import React, { useState, useMemo, useCallback } from 'react';
import { Job, JobStatus, TabStatus, JobFormData, Driver, Invoice, Customer } from '../types';
import { MAIN_SOURCES } from '../constants';
import JobForm from './JobForm';
import JobsTable from './JobsTable';
import { SearchIcon, CalendarIcon, PlusIcon } from './icons';

interface DataManagementPageProps {
    jobs: Job[];
    drivers: Driver[];
    customers: Customer[];
    invoices: Invoice[];
    onSaveJob: (jobData: JobFormData) => void;
    onDeleteJob: (jobId: number) => void;
    onDeleteJobs: (jobIds: number[]) => void;
    onUpdateStatus: (jobIds: number[], status: JobStatus) => void;
    onAssignDriver: (jobIds: number[], driverId: number) => void;
    tabId: string;
}

const DataManagementPage: React.FC<DataManagementPageProps> = ({ jobs, drivers, customers, invoices, onSaveJob, onDeleteJob, onDeleteJobs, onUpdateStatus, onAssignDriver, tabId }) => {
    const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');

    const filteredJobs = useMemo(() => {
        let results = jobs;
        if (appliedSearch) {
             const lowercasedTerm = appliedSearch.toLowerCase();
             results = jobs.filter(job =>
                job.company.toLowerCase().includes(lowercasedTerm) ||
                job.awbRef.toLowerCase().includes(lowercasedTerm) ||
                job.description.toLowerCase().includes(lowercasedTerm)
            );
        }

        if (activeTab === 'ALL') {
            return results;
        }
        return results.filter(job => job.status === activeTab);
    }, [jobs, activeTab, appliedSearch]);

    const handleSaveJob = useCallback((jobData: JobFormData) => {
        onSaveJob(jobData);
        setSelectedJob(null);
        setIsFormVisible(false);
    }, [onSaveJob]);
    
    const handleEditJob = useCallback((job: Job) => {
        setSelectedJob(job);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleAddNewJob = () => {
        setSelectedJob(null);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const tabs: { label: string, status: TabStatus }[] = [
        { label: 'All', status: 'ALL' },
        { label: 'Assigned', status: JobStatus.ASSIGNED },
        { label: 'Pending', status: JobStatus.PENDING },
        { label: 'Completed', status: JobStatus.COMPLETED },
        { label: 'Cancelled', status: JobStatus.CANCELLED },
    ];

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold text-brand-blue-dark">Data Management</h1>
            
            <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-2 xl:col-span-1">
                        <label htmlFor="search-text-mgmt" className="text-sm font-medium text-gray-600">Company/AWB/Ref</label>
                        <input id="search-text-mgmt" type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue bg-brand-gray-100 text-black" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Date From</label>
                        <input type="date" className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue bg-brand-gray-100 text-black" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Date To</label>
                        <input type="date" className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue bg-brand-gray-100 text-black" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Main Source</label>
                        <select className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue bg-brand-gray-100 text-black">
                            <option>All Sources</option>
                            {MAIN_SOURCES.map(source => <option key={source}>{source}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-600">Customer</label>
                        <select className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue bg-brand-gray-100 text-black">
                            <option>All Customers</option>
                            {customers.map(c => <option key={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={() => setAppliedSearch(searchText)} className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light transition">
                        <SearchIcon className="w-5 h-5 mr-2" /> Search
                    </button>
                    <button className="flex items-center px-4 py-2 bg-brand-accent text-white rounded-md hover:bg-opacity-90 transition">
                        <CalendarIcon className="w-5 h-5 mr-2" /> Today
                    </button>
                </div>
            </div>

            {isFormVisible && (
                <JobForm
                    job={selectedJob}
                    customers={customers}
                    onSave={handleSaveJob}
                    onCancel={() => { setIsFormVisible(false); setSelectedJob(null); }}
                    tabId={tabId}
                />
            )}
            
            <div className="bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center p-4 border-b flex-wrap gap-4">
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
                     <button
                        onClick={handleAddNewJob}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" /> Add New Job
                    </button>
                </div>
                <JobsTable
                    jobs={filteredJobs}
                    drivers={drivers}
                    invoices={invoices}
                    onEdit={handleEditJob}
                    onDelete={onDeleteJob}
                    onDeleteMultiple={onDeleteJobs}
                    onUpdateStatus={onUpdateStatus}
                    onAssignDriver={onAssignDriver}
                />
            </div>
        </div>
    );
};

export default DataManagementPage;