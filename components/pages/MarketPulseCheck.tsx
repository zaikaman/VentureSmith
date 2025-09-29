import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './MarketPulseCheck.css';

interface MarketPulseResult {
  marketDemand: number;
  competitionLevel: number;
  growthPotential: number;
  relatedKeywords: string[];
  summary: string;
}

interface MarketPulseCheckProps {
  startup: {
    _id: Id<"startups">;
    idea?: string | undefined;
    marketPulse?: string | undefined;
    brainstormResult?: string | undefined;
  };
}

const Gauge: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="gauge-container">
      <svg className="gauge-svg" viewBox="0 0 100 100">
        <circle className="gauge-bg" cx="50" cy="50" r="45" />
        <circle
          className="gauge-fg"
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text x="50" y="50" className="gauge-value">{value}</text>
      </svg>
      <span className="gauge-label">{label}</span>
    </div>
  );
};

export const MarketPulseCheck: React.FC<MarketPulseCheckProps> = ({ startup }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<MarketPulseResult | null>(null);
  const getMarketPulse = useAction(api.actions.getMarketPulse);

  useEffect(() => {
    if (startup.marketPulse) {
      const parsedResult = JSON.parse(startup.marketPulse);
      setResult(parsedResult);
      setShowResults(true);
    }
  }, [startup.marketPulse]);

  const handleScan = async () => {
    const brainstormData = startup.brainstormResult ? JSON.parse(startup.brainstormResult) : null;
    const ideaToAnalyze = brainstormData?.refinedIdea || startup.idea;

    if (!ideaToAnalyze) {
      toast.error("No idea found to analyze. Please complete the previous step.");
      return;
    }

    setIsScanning(true);
    setShowResults(false);

    try {
      const pulseResult = await getMarketPulse({
        startupId: startup._id,
        idea: ideaToAnalyze, // Use the refined idea
      });
      setResult(pulseResult);
      // Animation timings
      setTimeout(() => {
        setIsScanning(false);
        setShowResults(true);
      }, 4000); // Match this with CSS animation duration
    } catch (err: any) {
      toast.error("Failed to get market pulse. Please try again.");
      console.error("Error getting market pulse:", err);
      setIsScanning(false);
    }
  };

  return (
    <div className="market-pulse-container">
      {isScanning && (
        <div className="sonar-overlay">
          <div className="sonar-scanner">
            <div className="sonar-sweep"></div>
            {(result?.relatedKeywords || []).map((kw, i) => (
              <div key={i} className="sonar-blip" style={{ animationDelay: `${i * 0.5}s` }}>{kw}</div>
            ))}
          </div>
          <div className="mobile-spinner"></div>
          <div className="scan-text">ANALYZING MARKET PULSE...</div>
        </div>
      )}

      {!showResults && !isScanning && (
        <InitialTaskView
          title="Initial Market Pulse Check"
          description="Get a rapid, AI-powered analysis of your idea's market potential. Our sonar will scan for demand, competition, growth, and related keywords."
          buttonText="Analyze Market Pulse"
          onAction={handleScan}
        />
      )}

      {showResults && result && (
        <div className="results-container">
            <TaskResultHeader title="Market Pulse Results" onRegenerate={handleScan} />
            <p className="summary-text">{result.summary}</p>
            <div className="gauges-wrapper">
                <Gauge value={result.marketDemand} label="Market Demand" color="#60a5fa" />
                <Gauge value={result.competitionLevel} label="Competition" color="#f87171" />
                <Gauge value={result.growthPotential} label="Growth Potential" color="#4ade80" />
            </div>
            <div className="keywords-panel">
                <h3 className="keywords-panel-title">Related Keywords</h3>
                <ul className="keywords-list">
                    {result.relatedKeywords.map((kw, i) => (
                        <li key={i} className="keyword-item">{kw}</li>
                    ))}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
};
