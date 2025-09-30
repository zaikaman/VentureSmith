import React from 'react';
import { Link } from 'react-router-dom';
import './SmithBuildLoginModal.css';

interface SmithBuildLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SmithBuildLoginModal: React.FC<SmithBuildLoginModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="lm-modal-overlay" onClick={onClose}>
            <div className="lm-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="lm-modal-title">Please Sign In</h2>
                <p className="lm-modal-description">You need to be signed in to build a new web app.</p>
                <div className="lm-modal-actions">
                    <Link to="/signin" onClick={onClose} className="lm-modal-button confirm" style={{ textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};