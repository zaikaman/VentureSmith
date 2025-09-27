import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';

import './AIPricingStrategy.css';

// Data structures for the pricing strategy
interface Tier {
  tierName: string;
  price: string;
  description: string;
  features: string[];
  isRecommended: boolean;
}

interface PricingModel {
  modelName: string;
  modelDescription: string;
  tiers: Tier[];
}

interface PricingData {
  models: PricingModel[];
}

interface AIPricingStrategyProps {
  startup: {
    _id: Id<"startups">;
    pricingStrategy?: string;
    businessPlan?: string;
    customerPersonas?: string;
    competitorMatrix?: string;
  };
}

const AIPricingStrategy: React.FC<AIPricingStrategyProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);

  const generatePricingAction = useAction(api.actions.generatePricingStrategy);

  const loadingTexts = [
    "Analyzing business model...",
    "Evaluating competitor pricing...",
    "Assessing customer value perception...",
    "Constructing pricing tiers...",
    "Finalizing strategy...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.businessPlan && !!startup.customerPersonas && !!startup.competitorMatrix;

  useEffect(() => {
    if (startup.pricingStrategy) {
      try {
        setPricingData(JSON.parse(startup.pricingStrategy));
      } catch (e) {
        console.error("Failed to parse pricing data:", e);
        setPricingData(null);
      }
    }
  }, [startup.pricingStrategy]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentLoadingText(prev => loadingTexts[(loadingTexts.indexOf(prev) + 1) % loadingTexts.length]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete Business Plan, Customer Personas, and Competitor Matrix first.");
      return;
    }
    setIsGenerating(true);
    setPricingData(null);
    try {
      const resultString = await generatePricingAction({ startupId: startup._id });
      setPricingData(JSON.parse(resultString));
      toast.success("Pricing Strategy generated successfully!");
    } catch (err: any) {
      console.error("Pricing generation failed:", err);
      toast.error("Failed to generate Pricing Strategy", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="graph-animation-container">
        <div className="graph-axes">
            <div className="axis-label y-axis-label">PRICE</div>
            <div className="axis-label x-axis-label">FEATURES</div>
        </div>
        <svg className="graph-path" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 20 80 C 35 70, 40 40, 50 45 S 65 20, 80 10" />
        </svg>
        <div className="graph-point point-1"></div>
        <div className="graph-point point-2"></div>
        <div className="graph-point point-3"></div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => {
    if (!pricingData) return null;

    return (
      <div className="pricing-results-container">
        {pricingData.models.map((model, modelIndex) => (
          <div key={modelIndex} className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-2">{model.modelName}</h2>
            <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">{model.modelDescription}</p>
            <div className="pricing-models-grid">
              {model.tiers.map((tier, tierIndex) => (
                <div key={tierIndex} className={`pricing-card ${tier.isRecommended ? 'recommended' : ''}`}>
                  <div className="pricing-card-header">
                    {tier.isRecommended && <div className="recommend-badge">RECOMMENDED</div>}
                    <h3 className="tier-name">{tier.tierName}</h3>
                    <div className="tier-price">{tier.price.split('/')[0]}<span>/ {tier.price.split('/')[1] || 'one-time'}</span></div>
                    <p className="tier-description">{tier.description}</p>
                  </div>
                  <ul className="features-list">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex}><i className="fas fa-check"></i> {feature}</li>
                    ))}
                  </ul>
                  <a href="#" className="pricing-card-cta">Get Started</a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderInitial = () => (
    <div className="initial-view">
        <h3 className="text-3xl font-bold mb-4 text-white">Generate AI-Powered Pricing Strategy</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Let AI analyze your business plan, target customers, and competitive landscape to suggest optimal pricing models and tiers for your product.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={!canGenerate}
        >
            Generate Pricing Strategy
        </button>
        {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete Business Plan, Customer Personas, and Competitor Matrix first.</p>}
    </div>
  );

  const hasContent = pricingData || isGenerating;

  return (
    <div className="pricing-strategy-container">
      {hasContent && (
        <div className="header-section">
            <h2 className="text-3xl font-bold">AI Pricing Strategy</h2>
            {pricingData && !isGenerating && (
                <div className="header-actions">
                    <button onClick={handleGenerate} className="regenerate-button" title="Regenerate Pricing Strategy">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>Regenerate</span>
                    </button>
                </div>
            )}
        </div>
      )}

      {isGenerating ? renderLoading() : pricingData ? renderResults() : renderInitial()}
    </div>
  );
};

export default AIPricingStrategy;
