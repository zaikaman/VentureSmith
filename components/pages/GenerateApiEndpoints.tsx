
import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

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

  const hasContent = apiResult || isGenerating;

  return (
    <div className="api-endpoints-container">
      {hasContent && (
        <TaskResultHeader title="API Endpoints" onRegenerate={handleGenerate} />
      )}

      {isGenerating ? renderLoading() : apiResult ? renderResults() : (
        <InitialTaskView
            title="Generate RESTful API Endpoints"
            description="Automatically design a complete set of RESTful API endpoints based on your application's logic, user flows, and database schema."
            buttonText="Generate API Endpoints"
            onAction={handleGenerate}
            disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default GenerateApiEndpoints;
