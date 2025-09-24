import React from 'react';
import './Hero.css';

export const Hero: React.FC = () => {
    return (
        <div className="hero-container">
            <h1 className="hero-title">Build Your Startup with AI</h1>
            <p className="hero-subtitle">Turn your idea into a reality. Get a business plan, market research, and more.</p>
        </div>
    );
};