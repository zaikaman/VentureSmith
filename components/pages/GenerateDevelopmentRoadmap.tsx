import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';

import './GenerateDevelopmentRoadmap.css';

// Define the structure of the roadmap data
interface Epic {
  title: string;
  icon: string;
  tasks: string[];
}

interface Phase {
  phase: string;
  epics: Epic[];
}

interface RoadmapData {
  roadmap: Phase[];
}

interface GenerateDevelopmentRoadmapProps {
  startup: {
    _id: Id<"startups">;
    developmentRoadmap?: string;
    brainstormResult?: string;
    techStack?: string;
    databaseSchema?: string;
    apiEndpoints?: string;
  };
}

const GenerateDevelopmentRoadmap: React.FC<GenerateDevelopmentRoadmapProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);

  const generateRoadmapAction = useAction(api.actions.generateDevelopmentRoadmap);

  const loadingTexts = [
    "Defining project milestones...",
    "Structuring development sprints...",
    "Prioritizing core features for MVP...",
    "Allocating technical resources...",
    "Building the project timeline...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.brainstormResult && !!startup.techStack && !!startup.databaseSchema && !!startup.apiEndpoints;

  useEffect(() => {
    if (startup.developmentRoadmap) {
      try {
        const parsedData = JSON.parse(startup.developmentRoadmap);
        setRoadmapData(parsedData);
      } catch (e) {
        console.error("Failed to parse roadmap data:", e);
        setRoadmapData(null);
      }
    }
  }, [startup.developmentRoadmap]);

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
      toast.error("Please complete all previous technical steps first (Tech Stack, DB Schema, API Endpoints).");
      return;
    }
    setIsGenerating(true);
    setRoadmapData(null);
    try {
      const resultString = await generateRoadmapAction({ startupId: startup._id });
      const resultData = JSON.parse(resultString);
      setRoadmapData(resultData);
      toast.success("Development Roadmap generated successfully!");
    } catch (err: any) {
      console.error("Roadmap generation failed:", err);
      toast.error("Failed to generate Development Roadmap", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="gantt-animation-container">
        <div className="gantt-bar bar-1" style={{ '--final-width': '70%' } as React.CSSProperties}>Sprint 1: Foundation</div>
        <div className="gantt-bar bar-2" style={{ '--final-width': '90%' } as React.CSSProperties}>Sprint 2: Core Features</div>
        <div className="gantt-bar bar-3" style={{ '--final-width': '80%' } as React.CSSProperties}>Sprint 3: MVP Polish</div>
        <div className="gantt-milestone milestone-1">Wk 0</div>
        <div className="gantt-milestone milestone-2">Wk 2</div>
        <div className="gantt-milestone milestone-3">Wk 4</div>
        <div className="gantt-milestone milestone-4">Wk 6</div>
        <div className="gantt-milestone milestone-5">Launch</div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => {
    if (!roadmapData) return null;

    return (
      <div className="roadmap-results-container">
        <div className="roadmap-path"></div>
        {roadmapData.roadmap.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="phase-container">
            <h2 className="phase-title">{phase.phase}</h2>
            <div className="epics-container">
              {phase.epics.map((epic, epicIndex) => (
                <div key={epicIndex} className={`epic-card ${epicIndex % 2 === 0 ? 'left' : 'right'}`}>
                  <div className="epic-header">
                    <div className="epic-icon" style={{ color: epicIndex % 2 === 0 ? '#a5b4fc' : '#6ee7b7'}}>
                      <i className={epic.icon}></i>
                    </div>
                    <h3 className="epic-title">{epic.title}</h3>
                  </div>
                  <ul className="epic-tasks">
                    {epic.tasks.map((task, taskIndex) => (
                      <li key={taskIndex}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderInitial = () => (
    <div className="initial-view">
        <h3 className="text-3xl font-bold mb-4 text-white">Generate Development Roadmap</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Create a detailed, phased development roadmap from your technical specifications, outlining sprints, milestones, and feature priorities.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={!canGenerate}
        >
            Generate Roadmap
        </button>
        {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete Tech Stack, DB Schema, and API Endpoints first.</p>}
    </div>
  );

  const hasContent = roadmapData || isGenerating;

  return (
    <div className="roadmap-container">
      {hasContent && (
        <div className="header-section">
            <h2 className="text-3xl font-bold">Development Roadmap</h2>
            {roadmapData && !isGenerating && (
                <div className="header-actions">
                    <button onClick={handleGenerate} className="regenerate-button" title="Regenerate Roadmap">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>Regenerate</span>
                    </button>
                </div>
            )}
        </div>
      )}

      {isGenerating ? renderLoading() : roadmapData ? renderResults() : renderInitial()}
    </div>
  );
};

export default GenerateDevelopmentRoadmap;
