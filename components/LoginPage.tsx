import React, { useState } from 'react';
import { CompanyLogoIcon, UserCircleIcon, LockClosedIcon } from './icons';
import { User } from '../types';

interface LoginPageProps {
    onLogin: (token: string, user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // This is a mock API call. Replace with actual fetch to backend.
        setTimeout(() => {
            if (username === 'sadmin' && password === 'London777') {
                // Mock a JWT token for super_admin
                const token = `header.${btoa(JSON.stringify({ sub: 'sadmin', role: 'super_admin' }))}.signature`;
                onLogin(token, { id: 0, username: 'sadmin', role: 'super_admin' });
            } else if (username === 'admin' && password === 'password') {
                 // Mock a JWT token for admin
                const token = `header.${btoa(JSON.stringify({ sub: 'admin', role: 'admin' }))}.signature`;
                onLogin(token, { id: 1, username: 'admin', role: 'admin' });
            } else {
                setError('Invalid username or password.');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
                <div className="text-center">
                    <CompanyLogoIcon className="w-auto h-12 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-brand-blue-dark">Logistics & Invoice CMS</h2>
                    <p className="mt-2 text-sm text-brand-gray-600">Please sign in to continue</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password-input" className="sr-only">Password</label>
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password-input"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-dark disabled:bg-brand-gray-400"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                 <p className="text-xs text-center text-brand-gray-500">
                    Hint: Use `sadmin`/`London777` for Super Admin, or `admin`/`password` for Normal Admin.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;