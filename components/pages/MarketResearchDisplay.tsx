import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import ReactMarkdown from 'react-markdown';
import './MarketResearchDisplay.css';

interface Source {
    title: string;
    url: string;
}

interface MarketResearchData {
    summary: string;
    sources: Source[];
}

interface MarketResearchDisplayProps {
  startup: {
    _id: Id<"startups">;
    idea?: string | undefined;
    name?: string | undefined;
    marketResearch?: string | undefined;
  };
}

const cleanText = (text: string) => {
    return text ? String(text).replace(/\*/g, '') : '';
};

export const MarketResearchDisplay: React.FC<MarketResearchDisplayProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketResearchData, setMarketResearchData] = useState<MarketResearchData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generateMarketResearch = useAction(api.actions.generateMarketResearch);

  useEffect(() => {
    if (startup.marketResearch) {
      try {
        setMarketResearchData(JSON.parse(startup.marketResearch));
      } catch (e) {
        console.error("Failed to parse market research data:", e);
        setError("Failed to load existing market research data.");
      }
    }
  }, [startup.marketResearch]);

  const handleGenerate = async () => {
    if (!startup.idea) {
      setError("Initial idea is missing.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateMarketResearch({
        startupId: startup._id,
        idea: startup.idea,
      });
      setMarketResearchData(result);
    } catch (err: any) {
      setError("Failed to generate market research. Please try again.");
      console.error("Error generating market research:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="spinner"></div>
        <p className="mt-6 text-xl font-semibold animate-pulse">
          AI is performing a deep dive market analysis...
        </p>
      </div>
    );
  }

  if (!marketResearchData) {
    return (
      <div className="text-center p-12">
        <h3 className="text-3xl font-bold mb-4">Generate Market Analysis</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
          Let our AI scrape the web and generate a detailed market analysis for your startup idea.
        </p>
        <button onClick={handleGenerate} className="cta-button">
          Generate Market Analysis
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  const { summary, sources } = marketResearchData;
  const topic = startup.name || '';

  return (
    <div className="market-research-container">
        <div className="mr-header">
            <h2 className="mr-title">AI-Powered Market Analysis</h2>
            <p className="mr-topic">Topic: {topic}</p>
        </div>

        <div className="mr-summary">
            <ReactMarkdown
                components={{
                    h1: ({node, ...props}) => <h3 className="md-h3" {...props} />,
                    h2: ({node, ...props}) => <h4 className="md-h4" {...props} />,
                    h3: ({node, ...props}) => <h5 className="md-h5" {...props} />,
                    p: ({node, ...props}) => <p className="md-p" {...props} />,
                    ul: ({node, ...props}) => <ul className="md-ul" {...props} />,
                    li: ({node, ...props}) => <li className="md-li" {...props} />,
                    strong: ({node, ...props}) => <strong className="md-strong" {...props} />,
                }}
            >
                {cleanText(summary)}
            </ReactMarkdown>
        </div>

        {sources && sources.length > 0 && (
            <div className="mr-sources">
                <h3 className="mr-sources-title">Sources</h3>
                <ul className="mr-sources-list">
                    {sources.map((source, index) => (
                        <li key={index}>
                            <a href={source.url} target="_blank" rel="noopener noreferrer">
                                {source.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );
};
