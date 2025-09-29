import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import './SmithBuild.css';
import { SmallSpinner } from './SmallSpinner';

// This is the initial view where the user inputs their idea.
const IdeaInputView = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const createWorkspace = useMutation(api.smithWorkspaces.createWorkspace);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuild = async () => {
    if (!prompt.trim() || isBuilding) return;

    setIsBuilding(true);
    try {
      const workspaceId = await createWorkspace({ prompt });
      navigate(`/smith-build/${workspaceId}`);
    } catch (error) {
      console.error("Failed to create workspace:", error);
      // You might want to show an error message to the user
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="idea-input-container">
      <h2>Let's build something new.</h2>
      <p>Describe the web app or component you want to create.</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A simple counter button with a display that increments on click."
        rows={5}
      />
      <button onClick={handleBuild} disabled={isBuilding}>
        {isBuilding ? <SmallSpinner /> : 'Start Building'}
      </button>
    </div>
  );
};

// The main SmithBuild component now only renders the IdeaInputView.
export const SmithBuild: React.FC = () => {
  return (
    <div className="smith-build-container">
      <IdeaInputView />
    </div>
  );
};
