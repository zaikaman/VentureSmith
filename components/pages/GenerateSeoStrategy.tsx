import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

import './GenerateSeoStrategy.css';

interface KeywordCluster {
  clusterName: string;
  justification: string;
  keywords: string[];
}

interface ContentPillar {
  pillar: string;
  description: string;
  topics: string[];
}

interface SeoStrategy {
  keywordClusters: KeywordCluster[];
  contentPillars: ContentPillar[];
}

interface GenerateSeoStrategyProps {
  startup: {
    _id: Id<"startups">;
    seoStrategy?: string; // JSON string of SeoStrategy
    brainstormResult?: string;
    marketingCopy?: string;
    customerPersonas?: string;
  };
}

const GenerateSeoStrategy: React.FC<GenerateSeoStrategyProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategy, setStrategy] = useState<SeoStrategy | null>(null);
  const generateStrategyAction = useAction(api.actions.generateSeoStrategy);

  const loadingTexts = [
    "Analyzing your brand's core concepts...",
    "Identifying high-intent keywords...",
    "Clustering keywords by user intent...",
    "Mapping keywords to content pillars...",
    "Building your content authority map...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.brainstormResult && !!startup.marketingCopy && !!startup.customerPersonas;

  useEffect(() => {
    if (startup.seoStrategy) {
      try {
        const parsedStrategy = JSON.parse(startup.seoStrategy);
        setStrategy(parsedStrategy);
      } catch (e) {
        console.error("Failed to parse SEO strategy:", e);
        toast.error("Failed to load existing SEO strategy.");
      }
    }
  }, [startup.seoStrategy]);

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
      toast.error("Please complete 'Brainstorm', 'Marketing Copy', and 'Customer Personas' steps first.");
      return;
    }
    setIsGenerating(true);
    setStrategy(null);
    try {
      const [generatedStrategy, _] = await Promise.all([
        generateStrategyAction({ startupId: startup._id }),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);
      
      if (generatedStrategy) {
        setStrategy(generatedStrategy);
        toast.success("SEO Keyword Strategy generated successfully!");
      } else {
        throw new Error("Received an empty response from the server.");
      }
    } catch (err: any) {
      console.error("SEO strategy generation failed:", err);
      toast.error("Failed to generate SEO Strategy", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="seo-animation-container">
        <div className="seo-graph">
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none" className="graph-glow">
                <path d="M0,140 C50,140 80,80 150,80 S 250,20 300,20" className="graph-line" />
            </svg>
            <div className="keyword-orb"></div>
        </div>
        <div className="keyword-tag tag-1">#startup</div>
        <div className="keyword-tag tag-2">#growth</div>
        <div className="keyword-tag tag-3">#saas</div>
        <div className="keyword-tag tag-4">#innovation</div>
      </div>
      <div className="mobile-spinner"></div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => (
    <div className="seo-results-container">
        {strategy && (
            <>
                <div className="seo-section">
                    <h3>
                        <i className="fas fa-bullseye"></i>
                        Keyword Clusters
                    </h3>
                    {strategy.keywordClusters.map((cluster, index) => (
                        <div key={index} className="keyword-cluster">
                            <h4>{cluster.clusterName}</h4>
                            <p>{cluster.justification}</p>
                            <div className="keywords-list">
                                {cluster.keywords.map((keyword, kIndex) => (
                                    <span key={kIndex} className="keyword-item">{keyword}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="seo-section">
                    <h3>
                        <i className="fas fa-columns"></i>
                        Content Pillars
                    </h3>
                    <div className="content-pillar-grid">
                        {strategy.contentPillars.map((pillar, index) => (
                            <div key={index} className="pillar-card">
                                <h4>{pillar.pillar}</h4>
                                <p>{pillar.description}</p>
                                <ul>
                                    {pillar.topics.map((topic, tIndex) => (
                                        <li key={tIndex}>{topic}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>
  );

  const hasContent = strategy || isGenerating;

  return (
    <div className="seo-strategy-container">
      {hasContent && (
        <TaskResultHeader title="SEO Keyword Strategy" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : strategy ? renderResults() : (
        <InitialTaskView
          title="Generate SEO Keyword Strategy"
          description="Develop a powerful SEO strategy with AI-suggested keyword clusters and content pillars to attract your target audience."
          buttonText="Generate Strategy"
          onAction={handleGenerate}
          disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default GenerateSeoStrategy;
