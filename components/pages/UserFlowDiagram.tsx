import React, { useState, useEffect, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';

import ReactFlow, { useNodesState, useEdgesState, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

import './UserFlowDiagram.css';

interface UserFlowDiagramProps {
  startup: {
    _id: Id<"startups">;
    userFlowDiagram?: string;
    brainstormResult?: string;
    customerPersonas?: string;
    name?: string;
  };
}

const UserFlowDiagram: React.FC<UserFlowDiagramProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const generateDiagram = useAction(api.actions.generateUserFlow);

  const canGenerate = !!startup.brainstormResult && !!startup.customerPersonas;

  useEffect(() => {
    if (startup.userFlowDiagram) {
      try {
        const diagramData = JSON.parse(startup.userFlowDiagram);
        setNodes(diagramData.nodes || []);
        setEdges(diagramData.edges || []);
      } catch (e) {
        console.error("Failed to parse user flow diagram data:", e);
        toast.error("Failed to load existing diagram.");
      }
    }
  }, [startup.userFlowDiagram, setNodes, setEdges]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please complete Brainstorm and Customer Personas steps first.");
      return;
    }
    setIsGenerating(true);
    try {
      const diagramPromise = generateDiagram({ startupId: startup._id });
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));
      await Promise.all([diagramPromise, timeoutPromise]);
      toast.success("User Flow Diagram generated!");
    } catch (err: any) {
      toast.error("Failed to generate diagram", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (reactFlowWrapper.current) {
      toPng(reactFlowWrapper.current, { cacheBust: true })
        .then((dataUrl) => {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `${startup.name?.replace(/ /g, '_') || 'user-flow'}.png`;
          a.click();
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to export diagram.");
        });
    }
  };

  const renderLoading = () => (
    <div className="morph-container">
        <div className="morph-icon user-icon"><i className="fa-solid fa-user"></i></div>
        <div className="morph-icon goal-icon"><i className="fa-solid fa-flag-checkered"></i></div>
        <div className="paths-wrapper">
          {/* SVG paths are drawn on a viewbox and will scale to the container */}
          {/* The coordinates are relative to this viewbox */}
          <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none">
            {/* A complex path with a quadratic curve and a smooth curve */}
            <path d="M 40,150 Q 150,50 250,150 T 360,150" className="animated-path p-1" />
            {/* A simpler quadratic curve */}
            <path d="M 40,150 Q 200,250 360,150" className="animated-path p-2" />
            {/* A cubic bezier curve for a different feel */}
            <path d="M 40,150 C 100,200 300,100 360,150" className="animated-path p-3" />
          </svg>
        </div>
        <div className="morph-status-text">MAPPING USER JOURNEYS...</div>
      </div>
  );

  const renderResults = () => (
    <div className="uf-results-container" ref={reactFlowWrapper}>
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

  const hasContent = nodes.length > 0 || isGenerating;

  return (
    <div className="user-flow-diagram-container">
      {hasContent && (
        <TaskResultHeader title="User Flow Diagram" onRegenerate={handleGenerate}>
            <button onClick={handleExport} className="regenerate-button" title="Export to PNG">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 4.5a.75.75 0 01.75.75v5.518l2.28-2.28a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L5.47 9.048a.75.75 0 111.06-1.06l2.22 2.22V5.25A.75.75 0 0110 4.5z"/><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/></svg>
                <span>Export</span>
            </button>
        </TaskResultHeader>
      )}

      {isGenerating ? renderLoading() : nodes.length > 0 ? renderResults() : (
        <InitialTaskView
            title="Generate User Flow Diagram"
            description="Automatically generate a visual diagram of the primary path a user will take through your application, from discovery to achieving the core value."
            buttonText="Generate Diagram"
            onAction={handleGenerate}
            disabled={!canGenerate}
        />
      )}
    </div>
  );
};

export default UserFlowDiagram;
