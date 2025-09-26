import { toast } from 'sonner';
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { authClient } from '../../lib/auth-client';
import { MobileMenu } from './MobileMenu';

// Icons (SunIcon and MoonIcon are kept for the theme toggler)
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

export const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { data: session } = authClient.useSession();
    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Blueprint", path: "/blueprint-builder" },
    ];

    const handleSignOut = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Signed out successfully!");
                        navigate('/');
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

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            <header className="header-container">
                <div className="header-content">
                    <div className="header-logo">
                        <Link to="/">
                            <img src={theme === 'dark' ? '/logo.png' : '/logo-2.png'} alt="VentureSmith Logo" />
                            <span>VentureSmith</span>
                        </Link>
                    </div>

                    <nav className="header-nav">
                        {navLinks.map(link => (
                            <NavLink key={link.name} to={link.path} className={({ isActive }) => isActive ? "active" : ""}>
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="header-actions">
                        <button onClick={toggleTheme} className="theme-toggle-button" aria-label="Toggle theme">
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                        <div className="flex items-center gap-2">
                            {session ? (
                                <>
                                    <Link to="/account" className="auth-button signin">Account</Link>
                                    <button onClick={handleSignOut} className="auth-button signup">Sign out</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/signin" className="auth-button signin">Sign In</Link>
                                    <Link to="/signup" className="auth-button signup">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mobile-menu-button">
                        <button onClick={toggleMobileMenu} aria-label="Open menu">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
        </>
    );
};
