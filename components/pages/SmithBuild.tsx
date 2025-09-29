
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import './SmithBuild.css';
import { SmallSpinner } from './SmallSpinner';

import { SmithBuildHistory } from './SmithBuildHistory';

// View for starting from a blank slate
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
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="build-option-card">
      <h3>Start from Scratch</h3>
      <p>Describe the web app or component you want to create from a simple idea.</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A simple counter button..."
        rows={4}
      />
      <button onClick={handleBuild} disabled={isBuilding || !prompt.trim()}>
        {isBuilding ? <SmallSpinner /> : 'Start Building'}
      </button>
    </div>
  );
};

// View for starting from an existing Venture
const VentureInputView = () => {
  const [selectedVentureId, setSelectedVentureId] = useState<string>('');
  const navigate = useNavigate();
  const ventures = useQuery(api.startups.getStartupsForUser);
  const venture = useQuery(api.startups.getStartupById, selectedVentureId ? { id: selectedVentureId as any } : 'skip');
  const createWorkspace = useMutation(api.smithWorkspaces.createWorkspace);
  const [isBuilding, setIsBuilding] = useState(false);

  const ventureContext = useMemo(() => {
    if (!venture) return '';
    // Aggregate all the textual data from the venture into a single context string.
    const context = Object.entries(venture)
      .filter(([key, value]) => typeof value === 'string' && key !== 'name' && key !== 'idea' && value)
      .map(([key, value]) => `## ${key}\n${value}`)
      .join('\n\n');
    return `Venture Name: ${venture.name}\nIdea: ${venture.idea}\n\n${context}`;
  }, [venture]);

  const handleBuild = async () => {
    if (!ventureContext || isBuilding) return;

    setIsBuilding(true);
    try {
      const workspaceId = await createWorkspace({ prompt: ventureContext });
      navigate(`/smith-build/${workspaceId}`);
    } catch (error) {
      console.error("Failed to create workspace from venture:", error);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="build-option-card">
      <h3>Build from a Venture</h3>
      <p>Use the context from one of your existing ventures to guide the build process.</p>
      <select
        value={selectedVentureId}
        onChange={(e) => setSelectedVentureId(e.target.value)}
        disabled={!ventures}
      >
        <option value="">{ventures ? 'Select a Venture' : 'Loading ventures...'}</option>
        {ventures?.map((v: Doc<"startups">) => (
          <option key={v._id} value={v._id}>{v.name || 'Untitled Venture'}</option>
        ))}
      </select>
      <button onClick={handleBuild} disabled={isBuilding || !selectedVentureId}>
        {isBuilding ? <SmallSpinner /> : 'Build with Venture Context'}
      </button>
    </div>
  );
};


export const SmithBuild: React.FC = () => {
  return (
    <div className="smith-build-container">
      <div className="smith-build-header">
        <h2>Let's build something new.</h2>
        <p>Choose how you'd like to start your next project.</p>
      </div>
      <div className="smith-build-options">
        <IdeaInputView />
        <VentureInputView />
      </div>
      <div className="divider"></div>
      <SmithBuildHistory />
    </div>
  );
};
