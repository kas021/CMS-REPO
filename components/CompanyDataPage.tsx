import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Customer, Driver, CompanyDetails, InvoiceTemplateSettings, Invoice, InvoiceStatus, InvoiceSectionType } from '../types';
// FIX: Added PencilIcon, SaveIcon, and XMarkIcon to support the new EditDriverModal.
import { PlusIcon, UserGroupIcon, TruckIcon, RefreshIcon, ChevronUpIcon, ChevronDownIcon, EyeIcon, EyeSlashIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, PencilIcon, SaveIcon, XMarkIcon } from './icons';
import Pagination from './Pagination';
import InvoiceDetailPage from './InvoiceDetailPage';
import { MOCK_INVOICES } from '../large-mock-data';
import { DEFAULT_INVOICE_TEMPLATE } from '../constants';
import { API_BASE_URL } from '../utils/api';


interface CompanyDataPageProps {
    customers: Customer[];
    drivers: Driver[];
    onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
    onAddDriver: (driver: Omit<Driver, 'id'>) => void;
    // FIX: Added missing onUpdateDriver prop to resolve the TypeScript error.
    onUpdateDriver: (driver: Driver) => void;
    companyDetails: CompanyDetails;
    onUpdateCompanyDetails: (details: CompanyDetails) => void;
    invoiceTemplates: InvoiceTemplateSettings[];
    onUpdateTemplate: (template: InvoiceTemplateSettings) => void;
    onAddTemplate: (name: string) => void;
    onResetTemplate: (templateId: string) => void;
    activeTemplateId: string;
    onSetActiveTemplateId: (id: string) => void;
    onSetInvoiceTemplates: (templates: InvoiceTemplateSettings[]) => void;
}

const PAGE_SIZES = [50, 100, 150, 200];

const CompanyDataPage: React.FC<CompanyDataPageProps> = (props) => {
    const { customers, drivers, onAddCustomer, onAddDriver } = props;
    const [activeTab, setActiveTab] = useState('customers');
    
    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold text-brand-blue-dark">Company Settings</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('customers')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'customers' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Customers</button>
                    <button onClick={() => setActiveTab('drivers')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'drivers' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Drivers</button>
                    <button onClick={() => setActiveTab('branding')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'branding' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Branding</button>
                    <button onClick={() => setActiveTab('invoice')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'invoice' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Invoice Template</button>
                    <button onClick={() => setActiveTab('backup')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'backup' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Backup & Restore</button>
                </nav>
            </div>

            {activeTab === 'customers' && <CustomersPanel customers={customers} onAddCustomer={onAddCustomer} />}
            {activeTab === 'drivers' && <DriversPanel drivers={drivers} onAddDriver={onAddDriver} onUpdateDriver={props.onUpdateDriver} />}
            {activeTab === 'branding' && <BrandingPanel details={props.companyDetails} onUpdate={props.onUpdateCompanyDetails} />}
            {activeTab === 'invoice' && <InvoiceEditorPanel {...props} />}
            {activeTab === 'backup' && <BackupPanel 
                companyDetails={props.companyDetails}
                invoiceTemplates={props.invoiceTemplates}
                onImportSuccess={(settings, preferences) => {
                    props.onUpdateCompanyDetails(settings);
                    props.onSetInvoiceTemplates(preferences);
                }}
             />}
        </div>
    );
};

// Backup Panel Component
const BackupPanel: React.FC<{
    companyDetails: CompanyDetails;
    invoiceTemplates: InvoiceTemplateSettings[];
    onImportSuccess: (settings: CompanyDetails, preferences: InvoiceTemplateSettings[]) => void;
}> = ({ companyDetails, invoiceTemplates, onImportSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        setIsLoading(true);
        setFeedback(null);
        try {
            const response = await fetch(`${API_BASE_URL}/backup/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: companyDetails,
                    preferences: invoiceTemplates,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Export failed with no error message.' }));
                throw new Error(errorData.detail || 'Failed to export backup.');
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `als_backup_${new Date().toISOString().split('T')[0]}.zip`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setFeedback({ type: 'success', message: 'Backup exported successfully.' });
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.message || 'An unknown error occurred during export.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async () => {
        if (!fileInputRef.current?.files?.[0]) {
            setFeedback({ type: 'error', message: 'Please select a backup file to import.' });
            return;
        }

        if (!window.confirm("Are you sure you want to import this backup? This will overwrite ALL existing data and cannot be undone.")) {
            return;
        }

        setIsLoading(true);
        setFeedback(null);

        try {
            const file = fileInputRef.current.files[0];
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/backup/import`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Import failed with an invalid server response.' }));
                throw new Error(errorData.detail || 'Failed to import backup.');
            }

            const result = await response.json();
            onImportSuccess(result.settings, result.preferences);

            setFeedback({ type: 'success', message: 'Import successful! The application will now reload to apply the changes.' });

            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (err: any) {
            setFeedback({ type: 'error', message: err.message || 'An unknown error occurred during import.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6 space-y-8">
            <h2 className="text-xl font-semibold text-brand-blue-dark">Backup & Restore</h2>
            
            {feedback && (
                <div className={`p-4 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback.message}
                </div>
            )}

            {/* Export Section */}
            <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-gray-800">Export System Data</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Create a complete backup of all jobs, invoices, customers, drivers, and system settings. The data will be downloaded as a single <code>.zip</code> file.
                </p>
                <button 
                    onClick={handleExport}
                    disabled={isLoading}
                    className="mt-4 flex items-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light transition disabled:bg-gray-400"
                >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Exporting...' : 'Export Backup'}
                </button>
            </div>

            {/* Import Section */}
            <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-800">Restore from Backup</h3>
                        <p className="text-sm text-red-700 mt-1">
                            Restoring from a backup will <strong className="font-bold">completely overwrite all existing data</strong> in the application. This action cannot be undone. Please proceed with caution.
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex items-center space-x-3">
                     <input
                        type="file"
                        accept=".zip"
                        ref={fileInputRef}
                        className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue-light file:text-white hover:file:bg-brand-blue"
                     />
                    <button 
                        onClick={handleImport}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400"
                    >
                        <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Importing...' : 'Import Backup'}
                    </button>
                </div>
            </div>
        </section>
    );
};


// Customers Panel Component
const CustomersPanel: React.FC<{ customers: Customer[], onAddCustomer: (c: Omit<Customer, 'id'>) => void }> = ({ customers, onAddCustomer }) => {
    const [newCustomer, setNewCustomer] = useState({ name: '', address: '', phone: '', email: '', accountRef: '', paymentTerms: 'After 30 Days' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);

    const paginatedCustomers = useMemo(() => {
        if (pageSize === 0) return customers;
        const startIndex = (currentPage - 1) * pageSize;
        return customers.slice(startIndex, startIndex + pageSize);
    }, [customers, currentPage, pageSize]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCustomer.name.trim()) {
            onAddCustomer(newCustomer);
            setNewCustomer({ name: '', address: '', phone: '', email: '', accountRef: '', paymentTerms: 'After 30 Days' });
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setNewCustomer(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <section className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6 flex flex-col">
             <h2 className="flex items-center text-xl font-semibold text-brand-blue-dark mb-4"><UserGroupIcon className="w-6 h-6 mr-2" /> Customers</h2>
             <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Customer Name" name="name" value={newCustomer.name} onChange={handleChange} required />
                    <InputField label="Account Ref" name="accountRef" value={newCustomer.accountRef} onChange={handleChange} />
                    <InputField label="Email" name="email" type="email" value={newCustomer.email} onChange={handleChange} />
                    <InputField label="Phone" name="phone" type="tel" value={newCustomer.phone} onChange={handleChange} />
                    <div className="md:col-span-2">
                         <label htmlFor="address" className="text-sm font-medium text-gray-600">Address</label>
                         <textarea id="address" name="address" value={newCustomer.address} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" rows={3}></textarea>
                    </div>
                    <div>
                        <label htmlFor="paymentTerms" className="text-sm font-medium text-gray-600">Payment Terms</label>
                        <select id="paymentTerms" name="paymentTerms" value={newCustomer.paymentTerms} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md">
                            <option>After 30 Days</option><option>After 45 Days</option><option>After 60 Days</option><option>On Receipt</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="w-full flex items-center justify-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light transition"><PlusIcon className="w-5 h-5 mr-2" /> Add Customer</button>
             </form>
             <div className="overflow-x-auto flex-grow">
                <table className="min-w-full bg-white text-sm">
                    <thead className="bg-brand-gray-100 sticky top-0"><tr><th className="p-3 text-left font-semibold text-gray-600">Name</th><th className="p-3 text-left font-semibold text-gray-600">Account Ref</th><th className="p-3 text-left font-semibold text-gray-600">Contact</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">{paginatedCustomers.map(c => (<tr key={c.id} className="hover:bg-gray-50"><td className="p-3 font-medium text-black">{c.name}</td><td className="p-3 text-gray-600">{c.accountRef}</td><td className="p-3 text-gray-600">{c.email}</td></tr>))}</tbody>
                </table>
             </div>
             <Pagination currentPage={currentPage} totalItems={customers.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} pageSizes={[...PAGE_SIZES, { label: 'All', value: 0 }]} />
        </section>
    );
}

// FIX: Added EditDriverModal to support editing driver details.
interface EditDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    driver: Driver;
    onSave: (driverData: Driver) => void;
}

const EditDriverModal: React.FC<EditDriverModalProps> = ({ isOpen, onClose, driver, onSave }) => {
    const [driverData, setDriverData] = useState(driver);

    useEffect(() => {
        setDriverData(driver);
    }, [driver]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDriverData({ ...driverData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(driverData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-brand-blue-dark">Edit Driver: {driver.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close">
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="edit-driver-name" className="block text-sm font-medium text-gray-700">Driver Name</label>
                            <input id="edit-driver-name" name="name" type="text" value={driverData.name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="edit-driver-username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input id="edit-driver-username" name="username" type="text" value={driverData.username} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="edit-driver-password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input id="edit-driver-password" name="password" type="text" value={driverData.password || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" placeholder="Enter new password to change" />
                        </div>
                        <div>
                            <label htmlFor="edit-vehicle-type" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                            <input id="edit-vehicle-type" name="vehicleType" type="text" value={driverData.vehicleType} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="edit-vehicle-reg" className="block text-sm font-medium text-gray-700">Vehicle Registration</label>
                            <input id="edit-vehicle-reg" name="vehicleRegistration" type="text" value={driverData.vehicleRegistration} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required />
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-light">
                            <SaveIcon className="w-5 h-5 mr-2" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Drivers Panel Component
const DriversPanel: React.FC<{ drivers: Driver[], onAddDriver: (d: Omit<Driver, 'id'>) => void, onUpdateDriver: (d: Driver) => void }> = ({ drivers, onAddDriver, onUpdateDriver }) => {
    const [newDriver, setNewDriver] = useState({ name: '', username: '', password: '', vehicleType: '', vehicleRegistration: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

    const paginatedDrivers = useMemo(() => {
        if (pageSize === 0) return drivers;
        const startIndex = (currentPage - 1) * pageSize;
        return drivers.slice(startIndex, startIndex + pageSize);
    }, [drivers, currentPage, pageSize]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDriver.name && newDriver.username && newDriver.vehicleType && newDriver.vehicleRegistration) {
            onAddDriver(newDriver);
            setNewDriver({ name: '', username: '', password: '', vehicleType: '', vehicleRegistration: '' });
        }
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewDriver(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSaveDriver = (driverData: Driver) => {
        onUpdateDriver(driverData);
        setEditingDriver(null);
    };

    return (
        <section className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6 flex flex-col">
            {editingDriver && (
                <EditDriverModal
                    isOpen={!!editingDriver}
                    onClose={() => setEditingDriver(null)}
                    driver={editingDriver}
                    onSave={handleSaveDriver}
                />
            )}
             <h2 className="flex items-center text-xl font-semibold text-brand-blue-dark mb-4"><TruckIcon className="w-6 h-6 mr-2" /> Drivers</h2>
             <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Driver Name" name="name" value={newDriver.name} onChange={handleChange} required />
                    <InputField label="Vehicle Type" name="vehicleType" value={newDriver.vehicleType} onChange={handleChange} required />
                    <InputField label="Vehicle Reg" name="vehicleRegistration" value={newDriver.vehicleRegistration} onChange={handleChange} required />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Username" name="username" type="text" value={newDriver.username} onChange={handleChange} required />
                    <InputField label="Password" name="password" type="password" value={newDriver.password} onChange={handleChange} placeholder="Initial Password (optional)" />
                 </div>
                 <button type="submit" className="w-full flex items-center justify-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light transition"><PlusIcon className="w-5 h-5 mr-2" /> Add Driver</button>
             </form>
             <div className="overflow-x-auto flex-grow">
                <table className="min-w-full bg-white text-sm">
                    <thead className="bg-brand-gray-100 sticky top-0"><tr><th className="p-3 text-left font-semibold text-gray-600">ID</th><th className="p-3 text-left font-semibold text-gray-600">Name</th><th className="p-3 text-left font-semibold text-gray-600">Vehicle</th><th className="p-3 text-left font-semibold text-gray-600">Registration</th><th className="p-3 text-left font-semibold text-gray-600">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">{paginatedDrivers.map(d => (<tr key={d.id} className="hover:bg-gray-50"><td className="p-3 text-gray-500">{d.id}</td><td className="p-3 font-medium text-black">{d.name}</td><td className="p-3 text-gray-600">{d.vehicleType}</td><td className="p-3 text-gray-600">{d.vehicleRegistration}</td><td className="p-3"><button onClick={() => setEditingDriver(d)} className="p-1 text-blue-600 hover:text-blue-800" title="Edit Driver"><PencilIcon className="w-4 h-4" /></button></td></tr>))}</tbody>
                </table>
             </div>
             <Pagination currentPage={currentPage} totalItems={drivers.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} pageSizes={[...PAGE_SIZES, { label: 'All', value: 0 }]}/>
        </section>
    );
};

// Branding Panel Component
const BrandingPanel: React.FC<{ details: CompanyDetails, onUpdate: (d: CompanyDetails) => void }> = ({ details, onUpdate }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const nameParts = name.split('.');
        if (nameParts.length > 1) {
            onUpdate({ ...details, [nameParts[0]]: { ...(details[nameParts[0]] as object), [nameParts[1]]: value } });
        } else {
            onUpdate({ ...details, [name]: value });
        }
    };
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { onUpdate({ ...details, logo: reader.result as string }); };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6">
            <h2 className="text-xl font-semibold text-brand-blue-dark mb-4">Company Branding & Information</h2>
            <div className="space-y-6">
                <div>
                    <label className="text-sm font-medium text-gray-600">Company Logo</label>
                    <div className="mt-2 flex items-center space-x-6">
                        <img src={details.logo} alt="Company Logo" className="h-16 w-auto object-contain bg-white border p-1 rounded-md" />
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
                    </div>
                </div>
                <InputField label="Company Name" name="name" value={details.name} onChange={handleChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Street Address" name="address.street" value={details.address.street} onChange={handleChange} />
                    <InputField label="City" name="address.city" value={details.address.city} onChange={handleChange} />
                    <InputField label="Postcode" name="address.postcode" value={details.address.postcode} onChange={handleChange} />
                    <InputField label="Country" name="address.country" value={details.address.country} onChange={handleChange} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Phone" name="phone" value={details.phone} onChange={handleChange} />
                    <InputField label="Email" name="email" value={details.email} onChange={handleChange} type="email"/>
                    <InputField label="Website" name="www" value={details.www} onChange={handleChange} />
                    <InputField label="Reg No." name="regNo" value={details.regNo} onChange={handleChange} />
                    <InputField label="VAT No." name="vatNo" value={details.vatNo} onChange={handleChange} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-brand-blue-dark mb-2">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Bank Name" name="bankDetails.name" value={details.bankDetails.name} onChange={handleChange} />
                        <InputField label="Sort Code" name="bankDetails.sortCode" value={details.bankDetails.sortCode} onChange={handleChange} />
                        <InputField label="Account No." name="bankDetails.account" value={details.bankDetails.account} onChange={handleChange} />
                        <InputField label="BIC / SWIFT" name="bankDetails.bic" value={details.bankDetails.bic} onChange={handleChange} />
                        <InputField label="IBAN" name="bankDetails.iban" value={details.bankDetails.iban} onChange={handleChange} className="md:col-span-2" />
                    </div>
                </div>
            </div>
        </section>
    );
};

// Invoice Editor Panel
const InvoiceEditorPanel: React.FC<CompanyDataPageProps> = (props) => {
    const { invoiceTemplates, activeTemplateId, onSetActiveTemplateId, onUpdateTemplate, onAddTemplate, onResetTemplate, companyDetails } = props;
    
    const activeTemplate = useMemo(() => invoiceTemplates.find(t => t.id === activeTemplateId) || invoiceTemplates[0] || DEFAULT_INVOICE_TEMPLATE, [invoiceTemplates, activeTemplateId]);
    
    const [editedTemplate, setEditedTemplate] = useState<InvoiceTemplateSettings>(activeTemplate);

    useEffect(() => {
        setEditedTemplate(activeTemplate);
    }, [activeTemplate]);
    
    const handleStyleChange = (key: keyof InvoiceTemplateSettings['styles'], value: any) => {
        setEditedTemplate(prev => ({...prev, styles: {...prev.styles, [key]: value }}));
    };
    
    const handleSectionVisibility = (sectionId: InvoiceSectionType) => {
        setEditedTemplate(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s)
        }));
    };

    const handleMoveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...editedTemplate.sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]; // Swap
        setEditedTemplate(prev => ({ ...prev, sections: newSections }));
    };

    const handleAddNewTemplate = () => {
        const name = prompt("Enter new template name:", "New Template");
        if (name) onAddTemplate(name);
    }
    
    const sampleInvoice: Invoice = useMemo(() => MOCK_INVOICES.find(inv => inv.status === InvoiceStatus.PARTIALLY_PAID) || MOCK_INVOICES[0], []);

    return (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6 h-fit">
                <h2 className="text-xl font-semibold text-brand-blue-dark mb-4">Invoice Template Editor</h2>
                
                {/* Template Management */}
                <div className="space-y-4 mb-6 p-4 bg-white rounded-md border">
                     <h3 className="font-semibold text-gray-700">Template Management</h3>
                     <select value={activeTemplateId} onChange={e => onSetActiveTemplateId(e.target.value)} className="w-full p-2 border rounded-md">
                        {invoiceTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                     </select>
                     <div className="flex space-x-2">
                         <button onClick={handleAddNewTemplate} className="flex-1 text-sm px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">Add New</button>
                         <button onClick={() => onResetTemplate(activeTemplateId)} className="flex-1 text-sm px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600">Reset</button>
                     </div>
                </div>

                {/* Section Ordering */}
                <div className="space-y-4 mb-6">
                     <h3 className="font-semibold text-gray-700">Layout & Visibility</h3>
                     <div className="space-y-1">
                        {editedTemplate.sections.map((section, index) => (
                             <div key={section.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                 <span className="text-sm font-medium">{section.name}</span>
                                 <div className="flex items-center space-x-2">
                                     <button onClick={() => handleSectionVisibility(section.id)} title="Toggle visibility">{section.visible ? <EyeIcon className="w-5 h-5 text-gray-600"/> : <EyeSlashIcon className="w-5 h-5 text-gray-400" />}</button>
                                     <button onClick={() => handleMoveSection(index, 'up')} disabled={index === 0} className="disabled:opacity-25"><ChevronUpIcon className="w-5 h-5"/></button>
                                     <button onClick={() => handleMoveSection(index, 'down')} disabled={index === editedTemplate.sections.length - 1} className="disabled:opacity-25"><ChevronDownIcon className="w-5 h-5"/></button>
                                 </div>
                             </div>
                        ))}
                     </div>
                </div>

                {/* Style Controls */}
                <div className="space-y-4">
                     <h3 className="font-semibold text-gray-700">Styling</h3>
                     <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">Logo Size ({editedTemplate.styles.logoSize}%)</label>
                            <input type="range" min="10" max="50" value={editedTemplate.styles.logoSize} onChange={e => handleStyleChange('logoSize', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                         <div>
                            <label className="text-sm font-medium">Font Size</label>
                            <select value={editedTemplate.styles.fontSize} onChange={e => handleStyleChange('fontSize', e.target.value)} className="w-full p-2 border rounded-md text-sm">
                                <option value="text-xs">Small</option><option value="text-sm">Normal</option><option value="text-base">Large</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium">Accent Color</label>
                            <input type="color" value={editedTemplate.styles.accentColor} onChange={e => handleStyleChange('accentColor', e.target.value)} className="w-full h-8 p-1 border rounded cursor-pointer" />
                        </div>
                     </div>
                </div>
                 <button onClick={() => onUpdateTemplate(editedTemplate)} className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light transition">Save Template</button>
            </div>
            <div className="lg:col-span-2">
                 <h3 className="text-lg font-semibold text-brand-blue-dark mb-2">Live Preview</h3>
                 <div className="border rounded-lg shadow-lg overflow-hidden bg-gray-200">
                     <div className="transform scale-[.6] -translate-y-[17%] -translate-x-[17%] origin-top-left" style={{ width: '166.66%', minHeight: '166.66%' }}>
                        <InvoiceDetailPage invoice={sampleInvoice} companyDetails={companyDetails} onClose={()=>{}} isPreview={true} template={editedTemplate} />
                     </div>
                 </div>
            </div>
        </section>
    );
};


const InputField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>void, type?:string, required?: boolean, className?: string, placeholder?: string}> = ({ label, ...props }) => (
    <div className={props.className}>
        <label htmlFor={props.name} className="text-sm font-medium text-gray-600">{label}</label>
        <input id={props.name} {...props} className="mt-1 w-full p-2 border rounded-md" />
    </div>
);

export default CompanyDataPage;
