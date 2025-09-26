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
            title: 'Submit Your Idea',
            description: 'Start by describing your business concept. The more detail you provide, the better the AI can understand your vision.'
        },
        {
            number: '02',
            title: 'Generate Assets',
            description: 'Our AI gets to work, creating a full suite of startup documents, from a business plan to a website prototype.'
        },
        {
            number: '03',
            title: 'Review & Refine',
            description: 'Analyze your generated assets, get feedback from our AI mentor, and refine your strategy for success.'
        }
    ];

    return (
        <section className="how-it-works-section">
            <div className="how-it-works-container">
                <div ref={headerRef} className={`how-it-works-header ${isHeaderVisible ? 'is-visible' : ''}`}>
                    <h2 className="how-it-works-headline">From Idea to Impact in Minutes</h2>
                    <p className="how-it-works-subheadline">A streamlined process to bring your vision to life.</p>
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