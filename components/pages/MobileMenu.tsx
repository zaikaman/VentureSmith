import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { authClient } from '../../lib/auth-client';
import { toast } from 'sonner';
import './MobileMenu.css';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    const { data: session } = authClient.useSession();

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Blueprint", path: "/blueprint-builder" },
        { name: "SmithBuild", path: "/smith-build" },
    ];

    const handleSignOut = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Signed out successfully!");
                        onClose(); // Close menu after sign out
                    },
                    onError: (err) => {
                        console.error("Sign out error:", err);
                        toast.error("Failed to sign out.");
                    }
                }
            });
        } catch (error) {
            console.error("Caught sign out error:", error);
            toast.error("Failed to sign out.");
        }
    };

    return (
        <div className={`mobile-menu ${isOpen ? 'is-open' : ''}`}>
            <div className="mobile-menu-header">
                <button onClick={onClose} className="mobile-menu-close-button" aria-label="Close menu">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <nav className="mobile-menu-nav">
                {navLinks.map(link => (
                    <NavLink key={link.name} to={link.path} onClick={onClose} className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}>
                        {link.name}
                    </NavLink>
                ))}
            </nav>
            <div className="mobile-menu-actions">
                <div className="mobile-auth-buttons">
                    {session ? (
                        <>
                            <Link to="/account" className="auth-button signin" onClick={onClose}>Account</Link>
                            <button onClick={handleSignOut} className="auth-button signup">Sign out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" className="auth-button signin" onClick={onClose}>Sign In</Link>
                            <Link to="/signup" className="auth-button signup" onClick={onClose}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
