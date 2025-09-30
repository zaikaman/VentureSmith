import React, { useState, useEffect } from 'react';
import './IdentifyGrowthMetrics.css';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';

const loadingTexts = [
  "Analyzing market trends for growth opportunities...",
  "Identifying Key Performance Indicators (KPIs)...",
  "Correlating business goals with measurable metrics...",
  "Building a framework for data-driven decisions...",
  "Finalizing your custom growth metric dashboard..."
];

const LoadingAnimation = () => {
  const [currentText, setCurrentText] = useState(loadingTexts[0]);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % loadingTexts.length;
      setCurrentText(loadingTexts[index]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="loading-container"> 
      <div className="typewriter-animation-container">
        <svg className="radar-container" viewBox="0 0 200 200" style={{ position: 'absolute' }}>
          <circle className="radar-grid" cx="100" cy="100" r="40" />
          <circle className="radar-grid" cx="100" cy="100" r="70" />
          <circle className="radar-grid" cx="100" cy="100" r="95" />
          <line className="radar-grid" x1="100" y1="5" x2="100" y2="195" />
          <line className="radar-grid" x1="5" y1="100" x2="195" y2="100" />
          <line className="radar-sweep" x1="100" y1="100" x2="100" y2="5" />
        </svg>
        <div className="radar-icon-group icon-group-1" style={{ top: '25%', left: '70%' }}>
          <div className="radar-icon-glow"></div>
          <i className="fas fa-users radar-icon"></i>
        </div>
        <div className="radar-icon-group icon-group-2" style={{ top: '70%', left: '25%' }}>
          <div className="radar-icon-glow"></div>
          <i className="fas fa-dollar-sign radar-icon"></i>
        </div>
        <div className="radar-icon-group icon-group-3" style={{ top: '20%', left: '30%' }}>
          <div className="radar-icon-glow"></div>
          <i className="fas fa-rocket radar-icon"></i>
        </div>
      </div>
      <div className="mobile-spinner"></div>
      <div className="loading-status-text">{currentText}</div>
    </div>
  );
};

interface IdentifyGrowthMetricsProps {
  startup: any;
  startupId: Id<"startups">;
}

const IdentifyGrowthMetrics: React.FC<IdentifyGrowthMetricsProps> = ({ startup, startupId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const generateTaskResult = useAction(api.actions.generateTaskResult);

  const metricsResult = startup?.growthMetrics ? JSON.parse(startup.growthMetrics) : null;

  const handleGenerateMetrics = async (force: boolean = false) => {
    setIsGenerating(true);
    try {
      const result = await generateTaskResult({ startupId, taskId: 'growthMetrics', force });
      if (result && !result.success) {
        if (result.message !== "Task already completed.") {
          toast.error(result.message || "An unknown error occurred during generation.");
        }
      }
    } catch (error: any) {
      console.error("Failed to generate growth metrics:", error);
      toast.error(error.message || "Failed to initiate generation.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleStart = () => {
    handleGenerateMetrics(false);
  };

  const handleRegenerate = () => {
    handleGenerateMetrics(true);
  };

  const renderResults = (data: any) => (
    <>
      <p className="growth-metrics-intro">{data.introduction}</p>
      <div className="accordion">
        {data?.metrics?.map((metric: any, index: number) => (
          <div key={index} className="accordion-item">
            <button 
              className="accordion-header" 
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            >
              <i className={`${metric.icon} metric-icon`} style={{ color: metric.color }}></i>
              <h3>{metric.category}</h3>
              <span className={`accordion-chevron ${activeIndex === index ? 'expanded' : ''}`}>
                <i className="fas fa-chevron-down"></i>
              </span>
            </button>
            {activeIndex === index && (
              <div className="accordion-content">
                <p className="metric-card-description">{metric.description}</p>
                <ul className="metric-points">
                  {metric.points.map((point: any, pIndex: number) => (
                    <li key={pIndex}>
                      <strong>{point.name}:</strong> {point.detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  const hasContent = !!metricsResult || isGenerating;

  return (
    <div className="growth-metrics-container">
      {hasContent && (
              <TaskResultHeader
                title="Identify Growth Metrics"
                onRegenerate={handleRegenerate}
              />      )}
      <div className="growth-metrics-content">
        {isGenerating 
          ? <LoadingAnimation /> 
          : metricsResult 
            ? renderResults(metricsResult) 
            : <InitialTaskView
                title="Identify Growth Metrics"
                description="Let our AI analyze your business idea to identify and suggest the most important Key Performance Indicators (KPIs) to track for sustainable growth. Make data-driven decisions from day one."
                buttonText="Generate Growth Metrics"
                onAction={handleStart}
                disabled={isGenerating}
              />
        }
      </div>
    </div>
  );
};

export default IdentifyGrowthMetrics;
