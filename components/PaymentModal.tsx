import React, { useState } from 'react';
import { Invoice } from '../types';
import { XMarkIcon, CreditCardIcon } from './icons';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, date: string) => void;
    invoice: Invoice;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSubmit, invoice }) => {
    const [amount, setAmount] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState<string>('');

    if (!isOpen) return null;

    const maxPayment = invoice.outstandingAmount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
        if (paymentAmount > maxPayment) {
            setError(`Payment cannot exceed the outstanding amount of £${maxPayment.toFixed(2)}.`);
            return;
        }
        onSubmit(paymentAmount, date);
        setAmount('');
        setError('');
    };
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setAmount(e.target.value);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-brand-gray-200">
                    <h2 className="text-lg font-semibold text-brand-blue-dark">Record 'Cash' Payment for Invoice {invoice.invoice_ref}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-gray-200" aria-label="Close">
                        <XMarkIcon className="w-6 h-6 text-brand-gray-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <p className="text-sm text-brand-gray-600">Customer: <span className="font-medium text-brand-gray-900">{invoice.customerDetails?.name || 'Unknown Customer'}</span></p>
                            <p className="text-sm text-brand-gray-600">Outstanding: <span className="font-medium text-red-600">£{invoice.outstandingAmount.toFixed(2)}</span></p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="payment-amount" className="block text-sm font-medium text-brand-gray-700">
                                    Payment Amount (£)
                                </label>
                                <input
                                    type="number"
                                    name="payment-amount"
                                    id="payment-amount"
                                    className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    step="0.01"
                                    min="0.01"
                                    max={maxPayment.toFixed(2)}
                                    autoFocus
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="payment-date" className="block text-sm font-medium text-brand-gray-700">
                                    Payment Date
                                </label>
                                <input
                                    type="date"
                                    name="payment-date"
                                    id="payment-date"
                                    className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                         {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="bg-brand-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-brand-gray-700 text-sm font-medium rounded-md border border-brand-gray-300 hover:bg-brand-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-light"
                        >
                            <CreditCardIcon className="w-5 h-5 mr-2" />
                            Submit Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;