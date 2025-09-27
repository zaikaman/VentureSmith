import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import './BrainstormIdea.css';

// Interfaces
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BrainstormResult | null>(null);
  const [hasJustAnalyzed, setHasJustAnalyzed] = useState(false);
  const generateBrainstormIdea = useAction(api.actions.generateBrainstormIdea);

  useEffect(() => {
    if (startup.brainstormResult) {
      setResult(JSON.parse(startup.brainstormResult));
    }
    // Cleanup function to reset animation state on component unmount
    return () => {
      setHasJustAnalyzed(false);
    };
  }, [startup.brainstormResult]);

  const handleAnalysis = async () => {
    if (!startup.idea) {
      toast.error("Initial idea is missing.");
      return;
    }
    setIsAnalyzing(true);
    setHasJustAnalyzed(true); // Trigger the delayed animation
    setResult(null); // Clear previous results for re-generation

    try {
      const brainstormResult = await generateBrainstormIdea({
        startupId: startup._id,
        idea: startup.idea,
      });
      // Set result after animation has played out
      setTimeout(() => {
        setResult(brainstormResult);
      }, 3500); // Corresponds to animation duration
    } catch (err: any) {
      toast.error("Failed to generate brainstorm data. Please try again.");
      console.error("Error generating brainstorm data:", err);
      setIsAnalyzing(false);
    }
  };

  // Separate render function for clarity
  const renderResults = () => (
    <div className={`results-grid visible ${hasJustAnalyzed ? 'with-delay' : ''}`}>
        <div className="info-card refined-idea-card">
            <div className="card-header">
                <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="card-title">Refined Idea</h3>
            </div>
            <p className="card-content">{cleanText(result!.refinedIdea)}</p>
        </div>
        <div className="info-card">
            <div className="card-header">
                <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="card-title">Key Features</h3>
            </div>
            <ul className="card-list">
                {(result!.keyFeatures || []).map((feature, i) => <li key={i}>{cleanText(feature)}</li>)}
            </ul>
        </div>
        <div className="info-card">
            <div className="card-header">
                <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-8.495l.928.928M3.75 9.75l.928-.928M15.75 9.75l-.928-.928M5.625 19.125l-.928.928M18.375 19.125l.928.928M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>
                </div>
                <h3 className="card-title">Potential Angles</h3>
            </div>
            <ul className="card-list">
                {(result!.potentialAngles || []).map((angle, i) => <li key={i}>{cleanText(angle)}</li>)}
            </ul>
        </div>
        <div className="info-card">
            <div className="card-header">
                <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>
                </div>
                <h3 className="card-title">Initial Concerns</h3>
            </div>
            <ul className="card-list">
                {(result!.initialConcerns || []).map((concern, i) => <li key={i}>{cleanText(concern)}</li>)}
            </ul>
        </div>
        <div className="info-card">
            <div className="card-header">
                <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="card-title">Competitive Advantage</h3>
            </div>
            <ul className="card-list">
                {(result!.competitiveAdvantage || []).map((advantage, i) => <li key={i}>{cleanText(advantage)}</li>)}
            </ul>
        </div>
    </div>
  );

  // Main render logic
  return (
    <div className="brainstorm-idea-container">
        <div className="header-section">
            <h2 className="text-3xl font-bold">Brainstorm & Refine Idea</h2>
            {/* Show regenerate button only when results are present and not analyzing */}
            {result && !isAnalyzing && (
                 <button onClick={handleAnalysis} className="regenerate-button" title="Regenerate">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                    <span>Regenerate</span>
                </button>
            )}
        </div>

        {isAnalyzing ? (
            // 1. Analysis/Animation View
            <div className="prism-container">
                <div className="prism-core">
                    <div className="prism-text">{startup.idea}</div>
                    <div className="prism-surface"></div>
                    <div className="prism-beam beam-1"></div>
                    <div className="prism-beam beam-2"></div>
                    <div className="prism-beam beam-3"></div>
                    <div className="prism-beam beam-4"></div>
                    <div className="prism-beam beam-5"></div>
                </div>
            </div>
        ) : result ? (
            // 2. Results View
            renderResults()
        ) : (
            // 3. Initial View
            <div className="initial-view">
                <div className="initial-idea-box">
                    <h3 className="text-xl font-semibold mb-2">Your Initial Idea:</h3>
                    <p>{cleanText(startup.idea || "No initial idea found.")}</p>
                </div>
                <div className="text-center p-8">
                    <button onClick={handleAnalysis} className="cta-button">
                        Analyze with Idea Prism
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default BrainstormIdea;
