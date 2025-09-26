import React from 'react';
import { Link } from 'react-router-dom';
import './CTASection.css';

export const CTASection: React.FC = () => {
    return (
        <section className="cta-section">
            <div className="cta-container">
                <div className="cta-content">
                    <h2 className="cta-headline">Ready to Build What's Next?</h2>
                    <p className="cta-subheadline">Start your journey with VentureSmith today and turn your idea into a reality. No credit card required.</p>
                    <Link to="/build" className="cta-button">Generate Your Business Plan</Link>
                </div>
            </div>
        </section>
    );
};