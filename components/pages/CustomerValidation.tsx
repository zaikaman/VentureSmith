import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import './CustomerValidation.css';

// --- TYPE DEFINITIONS ---
interface SimulationResult {
  personaName: string;
  keyPositiveFeedback: string[];
  criticalConcerns: string[];
  unansweredQuestions: string[];
}

interface Persona {
  name: string;
  avatar: string;
}

interface CustomerValidationProps {
  startup: {
    _id: Id<"startups">;
    name?: string;
    customerValidation?: string;
    customerPersonas?: string;
    interviewScripts?: string; // For dependency check
  };
}

const CustomerValidation: React.FC<CustomerValidationProps> = ({ startup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [activePersona, setActivePersona] = useState<string | null>(null);

  const runSimulations = useAction(api.actions.runInterviewSimulations);

  const canSimulate = !!startup.interviewScripts;
  const personas: Persona[] = startup.customerPersonas ? JSON.parse(startup.customerPersonas).personas : [];

  useEffect(() => {
    if (startup.customerValidation) {
      try {
        const savedResults = JSON.parse(startup.customerValidation).simulations;
        setResults(savedResults);
        if (savedResults.length > 0) {
          setActivePersona(savedResults[0].personaName);
        }
      } catch (e) {
        console.error("Failed to parse existing validation data:", e);
        toast.error("Failed to load previous results.");
      }
    }
  }, [startup.customerValidation]);

  const handleSimulation = async () => {
    if (!canSimulate) {
      toast.error("Please complete 'Generate Interview Scripts' first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null); // Clear previous results

    try {
      const simulationPromise = runSimulations({ startupId: startup._id });
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));
      
      await Promise.all([simulationPromise, timeoutPromise]);
      // The useQuery hook for startup will automatically update the component with the new
      // customerValidation data, which the useEffect above will then process.
      toast.success("Simulation complete!");

    } catch (err: any) {
      console.error("Failed to run simulations:", err);
      setError("Failed to simulate interviews. Please ensure all previous steps are completed.");
      toast.error("Simulation Failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="focus-group-container">
        <div className="focus-group-animation">
          <div className="scanner"></div>
          <div className="table"></div>
          {personas.map((p, i) => (
            <div key={i} className={`chair chair-${i}`}>{p.avatar}</div>
          ))}
        </div>
        <div className="focus-group-status-text">AI IS CONDUCTING A VIRTUAL FOCUS GROUP...</div>
      </div>
    );
  }

  if (results) {
    const activeResult = results.find(r => r.personaName === activePersona);
    return (
      <div className="cv-results-container">
        <div className="cv-header">
          <h2 className="text-3xl font-bold">Simulated Customer Feedback</h2>
          <button onClick={handleSimulation} className="regenerate-button" title="Regenerate">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
            <span>Regenerate</span>
          </button>
        </div>

        <div className="persona-tabs">
          {results.map(result => {
            const persona = personas.find(p => p.name === result.personaName);
            return (
              <button 
                key={result.personaName} 
                onClick={() => setActivePersona(result.personaName)}
                className={`persona-tab ${activePersona === result.personaName ? 'active' : ''}`}>
                  <span className="persona-avatar">{persona?.avatar}</span>
                  <span>{result.personaName}</span>
              </button>
            );
          })}
        </div>

        {activeResult && (
          <div className="feedback-content">
            <div className="feedback-card positive">
              <h4 className="feedback-title"><i className="fa-solid fa-thumbs-up"></i> Key Positive Feedback</h4>
              <ul>{activeResult.keyPositiveFeedback.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div className="feedback-card concerns">
              <h4 className="feedback-title"><i className="fa-solid fa-triangle-exclamation"></i> Critical Concerns</h4>
              <ul>{activeResult.criticalConcerns.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div className="feedback-card questions">
              <h4 className="feedback-title"><i className="fa-solid fa-circle-question"></i> Unanswered Questions</h4>
              <ul>{activeResult.unansweredQuestions.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center p-12 bg-slate-900 rounded-lg">
        <h3 className="text-3xl font-bold mb-4 text-white">Simulate Customer Interviews</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Run a virtual focus group with your generated customer personas. The AI will simulate their reactions, providing critical feedback based on your entire venture context.
        </p>
        <button
            onClick={handleSimulation}
            className="cta-button"
            disabled={!canSimulate}
        >
            Run Simulation
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {!canSimulate && <p className="text-sm text-slate-500 mt-4">Please complete 'Generate Interview Scripts' first.</p>}
    </div>
  );
};

export default CustomerValidation;