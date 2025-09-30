import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

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
      const resultData = await generateRoadmapAction({ startupId: startup._id });
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
      <div className="mobile-spinner"></div>
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

  const hasContent = roadmapData || isGenerating;

  return (
    <div className="roadmap-container">
      {hasContent && (
        <TaskResultHeader title="Development Roadmap" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : roadmapData ? renderResults() : (
        <InitialTaskView
            title="Generate Development Roadmap"
            description="Create a detailed, phased development roadmap from your technical specifications, outlining sprints, milestones, and feature priorities."
            buttonText="Generate Roadmap"
            onAction={handleGenerate}
            disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default GenerateDevelopmentRoadmap;
