import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
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
        <>
            <TaskResultHeader title="Competitor Landscape Matrix" onRegenerate={handleAnalyze} />
            <div className="matrix-results-container">
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
        </>
    );
  }

  return (
    <InitialTaskView
        title="Competitor Landscape Matrix"
        description="Initiate tactical analysis to map out your competitors. Our AI will generate a detailed comparison matrix based on market research."
        buttonText="Deploy Tactical Analysis"
        onAction={handleAnalyze}
        disabled={!canAnalyze}
    />
  );
};