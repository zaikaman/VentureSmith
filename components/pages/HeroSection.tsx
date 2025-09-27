
import React from 'react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './HeroSection.css';

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const HeroSection: React.FC = () => {
    const [headlineRef, isHeadlineVisible] = useIntersectionObserver({ threshold: 0.1 });
    const [subheadlineRef, isSubheadlineVisible] = useIntersectionObserver({ threshold: 0.1 });
    const [ctaRef, isCtaVisible] = useIntersectionObserver({ threshold: 0.1 });

    return (
        <section className="section hero-section">
            <h1 ref={headlineRef} className={isHeadlineVisible ? 'is-visible' : ''}>Build your business, one block at a time</h1>
            <p ref={subheadlineRef} className={isSubheadlineVisible ? 'is-visible' : ''}>VentureSmith helps you validate, plan, and build your next business idea with the power of AI.</p>
            <div ref={ctaRef} className={`cta-container ${isCtaVisible ? 'is-visible' : ''}`}>
                <Link to="/blueprint-builder" className="cta-button">
                    Build Your Startup Now
                </Link>
                <div className="cta-note">
                    <InfoIcon />
                    <span>No credit card required</span>
                </div>
            </div>
        </section>
    );
};
