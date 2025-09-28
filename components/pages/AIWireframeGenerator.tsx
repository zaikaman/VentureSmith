import React, { useState, useEffect } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

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
  const updateCodeMutation = useMutation(api.startups.updateAIWireframeCode);

  const handleSave = async () => {
    try {
      const newWireframeData = JSON.stringify({ code });
      await updateCodeMutation({
        startupId: startup._id,
        aiWireframe: newWireframeData,
      });
      toast.success("Changes saved successfully!");
    } catch (error) {
      toast.error("Failed to save changes.");
      console.error("Failed to save AI wireframe code:", error);
    }
  };

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
        <LiveProvider code={`${code}\nrender(<WireframeComponent />);`} scope={{ React }} noInline={true}>
          <div className="wireframe-preview-container">
            <LivePreview className="wireframe-preview" />
          </div>
          <LiveError className="live-error" />
          <h3 className="generated-code-title">Code Editor</h3>
          <LiveEditor onChange={setCode} className="live-editor" />
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

  const hasContent = code || isGenerating;

  return (
    <div className="ai-wireframe-container">
      {hasContent && (
        <TaskResultHeader title="AI-Powered Wireframing" onRegenerate={handleGenerate}>
            {code && !isGenerating && (
                <button onClick={handleSave} className="regenerate-button" title="Save Changes">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l4.122 4.12A1.5 1.5 0 0117 7.622V16.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13zM5.25 3.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h9.5a.75.75 0 00.75-.75V8.122a.75.75 0 00-.22-.53l-4.12-4.122a.75.75 0 00-.531-.22H5.25zM10 10a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"/><path d="M10 6.5a1 1 0 00-1 1v1.5a.75.75 0 001.5 0V7.5a1 1 0 00-1-1z"/></svg>
                    <span>Save</span>
                </button>
            )}
        </TaskResultHeader>
      )}

      {isGenerating ? renderLoading() : code ? renderResults() : (
        <InitialTaskView
            title="AI-Powered Wireframe"
            description="Use AI to generate a low-fidelity wireframe for your landing page based on all the data you've developed so far."
            buttonText="Generate Wireframe"
            onAction={handleGenerate}
            disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default AIWireframeGenerator;