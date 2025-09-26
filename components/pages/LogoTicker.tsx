
import React from 'react';
import './LogoTicker.css';

const logos = [
    { src: '/convex.png', alt: 'Convex' },
    { src: '/better-auth.png', alt: 'Better Auth' },
    { src: '/vapi.png', alt: 'VAPI' },
    { src: '/resend.png', alt: 'Resend' },
    { src: '/firecrawl.png', alt: 'Firecrawl' },
];

export const LogoTicker: React.FC = () => {
    return (
        <div className="logo-ticker-container">
            <div className="logo-ticker-track">
                <img src="/convex.png" alt="Convex" className="logo-item" />
                <img src="/better-auth.png" alt="Better Auth" className="logo-item" />
                <img src="/vapi.png" alt="VAPI" className="logo-item" />
                <img src="/resend.png" alt="Resend" className="logo-item" />
                <img src="/firecrawl.png" alt="Firecrawl" className="logo-item" />
                <img src="/convex.png" alt="Convex" className="logo-item" />
                <img src="/better-auth.png" alt="Better Auth" className="logo-item" />
                <img src="/vapi.png" alt="VAPI" className="logo-item" />
                <img src="/resend.png" alt="Resend" className="logo-item" />
                <img src="/firecrawl.png" alt="Firecrawl" className="logo-item" />
            </div>
        </div>
    );
};
