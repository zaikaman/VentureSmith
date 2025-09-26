import React from 'react';
import './TestimonialsSection.css';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface TestimonialProps {
    quote: string;
    author: string;
    title: string;
    index: number;
}

const UserIcon = () => (
    <svg className="testimonial-avatar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

const TestimonialCard: React.FC<Omit<TestimonialProps, 'index'> & { index: number }> = ({ quote, author, title, index }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    return (
        <div 
            ref={ref} 
            className={`testimonial-card ${isVisible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <p className="testimonial-quote">"{quote}"</p>
            <div className="testimonial-author-info">
                <UserIcon />
                <div>
                    <p className="testimonial-author">{author}</p>
                    <p className="testimonial-title">{title}</p>
                </div>
            </div>
        </div>
    );
};

export const TestimonialsSection: React.FC = () => {
    const [headerRef, isHeaderVisible] = useIntersectionObserver({ threshold: 0.1 });

    const testimonials = [
        {
            quote: 'VentureSmith turned my napkin sketch into a full-fledged business plan in a single afternoon. The AI insights were scarily accurate.',
            author: 'Jane Doe',
            title: 'Founder, Innovate Inc.',
        },
        {
            quote: 'The ability to generate a pitch deck and website prototype instantly is a game-changer for early-stage founders.',
            author: 'John Smith',
            title: 'CEO, TechForward',
        },
        {
            quote: 'I was skeptical about AI-generated business advice, but the mentor feedback was more insightful than some human consultants I\'ve worked with.',
            author: 'Emily White',
            title: 'Solo Entrepreneur',
        }
    ];

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <div ref={headerRef} className={`testimonials-header ${isHeaderVisible ? 'is-visible' : ''}`}>
                    <h2 className="testimonials-headline">Trusted by Innovators</h2>
                    <p className="testimonials-subheadline">See what founders are saying about their experience.</p>
                </div>
                <div className="testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} {...testimonial} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};
