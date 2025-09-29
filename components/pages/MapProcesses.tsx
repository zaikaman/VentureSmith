import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

import './MapProcesses.css';

interface ProcessStep {
  step: number;
  action: string;
  automationType: 'Manual' | 'Assisted' | 'Full';
}

interface AutomationProcess {
  name: string;
  description: string;
  automationPotential: 'High' | 'Medium' | 'Low';
  steps: ProcessStep[];
}

interface AutomationMap {
  processes: AutomationProcess[];
}

interface MapProcessesProps {
  startup: {
    _id: Id<"startups">;
    processAutomation?: string; // JSON string of AutomationMap
    businessPlan?: string;
    developmentRoadmap?: string;
  };
}

const MapProcesses: React.FC<MapProcessesProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [automationMap, setAutomationMap] = useState<AutomationMap | null>(null);
  const generateMapAction = useAction(api.actions.generateProcessMap);

  const loadingTexts = [
    "Analyzing business plan for core operations...",
    "Deconstructing development roadmap for technical processes...",
    "Identifying repetitive tasks and bottlenecks...",
    "Mapping workflows for automation opportunities...",
    "Designing the future of your operations...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.businessPlan && !!startup.developmentRoadmap;

  useEffect(() => {
    if (startup.processAutomation) {
      try {
        const parsedMap = JSON.parse(startup.processAutomation);
        setAutomationMap(parsedMap);
      } catch (e) {
        console.error("Failed to parse automation map:", e);
        toast.error("Failed to load existing automation map.");
      }
    }
  }, [startup.processAutomation]);

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
  }, [isGenerating, loadingTexts]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete 'Business Plan' and 'Development Roadmap' steps first.");
      return;
    }
    setIsGenerating(true);
    setAutomationMap(null);
    try {
      const [generatedMapString, _] = await Promise.all([
        generateMapAction({ startupId: startup._id }),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);
      
      if (generatedMapString) {
        const parsedMap = JSON.parse(generatedMapString);
        setAutomationMap(parsedMap);
        toast.success("Process Automation Map generated successfully!");
      } else {
        throw new Error("Received an empty response from the server.");
      }
    } catch (err: any) {
      console.error("Process map generation failed:", err);
      toast.error("Failed to generate Process Map", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="automation-animation-container">
        <i className="fas fa-cog gear g1"></i>
        <i className="fas fa-cog gear g2"></i>
        <i className="fas fa-cog gear g3"></i>
        <div className="conveyor-belt"></div>
        <div className="task-box"></div>
        <div className="robot-arm">
            <i className="fas fa-robot"></i>
        </div>
      </div>
      <div className="mobile-spinner"></div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const getPotentialBadgeClass = (potential: string) => {
    switch (potential.toLowerCase()) {
      case 'high': return 'potential-high';
      case 'medium': return 'potential-medium';
      case 'low': return 'potential-low';
      default: return '';
    }
  };

  const getAutomationTypeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full': return 'type-full';
      case 'assisted': return 'type-assisted';
      case 'manual': return 'type-manual';
      default: return '';
    }
  };

  const renderResults = () => (
    <div className="automation-results-container">
        {automationMap?.processes.map((process, index) => (
            <div key={index} className="process-card">
                <div className="process-header">
                    <div>
                        <h3>{process.name}</h3>
                        <p>{process.description}</p>
                    </div>
                    <span className={`potential-badge ${getPotentialBadgeClass(process.automationPotential)}`}>
                        {process.automationPotential} Potential
                    </span>
                </div>
                <table className="steps-table">
                    <thead>
                        <tr>
                            <th>Step</th>
                            <th>Action</th>
                            <th>Automation Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {process.steps.map((step, sIndex) => (
                            <tr key={sIndex}>
                                <td>{step.step}</td>
                                <td>{step.action}</td>
                                <td>
                                    <span className={`automation-type-badge ${getAutomationTypeClass(step.automationType)}`}>
                                        {step.automationType}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ))}
    </div>
  );

  const hasContent = automationMap || isGenerating;

  return (
    <div className="map-processes-container">
      {hasContent && (
        <TaskResultHeader title="Process Automation Map" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : automationMap ? renderResults() : (
        <InitialTaskView
          title="Map Business Processes for Automation"
          description="Identify key business and technical workflows and let AI suggest opportunities for automation to improve efficiency."
          buttonText="Generate Process Map"
          onAction={handleGenerate}
          disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default MapProcesses;
