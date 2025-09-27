import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';


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

  const renderInitial = () => (
    <div className="initial-view">
        <h3 className="text-3xl font-bold mb-4 text-white">Build Pre-launch Waitlist Page</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Generate a complete, ready-to-use waitlist page to start capturing leads before you even launch your product.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={!canGenerate}
        >
            Build Waitlist Page
        </button>
        {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete Brand Identity and Marketing Copy first.</p>}
    </div>
  );

  const hasContent = waitlistData || isGenerating;

  return (
    <div className="waitlist-page-container">
      {hasContent && (
        <div className="header-section">
            <h2 className="text-3xl font-bold">Waitlist Page Builder</h2>
            {waitlistData && !isGenerating && (
                <div className="header-actions">
                    <button onClick={handleGenerate} className="regenerate-button" title="Regenerate Page">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>Regenerate</span>
                    </button>
                </div>
            )}
        </div>
      )}

      {isGenerating ? renderLoading() : waitlistData ? renderResults() : renderInitial()}
    </div>
  );
};

export default BuildWaitlistPage;
