import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';


import './BuildWaitlistPage.css';

interface WaitlistData {
  code: string;
}

interface BuildWaitlistPageProps {
  startup: {
    _id: Id<"startups">;
    preLaunchWaitlist?: string;
    brandIdentity?: string;
    missionVision?: string;
    marketingCopy?: string;
  };
}

const BuildWaitlistPage: React.FC<BuildWaitlistPageProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [waitlistData, setWaitlistData] = useState<WaitlistData | null>(null);
  const [code, setCode] = useState('');

  const generatePageAction = useAction(api.actions.generateWaitlistPage);

  const loadingTexts = [
    "Reviewing marketing copy...",
    "Designing page layout...",
    "Writing React component...",
    "Styling input forms...",
    "Assembling final code...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.brandIdentity && !!startup.marketingCopy;

  useEffect(() => {
    if (startup.preLaunchWaitlist) {
      try {
        const parsedData = JSON.parse(startup.preLaunchWaitlist);
        setWaitlistData(parsedData);
        setCode(parsedData.code || '');
      } catch (e) {
        console.error("Failed to parse waitlist data:", e);
        setWaitlistData(null);
        setCode('');
      }
    }
  }, [startup.preLaunchWaitlist]);

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
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete Brand Identity and Marketing Copy first.");
      return;
    }
    setIsGenerating(true);
    setWaitlistData(null);
    setCode('');
    try {
      const resultString = await generatePageAction({ startupId: startup._id });
      const resultData = JSON.parse(resultString);
      setWaitlistData(resultData);
      setCode(resultData.code || '');
      toast.success("Waitlist Page generated successfully!");
    } catch (err: any) {
      console.error("Page generation failed:", err);
      toast.error("Failed to generate Waitlist Page", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="rolodex-animation-container">
        <div className="rolodex">
            <div className="rolodex-card"><i className="fas fa-at"></i></div>
            <div className="rolodex-card"><i className="fas fa-at"></i></div>
            <div className="rolodex-card"><i className="fas fa-at"></i></div>
            <div className="rolodex-card"><i className="fas fa-at"></i></div>
            <div className="rolodex-card"><i className="fas fa-at"></i></div>
            <div className="rolodex-card"><i className="fas fa-at"></i></div>
        </div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => {
    if (!waitlistData) return null;

    return (
        <LiveProvider code={code}>
            <div className="waitlist-results-container">
                <div className="preview-section">
                    <div className="preview-header">Live Preview</div>
                    <div className="preview-content">
                        <LivePreview />
                    </div>
                </div>
                <div className="code-editor-section">
                    <div className="preview-header">Code Editor</div>
                    <LiveEditor onChange={setCode} />
                </div>
                <LiveError />
            </div>
        </LiveProvider>
    );
  };

  const hasContent = waitlistData || isGenerating;

  return (
    <div className="waitlist-page-container">
      {hasContent && (
        <TaskResultHeader title="Waitlist Page Builder" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : waitlistData ? renderResults() : (
        <InitialTaskView
            title="Build Pre-launch Waitlist Page"
            description="Generate a complete, ready-to-use waitlist page to start capturing leads before you even launch your product."
            buttonText="Build Waitlist Page"
            onAction={handleGenerate}
            disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default BuildWaitlistPage;
