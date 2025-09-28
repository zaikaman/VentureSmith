import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
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
          <TaskResultHeader title="Ideal Customer Personas" onRegenerate={handleGenerate} />
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
    <InitialTaskView
        title="Ideal Customer Personas"
        description="Understand who your customers are. Generate detailed personas to guide your product development, marketing, and strategy."
        buttonText="Sculpt Personas"
        onAction={handleGenerate}
        disabled={!canGenerate}
    />
  );
};