import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

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
      const resultData = await generatePricingAction({ startupId: startup._id });
      setPricingData(resultData);
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

    const formatPrice = (priceStr: string) => {
      const parts = String(priceStr).trim().split('/');
      let mainPrice = parts[0].trim();
      const period = parts[1] ? parts[1].trim() : 'one-time';
  
      if (mainPrice.toLowerCase() !== 'free' && mainPrice !== '0') {
        mainPrice = `$${mainPrice.replace(/\$/g, '')}`;
      }
      
      return (
        <>
          {mainPrice}
          <span>/ {period}</span>
        </>
      );
    };

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
                    <div className="tier-price">{formatPrice(tier.price)}</div>
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

  const hasContent = pricingData || isGenerating;

  return (
    <div className="pricing-strategy-container">
      {hasContent && (
        <TaskResultHeader title="AI Pricing Strategy" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : pricingData ? renderResults() : (
        <InitialTaskView
            title="Generate AI-Powered Pricing Strategy"
            description="Let AI analyze your business plan, target customers, and competitive landscape to suggest optimal pricing models and tiers for your product."
            buttonText="Generate Pricing Strategy"
            onAction={handleGenerate}
            disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default AIPricingStrategy;
