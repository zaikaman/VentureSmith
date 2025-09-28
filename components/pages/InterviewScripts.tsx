import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './InterviewScripts.css';

// --- INTERFACES & PROPS ---
interface Script {
  personaName: string;
  introduction: string[];
  problemDiscovery: string[];
  solutionValidation: string[];
  wrapUp: string[];
}

interface InterviewScriptsResult {
  scripts: Script[];
}

interface InterviewScriptsProps {
  startup: {
    _id: Id<"startups">;
    name?: string | undefined;
    interviewScripts?: string | undefined;
    customerPersonas?: string | undefined;
  };
}

// --- ACCORDION COMPONENT ---
const AccordionItem: React.FC<{ script: Script; initiallyOpen?: boolean }> = ({ script, initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const handleCopy = () => {
    const scriptText = `
Interview Script for: ${script.personaName}

--- Introduction ---
${script.introduction.join('\n')}

--- Problem Discovery Questions ---
${script.problemDiscovery.join('\n')}

--- Solution Validation Questions ---
${script.solutionValidation.join('\n')}

--- Wrap-up ---
${script.wrapUp.join('\n')}
    `;
    navigator.clipboard.writeText(scriptText.trim());
    toast.success(`Script for ${script.personaName} copied to clipboard!`);
  };

  return (
    <div className="script-item">
      <div className="script-item-header" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="script-item-title">Interview Script for: {script.personaName}</h3>
        <span className={`script-item-toggle ${isOpen ? 'open' : ''}`}>▶</span>
      </div>
      {isOpen && (
        <div className="script-content">
          <div className="script-actions">
            <button onClick={handleCopy} className="copy-button"><i className="fa-solid fa-copy"></i> Copy Script</button>
          </div>
          <div className="script-section">
            <h4 className="script-section-title"><i className="fa-solid fa-comments"></i> Introduction</h4>
            <ul>{script.introduction?.map((line, i) => <li key={i}>{line}</li>)}</ul>
          </div>
          <div className="script-section">
            <h4 className="script-section-title"><i className="fa-solid fa-magnifying-glass-chart"></i> Problem Discovery</h4>
            <ul>{script.problemDiscovery?.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </div>
          <div className="script-section">
            <h4 className="script-section-title"><i className="fa-solid fa-key"></i> Solution Validation</h4>
            <ul>{script.solutionValidation?.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </div>
          <div className="script-section">
            <h4 className="script-section-title"><i className="fa-solid fa-flag-checkered"></i> Wrap-up</h4>
            <ul>{script.wrapUp?.map((line, i) => <li key={i}>{line}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
export const InterviewScripts: React.FC<InterviewScriptsProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<InterviewScriptsResult | null>(null);
  const generateScripts = useAction(api.actions.generateInterviewScripts);

  const canGenerate = !!startup.customerPersonas;

  useEffect(() => {
    if (startup.interviewScripts) {
      setResult(JSON.parse(startup.interviewScripts));
    }
  }, [startup.interviewScripts]);

  const handleGenerate = async () => {
    if (!canGenerate) { toast.error("Customer Personas must be generated first."); return; }
    setIsGenerating(true);
    setResult(null);

    try {
      const scriptsResult = await generateScripts({ startupId: startup._id });
      setTimeout(() => {
        setResult(scriptsResult);
        setIsGenerating(false);
      }, 5000); // Animation duration
    } catch (err: any) {
      toast.error("Failed to generate interview scripts.", { description: err.message });
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
        <div className="dialogue-container">
            <div className="dialogue-animation">
                <div className="persona-icon"></div>
                <div className="speech-bubble question">?</div>
                <div className="speech-bubble answer">!</div>
                {/* Add some particles for effect */}
                {[...Array(10)].map((_, i) => <div key={i} className={`particle p-${i}`}></div>)}
            </div>
            <div className="mobile-spinner"></div>
            <div className="dialogue-status-text">AI IS WEAVING DIALOGUE...</div>
        </div>
    );
  }

  if (result) {
    return (
        <div className="is-results-container">
          <TaskResultHeader title="Interview Scripts" onRegenerate={handleGenerate} />
          <div className="scripts-accordion">
            {result.scripts.map((script, i) => (
              <AccordionItem key={i} script={script} initiallyOpen={i === 0} />
            ))}
          </div>
        </div>
    );
  }

  return (
    <InitialTaskView
        title="Generate Interview Scripts"
        description="Create tailored interview scripts based on your customer personas to effectively validate your problem and solution."
        buttonText="Draft Interview Scripts"
        onAction={handleGenerate}
        disabled={!canGenerate}
    />
  );
};
