import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import './CustomerPersonas.css';

// --- INTERFACES & PROPS ---
interface Persona {
  name: string;
  avatar: string;
  demographics: string;
  goals: string[];
  painPoints: string[];
  motivations: string[];
}

interface CustomerPersonasResult {
  personas: Persona[];
}

interface CustomerPersonasProps {
  startup: {
    _id: Id<"startups">;
    customerPersonas?: string | undefined;
    // Prerequisites for generation
    brainstormResult?: string | undefined;
    marketResearch?: string | undefined;
    missionVision?: string | undefined;
    brandIdentity?: string | undefined;
  };
}

// --- MAIN COMPONENT ---
export const CustomerPersonas: React.FC<CustomerPersonasProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<CustomerPersonasResult | null>(null);
  const generatePersonas = useAction(api.actions.generateCustomerPersonas);

  const canGenerate = !!startup.brainstormResult && !!startup.marketResearch && !!startup.missionVision && !!startup.brandIdentity;

  useEffect(() => {
    if (startup.customerPersonas) {
      setResult(JSON.parse(startup.customerPersonas));
    }
  }, [startup.customerPersonas]);

  const handleGenerate = async () => {
    if (!canGenerate) { toast.error("Previous steps must be completed first."); return; }
    setIsGenerating(true);
    setResult(null);

    try {
      const personasResult = await generatePersonas({ startupId: startup._id });
      // Add a delay to appreciate the animation
      setTimeout(() => {
        setResult(personasResult);
        setIsGenerating(false);
      }, 4000);
    } catch (err: any) {
      toast.error("Failed to generate customer personas. Please try again.");
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    // Each part is a piece of a larger 👤 icon, positioned to form the whole.
    const iconParts = [
      { char: '👤', style: { transform: 'translate(66%, 66%) scale(3)' } },
      { char: '👤', style: { transform: 'translate(0, 66%) scale(3)' } },
      { char: '👤', style: { transform: 'translate(-66%, 66%) scale(3)' } },
      { char: '👤', style: { transform: 'translate(66%, 0) scale(3)' } },
      { char: '👤', style: { transform: 'translate(0, 0) scale(3)' } },
      { char: '👤', style: { transform: 'translate(-66%, 0) scale(3)' } },
      { char: '👤', style: { transform: 'translate(66%, -66%) scale(3)' } },
      { char: '👤', style: { transform: 'translate(0, -66%) scale(3)' } },
      { char: '👤', style: { transform: 'translate(-66%, -66%) scale(3)' } },
    ];

    return (
      <div className="persona-sculpting-container">
        <div className="sculpting-grid">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="sculpt-card">
              <div className="sculpt-card-face sculpt-card-front">⚙️</div>
              <div className="sculpt-card-face sculpt-card-back">
                <span style={iconParts[i].style}>{iconParts[i].char}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="sculpt-status-text">SCULPTING IDEAL PERSONAS...</div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="cp-results-container">
        <div className="header-section">
          <h2 className="text-3xl font-bold">Ideal Customer Personas</h2>
          <button onClick={handleGenerate} className="regenerate-button" title="Regenerate">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
            <span>Regenerate</span>
          </button>
        </div>
        <div className="personas-grid">
          {result.personas.map((persona, i) => (
            <div key={i} className="persona-card">
              <div className="persona-header">
                <div className="persona-avatar">{persona.avatar}</div>
                <div>
                  <h3 className="persona-name">{persona.name}</h3>
                  <p className="persona-demographics">{persona.demographics}</p>
                </div>
              </div>
              <div className="persona-section">
                <h4 className="persona-section-title"><i className="fa-solid fa-bullseye"></i><span>Goals</span></h4>
                <ul>{persona.goals.map((goal, j) => <li key={j}>{goal}</li>)}</ul>
              </div>
              <div className="persona-section">
                <h4 className="persona-section-title"><i className="fa-solid fa-triangle-exclamation"></i><span>Pain Points</span></h4>
                <ul>{persona.painPoints.map((pain, j) => <li key={j}>{pain}</li>)}</ul>
              </div>
              <div className="persona-section">
                <h4 className="persona-section-title"><i className="fa-solid fa-lightbulb"></i><span>Motivations</span></h4>
                <ul>{persona.motivations.map((motive, j) => <li key={j}>{motive}</li>)}</ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cp-initial-view">
      <h2 className="text-3xl font-bold mb-4">Ideal Customer Personas</h2>
      <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
        Understand who your customers are. Generate detailed personas to guide your product development, marketing, and strategy.
      </p>
      <button onClick={handleGenerate} disabled={!canGenerate} className="cta-button">
        Sculpt Personas
      </button>
      {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete the Brainstorm, Market Research, Mission/Vision, and Brand Identity steps first.</p>}
    </div>
  );
};