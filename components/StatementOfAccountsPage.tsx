import React, { useState, useMemo } from 'react';
import { Invoice, Customer } from '../types';
import { DocumentChartBarIcon, ArrowLeftIcon, DocumentArrowDownIcon, TableCellsIcon } from './icons';
import { safeDateFormat, safeParseDate } from '../utils/date';

interface StatementOfAccountsPageProps {
    invoices: Invoice[];
    customers: Customer[];
    onNavigateBack: () => void;
}

const StatementOfAccountsPage: React.FC<StatementOfAccountsPageProps> = ({ invoices, customers, onNavigateBack }) => {
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const filteredInvoices = useMemo(() => {
        return invoices
            .filter(invoice => {
                // FIX: Convert selectedCustomerId from string to number for comparison with invoice.customerId
                if (selectedCustomerId !== 'all' && invoice.customerId !== Number(selectedCustomerId)) {
                    return false;
                }

                const invoiceDate = safeParseDate(invoice.invoiceDate);
                // Exclude invoices with invalid dates from the statement
                if (!invoiceDate) {
                    return false;
                }

                if (startDate) {
                    const filterStartDate = safeParseDate(startDate);
                    // Only filter if the start date is valid
                    if (filterStartDate && invoiceDate < filterStartDate) {
                        return false;
                    }
                }
                
                if (endDate) {
                    const filterEndDate = safeParseDate(endDate);
                    // Only filter if the end date is valid
                    if (filterEndDate) {
                        // To include all entries on the end date, we check against the start of the next day.
                        const nextDay = new Date(filterEndDate);
                        nextDay.setDate(nextDay.getDate() + 1);
                        if (invoiceDate >= nextDay) {
                            return false;
                        }
                    }
                }
                
                return true;
            })
            .sort((a, b) => {
                const dateA = safeParseDate(a.invoiceDate);
                const dateB = safeParseDate(b.invoiceDate);
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1; // invoices with invalid dates go to the end
                if (!dateB) return -1;
                return dateA.getTime() - dateB.getTime();
            });
    }, [invoices, selectedCustomerId, startDate, endDate]);
    
    const summary = useMemo(() => {
        const totalBilled = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
        const totalCredit = filteredInvoices.reduce((sum, inv) => sum + inv.credit_applied, 0);
        const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
        return { totalBilled, totalPaid, totalCredit, totalOutstanding };
    }, [filteredInvoices]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        const headers = [
            'Invoice Date',
            'Invoice ID',
            'AWB/Ref',
            'Customer',
            'Total (£)',
            'Paid (£)',
            'Credit Applied (£)',
            'Outstanding (£)'
        ];

        const formatCsvField = (field: any): string => {
            const str = String(field ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = filteredInvoices.map(invoice => [
            safeDateFormat(invoice.invoiceDate),
            invoice.invoice_ref,
            invoice.jobDetails?.awbRef || 'N/A',
            invoice.customerDetails?.name || 'N/A',
            invoice.totalAmount.toFixed(2),
            invoice.paidAmount.toFixed(2),
            invoice.credit_applied.toFixed(2),
            invoice.outstandingAmount.toFixed(2)
        ].map(formatCsvField).join(','));

        const summaryRow = [
            '', '', '', 'Totals:',
            summary.totalBilled.toFixed(2),
            summary.totalPaid.toFixed(2),
            summary.totalCredit.toFixed(2),
            summary.totalOutstanding.toFixed(2)
        ].map(formatCsvField).join(',');

        const csvContent = [
            headers.join(','),
            ...rows,
            '', // Blank line
            summaryRow
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const customerName = selectedCustomerId === 'all' ? 'All_Customers' : customers.find(c => c.id === Number(selectedCustomerId))?.name.replace(/\s+/g, '_') || 'Customer';
            const dateString = new Date().toISOString().slice(0, 10);
            link.setAttribute('href', url);
            link.setAttribute('download', `Statement_of_Accounts_${customerName}_${dateString}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="p-6 space-y-6 sao-page">
             <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .sao-print-area, .sao-print-area * {
                        visibility: visible;
                    }
                    .sao-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                }
            `}</style>

            <header className="flex items-center space-x-3 no-print">
                <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-brand-gray-200" aria-label="Go back to Accounts Hub">
                    <ArrowLeftIcon className="w-5 h-5 text-brand-gray-600" />
                </button>
                <DocumentChartBarIcon className="w-8 h-8 text-brand-blue" />
                <h1 className="text-2xl font-bold text-brand-blue-dark">Statement of Accounts</h1>
            </header>
            
            <section className="p-4 bg-brand-gray-50 rounded-lg border border-brand-gray-200 no-print">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="customer-select" className="text-sm font-medium text-gray-600">Customer</label>
                        <select 
                            id="customer-select"
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue bg-white text-brand-gray-900"
                        >
                            <option value="all">All Customers</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="start-date" className="text-sm font-medium text-gray-600">Start Date</label>
                        <input 
                            type="date" 
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue bg-white text-brand-gray-900"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="text-sm font-medium text-gray-600">End Date</label>
                        <input 
                            type="date" 
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue bg-white text-brand-gray-900"
                        />
                    </div>
                </div>
            </section>

             <section className="bg-white rounded-lg shadow-md">
                 <div className="flex justify-end p-4 border-b no-print">
                     <div className="flex space-x-3">
                         <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                             <DocumentArrowDownIcon className="w-5 h-5 mr-2" /> Export PDF
                         </button>
                         <button onClick={handleExportExcel} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                             <TableCellsIcon className="w-5 h-5 mr-2" /> Export Excel
                         </button>
                     </div>
                 </div>
                 <div className="p-6 sao-print-area">
                     <div className="mb-8">
                         <h2 className="text-2xl font-bold text-black">Statement of Account</h2>
                         <p className="text-black">
                             {/* FIX: Convert selectedCustomerId from string to number for comparison with customer.id */}
                             For: {selectedCustomerId === 'all' ? 'All Customers' : customers.find(c => c.id === Number(selectedCustomerId))?.name}
                         </p>
                         <p className="text-sm text-black">
                             Date Range: {startDate || 'Start'} to {endDate || 'End'}
                         </p>
                     </div>

                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-brand-gray-50 text-left text-xs font-semibold text-black uppercase tracking-wider">
                            <tr>
                                <th className="p-3">Inv. Date</th>
                                <th className="p-3">Inv. ID</th>
                                <th className="p-3">AWB/Ref</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3 text-right">Total (£)</th>
                                <th className="p-3 text-right">Paid (£)</th>
                                <th className="p-3 text-right">Credit Applied (£)</th>
                                <th className="p-3 text-right">Outstanding (£)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredInvoices.map(invoice => (
                                <tr key={invoice.id} className="text-black">
                                    <td className="p-3">{safeDateFormat(invoice.invoiceDate)}</td>
                                    <td className="p-3 font-mono">{invoice.invoice_ref}</td>
                                    <td className="p-3 font-semibold">{invoice.jobDetails?.awbRef || 'N/A'}</td>
                                    <td className="p-3">{invoice.customerDetails?.name || 'N/A'}</td>
                                    <td className="p-3 text-right">{invoice.totalAmount.toFixed(2)}</td>
                                    <td className="p-3 text-right">{invoice.paidAmount.toFixed(2)}</td>
                                    <td className="p-3 text-right">{invoice.credit_applied.toFixed(2)}</td>
                                    <td className="p-3 text-right font-semibold">{invoice.outstandingAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-brand-gray-100 font-bold">
                            <tr className="text-black">
                                <td colSpan={4} className="p-3 text-right">Totals:</td>
                                <td className="p-3 text-right">£{summary.totalBilled.toFixed(2)}</td>
                                <td className="p-3 text-right">£{summary.totalPaid.toFixed(2)}</td>
                                <td className="p-3 text-right">£{summary.totalCredit.toFixed(2)}</td>
                                <td className="p-3 text-right">£{summary.totalOutstanding.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    {filteredInvoices.length === 0 && <p className="text-center p-8 text-gray-500">No invoices match the selected criteria.</p>}
                 </div>
            </section>
        </div>
    );
};

export default StatementOfAccountsPage;