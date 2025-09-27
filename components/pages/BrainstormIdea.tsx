import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import './BrainstormIdea.css';

// --- Interfaces and Helper Functions ---
interface BrainstormResult {
  refinedIdea: string;
  keyFeatures: string[];
  potentialAngles: string[];
  initialConcerns: string[];
  competitiveAdvantage: string[];
}

interface BrainstormIdeaProps {
  startup: {
    _id: Id<"startups">;
    idea?: string | undefined;
    brainstormResult?: string | undefined;
  };
}

const cleanText = (text: string) => {
    return text ? String(text).replace(/\*/g, '') : '';
};

// --- Main Component ---
const BrainstormIdea: React.FC<BrainstormIdeaProps> = ({ startup }) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [result, setResult] = useState<BrainstormResult | null>(null);
  const [hasJustSynthesized, setHasJustSynthesized] = useState(false);
  const generateBrainstormIdea = useAction(api.actions.generateBrainstormIdea);

  useEffect(() => {
    if (startup.brainstormResult) {
      setResult(JSON.parse(startup.brainstormResult));
    }
    return () => {
      setHasJustSynthesized(false);
    };
  }, [startup.brainstormResult]);

  const handleSynthesize = async () => {
    if (!startup.idea) {
      toast.error("Initial idea is missing.");
      return;
    }
    setIsSynthesizing(true);
    setHasJustSynthesized(true);
    setResult(null);

    try {
      const [synthesisResult, _] = await Promise.all([
        generateBrainstormIdea({ startupId: startup._id, idea: startup.idea }),
        new Promise(resolve => setTimeout(resolve, 5000)) // Min 5s animation
      ]);

      setResult(synthesisResult);
      setIsSynthesizing(false);

    } catch (err: any) {
      toast.error("Failed to synthesize idea. Please try again.");
      console.error("Error synthesizing data:", err);
      setIsSynthesizing(false);
    }
  };

  const renderAnimation = () => (
    <div className="neural-container">
        <div className="neural-grid">
            {[...Array(200)].map((_, i) => <div key={i} className="neuron"></div>)}
        </div>
        <div className="neural-main-node">{startup.idea}</div>
        <div className="neural-pulse"></div>
        <div className="neural-hub-labels">
            <div className="hub-label label-1">Refined Idea</div>
            <div className="hub-label label-2">Key Features</div>
            <div className="hub-label label-3">Potential Angles</div>
            <div className="hub-label label-4">Initial Concerns</div>
            <div className="hub-label label-5">Competitive Advantage</div>
        </div>
        <div className="synthesis-status-text">Synthesizing...</div>
    </div>
  );

  const renderResults = () => (
    <div className={`results-grid visible ${hasJustSynthesized ? 'with-delay' : ''}`}>
        {/* Cards with icons will be rendered here */}
        <div className="info-card refined-idea-card">
            <div className="card-header"><div className="card-icon"><i className="fa-solid fa-user-check"></i></div><h3 className="card-title">Refined Idea</h3></div>
            <p className="card-content">{cleanText(result!.refinedIdea)}</p>
        </div>
        <div className="info-card">
            <div className="card-header"><div className="card-icon"><i className="fa-solid fa-check-circle"></i></div><h3 className="card-title">Key Features</h3></div>
            <ul className="card-list">{(result!.keyFeatures || []).map((feature, i) => <li key={i}>{cleanText(feature)}</li>)}</ul>
        </div>
        <div className="info-card">
            <div className="card-header"><div className="card-icon"><i className="fa-solid fa-lightbulb"></i></div><h3 className="card-title">Potential Angles</h3></div>
            <ul className="card-list">{(result!.potentialAngles || []).map((angle, i) => <li key={i}>{cleanText(angle)}</li>)}</ul>
        </div>
        <div className="info-card">
            <div className="card-header"><div className="card-icon"><i className="fa-solid fa-triangle-exclamation"></i></div><h3 className="card-title">Initial Concerns</h3></div>
            <ul className="card-list">{(result!.initialConcerns || []).map((concern, i) => <li key={i}>{cleanText(concern)}</li>)}</ul>
        </div>
        <div className="info-card">
            <div className="card-header"><div className="card-icon"><i className="fa-solid fa-shield-halved"></i></div><h3 className="card-title">Competitive Advantage</h3></div>
            <ul className="card-list">{(result!.competitiveAdvantage || []).map((advantage, i) => <li key={i}>{cleanText(advantage)}</li>)}</ul>
        </div>
    </div>
  );

  return (
    <div className="brainstorm-idea-container">
        <div className="header-section">
            <h2 className="text-3xl font-bold">Brainstorm & Refine Idea</h2>
            {result && !isSynthesizing && (
                 <button onClick={handleSynthesize} className="regenerate-button" title="Regenerate">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                    <span>Regenerate</span>
                </button>
            )}
        </div>

        {isSynthesizing ? renderAnimation() : result ? renderResults() : (
            <div className="initial-view">
                <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-center">
                    Your initial idea is the seed. Let's synthesize it through a neural network to discover its core components and potential.
                </p>
                <div className="text-center p-8">
                    <button onClick={handleSynthesize} className="cta-button">
                        Synthesize Idea
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default BrainstormIdea;