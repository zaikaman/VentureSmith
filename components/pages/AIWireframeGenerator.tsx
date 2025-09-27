import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

import './AIWireframeGenerator.css';

interface AIWireframeGeneratorProps {
  startup: {
    _id: Id<"startups">;
    name?: string;
    aiWireframe?: string;
    brainstormResult?: string;
    customerPersonas?: string;
    userFlowDiagram?: string;
    brandIdentity?: string;
    missionVision?: string;
  };
}

const AIWireframeGenerator: React.FC<AIWireframeGeneratorProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState<string>(() => {
    try {
      return startup.aiWireframe ? JSON.parse(startup.aiWireframe).code : '';
    } catch { 
      return '';
    }
  });

  const generateWireframeAction = useAction(api.actions.generateAIWireframe);
  
  const canGenerate = 
    !!startup.brainstormResult &&
    !!startup.customerPersonas &&
    !!startup.userFlowDiagram &&
    !!startup.brandIdentity &&
    !!startup.missionVision;

  useEffect(() => {
    try {
      const newCode = startup.aiWireframe ? JSON.parse(startup.aiWireframe).code : '';
      const cleanedCode = newCode.replace(/(export default .*;|module.exports = .*)/s, '');
      setCode(cleanedCode);
    } catch (e) {
      console.error("Failed to parse AI wireframe data:", e);
      toast.error("Failed to load existing wireframe.");
    }
  }, [startup.aiWireframe]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete all previous steps first.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateWireframeAction({ startupId: startup._id });
      const cleanedCode = result.code.replace(/(export default .*;|module.exports = .*)/s, '');
      setCode(cleanedCode);
      toast.success("AI Wireframe generated and saved automatically!");
    } catch (err: any) {
      toast.error("Failed to generate wireframe", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };


  const renderLoading = () => (
    <div className="wireframe-generator-container">
      <div className="blueprint-animation">
        <svg className="blueprint-svg" preserveAspectRatio="xMidYMid meet">
          <rect x="10%" y="8%" width="80%" height="10%" rx="2" className="blueprint-shape shape-nav" />
          <rect x="10%" y="22%" width="55%" height="30%" rx="2" className="blueprint-shape shape-hero" />
          <rect x="70%" y="22%" width="20%" height="8%" rx="2" className="blueprint-shape shape-cta" />
          <rect x="10%" y="58%" width="25%" height="25%" rx="2" className="blueprint-shape shape-card1" />
          <rect x="37.5%" y="58%" width="25%" height="25%" rx="2" className="blueprint-shape shape-card2" />
          <rect x="65%" y="58%" width="25%" height="25%" rx="2" className="blueprint-shape shape-card3" />
        </svg>
      </div>
      <div className="wireframe-status-text">SKETCHING BLUEPRINT...</div>
    </div>
  );

  const renderResults = () => (
    <div className="wireframe-editor-container">
        <div className="uf-header">
            <button onClick={handleGenerate} className="regenerate-button" title="Regenerate Wireframe">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                <span>Regenerate</span>
            </button>
        </div>
        <LiveProvider code={`${code}\nrender(<WireframeComponent />);`} scope={{ React }} noInline={true}>
          <div className="wireframe-preview-container">
            <LivePreview className="wireframe-preview" />
          </div>
          <LiveError className="live-error" />
          <h3 className="generated-code-title">Generated Code</h3>
          <LiveEditor disabled={true} className="live-editor" />
        </LiveProvider>
    </div>
  );

  const renderInitial = () => (
    <div className="text-center p-12 bg-slate-900 rounded-lg">
        <h3 className="text-3xl font-bold mb-4 text-white">AI-Powered Wireframe</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Use AI to generate a low-fidelity wireframe for your landing page based on all the data you've developed so far.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={!canGenerate}
        >
            Generate Wireframe
        </button>
        {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete all previous steps to enable wireframe generation.</p>}
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

export default AIWireframeGenerator;