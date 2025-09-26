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
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12a1 1 0 110-2 1 1 0 010 2z" /></svg>,
            title: 'AI-Powered Insights',
            description: 'Leverage generative AI to get a deep understanding of your market landscape and competitive advantages.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            title: 'Comprehensive Reports',
            description: 'Generate everything from business plans to pitch decks, all tailored to your unique business idea.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0l8.954 8.955M2.25 12l8.954 8.955a1.125 1.125 0 001.591 0l8.954-8.955" /></svg>,
            title: 'Interactive Prototypes',
            description: 'Visualize your web presence with AI-generated website prototypes, bringing your ideas to life instantly.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>,
            title: 'AI Mentor Feedback',
            description: 'Receive critical feedback on your generated assets from an AI modeled after a seasoned venture capitalist.'
        }
    ];

    return (
        <section className="features-section">
            <div className="features-container">
                <div ref={headerRef} className={`features-header ${isHeaderVisible ? 'is-visible' : ''}`}>
                    <h2 className="features-headline">Everything You Need to Launch</h2>
                    <p className="features-subheadline">A complete toolkit to validate your idea and build your venture from the ground up.</p>
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