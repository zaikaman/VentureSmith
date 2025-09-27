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
        <div className="results-grid">
          {/* Refined Idea Card */}
          <div className="info-card refined-idea-card">
            <div className="card-header">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a14.994 14.994 0 01-3.75 0m-1.064-2.311a14.986 14.986 0 01-1.82-.333m3.75 0a14.986 14.986 0 001.82-.333M6.75 7.5h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V8.25a.75.75 0 01.75-.75z" /></svg>
              </div>
              <h3 className="card-title">Refined Idea</h3>
            </div>
            <p className="card-content">{cleanText(result.refinedIdea)}</p>
          </div>

          {/* Key Features Card */}
          <div className="info-card">
            <div className="card-header">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="card-title">Key Features</h3>
            </div>
            <ul className="card-list">
              {(result.keyFeatures || []).map((feature, i) => <li key={i}>{cleanText(feature)}</li>)}
            </ul>
          </div>

          {/* Potential Angles Card */}
          <div className="info-card">
            <div className="card-header">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-8.495l.928.928M3.75 9.75l.928-.928M15.75 9.75l-.928-.928M5.625 19.125l-.928.928M18.375 19.125l.928.928M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>
              </div>
              <h3 className="card-title">Potential Angles</h3>
            </div>
            <ul className="card-list">
              {(result.potentialAngles || []).map((angle, i) => <li key={i}>{cleanText(angle)}</li>)}
            </ul>
          </div>

          {/* Initial Concerns Card */}
          <div className="info-card">
            <div className="card-header">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>
              </div>
              <h3 className="card-title">Initial Concerns</h3>
            </div>
            <ul className="card-list">
              {(result.initialConcerns || []).map((concern, i) => <li key={i}>{cleanText(concern)}</li>)}
            </ul>
          </div>

          {/* Competitive Advantage Card */}
          <div className="info-card">
            <div className="card-header">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="card-title">Competitive Advantage</h3>
            </div>
            <ul className="card-list">
              {(result.competitiveAdvantage || []).map((advantage, i) => <li key={i}>{cleanText(advantage)}</li>)}
            </ul>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default BrainstormIdea;
