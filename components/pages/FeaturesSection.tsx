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
            icon: <img src="/1.png" alt="Ideation & Validation" />,
            title: 'Phase 1-2: Ideation & Validation',
            description: 'Brainstorm ideas, define your mission, and get an instant AI-powered scorecard analysis to validate your concept.'
        },
        {
            icon: <img src="/2.png" alt="Market & Customer Research" />,
            title: 'Phase 3-4: Market & Customer Research',
            description: 'Conduct deep market analysis, generate a competitor matrix, and simulate customer interviews to truly understand your audience.'
        },
        {
            icon: <img src="/3.png" alt="Prototyping & Technical Blueprint" />,
            title: 'Phase 5-6: Prototyping & Technical Blueprint',
            description: 'Generate user flow diagrams, AI-powered wireframes, a website prototype, and a complete technical stack and roadmap.'
        },
        {
            icon: <img src="/4.png" alt="Go-to-Market & Launch" />,
            title: 'Phase 7-8: Go-to-Market & Launch',
            description: 'Develop your pricing strategy, generate marketing copy, and build a complete Product Hunt launch kit.'
        },
        {
            icon: <img src="/5.png" alt="Growth & Operations" />,
            title: 'Phase 9-10: Growth & Operations',
            description: 'Identify key growth metrics, brainstorm A/B tests, and map your business processes for future automation.'
        },
        {
            icon: <img src="/6.png" alt="Fundraising & Investor Relations" />,
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