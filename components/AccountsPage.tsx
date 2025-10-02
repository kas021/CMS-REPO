import React, { useState, useMemo } from 'react';
import { Invoice, Job, InvoiceStatus, JobFormData, Customer, CompanyDetails, InvoiceTemplateSettings, InvoiceSearchMode } from '../types';
import { CreditCardIcon, ArrowLeftIcon } from './icons';
import InvoicesTable from './InvoicesTable';
import PaymentModal from './PaymentModal';
import BulkPaymentModal from './BulkPaymentModal';
import JobForm from './JobForm';
import InvoiceDetailPage from './InvoiceDetailPage';
import { safeParseDate } from '../utils/date';

type InvoiceFilterStatus = InvoiceStatus | 'ALL';

interface AccountsPageProps {
    invoices: Invoice[];
    jobs: Job[];
    customers: Customer[];
    onRecordPayment: (invoiceId: number, amount: number, paymentDate: string) => void;
    onSaveJob: (jobData: JobFormData) => void;
    onBulkPayInvoices: (invoiceIds: number[], amount: number | null, paymentDate: string) => void;
    onNavigateBack: () => void;
    companyDetails: CompanyDetails;
    activeTemplate: InvoiceTemplateSettings;
    tabId: string;
}

const AccountsPage: React.FC<AccountsPageProps> = ({ invoices, jobs, customers, onRecordPayment, onSaveJob, onBulkPayInvoices, onNavigateBack, companyDetails, activeTemplate, tabId }) => {
    const [activeTab, setActiveTab] = useState<InvoiceFilterStatus>('ALL');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isBulkPaymentModalOpen, setIsBulkPaymentModalOpen] = useState(false);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
    const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

    // State for new filters
    const [searchTerm, setSearchTerm] = useState('');
    const [searchMode, setSearchMode] = useState<InvoiceSearchMode>('invoice_ref');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredInvoices = useMemo(() => {
        let results = invoices;

        // 1. Filter by Status Tab
        if (activeTab !== 'ALL') {
            results = results.filter(invoice => invoice.status === activeTab);
        }

        // 2. Filter by Date Range
        const filterStartDate = safeParseDate(startDate);
        const filterEndDate = safeParseDate(endDate);

        if (filterStartDate) {
            filterStartDate.setHours(0, 0, 0, 0); // Start of the day
            results = results.filter(invoice => {
                const invoiceDate = safeParseDate(invoice.invoiceDate);
                return invoiceDate && invoiceDate >= filterStartDate;
            });
        }

        if (filterEndDate) {
            filterEndDate.setHours(23, 59, 59, 999); // End of the day
            results = results.filter(invoice => {
                const invoiceDate = safeParseDate(invoice.invoiceDate);
                return invoiceDate && invoiceDate <= filterEndDate;
            });
        }

        // 3. Filter by Search Term
        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            results = results.filter(invoice => {
                switch (searchMode) {
                    case 'invoice_ref':
                        return invoice.invoice_ref.toLowerCase().includes(lowercasedTerm);
                    case 'awb':
                        return invoice.jobDetails?.awbRef?.toLowerCase().includes(lowercasedTerm) || false;
                    case 'customer':
                        return invoice.customerDetails?.name?.toLowerCase().includes(lowercasedTerm) || false;
                    default:
                        return false;
                }
            });
        }

        return results;
    }, [invoices, activeTab, searchTerm, searchMode, startDate, endDate]);

    const handleAddPaymentClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = (amount: number, date: string) => {
        if (selectedInvoice) {
            onRecordPayment(selectedInvoice.id, amount, date);
        }
        setIsPaymentModalOpen(false);
        setSelectedInvoice(null);
    };

    const handleBulkPaySubmit = (amount: number, date: string) => {
        onBulkPayInvoices(selectedInvoiceIds, amount, date);
        setIsBulkPaymentModalOpen(false);
        setSelectedInvoiceIds([]);
    };
    
    const handleMarkAsPaid = () => {
        const today = new Date().toISOString().split('T')[0];
        onBulkPayInvoices(selectedInvoiceIds, null, today); // null amount signifies "pay in full"
        setSelectedInvoiceIds([]);
    };

    const handleEditJobClick = (jobId: number) => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            setJobToEdit(job);
        }
    };
    
    const handleJobFormSave = (jobData: JobFormData) => {
        onSaveJob(jobData);
        setJobToEdit(null);
    };
    
    const handleClearFilters = () => {
        setSearchTerm('');
        setSearchMode('invoice_ref');
        setStartDate('');
        setEndDate('');
    }

    const tabs: { label: string, status: InvoiceFilterStatus }[] = [
        { label: 'All', status: 'ALL' },
        { label: 'Unpaid', status: InvoiceStatus.UNPAID },
        { label: 'Partially Paid', status: InvoiceStatus.PARTIALLY_PAID },
        { label: 'Paid', status: InvoiceStatus.PAID },
        { label: 'Settled with Credit', status: InvoiceStatus.SETTLED_WITH_CREDIT },
    ];

    const stats = useMemo(() => {
        const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
        const totalPaid = totalBilled - totalOutstanding;
        return { totalBilled, totalOutstanding, totalPaid };
    }, [invoices]);

    return (
        <div className="p-6 space-y-6">
            {selectedInvoice && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSubmit={handlePaymentSubmit}
                    invoice={selectedInvoice}
                />
            )}
            {isBulkPaymentModalOpen && (
                <BulkPaymentModal
                    isOpen={isBulkPaymentModalOpen}
                    onClose={() => setIsBulkPaymentModalOpen(false)}
                    onSubmit={handleBulkPaySubmit}
                    invoiceCount={selectedInvoiceIds.length}
                />
            )}
             {jobToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={() => setJobToEdit(null)} aria-hidden="true"></div>
            )}
             {jobToEdit && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
                        <JobForm 
                            job={jobToEdit}
                            customers={customers}
                            onSave={handleJobFormSave}
                            onCancel={() => setJobToEdit(null)}
                            tabId={tabId}
                        />
                    </div>
                </div>
            )}
            {viewingInvoice && (
                <InvoiceDetailPage 
                    invoice={viewingInvoice}
                    companyDetails={companyDetails}
                    template={activeTemplate}
                    onClose={() => setViewingInvoice(null)}
                />
            )}
            
            <header className="flex items-center space-x-3">
                 <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-brand-gray-100" aria-label="Go back to Accounts Hub">
                    <ArrowLeftIcon className="w-5 h-5 text-brand-gray-600" />
                </button>
                 <CreditCardIcon className="w-8 h-8 text-brand-blue" />
                 <h1 className="text-2xl font-bold text-brand-blue-dark">Invoicing</h1>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Billed" value={stats.totalBilled} />
                <StatCard title="Total Collected" value={stats.totalPaid} isCurrency/>
                <StatCard title="Total Outstanding" value={stats.totalOutstanding} isCurrency/>
            </section>
            
            <section className="p-6 bg-white rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="invoice-search" className="text-sm font-medium text-gray-600">Search</label>
                        <div className="flex mt-1">
                            <select 
                                value={searchMode} 
                                onChange={e => setSearchMode(e.target.value as InvoiceSearchMode)}
                                className="p-2 border border-r-0 rounded-l-md focus:ring-brand-blue focus:border-brand-blue"
                                aria-label="Search mode"
                            >
                                <option value="invoice_ref">Invoice #</option>
                                <option value="awb">AWB #</option>
                                <option value="customer">Customer</option>
                            </select>
                            <input 
                                id="invoice-search" 
                                type="text" 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2 border rounded-r-md focus:ring-brand-blue focus:border-brand-blue"
                                placeholder={`Search by ${searchMode.replace('_', ' ')}...`}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="start-date" className="text-sm font-medium text-gray-600">Date From</label>
                        <input 
                            id="start-date" 
                            type="date" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue" 
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="text-sm font-medium text-gray-600">Date To</label>
                        <input 
                            id="end-date" 
                            type="date" 
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue" 
                        />
                    </div>
                </div>
                 <div className="flex justify-end space-x-3 mt-4">
                    <button 
                        onClick={handleClearFilters} 
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                    >
                        Clear Filters
                    </button>
                </div>
            </section>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-brand-gray-200 flex-wrap gap-4">
                     <div className="flex border-b border-gray-200">
                        {tabs.map(tab => (
                            <button
                                key={tab.status}
                                onClick={() => setActiveTab(tab.status)}
                                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 -mb-px border-b-2 ${
                                    activeTab === tab.status
                                        ? 'border-brand-blue text-brand-blue'
                                        : 'border-transparent text-gray-500 hover:text-brand-blue hover:border-brand-blue'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <InvoicesTable
                    invoices={filteredInvoices}
                    onAddPayment={handleAddPaymentClick}
                    selectedInvoiceIds={selectedInvoiceIds}
                    setSelectedInvoiceIds={setSelectedInvoiceIds}
                    onOpenBulkPay={() => setIsBulkPaymentModalOpen(true)}
                    onMarkAsPaid={handleMarkAsPaid}
                    onEditJob={handleEditJobClick}
                    onViewInvoice={setViewingInvoice}
                />
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number;
    isCurrency?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, isCurrency = true }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-2xl font-semibold text-brand-blue-dark">
            {isCurrency ? `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value}
        </p>
    </div>
);


export default AccountsPage;
