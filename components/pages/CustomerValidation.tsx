import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
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
        <div className="mobile-spinner"></div>
        <div className="focus-group-status-text">AI IS CONDUCTING A VIRTUAL FOCUS GROUP...</div>
      </div>
    );
  }

  if (results) {
    const activeResult = results.find(r => r.personaName === activePersona);
    return (
      <div className="cv-results-container">
        <TaskResultHeader title="Simulated Customer Feedback" onRegenerate={handleSimulation} />
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
    <InitialTaskView
        title="Simulate Customer Interviews"
        description="Run a virtual focus group with your generated customer personas. The AI will simulate their reactions, providing critical feedback based on your entire venture context."
        buttonText="Run Simulation"
        onAction={handleSimulation}
        disabled={!canSimulate}
    />
  );
};

export default CustomerValidation;