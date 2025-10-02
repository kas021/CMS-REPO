import React from 'react';
import { ExclamationTriangleIcon } from './icons';

const AccessDeniedPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-white text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold text-brand-blue-dark">Access Denied</h1>
            <p className="mt-2 text-gray-600 max-w-md">
                You do not have the required permissions to view this page. Please contact a Super Admin if you believe this is an error.
            </p>
        </div>
    );
};

export default AccessDeniedPage;