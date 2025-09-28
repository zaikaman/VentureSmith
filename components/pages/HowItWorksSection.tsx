import React from 'react';
import './HowItWorksSection.css';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface StepProps {
    number: string;
    title: string;
    description: string;
    index: number;
}

const Step: React.FC<Omit<StepProps, 'index'> & { index: number }> = ({ number, title, description, index }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    return (
        <div 
            ref={ref} 
            className={`step-item ${isVisible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            <div className="step-number">{number}</div>
            <div className="step-content">
                <h3 className="step-title">{title}</h3>
                <p className="step-description">{description}</p>
            </div>
        </div>
    );
};

export const HowItWorksSection: React.FC = () => {
    const [headerRef, isHeaderVisible] = useIntersectionObserver({ threshold: 0.1 });

    const steps = [
        {
            number: '01',
            title: 'Define & Validate',
            description: 'Submit your core concept and let our AI co-pilot help you refine it, define your mission, and instantly validate its potential with a data-driven scorecard.'
        },
        {
            number: '02',
            title: 'Strategize & Build',
            description: 'Generate a complete business plan, pitch deck, and brand identity. Then, build a functional website prototype and map out your full technical architecture with AI assistance.'
        },
        {
            number: '03',
            title: 'Launch & Grow',
            description: 'Develop a go-to-market strategy, get your launch assets, and identify the key metrics to drive growth, all within a single, unified workspace.'
        }
    ];

    return (
        <section className="how-it-works-section">
            <div className="how-it-works-container">
                <div ref={headerRef} className={`how-it-works-header ${isHeaderVisible ? 'is-visible' : ''}`}>
                    <h2 className="how-it-works-headline">Your Guided Path to a Market-Ready Venture</h2>
                    <p className="how-it-works-subheadline">Follow a structured, AI-accelerated journey through the critical phases of venture creation.</p>
                </div>
                <div className="steps-container">
                    {steps.map((step, index) => (
                        <Step key={index} {...step} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};