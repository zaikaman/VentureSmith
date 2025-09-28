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
  const [isIgniting, setIsIgniting] = useState(false);
  const [result, setResult] = useState<BrandIdentityResult | null>(null);
  const [hasJustIgnited, setHasJustIgnited] = useState(false);
  const [animatingNames, setAnimatingNames] = useState<string[]>([]);
  const generateBrandIdentity = useAction(api.actions.generateBrandIdentity);
  const updateName = useMutation(api.startups.updateName);

  const canIgnite = startup.brainstormResult && startup.marketPulse && startup.missionVision;

  useEffect(() => {
    if (startup.brandIdentity) {
      setResult(JSON.parse(startup.brandIdentity));
    }
    return () => {
      setHasJustIgnited(false);
    };
  }, [startup.brandIdentity]);

  const handleNameSelect = (name: string) => {
    toast.promise(updateName({ startupId: startup._id, name }), {
      loading: "Saving name...",
      success: "Brand name updated!",
      error: "Failed to save name.",
    });
  };

  const handleIgnite = async () => {
    if (!canIgnite) {
      toast.error("Previous steps must be completed first.");
      return;
    }
    setIsIgniting(true);
    setHasJustIgnited(true);
    setResult(null);

    // Immediately start dummy animation
    const dummyNames = Array(30).fill(0).map(() => Math.random().toString(36).substring(2, 10));
    const intervalId = setInterval(() => {
      setAnimatingNames(dummyNames.sort(() => 0.5 - Math.random()).slice(0, 5));
    }, 100);

    try {
      // Run API call and a minimum animation timer in parallel
      const [forgeResult, _] = await Promise.all([
        generateBrandIdentity({ startupId: startup._id }),
        new Promise(resolve => setTimeout(resolve, 5000)) // Min 5s animation
      ]);

      // Both are done, now show final result
      clearInterval(intervalId);
      setResult(forgeResult);
      setIsIgniting(false);

    } catch (err: any) {
      // Handle error
      clearInterval(intervalId);
      toast.error("Failed to ignite constellation. Please try again.");
      console.error("Error igniting data:", err);
      setIsIgniting(false);
    }
  };

  const renderAnimation = () => (
    <div className="constellation-container">
        <div className="stars-bg"></div>
        <div className="nebula idea-nebula">Refined Idea</div>
        <div className="nebula keywords-nebula">Keywords</div>
        <div className="nebula mission-nebula">Mission</div>
        <div className="nebula vision-nebula">Vision</div>

        <div className="constellation-lines">
            <div className="line line-1"></div>
            <div className="line line-2"></div>
            <div className="line line-3"></div>
        </div>

        <div className="star-field">
            {[...Array(5)].map((_, i) => (
                <div key={i} className={`star-container star-container-${i + 1}`}>
                    <div className="star"></div>
                </div>
            ))}
        </div>
        <div className="ignite-status-text">Igniting Constellation...</div>
    </div>
  );

  const renderResults = () => (
    <>
        <TaskResultHeader title="Brand Identity" onRegenerate={handleIgnite} />
        <div className={`results-view ${hasJustIgnited ? 'with-delay' : ''}`}>
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
        {isIgniting ? renderAnimation() : result ? renderResults() : (
            <InitialTaskView
                title="Generate Business Name & Identity"
                description="Let's forge a powerful brand identity. Our AI will use your refined idea, keywords, and mission to generate memorable names, a powerful slogan, and unique visual marks."
                buttonText="Ignite Constellation"
                onAction={handleIgnite}
                disabled={!canIgnite}
            />
        )}
    </div>
  );
};