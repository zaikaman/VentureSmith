import React, { useState, useEffect } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './BrandIdentity.css';

// --- Interfaces and Helper Functions ---
interface BrandIdentityResult {
  names: string[];
  slogan: string;
}

interface BrandIdentityProps {
  startup: {
    _id: Id<"startups">;
    name?: string;
    brandIdentity?: string | undefined;
    brainstormResult?: string | undefined;
    marketPulse?: string | undefined;
    missionVision?: string | undefined;
  };
}

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const ProceduralLogo: React.FC<{ name: string }> = ({ name }) => {
    const hash = simpleHash(name);
    const color1 = `hsl(${hash % 360}, 70%, 60%)`;
    const color2 = `hsl(${(hash * 2) % 360}, 70%, 80%)`;
    const shapeType = hash % 3;

    const style: React.CSSProperties = {
        width: '50px',
        height: '50px',
        background: `linear-gradient(45deg, ${color1}, ${color2})`,
        transition: 'all 0.3s ease',
    };

    if (shapeType === 1) style.borderRadius = '8px';
    if (shapeType === 2) {
        style.background = 'transparent';
        style.borderLeft = '25px solid transparent';
        style.borderRight = '25px solid transparent';
        style.borderBottom = `50px solid ${color1}`;
        style.width = '0';
        style.height = '0';
    }
    if (shapeType === 0) style.borderRadius = '50%';

    return <div className="procedural-logo" style={style}></div>;
};

// --- Main Component ---
export const BrandIdentity: React.FC<BrandIdentityProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BrandIdentityResult | null>(null);
  const generateBrandIdentity = useAction(api.actions.generateBrandIdentity);
  const updateName = useMutation(api.startups.updateName);

  const loadingTexts = [
    "Distilling brand essence...",
    "Exploring naming conventions...",
    "Crafting powerful slogans...",
    "Generating visual concepts...",
    "Forging a new identity...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = startup.brainstormResult && startup.marketPulse && startup.missionVision;

  useEffect(() => {
    if (startup.brandIdentity) {
      try {
        setResult(JSON.parse(startup.brandIdentity));
      } catch (e) {
        console.error("Failed to parse brand identity:", e);
        toast.error("Failed to load existing brand identity.");
      }
    }
  }, [startup.brandIdentity]);

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
  }, [isGenerating, loadingTexts]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Previous steps must be completed first.");
      return;
    }
    setIsGenerating(true);
    setResult(null);
    try {
      const [generateResult, _] = await Promise.all([
        generateBrandIdentity({ startupId: startup._id }),
        new Promise(resolve => setTimeout(resolve, 4000)) // Min 4s animation
      ]);
      
      setResult(generateResult);
      toast.success("Brand Identity generated!");

    } catch (err: any) {
      toast.error("Failed to generate Brand Identity.", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNameSelect = (name: string) => {
    toast.promise(updateName({ startupId: startup._id, name }), {
      loading: "Saving name...",
      success: "Brand name updated!",
      error: "Failed to save name.",
    });
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="brand-animation-container">
        <div className="orbit-path"></div>
        <div className="brand-core">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5H22L16 14.5L18.5 22L12 17L5.5 22L8 14.5L2 9.5H9.5L12 2Z" />
            </svg>
        </div>
        <div className="orbiting-element el-1">Name</div>
        <div className="orbiting-element el-2">Slogan</div>
        <div className="orbiting-element el-3">Logo</div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => (
    <>
        <TaskResultHeader title="Brand Identity" onRegenerate={handleGenerate} />
        <div className='results-view'>
            <p className="select-prompt">Select a name to become your official brand identity.</p>
            <ul className="name-list">
                {result!.names.map((name, i) => (
                    <li 
                        key={i} 
                        className={`name-item ${startup.name === name ? 'selected' : ''}`}
                        onClick={() => handleNameSelect(name)}
                    >
                        <ProceduralLogo name={name} />
                        <span>{name}</span>
                    </li>
                ))}
            </ul>
            <div className="slogan-container">
                <p className="slogan-text">"{result!.slogan}"</p>
                <span className="slogan-label">Suggested Slogan</span>
            </div>
        </div>
    </>
  );

  return (
    <div className="brand-identity-container">
        {isGenerating ? renderLoading() : result ? renderResults() : (
            <InitialTaskView
                title="Generate Business Name & Identity"
                description="Let's forge a powerful brand identity. Our AI will use your refined idea, keywords, and mission to generate memorable names, a powerful slogan, and unique visual marks."
                buttonText="Generate Identity"
                onAction={handleGenerate}
                disabled={!canGenerate}
                disabledReason={!canGenerate ? "Complete 'Brainstorm', 'Market Pulse', and 'Mission & Vision' first." : undefined}
            />
        )}
    </div>
  );
};
