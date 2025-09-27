import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import './CompetitorMatrix.css';

// --- INTERFACES & PROPS ---
interface Competitor {
  competitor: string;
  keyFeatures: string;
  targetAudience: string;
  strengths: string;
  weaknesses: string;
}

interface CompetitorMatrixResult {
  matrix: Competitor[];
}

interface CompetitorMatrixProps {
  startup: {
    _id: Id<"startups">;
    competitorMatrix?: string | undefined;
    marketResearch?: string | undefined; // For input
  };
}

// --- MAIN COMPONENT ---
export const CompetitorMatrix: React.FC<CompetitorMatrixProps> = ({ startup }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CompetitorMatrixResult | null>(null);
  const generateCompetitorMatrix = useAction(api.actions.generateCompetitorMatrix);

  const canAnalyze = !!startup.marketResearch;

  useEffect(() => {
    if (startup.competitorMatrix) {
      setResult(JSON.parse(startup.competitorMatrix));
    }
  }, [startup.competitorMatrix]);

  const handleAnalyze = async () => {
    if (!canAnalyze) { toast.error("Market Research must be completed first."); return; }
    setIsAnalyzing(true);
    setResult(null);

    try {
      const matrixResult = await generateCompetitorMatrix({ startupId: startup._id });
      setTimeout(() => {
        setResult(matrixResult);
        setIsAnalyzing(false);
      }, 4000); // Animation duration
    } catch (err: any) {
      toast.error("Failed to generate competitor matrix. Please try again.");
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="hologram-container">
        <div className="radar">
          <div className="radar-disc"></div>
          <div className="radar-sweep"></div>
          <div className="blip"></div>
          <div className="blip"></div>
          <div className="blip"></div>
          <div className="blip"></div>
          <div className="blip"></div>
        </div>
        <div className="radar-status-text">ANALYZING COMPETITIVE LANDSCAPE...</div>
      </div>
    );
  }

  if (result) {
    return (
        <div className="matrix-results-container">
            <div className="header-section">
                <h2 className="text-3xl font-bold">Competitor Landscape Matrix</h2>
                <button onClick={handleAnalyze} className="regenerate-button" title="Regenerate">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                    <span>Regenerate</span>
                </button>
            </div>
            <div className="matrix-table-container">
                <table className="competitor-table">
                    <thead>
                        <tr>
                            <th>Competitor</th>
                            <th>Key Features</th>
                            <th>Target Audience</th>
                            <th>Strengths</th>
                            <th>Weaknesses</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.matrix.map((comp, i) => (
                            <tr key={i}>
                                <td>{comp.competitor}</td>
                                <td>{comp.keyFeatures}</td>
                                <td>{comp.targetAudience}</td>
                                <td>{comp.strengths}</td>
                                <td>{comp.weaknesses}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  }

  return (
    <div className="cm-initial-view">
        <h2 className="text-3xl font-bold mb-4">Competitor Landscape Matrix</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Initiate tactical analysis to map out your competitors. Our AI will generate a detailed comparison matrix based on market research.
        </p>
        <button onClick={handleAnalyze} disabled={!canAnalyze} className="cta-button">
            Deploy Tactical Analysis
        </button>
        {!canAnalyze && <p className="text-sm text-slate-500 mt-4">Please complete the Market Research step first.</p>}
    </div>
  );
};