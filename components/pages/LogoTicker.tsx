
import React from 'react';
import './LogoTicker.css';

const logos = [
    { src: '/convex.png', alt: 'Convex' },
    { src: '/better-auth.png', alt: 'Better Auth' },
    { src: '/vapi.png', alt: 'VAPI' },
    { src: '/resend.png', alt: 'Resend' },
    { src: '/firecrawl.png', alt: 'Firecrawl' },
];

// Duplicate logos for a seamless loop
const extendedLogos = [...logos, ...logos];

export const LogoTicker: React.FC = () => {
    return (
        <div className="logo-ticker-container">
            <div className="logo-ticker-track">
                {extendedLogos.map((logo, index) => (
                    <img key={index} src={logo.src} alt={logo.alt} className="logo-item" />
                ))}
            </div>
        </div>
    );
};
