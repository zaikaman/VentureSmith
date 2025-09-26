
import React from 'react';
import { Link } from 'react-router-dom';
import './LoginModal.css';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Please Sign In</h2>
                <p className="modal-description">You need to be signed in to generate a startup plan.</p>
                <div className="modal-actions">
                    <Link to="/signin" onClick={onClose} className="modal-button confirm" style={{ textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};
