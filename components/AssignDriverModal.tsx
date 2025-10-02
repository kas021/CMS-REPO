import React, { useState } from 'react';
import { Driver } from '../types';
import { XMarkIcon, TruckIcon } from './icons';

interface AssignDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    drivers: Driver[];
    onAssign: (driverId: number) => void;
}

const AssignDriverModal: React.FC<AssignDriverModalProps> = ({ isOpen, onClose, drivers, onAssign }) => {
    const [selectedDriverId, setSelectedDriverId] = useState<number>(drivers[0]?.id || 0);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDriverId) {
            onAssign(selectedDriverId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all text-left">
                <div className="flex justify-between items-center p-4 border-b border-brand-gray-200">
                    <h2 className="text-lg font-semibold text-brand-blue-dark">Assign Driver</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-gray-200" aria-label="Close">
                        <XMarkIcon className="w-6 h-6 text-brand-gray-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="driver-select" className="block text-sm font-medium text-brand-gray-700 mb-2">
                            Select a driver to assign to the selected jobs:
                        </label>
                        <select
                            id="driver-select"
                            value={selectedDriverId}
                            onChange={(e) => setSelectedDriverId(Number(e.target.value))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md"
                        >
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.name} ({driver.vehicleType} - {driver.vehicleRegistration})
                                </option>
                            ))}
                        </select>
                        {drivers.length === 0 && <p className="text-xs text-red-600 mt-2">No drivers available. Please add drivers in the Company Data page.</p>}
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
                            disabled={!selectedDriverId}
                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-light disabled:bg-brand-gray-400"
                        >
                            <TruckIcon className="w-5 h-5 mr-2" />
                            Assign Driver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignDriverModal;