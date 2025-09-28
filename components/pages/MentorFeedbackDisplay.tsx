import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './MentorFeedbackDisplay.css';

// --- TYPE DEFINITIONS ---
interface MentorFeedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface MentorFeedbackProps {
  startup: {
    _id: Id<"startups">;
    name?: string;
    aiMentor?: string; // Corrected property
    // Add dependencies from other steps if needed
    businessPlan?: string;
  };
}

// --- MAIN COMPONENT ---
const MentorFeedbackDisplay: React.FC<MentorFeedbackProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<MentorFeedback | null>(null);
  const [activeTab, setActiveTab] = useState<'strengths' | 'weaknesses' | 'suggestions'>('strengths');
  const getMentorFeedback = useAction(api.actions.getMentorFeedback);

  const canGenerate = !!startup.businessPlan; // Example dependency

  useEffect(() => {
    if (startup.aiMentor) { // Corrected property
      try {
        setFeedback(JSON.parse(startup.aiMentor)); // Corrected property
      } catch (e) {
        console.error("Failed to parse existing mentor feedback:", e);
        toast.error("Failed to load previous feedback.");
      }
    } else {
      setFeedback(null); // Clear feedback if the prop is gone
    }
  }, [startup.aiMentor]); // Corrected dependency

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please generate the Business Plan first.");
      return;
    }
    setIsGenerating(true);
    setFeedback(null);

    try {
      // Using a timeout to ensure the animation plays for a minimum duration
      const feedbackPromise = getMentorFeedback({ startupId: startup._id });
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 6000)); // Let the cool animation run

      await Promise.all([feedbackPromise, timeoutPromise]);
      
      // The component will auto-update with new feedback via the startup prop
      toast.success("AI Mentor feedback is ready!");

    } catch (err: any) {
      console.error("Failed to get mentor feedback:", err);
      toast.error("Failed to get feedback", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="mentor-review-container">
        <div className="mentor-animation">
          <div className="robot-head">
            <div className="robot-eye"></div>
          </div>
          <div className="document doc-1"></div>
          <div className="document doc-2"></div>
        </div>
        <div className="mentor-status-text">AI MENTOR IS REVIEWING YOUR DOCUMENTS...</div>
      </div>
    );
  }

  if (feedback) {
    const tabContent = {
      strengths: {
        icon: "fa-solid fa-rocket",
        items: feedback.strengths,
      },
      weaknesses: {
        icon: "fa-solid fa-shield-halved",
        items: feedback.weaknesses,
      },
      suggestions: {
        icon: "fa-solid fa-lightbulb",
        items: feedback.suggestions,
      },
    };

    return (
      <div className="mf-results-container">
        <TaskResultHeader title="AI Mentor Feedback" onRegenerate={handleGenerate} />
        <div className="mf-tabs">
            {(Object.keys(tabContent) as Array<keyof typeof tabContent>).map(tabName => (
              <button 
                key={tabName} 
                className={`mf-tab-button ${activeTab === tabName ? `active ${tabName}` : ''}`}
                onClick={() => setActiveTab(tabName)}
              >
                <i className={tabContent[tabName].icon}></i>
                <span>{tabName.charAt(0).toUpperCase() + tabName.slice(1)}</span>
              </button>
            ))}
          </div>

          <div className={`mf-tab-content ${activeTab}`}>
              <ul>
                {tabContent[activeTab].items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
          </div>

        </div>
    );
  }

  return (
    <InitialTaskView
        title="Get Feedback from AI Mentor"
        description="Submit your business plan and other generated documents for a comprehensive review by your AI Mentor. It will analyze your strategy, market fit, and execution plan to provide actionable feedback."
        buttonText="Request AI Mentor Review"
        onAction={handleGenerate}
        disabled={!canGenerate}
    />
  );
};

export default MentorFeedbackDisplay;