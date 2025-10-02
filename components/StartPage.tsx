import React from 'react';
import { TabType, CompanyDetails } from '../types';
import { PlusIcon, UserGroupIcon, DocumentChartBarIcon, FolderIcon, BuildingOffice2Icon, DocumentTextIcon } from './icons';

interface StartPageProps {
    onNavigate: (type: TabType) => void;
    companyDetails: CompanyDetails;
}

const StartPage: React.FC<StartPageProps> = ({ onNavigate, companyDetails }) => {
    
    const panels = [
        { type: 'data-entry' as TabType, title: 'Data Entry', icon: PlusIcon, description: 'Create and manage new jobs.' },
        { type: 'data-management' as TabType, title: 'Data Management', icon: FolderIcon, description: 'View, filter, and update all jobs.' },
        { type: 'company-data' as TabType, title: 'Company Settings', icon: BuildingOffice2Icon, description: 'Manage branding, customers and drivers.' },
        { type: 'accounts-hub' as TabType, title: 'Accounts', icon: UserGroupIcon, description: 'Manage invoices and customer accounts.' },
        { type: 'system-stats' as TabType, title: 'System Statistics', icon: DocumentChartBarIcon, description: 'View key system usage metrics.' },
        { type: 'reports' as TabType, title: 'Reports', icon: DocumentTextIcon, description: 'Generate and view logistics reports.' },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-white">
            <div className="text-center mb-12">
                 <img src={companyDetails.logo} alt={`${companyDetails.name} Logo`} className="mx-auto h-16 w-auto object-contain" />
                <h1 className="text-4xl font-bold text-brand-blue-dark mt-4">Welcome to {companyDetails.name} CMS</h1>
                <p className="text-lg text-brand-gray-600 mt-2">Select a task to get started.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 w-full max-w-7xl">
                {panels.map(panel => (
                    <button
                        key={panel.type}
                        onClick={() => onNavigate(panel.type)}
                        className="group flex flex-col items-center justify-center p-6 bg-brand-gray-50 rounded-xl border-2 border-transparent hover:border-brand-blue hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out text-center"
                        aria-label={`Navigate to ${panel.title}`}
                    >
                        <div className="mb-4 p-4 bg-brand-blue-light rounded-full text-white transition-colors group-hover:bg-brand-accent">
                            <panel.icon className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-semibold text-brand-blue-dark">{panel.title}</h2>
                        <p className="text-brand-gray-500 mt-1 text-sm">{panel.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StartPage;