import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

import './AIInvestorMatching.css';

interface MatchedInvestor {
  name: string;
  firmOrType: string;
  investmentFocus: string[];
  matchRationale: string;
  profileUrl: string;
}

interface AIInvestorMatchingProps {
  startup: {
    _id: Id<"startups">;
    investorMatching?: string; // JSON string of MatchedInvestor[]
    businessPlan?: string;
    pitchDeck?: string;
    marketResearch?: string;
  };
}

const AIInvestorMatching: React.FC<AIInvestorMatchingProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [investors, setInvestors] = useState<MatchedInvestor[]>([]);
  const generateMatchesAction = useAction(api.actions.generateInvestorMatches);

  const loadingTexts = [
    "Analyzing your venture's DNA...",
    "Generating ideal investor profiles...",
    "Scanning the web for potential matches...",
    "Crawling investor data with Firecrawl...",
    "Cross-referencing investment theses...",
    "Finalizing top investor matches...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.businessPlan && !!startup.pitchDeck && !!startup.marketResearch;

  useEffect(() => {
    if (startup.investorMatching) {
      try {
        const parsedData = JSON.parse(startup.investorMatching);
        // Handle new format {investors: ...} and old raw array format for backward compatibility
        const investorsArray = parsedData.investors || parsedData;
        if (Array.isArray(investorsArray)) {
          setInvestors(investorsArray);
        }
      } catch (e) {
        console.error("Failed to parse investor matches:", e);
        toast.error("Failed to load existing investor matches.");
      }
    }
  }, [startup.investorMatching]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentLoadingText(prev => loadingTexts[(loadingTexts.indexOf(prev) + 1) % loadingTexts.length]);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, loadingTexts]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete 'Business Plan', 'Pitch Deck', and 'Market Research' first.");
      return;
    }
    setIsGenerating(true);
    setInvestors([]);
    try {
      const [generatedResult, _] = await Promise.all([
        generateMatchesAction({ startupId: startup._id }),
        new Promise(resolve => setTimeout(resolve, 10000)) // Longer delay for this complex task
      ]);
      
      if (generatedResult && generatedResult.investors && Array.isArray(generatedResult.investors)) {
        setInvestors(generatedResult.investors);
        toast.success("Investor matches generated successfully!");
      } else {
        console.error("Invalid format received from AI:", generatedResult);
        throw new Error("Received an invalid or empty response from the AI.");
      }
    } catch (err: any) {
      console.error("Investor matching failed:", err);
      toast.error("Failed to generate investor matches", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="radar-animation-container">
        <div className="radar-grid"></div>
        <div className="radar-sweep"></div>
        <div className="startup-node"><i className="fas fa-rocket"></i></div>
        <div className="investor-ping ping-1"><i className="fas fa-user-tie"></i></div>
        <div className="investor-ping ping-2"><i className="fas fa-user-tie"></i></div>
        <div className="investor-ping ping-3"><i className="fas fa-user-tie"></i></div>
        <div className="investor-ping ping-4"><i className="fas fa-user-tie"></i></div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => (
    <div className="investor-results-grid">
      {investors.map((investor, index) => (
        <div key={index} className="investor-card">
          <div className="investor-card-header">
            <div className="investor-avatar"><i className="fas fa-user-tie"></i></div>
            <div className="investor-info">
              <h3>{investor.name}</h3>
              <p>{investor.firmOrType}</p>
            </div>
          </div>
          <div className="investor-card-body">
            <h4>Investment Focus</h4>
            <ul>
              {investor.investmentFocus.map((focus, i) => <li key={i}>{focus}</li>)}
            </ul>
          </div>
          <div className="investor-card-body">
            <h4>Match Rationale</h4>
            <p>{investor.matchRationale}</p>
          </div>
          <div className="investor-card-footer">
            <a href={investor.profileUrl} target="_blank" rel="noopener noreferrer" className="profile-link">
              View Profile <i className="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  const hasContent = investors.length > 0 || isGenerating;

  return (
    <div className="investor-matching-container">
      {hasContent && (
        <TaskResultHeader title="AI Investor Matching" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : investors.length > 0 ? renderResults() : (
        <InitialTaskView
          title="Generate AI-Powered Investor Matches"
          description="Leverage AI to analyze your venture and scan the web, identifying and profiling the best-fit investors for your startup."
          buttonText="Find My Investors"
          onAction={handleGenerate}
          disabled={!canGenerate}
          disabledReason={!canGenerate ? "Complete Business Plan, Pitch Deck & Market Research first." : undefined}
        />
      )}
    </div>
  );
};

export default AIInvestorMatching;
