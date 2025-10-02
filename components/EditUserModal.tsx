import React, { useState, useEffect } from 'react';
import { User, UserUpdateData } from '../types';
import { XMarkIcon, UserCircleIcon, LockClosedIcon, SaveIcon } from './icons';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (userData: UserUpdateData) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState(user.password || '');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setUsername(user.username);
        setPassword(user.password || '');
        setError(null);
    }, [user]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!username.trim()) {
            setError('Username cannot be empty.');
            return;
        }
        if (!password.trim()) {
            setError('Password cannot be empty.');
            return;
        }
        
        const updateData: UserUpdateData = { id: user.id, username, password };
        onSave(updateData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-brand-blue-dark">Edit User: {user.username}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close">
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700">Username</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="edit-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full p-2 pl-10 border rounded-md"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">Password</label>
                             <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="edit-password"
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2 pl-10 border rounded-md"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-light">
                            <SaveIcon className="w-5 h-5 mr-2" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;