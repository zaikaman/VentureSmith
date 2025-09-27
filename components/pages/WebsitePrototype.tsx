import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
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
      <div className="prototype-animation">
        {/* Simple animation: a wireframe turning into a colorful site */}
        <div className="wireframe-base"></div>
        <div className="color-fill-1"></div>
        <div className="color-fill-2"></div>
        <div className="color-fill-3"></div>
      </div>
      <div className="prototype-status-text">BUILDING YOUR PROTOTYPE...</div>
    </div>
  );

  const renderResults = () => (
    <div className="website-prototype-container">
        <div className="wp-header">
            <h2 className="wp-title">Interactive Website Prototype</h2>
            <button onClick={handleGenerate} className="regenerate-button" disabled={isGenerating} title="Regenerate Website Prototype">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                <span>{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
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
          <h3 className="generated-code-title">Generated Code</h3>
          <LiveEditor disabled={true} className="live-editor" />
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

  if (isGenerating && !code) {
    return renderLoading();
  }

  if (code) {
    return renderResults();
  }

  return renderInitial();
};