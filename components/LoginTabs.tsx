import React, { useState } from 'react';
import { CompanyLogoIcon, UserCircleIcon, LockClosedIcon } from './icons';
import { AppRole } from '../types';
import { API_BASE_URL } from '../utils/api';

type AuthenticatedUser = {
    id: number;
    username: string;
    role: AppRole;
};

interface LoginTabsProps {
    onLogin: (token: string, user: AuthenticatedUser) => void;
}

type LoginTab = 'admin' | 'driver' | 'customer';

const LoginTabs: React.FC<LoginTabsProps> = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState<LoginTab>('admin');
    const [backendUrl, setBackendUrl] = useState(API_BASE_URL);

    const handleUrlSave = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('backend_url', backendUrl);
        window.location.reload();
    };

    const renderForm = () => {
        switch (activeTab) {
            case 'admin':
                return <LoginForm key="admin" role="admin" onLogin={onLogin} />;
            case 'driver':
                return <LoginForm key="driver" role="driver" onLogin={onLogin} />;
            case 'customer':
                return (
                    <div className="text-center p-8">
                        <h3 className="text-xl font-semibold text-brand-blue-dark">Customer Portal</h3>
                        <p className="mt-2 text-brand-gray-600">The customer portal is coming soon. Please check back later.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="text-center p-8 bg-brand-gray-50 border-b">
                    <CompanyLogoIcon className="w-auto h-12 mx-auto" />
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex justify-around" aria-label="Tabs">
                        <button onClick={() => setActiveTab('admin')} className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'admin' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Admin</button>
                        <button onClick={() => setActiveTab('driver')} className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'driver' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Driver</button>
                        <button onClick={() => setActiveTab('customer')} className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'customer' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Customer</button>
                    </nav>
                </div>
                
                <div className="p-8">
                    {renderForm()}
                </div>
            </div>

            <div className="w-full max-w-md p-4 mt-4 bg-white rounded-lg shadow-md">
                <form onSubmit={handleUrlSave} className="flex items-end space-x-2">
                    <div className="flex-grow">
                        <label htmlFor="backend-url" className="block text-xs font-medium text-gray-600">Backend URL</label>
                        <input
                            id="backend-url"
                            type="text"
                            value={backendUrl}
                            onChange={(e) => setBackendUrl(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md text-sm"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light text-sm">
                        Save & Reload
                    </button>
                </form>
            </div>
        </div>
    );
};

interface LoginFormProps {
    role: 'admin' | 'driver';
    onLogin: (token: string, user: AuthenticatedUser) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // MOCK API call. In a real app, this would be a fetch to the backend.
        setTimeout(() => {
            if (role === 'admin') {
                if (username === 'sadmin' && password === 'London777') {
                    const token = `header.${btoa(JSON.stringify({ sub: 'sadmin', role: 'super_admin' }))}.signature`;
                    onLogin(token, { id: 0, username: 'sadmin', role: 'super_admin' });
                } else if (username === 'admin' && password === 'password') {
                    const token = `header.${btoa(JSON.stringify({ sub: 'admin', role: 'admin' }))}.signature`;
                    onLogin(token, { id: 1, username: 'admin', role: 'admin' });
                } else {
                    setError('Invalid admin username or password.');
                }
            } else if (role === 'driver') {
                // Mocking a successful driver login
                if (password === 'password123') {
                     const token = `header.${btoa(JSON.stringify({ sub: username, role: 'driver', sub_id: 10 }))}.signature`;
                     onLogin(token, { id: 10, username: username, role: 'driver' });
                } else {
                    setError('Invalid driver username or password.');
                }
            }
            setIsLoading(false);
        }, 1000);
    };

    const isDriver = role === 'driver';

    return (
        <div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label htmlFor={`${role}-username`} className="sr-only">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserCircleIcon className="h-5 w-5 text-gray-400" /></div>
                            <input id={`${role}-username`} name="username" type="text" autoComplete="username" required className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor={`${role}-password`} className="sr-only">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockClosedIcon className="h-5 w-5 text-gray-400" /></div>
                            <input id={`${role}-password`} name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                </div>

                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md"><p className="text-sm text-red-700">{error}</p></div>}

                <div>
                    <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-dark disabled:bg-brand-gray-400">
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>
            {role === 'admin' && (
                <p className="mt-4 text-xs text-center text-brand-gray-500">
                    Hint: Use `sadmin`/`London777` or `admin`/`password`.
                </p>
            )}
             {role === 'driver' && (
                <p className="mt-4 text-xs text-center text-brand-gray-500">
                    Hint: Use a driver username (e.g. `johnsmith`) and `password123`.
                </p>
            )}
        </div>
    );
};

export default LoginTabs;
