import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ScorecardData } from '../../types';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
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

  return (
    <div>
        {isAnalyzing ? (
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
                <div className="mobile-spinner"></div>
                <div className="analysis-status-text">ANALYZING VENTURE DNA...</div>
            </div>
        ) : result ? (
            <div className="scorecard-results-container">
                <TaskResultHeader title="Scorecard Analysis" onRegenerate={handleAnalyze} />
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
        ) : (
            <InitialTaskView
                title="AI-Powered Scorecard Analysis"
                description="Initiate the Analysis Core to process all your venture data. The AI will generate a comprehensive scorecard on market potential, feasibility, and innovation."
                buttonText="Activate Analysis Core"
                onAction={handleAnalyze}
                disabled={!canAnalyze}
            />
        )}
    </div>
  );
};