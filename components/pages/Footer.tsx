
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
                            <h4>Product</h4>
                            <ul>
                                <li><a href="#">Features</a></li>
                                <li><a href="#">Integrations</a></li>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Changelog</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#">About us</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Resources</h4>
                            <ul>
                                <li><a href="#">Community</a></li>
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">API Docs</a></li>
                                <li><a href="#">Terms of Use</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Cookie Settings</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="copyright">© 2025 VentureSmith. All rights reserved.</p>
                    <div className="social-links">
                        <SocialIcon href="#">
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.03998C6.48 2.03998 2 6.51998 2 12.04C2 17.06 5.29 21.21 9.84 21.9V14.68H7.23V12.04H9.84V9.90002C9.84 7.34002 11.28 6.02002 13.62 6.02002C14.73 6.02002 15.88 6.21002 15.88 6.21002V8.45002H14.62C13.38 8.45002 13.06 9.16002 13.06 10.2V12.04H15.77L15.37 14.68H13.06V22C17.94 21.36 22 17.08 22 12.04C22 6.51998 17.52 2.03998 12 2.03998Z" /></svg>
                        </SocialIcon>
                        <SocialIcon href="#">
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M22.9999 5.08998C22.9999 5.08998 22.2199 5.31998 21.4399 5.53998C22.2899 5.01998 22.9199 4.15998 23.2399 3.15998C22.4599 3.63998 21.5899 3.99998 20.6699 4.20998C19.9299 3.40998 18.8099 2.83998 17.5399 2.83998C15.1199 2.83998 13.1299 4.82998 13.1299 7.24998C13.1299 7.58998 13.1699 7.92998 13.2499 8.24998C8.9499 8.03998 5.1199 6.01998 2.4299 2.99998C1.9599 3.81998 1.6799 4.77998 1.6799 5.80998C1.6799 7.31998 2.4599 8.64998 3.6299 9.41998C2.9199 9.39998 2.2499 9.20998 1.6799 8.89998C1.6799 8.90998 1.6799 8.91998 1.6799 8.93998C1.6799 11.02 3.1599 12.75 5.1199 13.14C4.6599 13.26 4.1699 13.32 3.6699 13.32C3.3899 13.32 3.1199 13.3 2.8499 13.25C3.4099 14.95 4.9299 16.18 6.7499 16.21C5.2899 17.35 3.4599 18.05 1.4799 18.05C1.1499 18.05 0.829902 18.03 0.509902 17.99C2.3699 19.16 4.5599 19.83 6.9099 19.83C17.5199 19.83 21.7499 11.28 21.7499 3.90998C21.7499 3.71998 21.7399 3.53998 21.7299 3.34998C22.3899 2.86998 22.9399 2.25998 23.3699 1.56998L22.9999 5.08998Z" /></svg>
                        </SocialIcon>
                        <SocialIcon href="#">
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12C2 16.43 5.02 20.13 9.12 21.5V14.25H6.5V11.37H9.12V9.39C9.12 6.89 10.62 5.5 12.88 5.5C13.95 5.5 15.19 5.69 15.19 5.69V8.13H13.87C12.54 8.13 12.25 8.94 12.25 9.78V11.37H15.09L14.61 14.25H12.25V21.81C17.56 21.23 22 17.02 22 12C22 6.48 17.52 2 12 2Z" /></svg>
                        </SocialIcon>
                    </div>
                </div>
            </div>
        </footer>
    );
};