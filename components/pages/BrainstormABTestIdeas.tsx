import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

import './BrainstormABTestIdeas.css';

interface ABTestIdea {
  hypothesis: string;
  description: string;
  variationA: {
    name: string;
    details: string;
  };
  variationB: {
    name: string;
    details: string;
  };
}

interface BrainstormABTestIdeasProps {
  startup: {
    _id: Id<"startups">;
    abTestIdeas?: string; // JSON string of ABTestIdea[]
    brainstormResult?: string;
  };
}

const BrainstormABTestIdeas: React.FC<BrainstormABTestIdeasProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<ABTestIdea[]>([]);
  // Assuming the action exists, if not, it needs to be created in convex/actions.ts
  const generateIdeasAction = useAction(api.actions.generateABTestIdeas);

  const loadingTexts = [
    "Analyzing user behavior patterns...",
    "Identifying key conversion funnels...",
    "Formulating testable hypotheses...",
    "Generating creative variations...",
    "Structuring A/B test concepts...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.brainstormResult;

  useEffect(() => {
    if (startup.abTestIdeas) {
      try {
        const parsedIdeas = JSON.parse(startup.abTestIdeas);
        setIdeas(parsedIdeas);
      } catch (e) {
        console.error("Failed to parse A/B test ideas:", e);
        toast.error("Failed to load existing A/B test ideas.");
      }
    }
  }, [startup.abTestIdeas]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentLoadingText(prev => loadingTexts[(loadingTexts.indexOf(prev) + 1) % loadingTexts.length]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, loadingTexts]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete the 'Brainstorm' step first to generate ideas.");
      return;
    }
    setIsGenerating(true);
    setIdeas([]);
    try {
      // Add a minimum delay for the user to see the animation
      const [generatedIdeasString, _] = await Promise.all([
        generateIdeasAction({ startupId: startup._id }),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);
      
      if (generatedIdeasString) {
        const parsedIdeas = JSON.parse(generatedIdeasString);
        setIdeas(parsedIdeas);
        toast.success("A/B Test Ideas generated successfully!");
      } else {
        throw new Error("Received an empty response from the server.");
      }
    } catch (err: any) {
      console.error("A/B test idea generation failed:", err);
      toast.error("Failed to generate A/B Test Ideas", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="ab-animation-container">
        <div className="variation-path"></div>
        <div className="idea-orb">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '40px', height: '40px', color: '#422006' }}>
                <path d="M12,2A7,7,0,0,0,5,9c0,2.38,1.19,4.47,3,5.74V17a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V14.74c1.81-1.27,3-3.36,3-5.74A7,7,0,0,0,12,2ZM9,21a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V20H9Z"/>
            </svg>
        </div>
        <div className="variation-box variation-a">A</div>
        <div className="variation-box variation-b">B</div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => (
    <div className="ab-results-container">
      {ideas.map((idea, index) => (
        <div key={index} className="ab-test-card">
          <h3>{idea.hypothesis}</h3>
          <p>{idea.description}</p>
          <div className="variations-grid">
            <div className="variation-column">
              <h4 className="variation-a-header">{idea.variationA.name}</h4>
              <p>{idea.variationA.details}</p>
            </div>
            <div className="variation-column">
              <h4 className="variation-b-header">{idea.variationB.name}</h4>
              <p>{idea.variationB.details}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const hasContent = ideas.length > 0 || isGenerating;

  return (
    <div className="ab-test-container">
      {hasContent && (
        <TaskResultHeader title="A/B Test Ideas" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : ideas.length > 0 ? renderResults() : (
        <InitialTaskView
          title="Brainstorm A/B Test Ideas"
          description="Generate creative and impactful A/B test ideas based on your business concept to optimize conversion rates and user engagement."
          buttonText="Generate Ideas"
          onAction={handleGenerate}
          disabled={!canGenerate}
          disabledReason={!canGenerate ? "Complete the 'Brainstorm' step first." : undefined}
        />
      )}
    </div>
  );
};

export default BrainstormABTestIdeas;
