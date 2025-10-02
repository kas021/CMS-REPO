import React, { useState, useEffect } from 'react';
import { User, UserUpdateData } from '../types';
import { UserCircleIcon, ArrowRightOnRectangleIcon, PlusIcon, TrashIcon, PencilIcon, LockClosedIcon, SaveIcon } from './icons';
import EditUserModal from './EditUserModal';
import { API_BASE_URL } from '../utils/api';

interface ProfilePageProps {
    user: User;
    onLogout: () => void;
    users: User[];
    onAddUser: (username: string, password: string) => void;
    onUpdateUser: (userData: UserUpdateData) => void;
    onDeleteUser: (userId: number) => void;
}

interface ApiKey {
    name: string;
    value: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, users, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [activeTab, setActiveTab] = useState('account');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // State for API Keys Panel
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoadingKeys, setIsLoadingKeys] = useState(false);
    const [keysError, setKeysError] = useState<string | null>(null);
    const [keysSuccess, setKeysSuccess] = useState<string | null>(null);


    useEffect(() => {
        if (activeTab === 'api-keys' && user.role === 'super_admin') {
            const fetchApiKeys = async () => {
                setIsLoadingKeys(true);
                setKeysError(null);
                const token = localStorage.getItem('token');
                if (!token) {
                    setKeysError("Authentication token not found.");
                    setIsLoadingKeys(false);
                    return;
                }
                
                try {
                    // MOCK: Replace with actual fetch call
                    // const response = await fetch(`${API_BASE_URL}/settings/api-keys`, { headers: { 'Authorization': `Bearer ${token}` }});
                    // if (!response.ok) throw new Error('Failed to fetch API keys.');
                    // const data = await response.json();
                    
                    // Mocked data for UI development
                    const mockData = [
                        { name: 'GEMINI_API_KEY', value: 'mock-gemini-key-for-ui-display' },
                    ];
                    setApiKeys(mockData);

                } catch (error: any) {
                    setKeysError(error.message || 'An error occurred.');
                } finally {
                    setIsLoadingKeys(false);
                }
            };
            fetchApiKeys();
        }
    }, [activeTab, user.role]);

    const handleKeyChange = (index: number, value: string) => {
        const updatedKeys = [...apiKeys];
        updatedKeys[index].value = value;
        setApiKeys(updatedKeys);
    };

    const handleSaveApiKeys = async () => {
        setKeysError(null);
        setKeysSuccess(null);
        const token = localStorage.getItem('token');
        if (!token) {
            setKeysError("Authentication token not found.");
            return;
        }

        try {
            // MOCK: Replace with actual fetch call
            // const response = await fetch(`${API_BASE_URL}/settings/api-keys`, { 
            //     method: 'POST',
            //     headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            //     body: JSON.stringify(apiKeys)
            // });
            // if (!response.ok) throw new Error('Failed to save API keys.');
            
            setKeysSuccess('API keys saved successfully!');
            setTimeout(() => setKeysSuccess(null), 3000);

        } catch (error: any) {
             setKeysError(error.message || 'An error occurred while saving.');
        }
    };


    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUsername && newPassword) {
            onAddUser(newUsername, newPassword);
            setNewUsername('');
            setNewPassword('');
        }
    };

    const handleDeleteUser = (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            onDeleteUser(userId);
        }
    };
    
    const handleSaveUser = (userData: UserUpdateData) => {
        onUpdateUser(userData);
        setEditingUser(null);
    };
    
    return (
        <div className="p-6 md:p-8 space-y-8">
            {editingUser && (
                <EditUserModal
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    user={editingUser}
                    onSave={handleSaveUser}
                />
            )}
            <header className="flex items-center space-x-4">
                <UserCircleIcon className="w-12 h-12 text-brand-blue" />
                <div>
                    <h1 className="text-2xl font-bold text-brand-blue-dark">{user.username}</h1>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.role === 'super_admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                </div>
            </header>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('account')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'account' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Account Settings</button>
                    {user.role === 'super_admin' && <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>User Management</button>}
                    {user.role === 'super_admin' && <button onClick={() => setActiveTab('api-keys')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'api-keys' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>API Keys</button>}
                </nav>
            </div>

            {activeTab === 'account' && (
                <section className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6 max-w-lg">
                    <h2 className="text-xl font-semibold text-brand-blue-dark mb-4">Account Settings</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Change Password</label>
                            <input type="password" placeholder="New Password" className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Confirm New Password</label>
                            <input type="password" placeholder="Confirm Password" className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light transition">
                            Save Password
                        </button>
                    </form>
                    <div className="mt-8 border-t pt-6">
                         <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" /> Logout
                        </button>
                    </div>
                </section>
            )}

            {activeTab === 'users' && user.role === 'super_admin' && (
                <section className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6 max-w-lg">
                     <h2 className="text-xl font-semibold text-brand-blue-dark mb-4">User Management</h2>
                     <form onSubmit={handleAddUser} className="space-y-4 mb-6 p-4 bg-white rounded-md border">
                        <h3 className="font-semibold text-gray-700">Add New Admin User</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Username</label>
                                <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="New username" className="mt-1 w-full p-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="mt-1 w-full p-2 border rounded-md" required />
                            </div>
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                            <PlusIcon className="w-5 h-5 mr-2" /> Add User
                        </button>
                     </form>
                     
                     <div className="space-y-2">
                         <h3 className="font-semibold text-gray-700">Existing Users</h3>
                         <ul className="divide-y divide-gray-200">
                            {users.map(u => (
                                <li key={u.id} className="py-2 flex justify-between items-center">
                                    <span>{u.username}</span>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => setEditingUser(u)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full" aria-label={`Edit user ${u.username}`}>
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(u.id)} 
                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full disabled:text-gray-400 disabled:hover:bg-transparent" 
                                            aria-label={`Delete user ${u.username}`}
                                            disabled={u.username === 'admin'}
                                            title={u.username === 'admin' ? "Cannot delete default admin user" : "Delete user"}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                         </ul>
                     </div>
                </section>
            )}

            {activeTab === 'api-keys' && user.role === 'super_admin' && (
                <section className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6 max-w-lg">
                    <h2 className="text-xl font-semibold text-brand-blue-dark mb-4">API Key Management</h2>
                    <p className="text-sm text-gray-600 mb-4">Configure API keys for external services. These are required for features like AI Job Parsing.</p>
                    
                    {isLoadingKeys && <p>Loading API Keys...</p>}
                    {keysError && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{keysError}</div>}
                    {keysSuccess && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{keysSuccess}</div>}

                    {!isLoadingKeys && !keysError && (
                        <div className="space-y-4">
                            {apiKeys.map((key, index) => (
                                <div key={key.name}>
                                    <label htmlFor={key.name} className="block text-sm font-medium text-gray-700">{key.name.replace(/_/g, ' ')}</label>
                                    <div className="relative mt-1">
                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockClosedIcon className="h-5 w-5 text-gray-400" /></div>
                                        <input
                                            id={key.name}
                                            type="password"
                                            value={key.value}
                                            onChange={(e) => handleKeyChange(index, e.target.value)}
                                            className="w-full p-2 pl-10 border rounded-md"
                                        />
                                    </div>
                                </div>
                            ))}
                             <button onClick={handleSaveApiKeys} className="w-full flex items-center justify-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light transition">
                                <SaveIcon className="w-5 h-5 mr-2" /> Save API Keys
                            </button>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default ProfilePage;
