import React, { useState, useMemo, Fragment, useEffect } from 'react';
import { CreditNote, Customer, Invoice, CreditNoteType, CreditNoteFormData, CreditNoteStatus, User } from '../types';
import { ArrowLeftIcon, ReceiptRefundIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon } from './icons';
import { safeDateFormat, safeParseDate } from '../utils/date';

interface CreditNotesPageProps {
    creditNotes: CreditNote[];
    customers: Customer[];
    invoices: Invoice[];
    onAddCreditNote: (noteData: CreditNoteFormData) => void;
    onNavigateBack: () => void;
    onVoidCreditNote: (noteId: number) => void;
    // FIX: Changed 'reason' from string to an object to match the handler in App.tsx.
    onEditCreditNote: (noteId: number, data: { reason?: string, remainingAmount?: number }) => void;
    onManualApplyCredit: (noteId: number, invoiceId: number, amount: number) => void;
    user: User;
    tabId: string;
}

type CreditNotesTab = 'summary' | 'history';

const CreditNotesPage: React.FC<CreditNotesPageProps> = (props) => {
    const { creditNotes, customers, invoices, onAddCreditNote, onNavigateBack, onVoidCreditNote, onEditCreditNote, user, tabId } = props;

    const [activeTab, setActiveTab] = useState<CreditNotesTab>('summary');
    const [formVisible, setFormVisible] = useState(false);
    const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
    const [editingNote, setEditingNote] = useState<CreditNote | null>(null);

    // Filters for history tab
    const [filterCustomerId, setFilterCustomerId] = useState<string>('all');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');
    const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');

    const customersMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);
    const invoicesMap = useMemo(() => new Map(invoices.map(i => [i.id, i.invoice_ref])), [invoices]);

    const filteredHistoryNotes = useMemo(() => {
        return creditNotes.filter(note => {
            if (filterCustomerId !== 'all' && note.customerId !== Number(filterCustomerId)) {
                return false;
            }
            const noteDate = safeParseDate(note.createdAt);
            if (!noteDate) return false;

            if (filterStartDate) {
                const startDate = safeParseDate(filterStartDate);
                if (startDate) {
                    startDate.setHours(0, 0, 0, 0);
                    if (noteDate < startDate) return false;
                }
            }
            if (filterEndDate) {
                const endDate = safeParseDate(filterEndDate);
                if (endDate) {
                    endDate.setHours(23, 59, 59, 999);
                    if (noteDate > endDate) return false;
                }
            }
            
            if (filterSearchTerm.trim()) {
                const term = filterSearchTerm.toLowerCase();
                const customerName = customersMap.get(note.customerId)?.toLowerCase() || '';
                const invoiceRef = note.invoiceId ? invoicesMap.get(note.invoiceId)?.toLowerCase() : '';

                return (
                    note.creditNoteRef.toLowerCase().includes(term) ||
                    customerName.includes(term) ||
                    note.reason.toLowerCase().includes(term) ||
                    (invoiceRef && invoiceRef.includes(term)) ||
                    note.initialAmount.toString().includes(term)
                );
            }
            return true;
        });
    }, [creditNotes, filterCustomerId, filterStartDate, filterEndDate, filterSearchTerm, customersMap, invoicesMap]);
    

    const customerCreditSummary = useMemo(() => {
        const summary = new Map<number, { name: string, totalCredit: number, remainingCredit: number }>();
        customers.forEach(c => {
            summary.set(c.id, { name: c.name, totalCredit: 0, remainingCredit: 0 });
        });
        creditNotes.forEach(cn => {
            if (cn.status === CreditNoteStatus.VOIDED) return;
            const customerSummary = summary.get(cn.customerId);
            if (customerSummary) {
                customerSummary.totalCredit += cn.initialAmount;
                customerSummary.remainingCredit += cn.remainingAmount;
            }
        });
        return Array.from(summary.values()).filter(s => s.totalCredit > 0).sort((a,b) => b.remainingCredit - a.remainingCredit);
    }, [creditNotes, customers]);

    const handleClearFilters = () => {
        setFilterCustomerId('all');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterSearchTerm('');
    };

    const handleVoidClick = (noteId: number) => {
        if (window.confirm("Are you sure you want to void this credit note? This will revert any applications and cannot be undone.")) {
            onVoidCreditNote(noteId);
        }
    };
    
    const handleEditSave = (noteId: number, newReason: string) => {
        // FIX: Pass data as an object to match the updated prop type.
        onEditCreditNote(noteId, { reason: newReason });
        setEditingNote(null);
    }

    const getStatusChip = (status: CreditNoteStatus, remaining: number) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        if (status === CreditNoteStatus.VOIDED) {
             return <span className={`${baseClasses} bg-red-100 text-red-800`}>Voided</span>;
        }
        if (remaining <= 0.009) {
             return <span className={`${baseClasses} bg-green-100 text-green-800`}>Depleted</span>;
        }
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Active</span>;
    };


    return (
        <div className="p-6 space-y-6 text-black">
             {editingNote && (
                <EditCreditNoteModal 
                    isOpen={!!editingNote}
                    onClose={() => setEditingNote(null)}
                    note={editingNote}
                    onSave={handleEditSave}
                />
            )}
            <header className="flex items-center space-x-3">
                <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-brand-gray-200" aria-label="Go back to Accounts Hub">
                    <ArrowLeftIcon className="w-5 h-5 text-brand-gray-600" />
                </button>
                <ReceiptRefundIcon className="w-8 h-8 text-brand-blue" />
                <h1 className="text-2xl font-bold text-brand-blue-dark">Credit Notes</h1>
            </header>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('summary')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'summary' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Summary & Creation</button>
                    <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>History & Management</button>
                </nav>
            </div>

            {activeTab === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-end">
                            <button onClick={() => setFormVisible(!formVisible)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                                <PlusIcon className="w-5 h-5 mr-2" /> {formVisible ? 'Cancel' : 'Add New Credit Note'}
                            </button>
                        </div>
                        {formVisible && <AddCreditNoteForm customers={customers} invoices={invoices} onAddCreditNote={onAddCreditNote} onDone={() => setFormVisible(false)} tabId={tabId} />}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-4 sticky top-6">
                            <h2 className="text-lg font-semibold text-brand-blue-dark mb-4">Customer Credit Summary</h2>
                            <ul className="space-y-3 max-h-[70vh] overflow-y-auto">
                                {customerCreditSummary.length === 0 && <p className="text-sm text-gray-500">No customers with active credits.</p>}
                                {customerCreditSummary.map(summary => (
                                    <li key={summary.name} className="p-3 bg-white rounded-md border">
                                        <p className="font-semibold text-black">{summary.name}</p>
                                        <div className="text-sm mt-1">
                                            <div className="flex justify-between"><span>Total Issued:</span> <span>£{summary.totalCredit.toFixed(2)}</span></div>
                                            <div className="flex justify-between font-bold text-green-600"><span>Available:</span> <span>£{summary.remainingCredit.toFixed(2)}</span></div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'history' && (
                <div className="space-y-6">
                    <section className="p-6 bg-brand-gray-50 rounded-lg border border-brand-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="text-sm font-medium text-gray-600">Customer</label>
                                <select value={filterCustomerId} onChange={e => setFilterCustomerId(e.target.value)} className="mt-1 w-full p-2 border rounded-md">
                                    <option value="all">All Customers</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Date From</label>
                                <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Date To</label>
                                <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-600">Search Ref/Reason</label>
                                <input type="text" value={filterSearchTerm} onChange={e => setFilterSearchTerm(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., CN-123456 or damage"/>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={handleClearFilters} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition text-sm">Clear Filters</button>
                        </div>
                    </section>

                    <div className="bg-white rounded-lg shadow-md">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-brand-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3"></th>
                                        {['Ref', 'Customer', 'Date', 'Reason', 'Issued For', 'Initial Amt', 'Remaining', 'Status', 'Actions'].map(header => (
                                            <th key={header} className="p-3">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredHistoryNotes.length === 0 && (
                                        <tr><td colSpan={10} className="text-center p-8 text-gray-500">No credit notes match the selected criteria.</td></tr>
                                    )}
                                    {filteredHistoryNotes.map(note => (
                                        <Fragment key={note.id}>
                                            <tr className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    <button onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)} aria-expanded={expandedNoteId === note.id} aria-controls={`details-${note.id}`} aria-label="Show details">
                                                        {expandedNoteId === note.id ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                                    </button>
                                                </td>
                                                <td className="p-3 font-mono text-brand-blue">{note.creditNoteRef}</td>
                                                <td className="p-3 font-medium text-black">{customersMap.get(note.customerId) || 'Unknown'}</td>
                                                <td className="p-3 text-black">{safeDateFormat(note.createdAt)}</td>
                                                <td className="p-3 text-black truncate" style={{maxWidth: '200px'}} title={note.reason}>{note.reason}</td>
                                                <td className="p-3 text-black">{note.type === CreditNoteType.JOB_BASED && note.invoiceId ? invoicesMap.get(note.invoiceId) : 'Account'}</td>
                                                <td className="p-3 text-black">£{note.initialAmount.toFixed(2)}</td>
                                                <td className="p-3 text-black font-semibold">£{note.remainingAmount.toFixed(2)}</td>
                                                <td className="p-3">{getStatusChip(note.status, note.remainingAmount)}</td>
                                                <td className="p-3">
                                                    {user.role === 'super_admin' && (
                                                        <div className="flex items-center space-x-2">
                                                            <button onClick={() => setEditingNote(note)} disabled={note.status === CreditNoteStatus.VOIDED} className="p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400" title="Edit Note"><PencilIcon className="w-4 h-4" /></button>
                                                            <button onClick={() => handleVoidClick(note.id)} disabled={note.status === CreditNoteStatus.VOIDED} className="p-1 text-red-600 hover:text-red-800 disabled:text-gray-400" title="Void Note"><TrashIcon className="w-4 h-4" /></button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedNoteId === note.id && (
                                                <tr id={`details-${note.id}`}>
                                                    <td colSpan={10} className="p-4 bg-brand-gray-50">
                                                        <h4 className="font-semibold mb-2 text-gray-800">Note History:</h4>
                                                        {note.history.length > 0 ? (
                                                            <ul className="list-disc pl-5 text-xs space-y-1">
                                                                {note.history.map((item, index) => (
                                                                    <li key={index}><span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">{safeDateFormat(item.date, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> - <strong>{item.action}</strong>: {item.details}</li>
                                                                ))}
                                                                {note.applications.map((app, index) => (
                                                                    <li key={`app-${index}`}><span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">{safeDateFormat(app.date, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> - <strong>APPLIED</strong>: Applied £{app.appliedAmount.toFixed(2)} to Invoice {invoicesMap.get(app.invoiceId) || 'N/A'}</li>
                                                                ))}
                                                            </ul>
                                                        ) : <p className="text-xs text-gray-500">No history available for this note.</p>}
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Add Credit Note Form Component
interface AddCreditNoteFormProps {
    customers: Customer[];
    invoices: Invoice[];
    onAddCreditNote: (data: CreditNoteFormData) => void;
    onDone: () => void;
    tabId: string;
}

const initialFormState = {
    type: CreditNoteType.JOB_BASED,
    customerId: '' as number | '',
    invoiceId: '' as number | '',
    initialAmount: '',
    reason: '',
};

const AddCreditNoteForm: React.FC<AddCreditNoteFormProps> = ({ customers, invoices, onAddCreditNote, onDone, tabId }) => {
    const storageKey = `creditNoteFormState-${tabId}`;
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem(storageKey);
        return savedData ? JSON.parse(savedData) : initialFormState;
    });
    const [error, setError] = useState('');

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(formData));
    }, [formData, storageKey]);

    const handleChange = (field: keyof typeof initialFormState, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const amount = parseFloat(formData.initialAmount);
        if (!formData.customerId || isNaN(amount) || amount <= 0 || !formData.reason.trim()) {
            setError('Please fill all fields with valid data.');
            return;
        }
        if (formData.type === CreditNoteType.JOB_BASED && !formData.invoiceId) {
            setError('Please select an invoice for a job-based credit note.');
            return;
        }
        onAddCreditNote({
            customerId: formData.customerId,
            type: formData.type,
            invoiceId: formData.type === CreditNoteType.JOB_BASED ? formData.invoiceId || undefined : undefined,
            initialAmount: amount,
            reason: formData.reason,
        });
        localStorage.removeItem(storageKey);
        onDone();
    };

    const customerInvoices = useMemo(() => {
        if (!formData.customerId) return [];
        return invoices.filter(i => i.customerId === formData.customerId).sort((a,b) => (safeDateFormat(b.invoiceDate) || '').localeCompare(safeDateFormat(a.invoiceDate) || ''));
    }, [formData.customerId, invoices]);

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md border space-y-4">
            <p className="text-sm text-gray-500">
                Example: 'Job-based: Credit £250.00 for invoice ALS-077014 due to damaged goods' or 'Account-based: Credit £500.00 to Fresh Produce Co. for service credits'
            </p>
            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}
            <div className="flex items-center space-x-4">
                <label className="flex items-center"><input type="radio" value={CreditNoteType.JOB_BASED} checked={formData.type === CreditNoteType.JOB_BASED} onChange={() => handleChange('type', CreditNoteType.JOB_BASED)} className="mr-2"/> Job-based</label>
                <label className="flex items-center"><input type="radio" value={CreditNoteType.ACCOUNT_BASED} checked={formData.type === CreditNoteType.ACCOUNT_BASED} onChange={() => { handleChange('type', CreditNoteType.ACCOUNT_BASED); handleChange('invoiceId', ''); }} className="mr-2"/> Account-based</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Customer</label>
                    <select value={formData.customerId} onChange={e => { handleChange('customerId', Number(e.target.value)); handleChange('invoiceId', ''); }} className="mt-1 w-full p-2 border rounded-md" required>
                        <option value="" disabled>Select a customer...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                {formData.type === CreditNoteType.JOB_BASED && (
                     <div>
                        <label className="text-sm font-medium">Invoice</label>
                        <select value={formData.invoiceId} onChange={e => handleChange('invoiceId', Number(e.target.value))} className="mt-1 w-full p-2 border rounded-md" required disabled={!formData.customerId}>
                            <option value="" disabled>Select an invoice...</option>
                            {customerInvoices.map(i => <option key={i.id} value={i.id}>{i.invoice_ref} ({i.jobDetails.awbRef}) - £{i.totalAmount.toFixed(2)}</option>)}
                        </select>
                    </div>
                )}
                <div>
                    <label className="text-sm font-medium">Amount (£)</label>
                    <input type="number" step="0.01" min="0.01" value={formData.initialAmount} onChange={e => handleChange('initialAmount', e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., 250.00" required />
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm font-medium">Reason</label>
                    <input type="text" value={formData.reason} onChange={e => handleChange('reason', e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., Credit for damaged goods" required />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light transition">
                    Create Credit Note
                </button>
            </div>
        </form>
    );
};


interface EditCreditNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: CreditNote;
    onSave: (noteId: number, reason: string) => void;
}

const EditCreditNoteModal: React.FC<EditCreditNoteModalProps> = ({ isOpen, onClose, note, onSave }) => {
    const [reason, setReason] = useState(note.reason);
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(note.id, reason);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Edit Credit Note {note.creditNoteRef}</h2>
                    </div>
                    <div className="p-6">
                        <label className="text-sm font-medium">Reason</label>
                        <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                    <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-3 py-1.5 text-sm bg-brand-blue text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreditNotesPage;