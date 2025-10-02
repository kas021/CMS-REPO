import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightOnRectangleIcon, TruckIcon, ChevronRightIcon, EllipsisVerticalIcon, HomeIcon } from './icons';
import { JobStatus, DriverJobSummary, DriverJobDetail } from '../types';
import DriverJobDetailComponent from './DriverJobDetail';


interface AuthenticatedUser {
    id: number;
    username: string;
    role: 'super_admin' | 'admin' | 'driver';
}

interface DriverDashboardProps {
    user: AuthenticatedUser;
    onLogout: () => void;
}

// MOCK DATA (to be replaced with API calls)
const MOCK_DRIVER_JOBS: DriverJobSummary[] = [
    { id: 2001, awbRef: "AWB-75832-1", pickupCity: "London", deliveryCity: "Manchester", status: JobStatus.ASSIGNED },
    { id: 2002, awbRef: "AWB-19475-2", pickupCity: "Birmingham", deliveryCity: "Glasgow", status: JobStatus.ASSIGNED },
    { id: 2003, awbRef: "AWB-54321-3", pickupCity: "Leeds", deliveryCity: "Bristol", status: JobStatus.EN_ROUTE },
];

const MOCK_DRIVER_HISTORY: DriverJobSummary[] = [
     { id: 2004, awbRef: "AWB-98765-4", pickupCity: "Sheffield", deliveryCity: "London", status: JobStatus.DELIVERED },
];

const MOCK_DRIVER_JOB_DETAILS: { [key: number]: DriverJobDetail } = {
    2001: { id: 2001, awbRef: "AWB-75832-1", pickupCity: "London", deliveryCity: "Manchester", status: JobStatus.ASSIGNED, pickupAddress: "123 Distribution Way, London, E1 6AN", deliveryAddress: "456 Industrial Park, Manchester, M1 2HF", description: "5 pallets of consumer electronics", note: "Deliver to back entrance, receiving dept closes at 4 PM.", pcs: 5, weight: 1250 },
    2002: { id: 2002, awbRef: "AWB-19475-2", pickupCity: "Birmingham", deliveryCity: "Glasgow", status: JobStatus.ASSIGNED, pickupAddress: "789 Trade St, Birmingham, B1 1QU", deliveryAddress: "101 Commerce Blvd, Glasgow, G1 1XX", description: "2 crates of machine parts", note: "", pcs: 2, weight: 800 },
    2003: { id: 2003, awbRef: "AWB-54321-3", pickupCity: "Leeds", deliveryCity: "Bristol", status: JobStatus.EN_ROUTE, pickupAddress: "45 Industrial Ave, Leeds, LS1 5SU", deliveryAddress: "67 Portside Dr, Bristol, BS1 5TT", description: "10 rolls of fabric", note: "Call recipient 30 mins before arrival.", pcs: 10, weight: 500 },
    2004: { id: 2004, awbRef: "AWB-98765-4", pickupCity: "Sheffield", deliveryCity: "London", status: JobStatus.DELIVERED, pickupAddress: "22 Steelworks Rd, Sheffield, S1 2GY", deliveryAddress: "88 Retail Park, London, W1T 3NL", description: "1 shipment of furniture", note: "Handle with care.", pcs: 15, weight: 2100 },
};

type DriverView = 'home' | 'history' | 'settings';

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout }) => {
    const [view, setView] = useState<DriverView>('home');
    const [menuOpen, setMenuOpen] = useState(false);
    const [jobs, setJobs] = useState<DriverJobSummary[]>(MOCK_DRIVER_JOBS);
    const [history, setHistory] = useState<DriverJobSummary[]>(MOCK_DRIVER_HISTORY);
    const [selectedJob, setSelectedJob] = useState<DriverJobDetail | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleSelectJob = (job: DriverJobSummary) => {
        // In a real app, this would fetch the full job details by ID from the backend stub
        const jobDetail = MOCK_DRIVER_JOB_DETAILS[job.id];
        // We need to ensure the status is up-to-date from the list view
        const currentJobState = [...jobs, ...history].find(j => j.id === job.id);
        if (jobDetail && currentJobState) {
            setSelectedJob({ ...jobDetail, status: currentJobState.status });
        }
    };
    
    const handleUpdateStatus = (jobId: number, newStatus: JobStatus) => {
        // This simulates a POST request to the backend stub and then updates local state
        
        // 1. Update the main job list
        const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j);
        setJobs(updatedJobs);

        // 2. If the job is now delivered, move it to history
        if (newStatus === JobStatus.DELIVERED) {
            const jobToMove = updatedJobs.find(j => j.id === jobId);
            if(jobToMove) {
                setJobs(updatedJobs.filter(j => j.id !== jobId));
                setHistory(prev => [jobToMove, ...prev]);
            }
        }

        // 3. Update the detailed view if it's the current job
        if (selectedJob && selectedJob.id === jobId) {
            setSelectedJob(prev => prev ? { ...prev, status: newStatus } : null);
        }
    };

    const handleBackToList = () => {
        setSelectedJob(null);
    };

    const getStatusChip = (status: JobStatus) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case JobStatus.ASSIGNED: return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Assigned</span>;
            case JobStatus.EN_ROUTE: return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>En Route</span>;
            case JobStatus.DELIVERED: return <span className={`${baseClasses} bg-green-100 text-green-800`}>Delivered</span>;
            default: return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
        }
    };
    
    const renderContent = () => {
        if (selectedJob) {
            return <DriverJobDetailComponent job={selectedJob} onBack={handleBackToList} onUpdateStatus={handleUpdateStatus} />;
        }
        
        switch(view) {
            case 'home': return <JobList jobs={jobs} title="Active Jobs" onSelectJob={handleSelectJob} getStatusChip={getStatusChip} />;
            case 'history': return <JobList jobs={history} title="Completed Jobs" onSelectJob={handleSelectJob} getStatusChip={getStatusChip} />;
            case 'settings': return <SettingsPlaceholder />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-screen font-sans antialiased text-brand-gray-900">
            <header className="bg-white shadow-sm">
                 <div className="flex items-center justify-between px-4 py-2 border-b border-brand-gray-200">
                    <div className="flex items-center">
                         <img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0ibG9nb0dyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmEzYWIyIj48L3N0b3A+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMmE1YTlkIj48L3N0b3A+PC9saW5lYXJHcmFdiZW50D48L2RlZnM+PGcgZmlsbD0idXJsKCNsb2dvR3JhZGllbnQpIj48cGF0aCBkPSJNNTUuNCwyOS45YzAsMTYuNS0xMy40LDI5LjktMjkuOSwyOS45Uy00LjQsNDYuNCwtNC40LDI5LjlTOSwwLDI1LjUsMGM4LjIsMCwxNS42LDMuMywyMC45LDguOGwtNS42LDUuNiBjLTMuOS0zLjktOS4xLTYuMy0xNC44LTYuM2MtMTEuNiwwLTIxLDkuNC0yMSwyMXM5LjQsMjEsMjEsMjFjMTEuNiwwLDIxLTkuNCwyMS0yMUg0Ni41bDUuNS01LjVsLTUuNS01LjVINTUuNHoiPjwvcGF0aCBkPSJNNDIuOSwyNC4ybC0xNC42LTkuMWMtMC42LTAuNC0xLjQtMC40LTIsMEwxMS43LDI0LjJjLTAuOCwwLjUtMS4zLDEuNC0xLjMsMi40djEuM2wxMi4xLTUuNGwxMi4xLDUuNHYtMS4zIEM0NC4yLDI1LjYsNDMuNywyNC43LDQyLjksMjQuMnogTTI1LjYsMjkuOWwtMTMuMyw2Ljd2Mi4xbDEzLjMtNC4ybDEzLjMsNC4ydjIuMUwyNS42LDI5Ljl6Ij48L3BhdGg+PC9nPjx0ZXh0IHg9IjcwIiB5PSI0NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMWYyOTM3Ij5BTFM8dHNwYW4gZm9udC1zaXplPSIyNCIgZHk9Ii0wLjE1ZW0iIGZpbGw9IiM0YjU1NjMiPiBMdGQ8L3RzcGFuPjwvdGV4dD48L3N2Zz4=" alt="ALS Ltd logo" className="h-8 w-auto mr-3 object-contain" />
                        <h1 className="text-xl font-semibold text-brand-blue-dark">Driver Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">{user.username}</span>
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-full hover:bg-gray-200">
                                <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Home</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setView('history'); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">History</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setView('settings'); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                                    <div className="border-t my-1"></div>
                                    <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
             <main className="flex-1 overflow-y-auto bg-brand-gray-100 p-4 md:p-6">
                {renderContent()}
            </main>
        </div>
    );
};

interface JobListProps {
    jobs: DriverJobSummary[];
    title: string;
    onSelectJob: (job: DriverJobSummary) => void;
    // FIX: Replace JSX.Element with React.ReactElement to resolve namespace issue.
    getStatusChip: (status: JobStatus) => React.ReactElement;
}
const JobList: React.FC<JobListProps> = ({ jobs, title, onSelectJob, getStatusChip }) => (
    <div className="bg-white rounded-lg shadow-md h-full overflow-hidden flex flex-col">
        <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-brand-blue-dark">{title}</h2>
        </div>
        {jobs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">No jobs to display.</div>
        ) : (
            <ul className="divide-y divide-gray-200 flex-1 overflow-y-auto">
                {jobs.map(job => (
                    <li key={job.id}>
                        <button onClick={() => onSelectJob(job)} className="w-full text-left p-4 hover:bg-brand-gray-50 focus:outline-none focus:bg-brand-gray-100 transition duration-150 ease-in-out">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-brand-blue-dark">{job.awbRef}</p>
                                    <div className="flex items-center text-sm text-brand-gray-600 mt-1">
                                        <TruckIcon className="w-4 h-4 mr-2" />
                                        <span>{job.pickupCity}</span>
                                        <ChevronRightIcon className="w-4 h-4 mx-1 text-brand-gray-400" />
                                        <span>{job.deliveryCity}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {getStatusChip(job.status)}
                                    <ChevronRightIcon className="w-5 h-5 text-brand-gray-400" />
                                </div>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const SettingsPlaceholder: React.FC = () => (
     <div className="bg-white rounded-lg shadow-md h-full overflow-hidden flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold text-brand-blue-dark">Settings</h2>
        <p className="mt-2 text-gray-500">This page is under construction.</p>
    </div>
);

export default DriverDashboard;