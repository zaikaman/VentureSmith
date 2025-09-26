import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { authClient } from '../../lib/auth-client';
import { toast } from 'sonner';
import './MobileMenu.css';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.909-2.636l1.591-1.591M5.25 12H3m2.636-4.909l1.591 1.591M12 5.25a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    const { theme, toggleTheme } = useTheme();
    const { data: session } = authClient.useSession();

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Build", path: "/build" },
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
                <button onClick={toggleTheme} className="theme-toggle-button" aria-label="Toggle theme">
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
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
