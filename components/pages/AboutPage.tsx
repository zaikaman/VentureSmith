import React from 'react';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="static-page-container">
      <div className="static-page-content">
        <h1 className="static-page-title">About VentureSmith</h1>
        <div className="static-page-section">
          <h2 className="static-page-subtitle">Our Mission</h2>
          <p>
            VentureSmith was founded on a simple principle: every great business starts with a great idea. However, the path from concept to a viable, investor-ready business is often fraught with challenges, complexity, and significant barriers. Our mission is to democratize entrepreneurship by providing aspiring founders with the AI-powered tools they need to validate, plan, and launch their ventures with speed and confidence.
          </p>
        </div>
        <div className="static-page-section">
          <h2 className="static-page-subtitle">What We Do</h2>
          <p>
            VentureSmith is your AI co-founder. We transform a single sentence idea into a comprehensive suite of business-critical documents and assets. From detailed business plans and in-depth market research to compelling pitch decks and functional website prototypes, our platform automates the foundational work, allowing you to focus on what truly matters: building your product and connecting with customers.
          </p>
        </div>
        <div className="static-page-section">
          <h2 className="static-page-subtitle">Our Vision</h2>
          <p>
            We envision a world where anyone with a powerful idea has the resources to bring it to life. We are committed to continuously evolving our platform, integrating cutting-edge AI and strategic frameworks to become the ultimate operating system for early-stage startups. Our goal is to help build the next generation of innovative companies that will shape our future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
