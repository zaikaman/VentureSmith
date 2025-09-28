import React from 'react';
import './FeaturesSection.css';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// Define a type for the feature items
interface FeatureItemProps {
    icon: JSX.Element;
    title: string;
    description: string;
    index: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description, index }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    return (
        <div 
            ref={ref} 
            className={`feature-item ${isVisible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <div className="feature-icon">{icon}</div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-description">{description}</p>
        </div>
    );
};

export const FeaturesSection: React.FC = () => {
    const [headerRef, isHeaderVisible] = useIntersectionObserver({ threshold: 0.1 });

    const features = [
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a14.994 14.994 0 01-3.75 0m-1.064-2.311a14.986 14.986 0 01-1.82-.333m3.75 0a14.986 14.986 0 001.82-.333M6.75 7.5h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V8.25a.75.75 0 01.75-.75z" /></svg>,
            title: 'Phase 1-2: Ideation & Validation',
            description: 'Brainstorm ideas, define your mission, and get an instant AI-powered scorecard analysis to validate your concept.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
            title: 'Phase 3-4: Market & Customer Research',
            description: 'Conduct deep market analysis, generate a competitor matrix, and simulate customer interviews to truly understand your audience.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75c0 3.142-2.558 5.7-5.7 5.7S6 9.892 6 6.75s2.558-5.7 5.7-5.7 5.7 2.558 5.7 5.7zM12 12.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            title: 'Phase 5-6: Prototyping & Technical Blueprint',
            description: 'Generate user flow diagrams, AI-powered wireframes, a website prototype, and a complete technical stack and roadmap.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-16.5 0V8.25m16.5 0v2.25m0 0v2.25m0 0l-3-3m3 3l3-3m-3 3v-2.25m-10.5 5.25h10.5" /></svg>,
            title: 'Phase 7-8: Go-to-Market & Launch',
            description: 'Develop your pricing strategy, generate marketing copy, and build a complete Product Hunt launch kit.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-3.75M14.25 12l-3.75-3.75" /></svg>,
            title: 'Phase 9-10: Growth & Operations',
            description: 'Identify key growth metrics, brainstorm A/B tests, and map your business processes for future automation.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m12 0V6.375c0-.621-.504-1.125-1.125-1.125H9.375c-.621 0-1.125.504-1.125 1.125V9m12 0a2.25 2.25 0 002.25 2.25H15m-6 0h-1.5" /></svg>,
            title: 'Phase 11: Fundraising & Investor Relations',
            description: 'Get an AI Pitch Coach, find matching investors, and prepare a due diligence checklist to get ready for funding.'
        }
    ];

    return (
        <section className="features-section">
            <div className="features-container">
                <div ref={headerRef} className={`features-header ${isHeaderVisible ? 'is-visible' : ''}`}>
                    <h2 className="features-headline">An End-to-End Venture Platform</h2>
                    <p className="features-subheadline">VentureSmith guides you through every phase of building a business, from initial spark to scaling and funding.</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <FeatureItem key={index} {...feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};