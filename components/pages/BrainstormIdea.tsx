import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import './BrainstormIdea.css';

interface BrainstormResult {
  refinedIdea: string;
  keyFeatures: string[];
  potentialAngles: string[];
  initialConcerns: string[];
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

const BrainstormIdea: React.FC<BrainstormIdeaProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BrainstormResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generateBrainstormIdea = useAction(api.actions.generateBrainstormIdea);

  useEffect(() => {
    if (startup.brainstormResult) {
      setResult(JSON.parse(startup.brainstormResult));
    }
  }, [startup.brainstormResult]);

  const handleGenerate = async () => {
    if (!startup.idea) {
      setError("Initial idea is missing.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const brainstormResult = await generateBrainstormIdea({
        startupId: startup._id,
        idea: startup.idea,
      });
      setResult(brainstormResult);
    } catch (err: any) {
      setError("Failed to generate brainstorm data. Please try again.");
      console.error("Error generating brainstorm data:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="brainstorm-idea-container">
      <h2 className="text-3xl font-bold mb-4">Brainstorm & Refine Idea</h2>
      <div className="initial-idea-box">
        <h3 className="text-xl font-semibold mb-2">Your Initial Idea:</h3>
        <p>{cleanText(startup.idea || "No initial idea found.")}</p>
      </div>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="spinner"></div>
          <p className="mt-6 text-xl font-semibold animate-pulse">
            AI is brainstorming and refining your idea...
          </p>
        </div>
      )}

      {!isGenerating && !result && (
        <div className="text-center p-8">
          <button onClick={handleGenerate} className="cta-button">
            Start Brainstorming with AI
          </button>
        </div>
      )}

      {result && (
        <div className="result-box">
          <div className="result-section">
            <h3 className="text-xl font-semibold mb-2">Refined Idea:</h3>
            <p>{cleanText(result.refinedIdea)}</p>
          </div>
          <div className="result-section">
            <h3 className="text-xl font-semibold mb-2">Key Features:</h3>
            <ul>
              {result.keyFeatures.map((feature, i) => <li key={i}>{cleanText(feature)}</li>)}
            </ul>
          </div>
          <div className="result-section">
            <h3 className="text-xl font-semibold mb-2">Potential Angles:</h3>
            <ul>
              {result.potentialAngles.map((angle, i) => <li key={i}>{cleanText(angle)}</li>)}
            </ul>
          </div>
          <div className="result-section">
            <h3 className="text-xl font-semibold mb-2">Initial Concerns:</h3>
            <ul>
              {result.initialConcerns.map((concern, i) => <li key={i}>{cleanText(concern)}</li>)}
            </ul>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default BrainstormIdea;
