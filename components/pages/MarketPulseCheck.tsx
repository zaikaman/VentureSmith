import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
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
          <div className="scan-text">ANALYZING MARKET PULSE...</div>
        </div>
      )}

      {!showResults && !isScanning && (
        <div className="pre-scan-content">
          <h2 className="text-3xl font-bold mb-4">Initial Market Pulse Check</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Get a rapid, AI-powered analysis of your idea's market potential. Our sonar will scan for demand, competition, growth, and related keywords.
          </p>
          <button onClick={handleScan} className="cta-button scan-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a3.004 3.004 0 014.118 0M8.625 6.75a3.004 3.004 0 004.118 0m0 0a4.505 4.505 0 015.636 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Analyze Market Pulse
          </button>
        </div>
      )}

      {showResults && result && (
        <div className="results-container">
            <div className="pulse-header">
              <h2 className="text-3xl font-bold">Market Pulse Results</h2>
              {!isScanning && (
                <button onClick={handleScan} className="regenerate-button" title="Regenerate">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                  <span>Regenerate</span>
                </button>
              )}
            </div>
            <p className="summary-text">{result.summary}</p>
            <div className="gauges-wrapper">
                <Gauge value={result.marketDemand} label="Market Demand" color="#60a5fa" />
                <Gauge value={result.competitionLevel} label="Competition" color="#f87171" />
                <Gauge value={result.growthPotential} label="Growth Potential" color="#4ade80" />
            </div>
            <div className="keywords-wrapper">
                <h3 className="keywords-title">Related Keywords</h3>
                <div className="keywords-grid">
                    {result.relatedKeywords.map((kw, i) => <div key={i} className="keyword-tag">{kw}</div>)}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
