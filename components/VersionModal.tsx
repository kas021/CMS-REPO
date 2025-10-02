import React from 'react';
import { XMarkIcon, InformationCircleIcon } from './icons';

interface VersionModalProps {
    isOpen: boolean;
    onClose: () => void;
    version: string;
    onShowHistory: () => void;
}

const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose, version, onShowHistory }) => {
    if (!isOpen) return null;

    const handleShowHistory = () => {
        onShowHistory();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm transform transition-all text-center">
                <div className="flex justify-end p-2">
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-gray-200" aria-label="Close">
                        <XMarkIcon className="w-6 h-6 text-brand-gray-600" />
                    </button>
                </div>
                <div className="px-6 pb-6">
                    <InformationCircleIcon className="w-16 h-16 text-brand-blue mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-brand-blue-dark">Application Version</h2>
                    <p className="mt-2 text-brand-gray-600">You are currently running version:</p>
                    <p className="text-3xl font-mono font-bold text-brand-accent bg-brand-gray-100 rounded-md py-2 mt-2">{version}</p>
                    <div className="mt-6 flex justify-center space-x-3">
                        <button
                            type="button"
                            onClick={handleShowHistory}
                            className="px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-md hover:bg-brand-blue-light"
                        >
                            More...
                        </button>
                         <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-brand-gray-200 text-brand-gray-800 text-sm font-medium rounded-md hover:bg-brand-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VersionModal;