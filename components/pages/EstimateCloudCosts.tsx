import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

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
      <div className="mobile-spinner"></div>
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

  const hasContent = costData || isGenerating;

  return (
    <div className="costs-container">
      {hasContent && (
        <TaskResultHeader title="Cloud Cost Estimate" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : costData ? renderResults() : (
        <InitialTaskView
            title="Estimate Initial Cloud Costs"
            description="Get an AI-powered estimate of your initial monthly cloud infrastructure costs based on your project's technical specifications."
            buttonText="Estimate Costs"
            onAction={handleGenerate}
            disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default EstimateCloudCosts;
