
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
                                <li><a href="#">About us</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#">Terms of Use</a></li>
                                <li><a href="#">Privacy Policy</a></li>
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