import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import './MissionVision.css';

interface MissionVisionResult {
  mission: string;
  vision: string;
}

interface MarketPulseData {
    marketDemand: number;
    competitionLevel: number;
    growthPotential: number;
}

interface BrainstormData {
    refinedIdea: string;
}

interface MissionVisionProps {
  startup: {
    _id: Id<"startups">;
    brainstormResult?: string | undefined;
    marketPulse?: string | undefined;
    missionVision?: string | undefined;
  };
}

export const MissionVision: React.FC<MissionVisionProps> = ({ startup }) => {
  const [isForging, setIsForging] = useState(false);
  const [result, setResult] = useState<MissionVisionResult | null>(null);
  const defineMissionVision = useAction(api.actions.defineMissionVision);

  const brainstormData: BrainstormData | null = startup.brainstormResult ? JSON.parse(startup.brainstormResult) : null;
  const marketPulseData: MarketPulseData | null = startup.marketPulse ? JSON.parse(startup.marketPulse) : null;

  useEffect(() => {
    if (startup.missionVision) {
      setResult(JSON.parse(startup.missionVision));
    }
  }, [startup.missionVision]);

  const handleForge = async () => {
    if (!brainstormData || !marketPulseData) {
      toast.error("Previous steps must be completed first.");
      return;
    }
    setIsForging(true);
    setResult(null);

    try {
      const forgeResult = await defineMissionVision({ startupId: startup._id });
      // Fake delay for animation to feel substantial
      setTimeout(() => {
        setResult(forgeResult);
        setIsForging(false);
      }, 3000);
    } catch (err: any) {
      toast.error("Failed to forge Mission & Vision. Please try again.");
      console.error("Error forging data:", err);
      setIsForging(false);
    }
  };

  const renderContent = () => {
    if (isForging) {
        return (
            <div className="genesis-block forging">
                <div className="input-data-side">
                    <div className="data-node idea-node">{brainstormData?.refinedIdea}</div>
                    <div className="data-node pulse-node">Demand: {marketPulseData?.marketDemand}%</div>
                    <div className="data-node pulse-node">Growth: {marketPulseData?.growthPotential}%</div>
                </div>
                <div className="core-animation">
                    <div className="core-ring"></div>
                </div>
                <div className="output-data-side">
                    <div className="output-field mission-field"></div>
                    <div className="output-field vision-field"></div>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="genesis-block complete">
                <div className="result-header">
                    <h2 className="text-3xl font-bold">Genesis Block Forged</h2>
                    <button onClick={handleForge} className="regenerate-button" title="Regenerate">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>Regenerate</span>
                    </button>
                </div>
                <div className="result-card">
                    <h3>Mission Statement</h3>
                    <p>"{result.mission}"</p>
                </div>
                <div className="result-card">
                    <h3>Vision Statement</h3>
                    <p>"{result.vision}"</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pre-forge-content">
            <h2 className="text-3xl font-bold mb-4">Define Mission & Vision</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                Synthesize your refined idea and market pulse data into a foundational Mission and Vision. This is the Genesis Block of your venture's identity.
            </p>
            <button onClick={handleForge} className="cta-button forge-button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a14.994 14.994 0 01-3.75 0m-1.064-2.311a14.986 14.986 0 01-1.82-.333m3.75 0a14.986 14.986 0 001.82-.333M6.75 7.5h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V8.25a.75.75 0 01.75-.75z" /></svg>
                Forge Genesis Block
            </button>
        </div>
    );
  };

  return (
    <div className="mission-vision-container">
        {renderContent()}
    </div>
  );
};
