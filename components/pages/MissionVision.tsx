import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
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

  const loadingTexts = [
    "Analyzing core idea...",
    "Evaluating market position...",
    "Distilling purpose into a Mission...",
    "Projecting future impact into a Vision...",
    "Forging the Genesis Block..."
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const brainstormData: BrainstormData | null = startup.brainstormResult ? JSON.parse(startup.brainstormResult) : null;
  const marketPulseData: MarketPulseData | null = startup.marketPulse ? JSON.parse(startup.marketPulse) : null;

  useEffect(() => {
    if (startup.missionVision) {
      setResult(JSON.parse(startup.missionVision));
    }
  }, [startup.missionVision]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isForging) {
      interval = setInterval(() => {
        setCurrentLoadingText(prev => loadingTexts[(loadingTexts.indexOf(prev) + 1) % loadingTexts.length]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isForging]);

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
            <div className="loading-container"> {/* Use reference class */}
                            <div className="typewriter-animation-container"> {/* Use reference class */}
                                <div className="mv-core"></div>
                                
                                {/* Mission Icons Flying In */}
                                <i className="fas fa-gears mission-icon icon-1"></i>
                                <i className="fas fa-compass mission-icon icon-2"></i>
                
                                {/* Vision Icons Flying Out */}
                                <i className="fas fa-star vision-icon icon-1"></i>
                                <i className="fas fa-trophy vision-icon icon-2"></i>
                            </div>
                            <div className="mobile-spinner"></div>
                            <div className="loading-status-text">{currentLoadingText}</div>            </div>
        );
    }

    if (result) {
        return (
            <div className="result-container">
                <TaskResultHeader title="Genesis Block Forged" onRegenerate={handleForge} />
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
        <InitialTaskView
            title="Define Mission & Vision"
            description="Synthesize your refined idea and market pulse data into a foundational Mission and Vision. This is the Genesis Block of your venture's identity."
            buttonText="Forge Genesis Block"
            onAction={handleForge}
            disabled={!brainstormData || !marketPulseData}
            buttonIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a14.994 14.994 0 01-3.75 0m-1.064-2.311a14.986 14.986 0 01-1.82-.333m3.75 0a14.986 14.986 0 001.82-.333M6.75 7.5h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V8.25a.75.75 0 01.75-.75z" /></svg>}
        />
    );
  };

  return (
    <div className="mission-vision-container">
        {renderContent()}
    </div>
  );
};
