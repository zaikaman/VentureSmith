import React, { useState, useEffect, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import ReactFlow, { useNodesState, useEdgesState, Background, Controls, MiniMap, Edge, Node } from 'reactflow';

import 'reactflow/dist/style.css';
import './GenerateDatabaseSchema.css';

interface GenerateDatabaseSchemaProps {
  startup: {
    _id: Id<"startups">;
    databaseSchema?: string;
    brainstormResult?: string;
    userFlowDiagram?: string;
    name?: string;
  };
}

const nodeStyle = {
  border: '1px solid #6366f1',
  background: '#1e293b',
  color: '#e2e8f0',
  borderRadius: '8px',
  padding: '10px',
  fontFamily: 'monospace',
  fontSize: '12px',
  width: 'auto',
};

const GenerateDatabaseSchema: React.FC<GenerateDatabaseSchemaProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const generateSchemaAction = useAction(api.actions.createDatabaseSchema);

  const loadingTexts = [
    "Analyzing business logic...",
    "Defining entities and relationships...",
    "Constructing node-based schema...",
    "Laying out tables...",
    "Finalizing connections...",
  ];
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  const canGenerate = !!startup.brainstormResult && !!startup.userFlowDiagram;

  // Effect to parse the schema from the startup prop
  useEffect(() => {
    if (startup.databaseSchema) {
      try {
        const diagramData = JSON.parse(startup.databaseSchema);
        // Apply custom styling to each node
        const styledNodes = diagramData.nodes.map((node: Node) => ({
          ...node,
          style: nodeStyle,
          data: { ...node.data, label: <pre>{node.data.label}</pre> }
        }));
        setNodes(styledNodes || []);
        setEdges(diagramData.edges || []);
      } catch (e) {
        console.error("Failed to parse database schema data:", e);
        toast.error("Failed to load existing schema.");
      }
    }
  }, [startup.databaseSchema, setNodes, setEdges]);

  // Effect for loading text animation
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
      toast.error("Please complete 'Brainstorm' and 'User Flow' steps first.");
      return;
    }
    setIsGenerating(true);
    setNodes([]);
    setEdges([]);
    try {
      const [schemaResult, _] = await Promise.all([
        generateSchemaAction({ startupId: startup._id }),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);
      
      if (schemaResult) {
        // The result is already a JSON object from the action
        const styledNodes = schemaResult.nodes.map((node: Node) => ({
          ...node,
          style: nodeStyle,
          data: { ...node.data, label: <pre>{node.data.label}</pre> }
        }));
        setNodes(styledNodes);
        setEdges(schemaResult.edges);
        toast.success("Database Schema generated successfully!");
      } else {
        throw new Error("Received an empty response from the server.");
      }
    } catch (err: any) {
      console.error("Schema generation failed:", err);
      toast.error("Failed to generate Database Schema", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (reactFlowWrapper.current) {
      toPng(reactFlowWrapper.current, { cacheBust: true, backgroundColor: '#0f172a' })
        .then((dataUrl) => {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `${startup.name?.replace(/ /g, '_') || 'database-schema'}.png`;
          a.click();
        })
        .catch((err) => {
          console.error("Export failed:", err);
          toast.error("Failed to export diagram.");
        });
    } else {
        toast.warning("There is no diagram to export.");
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="db-animation-container">
        <div className="db-core"></div>
        <svg width="100%" height="100%" viewBox="0 0 250 200" preserveAspectRatio="none">
            <path d="M 125,100 C 80,60 40,70 30,40" className="db-path path-1" />
            <path d="M 125,100 C 170,60 210,70 220,40" className="db-path path-2" />
            <path d="M 125,100 C 80,140 70,170 70,180" className="db-path path-3" />
            <path d="M 125,100 C 170,140 180,170 180,180" className="db-path path-4" />
        </svg>
        <div className="db-table table-1">
            <div className="db-table-col"></div><div className="db-table-col"></div><div className="db-table-col"></div>
        </div>
        <div className="db-table table-2">
            <div className="db-table-col"></div><div className="db-table-col"></div>
        </div>
        <div className="db-table table-3">
            <div className="db-table-col"></div><div className="db-table-col"></div><div className="db-table-col"></div>
        </div>
        <div className="db-table table-4">
            <div className="db-table-col"></div><div className="db-table-col"></div>
        </div>
      </div>
      <div className="loading-status-text">{currentLoadingText}</div>
    </div>
  );

  const renderResults = () => (
    <div className="db-schema-results-container" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
    </div>
  );

  const renderInitial = () => (
    <div className="initial-view">
        <h3 className="text-3xl font-bold mb-4 text-white">Generate Interactive Database Schema</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
            Automatically design an interactive, draggable database schema based on your application's features and user flows.
        </p>
        <button
            onClick={handleGenerate}
            className="cta-button"
            disabled={!canGenerate}
        >
            Generate Schema
        </button>
        {!canGenerate && <p className="text-sm text-slate-500 mt-4">Please complete the 'Brainstorm & Refine Idea' and 'User Flow Diagram' steps first.</p>}
    </div>
  );

  const hasContent = nodes.length > 0 || isGenerating;

  return (
    <div className="database-schema-container">
      {hasContent && (
        <div className="header-section">
            <h2 className="text-3xl font-bold">Database Schema (ERD)</h2>
            {nodes.length > 0 && !isGenerating && (
                <div className="header-actions">
                    <button onClick={handleGenerate} className="regenerate-button" title="Regenerate Schema">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>Regenerate</span>
                    </button>
                    <button onClick={handleExport} className="regenerate-button" title="Export to PNG">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 4.5a.75.75 0 01.75.75v5.518l2.28-2.28a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L5.47 9.048a.75.75 0 111.06-1.06l2.22 2.22V5.25A.75.75 0 0110 4.5z"/><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/></svg>
                        <span>Export</span>
                    </button>
                </div>
            )}
        </div>
      )}

      {isGenerating ? renderLoading() : nodes.length > 0 ? renderResults() : renderInitial()}
    </div>
  );
};

export default GenerateDatabaseSchema;