
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import './Footer.css';

const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
    </a>
);

export const Footer: React.FC = () => {
    const { theme } = useTheme();

    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-logo-section">
                        <Link to="/" className="footer-logo">
                            <img src={theme === 'dark' ? '/logo.png' : '/logo-2.png'} alt="VentureSmith Logo" />
                            <span>VentureSmith</span>
                        </Link>
                        <p className="footer-description">
                            AI-powered platform to validate, plan, and build your next business idea.
                        </p>
                    </div>
                    <div className="footer-links-grid">
                        <div className="footer-column">
                            <h4>Company</h4>
                            <ul>
                                <li><Link to="/about">About us</Link></li>
                                <li><Link to="/help-center">Help Center</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Legal</h4>
                            <ul>
                                <li><Link to="/terms">Terms of Use</Link></li>
                                <li><Link to="/privacy">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="copyright">© 2025 VentureSmith. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};