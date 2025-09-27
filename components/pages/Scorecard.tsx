import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ScorecardData } from '../../types';
import { toast } from 'sonner';
import './Scorecard.css';

interface ScorecardProps {
  startup: {
    _id: Id<"startups">;
    dashboard?: string | undefined; // This holds the scorecard data
    // Data from previous steps for the action
    brainstormResult?: string | undefined;
    marketPulse?: string | undefined;
    missionVision?: string | undefined;
    brandIdentity?: string | undefined;
  };
}

export const Scorecard: React.FC<ScorecardProps> = ({ startup }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScorecardData | null>(null);
  const generateScorecard = useAction(api.actions.generateScorecard);

  const canAnalyze = startup.brainstormResult && startup.marketPulse && startup.missionVision && startup.brandIdentity;

  useEffect(() => {
    if (startup.dashboard) {
      setResult(JSON.parse(startup.dashboard));
    }
  }, [startup.dashboard]);

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      toast.error("Previous steps must be completed first.");
      return;
    }
    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysisResult = await generateScorecard({ startupId: startup._id });
      // Delay for animation
      setTimeout(() => {
        setResult(analysisResult);
        setIsAnalyzing(false);
      }, 4000); 
    } catch (err: any) {
      toast.error("Failed to analyze scorecard. Please try again.");
      console.error("Error analyzing data:", err);
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
        <div className="analysis-core-container">
            <div className="core-rings">
                <div className="ring"></div>
                <div className="ring"></div>
                <div className="ring"></div>
            </div>
            <div className="data-packet packet-1">Ideation</div>
            <div className="data-packet packet-2">Market Pulse</div>
            <div className="data-packet packet-3">Mission/Vision</div>
            <div className="data-packet packet-4">Brand Identity</div>
            <div className="analysis-status-text">ANALYZING VENTURE DNA...</div>
        </div>
    );
  }

  if (result) {
    return (
        <div className="scorecard-results-container">
            <div className="header-section">
                <h2 className="text-3xl font-bold">Scorecard Analysis</h2>
                <button onClick={handleAnalyze} className="regenerate-button" title="Regenerate">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                    <span>Regenerate</span>
                </button>
            </div>
            <div className="overall-score-card" style={{'--glow-color': result.overallScore > 75 ? '#4ade80' : result.overallScore > 50 ? '#facc15' : '#f87171'}}>
                <span className="overall-title">Overall Score</span>
                <span className="overall-score">{result.overallScore}</span>
            </div>
            <div className="score-details-grid">
                <div className="score-detail-card">
                    <h4>Market Size & Demand</h4>
                    <div className="score-bar-container">
                        <div className="score-bar" style={{width: `${result.marketSize.score}%`, backgroundColor: '#60a5fa'}}></div>
                    </div>
                    <span className="score-number">{result.marketSize.score}</span>
                    <p className="justification">{result.marketSize.justification}</p>
                </div>
                <div className="score-detail-card">
                    <h4>Feasibility & Execution</h4>
                    <div className="score-bar-container">
                        <div className="score-bar" style={{width: `${result.feasibility.score}%`, backgroundColor: '#facc15'}}></div>
                    </div>
                    <span className="score-number">{result.feasibility.score}</span>
                    <p className="justification">{result.feasibility.justification}</p>
                </div>
                <div className="score-detail-card">
                    <h4>Innovation & Defensibility</h4>
                    <div className="score-bar-container">
                        <div className="score-bar" style={{width: `${result.innovation.score}%`, backgroundColor: '#4ade80'}}></div>
                    </div>
                    <span className="score-number">{result.innovation.score}</span>
                    <p className="justification">{result.innovation.justification}</p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="scorecard-initial-view">
        <h2 className="text-3xl font-bold mb-4">AI-Powered Scorecard Analysis</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Initiate the Analysis Core to process all your venture data. The AI will generate a comprehensive scorecard on market potential, feasibility, and innovation.
        </p>
        <button onClick={handleAnalyze} disabled={!canAnalyze} className="cta-button">
            Activate Analysis Core
        </button>
        {!canAnalyze && <p className="text-sm text-slate-500 mt-4">Please complete all previous steps first.</p>}
    </div>
  );
};
