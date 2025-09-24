
import React from 'react';
import { Link } from 'react-router-dom';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div style={{backgroundColor: `var(--bg-slate-800)`}} className="p-8 rounded-2xl shadow-lg text-center max-w-sm mx-auto">
                <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
                <p style={{color: `var(--text-slate-400)`}} className="mb-6">You need to be signed in to generate a startup plan.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="py-2 px-6 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <Link to="/signin" className="py-2 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};
