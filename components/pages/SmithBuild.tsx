import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SmithBuild.css';
import { SmallSpinner } from './SmallSpinner';

// This is the initial view where the user inputs their idea.
const IdeaInputView = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleBuild = () => {
    if (!prompt.trim()) return;

    // Generate a simple unique ID for the session
    const sessionId = Date.now().toString();

    // Navigate to the new workspace page, passing the prompt in the state
    navigate(`/smith-build/${sessionId}`, { state: { prompt } });
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
      <button onClick={handleBuild}>
        {'Start Building'}
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
