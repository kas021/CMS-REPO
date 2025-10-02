import React from 'react';
import { Invoice, CompanyDetails, InvoiceTemplateSettings } from '../types';
import { XMarkIcon, DocumentArrowDownIcon } from './icons';
import { safeDateFormat } from '../utils/date';

interface InvoiceDetailPageProps {
    invoice: Invoice;
    companyDetails: CompanyDetails;
    template: InvoiceTemplateSettings;
    onClose: () => void;
    isPreview?: boolean;
}

const InvoiceDetailPage: React.FC<InvoiceDetailPageProps> = ({ invoice, companyDetails, template, onClose, isPreview = false }) => {
    
    const handlePrint = () => {
        window.print();
    };
    
    const safeStyles = template?.styles ?? { accentColor: '#1a3a6e', logoSize: 25, fontSize: 'text-sm', headerAlign: 'left' };
    const safeSections = template?.sections ?? [];

    const fullCompanyAddress = [companyDetails?.address?.street, companyDetails?.address?.city, companyDetails?.address?.postcode, companyDetails?.address?.country].filter(Boolean).join('\n');
    const fullJobDescription = `${invoice?.jobDetails?.description || 'N/A'}\nCollection: ${invoice?.jobDetails?.pickupAddress || 'N/A'}\nDelivery: ${invoice?.jobDetails?.deliveryAddress || 'N/A'}`;
    
    // FIX: Replace JSX.Element with React.ReactElement to resolve namespace issue.
    const sections: Record<string, React.ReactElement | null> = {
        HEADER: (
             <header className="flex justify-between items-start pb-4 mb-8 border-b-2" style={{ borderColor: safeStyles.accentColor }}>
                <div className="flex items-center">
                    {companyDetails?.logo && <img src={companyDetails.logo} alt="Company Logo" className="mr-6 object-contain" style={{ width: `${safeStyles.logoSize * 4}px` }} />}
                    <div>
                        <h1 className="text-2xl font-bold text-black">{companyDetails?.name || 'Company Name'}</h1>
                        <p className="whitespace-pre-line text-xs text-black">{fullCompanyAddress}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-light uppercase text-black">INVOICE</h2>
                </div>
            </header>
        ),
        CUSTOMER_DETAILS: (
            <section className="grid grid-cols-2 gap-8 mb-8 text-xs">
                <div>
                    <h3 className="text-xs uppercase font-bold mb-2 text-black">BILL TO</h3>
                    <p className="font-bold text-sm text-black">{invoice?.customerDetails?.name || 'N/A'}</p>
                    <p className="whitespace-pre-line text-black">{invoice?.customerDetails?.address || 'N/A'}</p>
                </div>
                <div className="text-right">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-black">
                        <span className="font-bold">Invoice Number:</span><span>{invoice?.invoice_ref || 'N/A'}</span>
                        <span className="font-bold">Invoice Date:</span><span>{safeDateFormat(invoice?.invoiceDate)}</span>
                        <span className="font-bold">Due Date:</span><span>{safeDateFormat(invoice?.dueDate)}</span>
                        <span className="font-bold">Account Ref:</span><span>{invoice?.customerDetails?.accountRef || 'N/A'}</span>
                        <span className="font-bold">Payment Terms:</span><span>{invoice?.customerDetails?.paymentTerms || 'N/A'}</span>
                    </div>
                </div>
            </section>
        ),
        LINE_ITEMS: (
            <section className="mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="uppercase font-bold text-black" style={{ backgroundColor: '#f3f4f6' }}>
                            <th className="p-2 border border-gray-300 text-xs">Ref</th>
                            <th className="p-2 border border-gray-300 text-xs w-1/2">Description</th>
                            <th className="p-2 border border-gray-300 text-xs text-right">Pcs</th>
                            <th className="p-2 border border-gray-300 text-xs text-right">Weight</th>
                            <th className="p-2 border border-gray-300 text-xs text-right">Unit Price</th>
                            <th className="p-2 border border-gray-300 text-xs text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-black">
                            <td className="p-2 border border-gray-300 align-top text-xs">{invoice?.jobDetails?.awbRef || 'N/A'}</td>
                            <td className="p-2 border border-gray-300 align-top text-xs whitespace-pre-wrap">{fullJobDescription}</td>
                            <td className="p-2 border border-gray-300 align-top text-xs text-right">{invoice?.jobDetails?.pcs || 0}</td>
                            <td className="p-2 border border-gray-300 align-top text-xs text-right">{invoice?.jobDetails?.weight?.toFixed(2) || '0.00'} kg</td>
                            <td className="p-2 border border-gray-300 align-top text-xs text-right">£{(invoice?.subtotal || 0).toFixed(2)}</td>
                            <td className="p-2 border border-gray-300 align-top text-xs text-right font-semibold">£{(invoice?.subtotal || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        ),
        TOTALS: (
            <section className="flex justify-end mb-8">
                <div className="w-full max-w-xs">
                    <table className="w-full text-sm">
                        <tbody className="text-black">
                            <tr><td className="p-2">Subtotal</td><td className="p-2 text-right font-medium">£{(invoice?.subtotal || 0).toFixed(2)}</td></tr>
                            <tr><td className="p-2">VAT (20%)</td><td className="p-2 text-right">£{(invoice?.vatAmount || 0).toFixed(2)}</td></tr>
                            <tr className="font-bold text-base" style={{ backgroundColor: '#eef2ff' }}><td className="p-2">Grand Total</td><td className="p-2 text-right">£{(invoice?.totalAmount || 0).toFixed(2)}</td></tr>
                             {(invoice?.paidAmount || 0) > 0 && <tr><td className="p-2">Paid (Cash/Bank)</td><td className="p-2 text-right">- £{(invoice?.paidAmount || 0).toFixed(2)}</td></tr>}
                             {(invoice?.credit_applied || 0) > 0 && <tr><td className="p-2">Credit Applied</td><td className="p-2 text-right">- £{(invoice?.credit_applied || 0).toFixed(2)}</td></tr>}
                            <tr className="font-bold text-lg text-black" style={{ backgroundColor: safeStyles.accentColor }}><td className="p-3">Balance Due</td><td className="p-3 text-right">£{(invoice?.outstandingAmount || 0).toFixed(2)}</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>
        ),
        FOOTER: (
             <footer className="pt-6 border-t text-xs text-black">
                <div className="grid grid-cols-2 gap-8">
                     <div>
                        <h4 className="font-bold uppercase mb-2">Payment Details</h4>
                        <p><span className="font-semibold">Bank:</span> {companyDetails?.bankDetails?.name || 'N/A'}</p>
                        <p><span className="font-semibold">Sort Code:</span> {companyDetails?.bankDetails?.sortCode || 'N/A'}</p>
                        <p><span className="font-semibold">Account No:</span> {companyDetails?.bankDetails?.account || 'N/A'}</p>
                        <p><span className="font-semibold">IBAN:</span> {companyDetails?.bankDetails?.iban || 'N/A'}</p>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase mb-2">Terms & Conditions</h4>
                        <p>Payment terms: {invoice?.customerDetails?.paymentTerms || 'N/A'}. Please include the invoice number on your remittance.</p>
                        <p className="mt-4 font-semibold">Thank you for your business!</p>
                    </div>
                </div>
                <div className="text-center mt-8">
                    <p>{companyDetails?.name || ''} | Reg: {companyDetails?.regNo || ''} | VAT: {companyDetails?.vatNo || ''}</p>
                    <p>{companyDetails?.phone || ''} | {companyDetails?.email || ''} | {companyDetails?.www || ''}</p>
                </div>
            </footer>
        )
    };
    
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 ${isPreview ? 'static-preview' : ''}`} aria-modal={!isPreview} role="dialog">
            <style>{`
                .static-preview { position: static; background: transparent; padding: 0; }
                .invoice-print-area { font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; }
                @media print {
                    body * { visibility: hidden; }
                    .invoice-print-area, .invoice-print-area * { visibility: visible; }
                    .invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; margin: 0; padding: 0; border: none; }
                    .no-print { display: none !important; }
                    @page { size: A4; margin: 0; }
                }
            `}</style>
            <div className={`bg-white rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[95vh] flex flex-col ${isPreview ? 'max-w-full h-auto max-h-full' : ''}`}>
                {!isPreview && (
                     <header className="no-print bg-brand-gray-100 p-3 flex justify-between items-center border-b">
                        <h2 className="font-semibold text-brand-blue-dark">Invoice Details: {invoice?.invoice_ref || 'N/A'}</h2>
                        <div className="flex items-center space-x-2">
                             <button onClick={handlePrint} className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm">
                                 <DocumentArrowDownIcon className="w-4 h-4 mr-2" /> Export PDF
                             </button>
                            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-300" aria-label="Close">
                                <XMarkIcon className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                    </header>
                )}
                <main className={`flex-1 overflow-y-auto ${isPreview ? '' : 'p-2 bg-gray-200'}`}>
                     <div className={`bg-white invoice-print-area font-sans mx-auto ${safeStyles.fontSize}`} style={{ width: '210mm', minHeight: '297mm' }}>
                        <div className="flex flex-col p-12" style={{ minHeight: '297mm' }}>
                            {safeSections
                                .filter(s => s.id !== 'FOOTER')
                                .map(section => (
                                    section.visible && <div key={section.id}>{sections[section.id]}</div>
                                ))
                            }
                            <div className="flex-grow"></div>
                            {safeSections.find(s => s.id === 'FOOTER' && s.visible) && sections.FOOTER}
                        </div>
                     </div>
                </main>
            </div>
        </div>
    );
};


export default InvoiceDetailPage;