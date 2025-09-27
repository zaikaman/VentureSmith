
import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import './GenerateApiEndpoints.css';

interface GenerateApiEndpointsProps {
  startup: {
    _id: Id<"startups">;
    apiEndpoints?: string;
    brainstormResult?: string;
    userFlowDiagram?: string;
    databaseSchema?: string;
  };
}

const GenerateApiEndpoints: React.FC<GenerateApiEndpointsProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiResult, setApiResult] = useState(startup.apiEndpoints || '');

  const generateApiEndpointsAction = useAction(api.actions.generateApiEndpoints);

  const loadingTexts = [
    "Analyzing application context...",
    "Mapping user flows to resources...",
    "Defining RESTful endpoints...",
    "Structuring API paths and methods...",
    "Finalizing endpoint descriptions...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.brainstormResult && !!startup.userFlowDiagram && !!startup.databaseSchema;

  useEffect(() => {
    setApiResult(startup.apiEndpoints || '');
  }, [startup.apiEndpoints]);

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
      toast.error("Please complete 'Brainstorm', 'User Flow', and 'Database Schema' steps first.");
      return;
    }
    setIsGenerating(true);
    setApiResult('');
    try {
      const result = await generateApiEndpointsAction({ startupId: startup._id });
      setApiResult(result);
      toast.success("API Endpoints generated successfully!");
    } catch (err: any) {
      console.error("API Endpoints generation failed:", err);
      toast.error("Failed to generate API Endpoints", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="flow-animation-container">
        <div className="flow-gateway"></div>
        <div className="flow-packet packet-1"></div>
        <div className="flow-packet packet-2"></div>
        <div className="flow-packet packet-3"></div>
        <div className="flow-packet packet-4"></div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => (
    <div className="api-results-container">
        <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
                h3: ({node, ...props}) => <h3 style={{color: '#c4b5fd', borderBottom: '1px solid #334155', paddingBottom: '0.5rem'}} {...props} />,
                table: ({node, ...props}) => <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '2rem'}} {...props} />,
                th: ({node, ...props}) => <th style={{backgroundColor: '#1e293b', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.875rem', padding: '0.75rem 1rem'}} {...props} />,
                td: ({node, ...props}) => <td style={{borderBottom: '1px solid #1e293b', padding: '0.75rem 1rem'}} {...props} />,
                code: ({node, ...props}) => <code style={{backgroundColor: '#1e293b', padding: '0.2rem 0.4rem', borderRadius: '0.25rem'}} {...props} />
            }}
        >
            {apiResult}
        </ReactMarkdown>
    </div>
  );

  const renderInitial = () => (
    <div className="initial-view">
        <h3 className="text-3xl font-bold mb-4 text-white">Generate RESTful API Endpoints</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Automatically design a complete set of RESTful API endpoints based on your application's logic, user flows, and database schema.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={!canGenerate}
        >
            Generate API Endpoints
        </button>
        {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete the 'Brainstorm', 'User Flow', and 'Database Schema' steps first.</p>}
    </div>
  );

  const hasContent = apiResult || isGenerating;

  return (
    <div className="api-endpoints-container">
      {hasContent && (
        <div className="header-section">
            <h2 className="text-3xl font-bold">API Endpoints</h2>
            {apiResult && !isGenerating && (
                <div className="header-actions">
                    <button onClick={handleGenerate} className="regenerate-button" title="Regenerate API Endpoints">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>Regenerate</span>
                    </button>
                </div>
            )}
        </div>
      )}

      {isGenerating ? renderLoading() : apiResult ? renderResults() : renderInitial()}
    </div>
  );
};

export default GenerateApiEndpoints;
