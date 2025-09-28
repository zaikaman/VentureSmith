import React, { useState, useEffect } from 'react';
import './IdentifyGrowthMetrics.css';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import { SmallSpinner } from './SmallSpinner';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Mock data representing the AI-generated growth metrics
const mockMetrics = {
  title: "Key Growth Metrics for Your Business",
  introduction: "Based on your business idea, here are the key growth metrics to track. Focusing on these KPIs will help you measure progress and make data-driven decisions.",
  metrics: [
    {
      category: "Acquisition",
      icon: "fas fa-users",
      color: "#3498db",
      description: "How users find you.",
      points: [
        { name: "Website Traffic", detail: "Total number of visitors to your website." },
        { name: "Sign-up Rate", detail: "Percentage of visitors who create an account." },
        { name: "Customer Acquisition Cost (CAC)", detail: "The cost to acquire one new customer." }
      ]
    },
    {
      category: "Activation",
      icon: "fas fa-rocket",
      color: "#2ecc71",
      description: "When users experience the value.",
      points: [
        { name: "'Aha!' Moment Completion Rate", detail: "Percentage of users who complete a key action that demonstrates your product's value." },
        { name: "Feature Adoption Rate", detail: "Percentage of users who use a key feature for the first time." }
      ]
    },
    {
      category: "Retention",
      icon: "fas fa-sync-alt",
      color: "#f1c40f",
      description: "How many users you keep.",
      points: [
        { name: "Daily/Monthly Active Users (DAU/MAU)", detail: "The number of unique users who engage with your product in a day or month." },
        { name: "Churn Rate", detail: "The percentage of customers who stop using your product over a given period." }
      ]
    },
    {
      category: "Revenue",
      icon: "fas fa-dollar-sign",
      color: "#e74c3c",
      description: "How you make money.",
      points: [
        { name: "Monthly Recurring Revenue (MRR)", detail: "The predictable revenue a company can expect to receive every month." },
        { name: "Lifetime Value (LTV)", detail: "The total revenue a business can reasonably expect from a single customer account." }
      ]
    },
    {
      category: "Referral",
      icon: "fas fa-bullhorn",
      color: "#9b59b6",
      description: "How users spread the word.",
      points: [
        { name: "Net Promoter Score (NPS)", detail: "A measure of customer loyalty and satisfaction." },
        { name: "Viral Coefficient", detail: "The number of new users an existing user generates." }
      ]
    }
  ]
};

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

  // This structure now mimics DraftPressRelease.tsx exactly.
  return (
    <div className="loading-container"> 
      <div className="typewriter-animation-container">
        {/* Layer 1: The SVG Radar Grid and Sweep */}
        <svg className="radar-container" viewBox="0 0 200 200" style={{ position: 'absolute' }}>
          <circle className="radar-grid" cx="100" cy="100" r="40" />
          <circle className="radar-grid" cx="100" cy="100" r="70" />
          <circle className="radar-grid" cx="100" cy="100" r="95" />
          <line className="radar-grid" x1="100" y1="5" x2="100" y2="195" />
          <line className="radar-grid" x1="5" y1="100" x2="195" y2="100" />
          <line className="radar-sweep" x1="100" y1="100" x2="100" y2="5" />
        </svg>

        {/* Layer 2: The HTML Icons, positioned on top */}
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
      <div className="loading-status-text">{currentText}</div>
    </div>
  );
};

interface IdentifyGrowthMetricsProps {
  startup: any;
  startupId: Id<"startups">;
}

const IdentifyGrowthMetrics: React.FC<IdentifyGrowthMetricsProps> = ({ startup, startupId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const updateGrowthMetrics = useMutation(api.startups.updateGrowthMetrics);

  const metricsResult = startup?.growthMetrics ? JSON.parse(startup.growthMetrics) : null;

  const handleGenerateMetrics = async () => {
    setIsLoading(true);
    setIsGenerating(true);

    await new Promise(resolve => setTimeout(resolve, 12000));

    await updateGrowthMetrics({
      startupId,
      growthMetrics: JSON.stringify(mockMetrics),
    });

    setIsLoading(false);
    setIsGenerating(false);
  };
  
  const handleStart = () => {
    handleGenerateMetrics();
  };

  const handleRegenerate = () => {
    handleGenerateMetrics();
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (!metricsResult) {
    return (
      <div className="initial-task-wrapper">
        <i className="fas fa-chart-line initial-task-icon-large"></i>
        <InitialTaskView
          title="Identify Growth Metrics"
          description="Let our AI analyze your business idea to identify and suggest the most important Key Performance Indicators (KPIs) to track for sustainable growth. Make data-driven decisions from day one."
          buttonText="Generate Growth Metrics"
          onAction={handleStart}
          disabled={isGenerating}
        />
      </div>
    );
  }

  return (
    <div className="growth-metrics-container">
      <TaskResultHeader
        title="Identify Growth Metrics"
        onRegenerate={handleRegenerate}
        isLoading={isGenerating}
      />
      <div className="growth-metrics-content">
        <p className="growth-metrics-intro">{metricsResult.introduction}</p>
        <div className="accordion">
          {metricsResult.metrics.map((metric: any, index: number) => (
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
      </div>
    </div>
  );
};

export default IdentifyGrowthMetrics;
