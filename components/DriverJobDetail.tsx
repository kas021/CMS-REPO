import React from 'react';
import { DriverJobDetail, JobStatus } from '../types';
import { MapPinIcon, TruckIcon, CheckCircleIcon, ArrowLeftIcon, MapIcon } from './icons';

interface DriverJobDetailProps {
    job: DriverJobDetail;
    onBack: () => void;
    onUpdateStatus: (jobId: number, newStatus: JobStatus) => void;
}

const DriverJobDetailComponent: React.FC<DriverJobDetailProps> = ({ job, onBack, onUpdateStatus }) => {
    
    const renderActionButton = () => {
        switch (job.status) {
            case JobStatus.ASSIGNED:
                return (
                    <button 
                        onClick={() => onUpdateStatus(job.id, JobStatus.EN_ROUTE)}
                        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold"
                    >
                        <CheckCircleIcon className="w-6 h-6 mr-2"/>
                        Accept Job
                    </button>
                );
            case JobStatus.EN_ROUTE:
                return (
                     <button 
                        onClick={() => onUpdateStatus(job.id, JobStatus.DELIVERED)}
                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold"
                    >
                        <TruckIcon className="w-6 h-6 mr-2"/>
                        Mark as Delivered
                    </button>
                );
            case JobStatus.DELIVERED:
                 return (
                     <button 
                        disabled
                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed font-semibold"
                    >
                        <CheckCircleIcon className="w-6 h-6 mr-2"/>
                        Completed
                    </button>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-brand-gray-200" aria-label="Back to job list">
                    <ArrowLeftIcon className="w-5 h-5 text-brand-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-brand-blue-dark">Job Details: {job.awbRef}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-brand-blue-dark border-b pb-2 mb-4 flex items-center">
                            <MapPinIcon className="w-5 h-5 mr-2 text-brand-accent" />
                            Route Information
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="font-semibold text-gray-500 uppercase">Pickup</p>
                                <p className="text-brand-gray-800">{job.pickupAddress}</p>
                            </div>
                             <div>
                                <p className="font-semibold text-gray-500 uppercase">Delivery</p>
                                <p className="text-brand-gray-800">{job.deliveryAddress}</p>
                            </div>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-brand-blue-dark border-b pb-2 mb-4 flex items-center">
                            <TruckIcon className="w-5 h-5 mr-2 text-brand-accent" />
                            Shipment Details
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="font-semibold text-gray-500 uppercase">Description</p>
                                <p className="text-brand-gray-800">{job.description}</p>
                            </div>
                             <div>
                                <p className="font-semibold text-gray-500 uppercase">Pieces</p>
                                <p className="text-brand-gray-800">{job.pcs}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-500 uppercase">Weight</p>
                                <p className="text-brand-gray-800">{job.weight} kg</p>
                            </div>
                            <div className="col-span-2 md:col-span-3">
                                <p className="font-semibold text-gray-500 uppercase">Special Instructions</p>
                                <p className="text-brand-gray-800 italic">{job.note || 'None'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Map & Actions */}
                <div className="space-y-6">
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-brand-blue-dark border-b pb-2 mb-4 flex items-center">
                            <MapIcon className="w-5 h-5 mr-2 text-brand-accent" />
                            Map
                        </h2>
                        <div className="h-64 bg-brand-gray-200 rounded-md flex items-center justify-center text-brand-gray-500">
                            Map placeholder – integrate later
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <h2 className="text-lg font-semibold text-brand-blue-dark border-b pb-2 mb-4">Actions</h2>
                         {renderActionButton()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverJobDetailComponent;