import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';

import './EstimateCloudCosts.css';

// Define the structure of the cost data
interface CostEstimate {
  service: string;
  icon: string;
  justification: string;
  estimates: {
    stage: string;
    cost: string;
  }[];
}

interface CostData {
  costs: CostEstimate[];
  summary: string;
}

interface EstimateCloudCostsProps {
  startup: {
    _id: Id<"startups">;
    costEstimate?: string;
    techStack?: string;
    databaseSchema?: string;
    apiEndpoints?: string;
  };
}

const EstimateCloudCosts: React.FC<EstimateCloudCostsProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [costData, setCostData] = useState<CostData | null>(null);

  const estimateCostsAction = useAction(api.actions.estimateCloudCosts);

  const loadingTexts = [
    "Analyzing technology stack...",
    "Calculating compute requirements...",
    "Estimating database load...",
    "Projecting network traffic...",
    "Aggregating cost models...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.techStack && !!startup.databaseSchema && !!startup.apiEndpoints;

  useEffect(() => {
    if (startup.costEstimate) {
      try {
        const parsedData = JSON.parse(startup.costEstimate);
        setCostData(parsedData);
      } catch (e) {
        console.error("Failed to parse cost data:", e);
        setCostData(null);
      }
    }
  }, [startup.costEstimate]);

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
      toast.error("Please complete Tech Stack, DB Schema, and API Endpoints first.");
      return;
    }
    setIsGenerating(true);
    setCostData(null);
    try {
      const resultString = await estimateCostsAction({ startupId: startup._id });
      const resultData = JSON.parse(resultString);
      setCostData(resultData);
      toast.success("Cloud Cost Estimate generated successfully!");
    } catch (err: any) {
      console.error("Cost estimation failed:", err);
      toast.error("Failed to generate Cost Estimate", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="balance-animation-container">
        <div className="balance-beam"></div>
        <div className="balance-fulcrum"></div>
        <div className="balance-pan pan-left">
            <i className="fas fa-server service-icon service-1"></i>
            <i className="fas fa-database service-icon service-2"></i>
            <i className="fas fa-network-wired service-icon service-3"></i>
        </div>
        <div className="balance-pan pan-right">
            <i className="fas fa-dollar-sign cost-icon cost-1"></i>
            <i className="fas fa-dollar-sign cost-icon cost-2"></i>
            <i className="fas fa-dollar-sign cost-icon cost-3"></i>
            <i className="fas fa-dollar-sign cost-icon cost-4"></i>
            <i className="fas fa-dollar-sign cost-icon cost-5"></i>
            <i className="fas fa-dollar-sign cost-icon cost-6"></i>
        </div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => {
    if (!costData || !costData.costs || costData.costs.length === 0) return null;

    const stages = costData.costs[0]?.estimates.map(e => e.stage) || [];

    return (
      <div className="costs-results-container">
        <table className="costs-table">
          <thead>
            <tr>
              <th></th>
              {costData.costs.map((item, index) => (
                <th key={index}>
                  <div className="category-header">
                    <i className={`${item.icon} category-icon`}></i>
                    <span>{item.service}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="row-header">Justification</td>
              {costData.costs.map((item, index) => (
                <td key={index} className="justification-cell">{item.justification}</td>
              ))}
            </tr>
            {stages.map((stage, stageIndex) => (
              <tr key={stageIndex}>
                <td className="row-header">{stage}</td>
                {costData.costs.map((item, itemIndex) => (
                  <td key={itemIndex} className="cost-cell">
                    {item.estimates[stageIndex]?.cost || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInitial = () => (
    <div className="initial-view">
        <h3 className="text-3xl font-bold mb-4 text-white">Estimate Initial Cloud Costs</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Get an AI-powered estimate of your initial monthly cloud infrastructure costs based on your project's technical specifications.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={!canGenerate}
        >
            Estimate Costs
        </button>
        {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete Tech Stack, DB Schema, and API Endpoints first.</p>}
    </div>
  );

  const hasContent = costData || isGenerating;

  return (
    <div className="costs-container">
      {hasContent && (
        <div className="header-section">
            <h2 className="text-3xl font-bold">Cloud Cost Estimate</h2>
            {costData && !isGenerating && (
                <div className="header-actions">
                    <button onClick={handleGenerate} className="regenerate-button" title="Regenerate Estimate">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>Regenerate</span>
                    </button>
                </div>
            )}
        </div>
      )}

      {isGenerating ? renderLoading() : costData ? renderResults() : renderInitial()}
    </div>
  );
};

export default EstimateCloudCosts;
