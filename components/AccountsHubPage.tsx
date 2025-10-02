import React from 'react';
import { TabType } from '../types';
import { DocumentChartBarIcon, CreditCardIcon, ArrowLeftIcon, ReceiptRefundIcon } from './icons';

interface AccountsHubPageProps {
    onNavigate: (type: TabType) => void;
}

const AccountsHubPage: React.FC<AccountsHubPageProps> = ({ onNavigate }) => {
    
    const panels = [
        { type: 'accounts' as TabType, title: 'Invoicing', icon: CreditCardIcon, description: 'Manage invoices and record payments.' },
        { type: 'credit-notes' as TabType, title: 'Credit Notes', icon: ReceiptRefundIcon, description: 'Issue and track customer credits.' },
        { type: 'sao' as TabType, title: 'Statement of Accounts', icon: DocumentChartBarIcon, description: 'Generate and export client statements.' },
    ];

    return (
        <div className="flex flex-col h-full p-8 bg-white">
            <div className="mb-12">
                <button onClick={() => onNavigate('start')} className="flex items-center text-sm font-medium text-brand-gray-600 hover:text-brand-blue-dark transition-colors" aria-label="Go back to dashboard">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-grow">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-brand-blue-dark mt-4">Accounts Hub</h1>
                    <p className="text-lg text-brand-gray-600 mt-2">Select an accounting task.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                    {panels.map(panel => (
                        <button
                            key={panel.type}
                            onClick={() => onNavigate(panel.type)}
                            className="group flex flex-col items-center justify-center p-8 bg-brand-gray-50 rounded-xl border-2 border-transparent hover:border-brand-blue hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out text-center"
                            aria-label={`Navigate to ${panel.title}`}
                        >
                            <div className="mb-4 p-4 bg-brand-blue-light rounded-full text-white transition-colors group-hover:bg-brand-accent">
                                <panel.icon className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-semibold text-brand-blue-dark">{panel.title}</h2>
                            <p className="text-brand-gray-500 mt-1">{panel.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccountsHubPage;