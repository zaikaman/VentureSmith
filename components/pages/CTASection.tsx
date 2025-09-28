import React from 'react';
import { Link } from 'react-router-dom';
import './CTASection.css';

export const CTASection: React.FC = () => {
    return (
        <section className="cta-section">
            <div className="cta-container">
                <div className="cta-content">
                    <h2 className="cta-headline">Your Venture Awaits.</h2>
                    <p className="cta-subheadline">Stop wondering 'what if'. Start building your future, today. The AI co-founder is ready.</p>
                    <Link to="/blueprint-builder" className="cta-button">Start Building for Free</Link>
                </div>
            </div>
        </section>
    );
};