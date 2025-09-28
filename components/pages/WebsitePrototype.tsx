import React, { useState, useEffect } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

import './WebsitePrototype.css';

interface WebsitePrototypeProps {
  startup: {
    _id: Id<"startups">;
    name?: string;
    website?: string;
    aiWireframe?: string;
    brainstormResult?: string;
    customerPersonas?: string;
    userFlowDiagram?: string;
    brandIdentity?: string;
    missionVision?: string;
  };
}

export const WebsitePrototype: React.FC<WebsitePrototypeProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState<string>(() => {
    try {
      return startup.website ? JSON.parse(startup.website).code : '';
    } catch {
      return '';
    }
  });
  const updateCodeMutation = useMutation(api.startups.updateWebsitePrototypeCode);

  const handleSave = async () => {
    try {
      const newWebsiteData = JSON.stringify({ code });
      await updateCodeMutation({
        startupId: startup._id,
        website: newWebsiteData,
      });
      toast.success("Changes saved successfully!");
    } catch (error) {
      toast.error("Failed to save changes.");
      console.error("Failed to save website prototype code:", error);
    }
  };

  // State for the loading animation text
  const loadingTexts = [
    "Weaving digital threads...",
    "Compiling abstract concepts...",
    "Structuring the user experience...",
    "Painting with pixels...",
    "Assembling the interface...",
    "Finalizing the digital tapestry...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentLoadingText(prevText => {
          const currentIndex = loadingTexts.indexOf(prevText);
          const nextIndex = (currentIndex + 1) % loadingTexts.length;
          return loadingTexts[nextIndex];
        });
      }, 2500);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGenerating]);

  const generatePrototypeAction = useAction(api.actions.generateWebsitePrototype);

  const canGenerate = 
    !!startup.brainstormResult &&
    !!startup.customerPersonas &&
    !!startup.userFlowDiagram &&
    !!startup.brandIdentity &&
    !!startup.missionVision &&
    !!startup.aiWireframe;

  useEffect(() => {
    try {
      const newCode = startup.website ? JSON.parse(startup.website).code : '';
      // Clean up any potential module exports if they slip through
      const cleanedCode = newCode.replace(/(export default .*;|module.exports = .*)/s, '');
      setCode(cleanedCode);
    } catch (e) {
      console.error("Failed to parse AI website data:", e);
      toast.error("Failed to load existing website prototype.");
    }
  }, [startup.website]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete all previous steps, including AI Wireframe, first.");
      return;
    }
    setIsGenerating(true);
    try {
      await generatePrototypeAction({ startupId: startup._id });
      toast.success("Interactive Website Prototype generated and saved!");
    } catch (err: any) {
      toast.error("Failed to generate website prototype", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="prototype-loading-container">
      <div className="digital-weaver-animation">
        <svg viewBox="0 0 300 200">
          {/* Weaving lines */}
          <path className="weaver-path path1" d="M0 100 Q 75 20, 150 100 T 300 100" />
          <path className="weaver-path path2" d="M0 100 Q 75 180, 150 100 T 300 100" />
          <path className="weaver-path path3" d="M150 0 Q 20 75, 150 100 T 150 200" />
          <path className="weaver-path path4" d="M150 0 Q 280 75, 150 100 T 150 200" />
          
          {/* Final UI structure */}
          <g className="ui-structure">
            <rect className="ui-rect header" x="50" y="30" width="200" height="20" rx="2" />
            <rect className="ui-rect sidebar" x="50" y="60" width="50" height="110" rx="2" />
            <rect className="ui-rect body" x="110" y="60" width="140" height="80" rx="2" />
            <rect className="ui-rect footer" x="110" y="150" width="140" height="20" rx="2" />
          </g>
        </svg>
      </div>
      <div className="prototype-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => (
    <div className="website-prototype-container">
        <div className="wp-header">
            <h2 className="wp-title">Interactive Website Prototype</h2>
            <div className="button-group">
                <button onClick={handleGenerate} className="regenerate-button" disabled={isGenerating} title="Regenerate Website Prototype">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                    <span>{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
                <button onClick={handleSave} className="regenerate-button save-button" title="Save Changes">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l4.122 4.12A1.5 1.5 0 0117 7.622V16.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13zM5.25 3.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h9.5a.75.75 0 00.75-.75V8.122a.75.75 0 00-.22-.53l-4.12-4.122a.75.75 0 00-.531-.22H5.25zM10 10a.75.75 0 00-1.5 0v3.5a.75.a75 0 001.5 0v-3.5z"/><path d="M10 6.5a1 1 0 00-1 1v1.5a.75.75 0 001.5 0V7.5a1 1 0 00-1-1z"/></svg>
                    <span>Save</span>
                </button>
            </div>
        </div>
        <LiveProvider code={`${code}\nrender(<LandingPageComponent />);`} scope={{ React }} noInline={true}>
          <div className="browser-window">
            <div className="browser-header">
                <div className="browser-dot dot-red"></div>
                <div className="browser-dot dot-yellow"></div>
                <div className="browser-dot dot-green"></div>
            </div>
            <div className="live-preview-container">
                <LivePreview className="live-preview" />
            </div>
          </div>
          <LiveError className="live-error" />
          <h3 className="generated-code-title">Code Editor</h3>
          <LiveEditor onChange={setCode} className="live-editor" />
        </LiveProvider>
    </div>
  );

  const renderInitial = () => (
    <div className="text-center p-12 bg-slate-900 rounded-lg">
        <h3 className="text-3xl font-bold mb-4 text-white">Build Interactive Website Prototype</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Transform your wireframe and business data into a fully-coded, interactive landing page prototype. 
            The AI will build a complete React component based on all your progress.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={!canGenerate || isGenerating}
        >
            {isGenerating ? 'Generating...' : 'Generate Interactive Website'}
        </button>
        {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete all previous steps, including the AI Wireframe, to enable prototype generation.</p>}
    </div>
  );

  if (isGenerating) {
    return renderLoading();
  }

  if (code) {
    return renderResults();
  }

  return renderInitial();
};