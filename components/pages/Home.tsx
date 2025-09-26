import React from 'react';
import { HeroSection } from './HeroSection';
import { LogoTicker } from './LogoTicker';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import './Home.css';

export const Home: React.FC = () => {
    return (
        <div className="homepage-container">
            <HeroSection />
            <LogoTicker />
            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <CTASection />
        </div>
    );
};
