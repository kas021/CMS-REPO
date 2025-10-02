import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { PdfIcon, CreditCardIcon, CheckCircleIcon } from './icons';
import Pagination from './Pagination';
import { safeDateFormat } from '../utils/date';

interface InvoicesTableProps {
    invoices: Invoice[];
    onAddPayment: (invoice: Invoice) => void;
    selectedInvoiceIds: number[];
    setSelectedInvoiceIds: (ids: number[]) => void;
    onOpenBulkPay: () => void;
    onMarkAsPaid: () => void;
    onEditJob: (jobId: number) => void;
    onViewInvoice: (invoice: Invoice) => void;
}

const PAGE_SIZES = [50, 100, 150, 200];

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, onAddPayment, selectedInvoiceIds, setSelectedInvoiceIds, onOpenBulkPay, onMarkAsPaid, onEditJob, onViewInvoice }) => {
    const checkboxRef = useRef<HTMLInputElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);

    const paginatedInvoices = useMemo(() => {
        if (pageSize === 0) return invoices; // "All" is selected
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return invoices.slice(startIndex, endIndex);
    }, [invoices, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when invoices list changes
        setSelectedInvoiceIds([]);
    }, [invoices, pageSize, setSelectedInvoiceIds]);
    
    const isAllSelectedOnPage = useMemo(() => paginatedInvoices.length > 0 && selectedInvoiceIds.length === paginatedInvoices.length, [paginatedInvoices, selectedInvoiceIds]);
    const isIndeterminate = useMemo(() => selectedInvoiceIds.length > 0 && selectedInvoiceIds.length < paginatedInvoices.length, [paginatedInvoices, selectedInvoiceIds]);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedInvoiceIds(paginatedInvoices.map(inv => inv.id));
        } else {
            setSelectedInvoiceIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) {
            setSelectedInvoiceIds([...selectedInvoiceIds, id]);
        } else {
            setSelectedInvoiceIds(selectedInvoiceIds.filter(invId => invId !== id));
        }
    };
    
    const getStatusChip = (status: InvoiceStatus) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case InvoiceStatus.PAID:
                return <span className={`${baseClasses} bg-green-100 text-green-800`}>Paid</span>;
            case InvoiceStatus.PARTIALLY_PAID:
                return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Partially Paid</span>;
            case InvoiceStatus.UNPAID:
                return <span className={`${baseClasses} bg-red-100 text-red-800`}>Unpaid</span>;
            case InvoiceStatus.SETTLED_WITH_CREDIT:
                return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Settled with Credit</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
        }
    };

    const formatCurrency = (amount: number) => `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="overflow-x-auto">
             {selectedInvoiceIds.length > 0 && (
                <div className="p-4 bg-brand-gray-50 border-b flex items-center space-x-4 flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700">{selectedInvoiceIds.length} invoice(s) selected.</span>
                    <div className="flex-grow" />
                    <button onClick={onMarkAsPaid} className="flex items-center px-3 py-1.5 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                       <CheckCircleIcon className="w-4 h-4 mr-1"/> Mark as Paid
                    </button>
                    <button onClick={onOpenBulkPay} className="flex items-center px-3 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                       <CreditCardIcon className="w-4 h-4 mr-1"/> Apply Partial Payment
                    </button>
                </div>
            )}
            <table className="min-w-full bg-white text-sm">
                <thead className="bg-brand-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <tr>
                        <th className="p-3">
                            <input 
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-brand-blue"
                                ref={checkboxRef}
                                checked={isAllSelectedOnPage}
                                onChange={handleSelectAllOnPage}
                                aria-label="Select all invoices on this page"
                            />
                        </th>
                        {['Inv. ID', 'Customer', 'AWB/Ref', 'Inv. Date', 'Due Date', 'Total', 'Paid', 'Outstanding', 'Status', 'Actions'].map(header => (
                            <th key={header} className="p-3">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {paginatedInvoices.map((invoice) => (
                        <tr key={invoice.id} className={`hover:bg-gray-50 ${selectedInvoiceIds.includes(invoice.id) ? 'bg-blue-50' : ''}`}>
                             <td className="p-3">
                                <input 
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-brand-blue"
                                    checked={selectedInvoiceIds.includes(invoice.id)}
                                    onChange={e => handleSelectOne(e, invoice.id)}
                                    aria-labelledby={`invoice-customer-${invoice.id}`}
                                />
                            </td>
                            <td className="p-3 font-mono text-brand-blue">{invoice.invoice_ref}</td>
                            <td id={`invoice-customer-${invoice.id}`} className="p-3 font-medium text-black">{invoice.customerDetails?.name || 'N/A'}</td>
                            <td className="p-3 text-brand-blue-light font-semibold">{invoice.jobDetails?.awbRef || 'N/A'}</td>
                            <td className="p-3 text-black">{safeDateFormat(invoice.invoiceDate)}</td>
                            <td className="p-3 text-black">{safeDateFormat(invoice.dueDate)}</td>
                            <td className="p-3 text-black">{formatCurrency(invoice.totalAmount)}</td>
                            <td className="p-3 text-green-700">{formatCurrency(invoice.paidAmount)}</td>
                            <td className="p-3 font-semibold text-red-700">{formatCurrency(invoice.outstandingAmount)}</td>
                            <td className="p-3">{getStatusChip(invoice.status)}</td>
                            <td className="p-3 flex items-center space-x-2">
                                <button onClick={() => onViewInvoice(invoice)} className="text-blue-600 hover:text-blue-800">View</button>
                                 <span className="text-gray-300">|</span>
                                <button onClick={() => onEditJob(invoice.jobId)} className="text-blue-600 hover:text-blue-800">Edit Job</button>
                                <span className="text-gray-300">|</span>
                                <button 
                                    onClick={() => onAddPayment(invoice)} 
                                    className="flex items-center text-sm px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:bg-gray-400"
                                    disabled={invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.SETTLED_WITH_CREDIT}
                                    aria-label={`Add payment for invoice ${invoice.invoice_ref}`}
                                >
                                    <CreditCardIcon className="w-4 h-4 mr-1"/>
                                    Payment
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalItems={invoices.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizes={[...PAGE_SIZES, { label: 'All', value: 0 }]}
            />
        </div>
    );
};

export default InvoicesTable;
