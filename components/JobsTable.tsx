

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Job, JobStatus, Driver, Invoice, InvoiceStatus } from '../types';
import { PdfIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, TrashIcon } from './icons';
import AssignDriverModal from './AssignDriverModal';
import Pagination from './Pagination';
import { safeDateFormat } from '../utils/date';

interface JobsTableProps {
    jobs: Job[];
    drivers: Driver[];
    invoices: Invoice[];
    onEdit: (job: Job) => void;
    onDelete: (jobId: number) => void;
    onDeleteMultiple: (jobIds: number[]) => void;
    onUpdateStatus: (jobIds: number[], status: JobStatus) => void;
    onAssignDriver: (jobIds: number[], driverId: number) => void;
}

const PAGE_SIZES = [50, 100, 150, 200];

const JobsTable: React.FC<JobsTableProps> = ({ jobs, drivers, invoices, onEdit, onDelete, onUpdateStatus, onDeleteMultiple, onAssignDriver }) => {
    const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);
    const checkboxRef = useRef<HTMLInputElement>(null);

    const driversMap = useMemo(() => {
        return new Map(drivers.map(driver => [driver.id, driver]));
    }, [drivers]);
    
    const paginatedJobs = useMemo(() => {
        if (pageSize === 0) return jobs; // "All" is selected
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return jobs.slice(startIndex, endIndex);
    }, [jobs, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when jobs list changes
        setSelectedJobIds([]);
    }, [jobs, pageSize]);

    const isAllSelectedOnPage = useMemo(() => paginatedJobs.length > 0 && selectedJobIds.length === paginatedJobs.length, [paginatedJobs, selectedJobIds]);
    const isIndeterminate = useMemo(() => selectedJobIds.length > 0 && selectedJobIds.length < paginatedJobs.length, [paginatedJobs, selectedJobIds]);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);
    
    const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedJobIds(paginatedJobs.map(job => job.id));
        } else {
            setSelectedJobIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) {
            setSelectedJobIds(prev => [...prev, id]);
        } else {
            setSelectedJobIds(prev => prev.filter(jobId => jobId !== id));
        }
    };

    const handleDelete = (jobId: number) => {
        if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            onDelete(jobId);
        }
    }

    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedJobIds.length} selected job(s)? This action cannot be undone.`)) {
            onDeleteMultiple(selectedJobIds);
            setSelectedJobIds([]);
        }
    };
    
    const handleBulkUpdateStatus = (status: JobStatus) => {
        onUpdateStatus(selectedJobIds, status);
        setSelectedJobIds([]);
    }

    const handleAssignDriver = (driverId: number) => {
        onAssignDriver(selectedJobIds, driverId);
        setIsAssignModalOpen(false);
        setSelectedJobIds([]);
    };

    const getStatusChip = (status: JobStatus) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case JobStatus.COMPLETED:
                return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
            case JobStatus.ASSIGNED:
                return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Assigned</span>;
            case JobStatus.PENDING:
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
            case JobStatus.CANCELLED:
                return <span className={`${baseClasses} bg-red-100 text-red-800`}>Cancelled</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
        }
    };
    
    const getInvoiceStatusChip = (job: Job) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        if (!job.invoiceId) {
            return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Pending</span>;
        }
        const invoice = invoices.find(inv => inv.id === job.invoiceId);
        if (!invoice) {
            return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Pending</span>;
        }

        switch (invoice.status) {
            case InvoiceStatus.PAID:
                return <span className={`${baseClasses} bg-green-100 text-green-800`}>Paid</span>;
            case InvoiceStatus.PARTIALLY_PAID:
                return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Partially Paid</span>;
            case InvoiceStatus.UNPAID:
                return <span className={`${baseClasses} bg-red-100 text-red-800`}>Unpaid</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
        }
    };


    return (
        <div className="overflow-x-auto">
            <AssignDriverModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                drivers={drivers}
                onAssign={handleAssignDriver}
            />
             {selectedJobIds.length > 0 && (
                <div className="p-4 bg-brand-gray-50 border-b flex items-center space-x-4 flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700">{selectedJobIds.length} job(s) selected.</span>
                    <div className="flex-grow" />
                    <button onClick={() => setIsAssignModalOpen(true)} className="flex items-center px-3 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                       Assign Selected
                    </button>
                     <button onClick={() => handleBulkUpdateStatus(JobStatus.COMPLETED)} className="flex items-center px-3 py-1.5 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                       <CheckCircleIcon className="w-4 h-4 mr-1"/> Mark as Completed
                    </button>
                    <button onClick={() => handleBulkUpdateStatus(JobStatus.PENDING)} className="flex items-center px-3 py-1.5 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition">
                       <ArrowPathIcon className="w-4 h-4 mr-1"/> Restore
                    </button>
                    <button onClick={() => handleBulkUpdateStatus(JobStatus.CANCELLED)} className="flex items-center px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition">
                        <XCircleIcon className="w-4 h-4 mr-1"/> Cancel Selected
                    </button>
                    <button onClick={handleBulkDelete} className="flex items-center px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                        <TrashIcon className="w-4 h-4 mr-1"/> Delete Selected
                    </button>
                </div>
            )}
            <table className="min-w-full bg-white text-sm">
                <thead className="bg-brand-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <tr>
                        <th className="p-3">
                            <input type="checkbox" className="form-checkbox h-4 w-4 text-brand-blue" 
                                ref={checkboxRef}
                                checked={isAllSelectedOnPage}
                                onChange={handleSelectAllOnPage}
                                aria-label="Select all jobs on this page"
                            />
                        </th>
                        {['S.No.', 'Company', 'AWB/Ref', 'Driver', 'Ship Status', 'Order Time/Date', 'Due Date', 'Pickup/Delivery', 'PCS', 'Weight', 'CBM', 'Job Status', 'Invoice', 'Actions'].map(header => (
                            <th key={header} className="p-3">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {paginatedJobs.map((job, index) => {
                        const cbm = (job.dimensionH * job.dimensionL * job.dimensionW).toFixed(2);
                        const absoluteIndex = (currentPage - 1) * pageSize + index + 1;
                        const driver = job.driverId ? driversMap.get(job.driverId) : undefined;
                        return (
                        <tr key={job.id} className={`hover:bg-gray-50 ${selectedJobIds.includes(job.id) ? 'bg-blue-50' : ''}`}>
                            <td className="p-3"><input type="checkbox" className="form-checkbox h-4 w-4 text-brand-blue" checked={selectedJobIds.includes(job.id)} onChange={e => handleSelectOne(e, job.id)} aria-labelledby={`job-company-${job.id}`} /></td>
                            <td className="p-3 text-black">{absoluteIndex}</td>
                            <td id={`job-company-${job.id}`} className="p-3 font-medium text-black">{job.company}</td>
                            <td className="p-3 text-brand-blue font-semibold">{job.awbRef}</td>
                            <td className="p-3 text-black">
                                {driver
                                    ? `${driver.name} (${driver.vehicleType} - ${driver.vehicleRegistration})`
                                    : 'Unassigned'}
                            </td>
                            <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${job.shipStatus === 'Priority' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{job.shipStatus}</span></td>
                            <td className="p-3 text-black">{safeDateFormat(job.orderDateTime)}</td>
                            <td className="p-3 text-black">{safeDateFormat(job.dueDateTime)}</td>
                            <td className="p-3 text-black">{job.pickupAddress.split(',').pop()} / {job.deliveryAddress.split(',').pop()}</td>
                            <td className="p-3 text-black">{job.pcs}</td>
                            <td className="p-3 text-black">{job.weight} kg</td>
                            <td className="p-3 text-black">{cbm}</td>
                            <td className="p-3">{getStatusChip(job.status)}</td>
                            <td className="p-3">{getInvoiceStatusChip(job)}</td>
                            <td className="p-3 flex items-center space-x-2">
                                <button onClick={() => onEdit(job)} className="text-blue-600 hover:text-blue-800">Edit</button>
                                <span>|</span>
                                <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                <span>|</span>
                                <button onClick={() => window.print()} className="text-gray-500 hover:text-gray-700" aria-label="Print job">
                                    <PdfIcon className="w-5 h-5"/>
                                </button>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
            
             <Pagination
                currentPage={currentPage}
                totalItems={jobs.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizes={[...PAGE_SIZES, { label: 'All', value: 0 }]}
            />
        </div>
    );
};

export default JobsTable;