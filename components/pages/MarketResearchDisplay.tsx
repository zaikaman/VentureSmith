import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './MarketResearchDisplay.css';

// --- INTERFACES & PROPS ---
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
    name?: string | undefined;
    marketResearch?: string | undefined;
    brainstormResult?: string | undefined; // For input
  };
}

// --- MAIN COMPONENT ---
export const MarketResearchDisplay: React.FC<MarketResearchDisplayProps> = ({ startup }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<MarketResearchData | null>(null);
  const generateMarketResearch = useAction(api.actions.generateMarketResearch);

  const canScan = !!startup.brainstormResult;

  useEffect(() => {
    if (startup.marketResearch) {
      setResult(JSON.parse(startup.marketResearch));
    }
  }, [startup.marketResearch]);

  const handleScan = async () => {
    if (!canScan) { toast.error("Brainstorm step must be completed first."); return; }
    setIsScanning(true);
    setResult(null);

    try {
      // Firecrawl can be slow, so we give it a long animation time
      const scanResult = await generateMarketResearch({ startupId: startup._id });
      setTimeout(() => {
        setResult(scanResult);
        setIsScanning(false);
      }, 6000); // Long animation for a long process
    } catch (err: any) {
      toast.error("Failed to perform deep scan. Please try again.");
      setIsScanning(false);
    }
  };

  if (isScanning) {
    return (
        <div className="data-stream-container">
            {[...Array(50)].map((_, i) => <div key={i} className="stream-line" style={{ '--index': i } as React.CSSProperties}></div>)}
            <div className="stream-core"></div>
            <div className="stream-status-text">PERFORMING DEEP WEB ANALYSIS...</div>
        </div>
    );
  }

  if (result) {
    return (
            <div className="dossier-container">
                <TaskResultHeader title="Market Research Dossier" onRegenerate={handleScan} />
                <div className="dossier-content">
                    <ReactMarkdown components={{
                        h1: ({node, ...props}) => <h3 className="md-h3" {...props} />,
                        h2: ({node, ...props}) => <h4 className="md-h4" {...props} />,
                        h3: ({node, ...props}) => <h5 className="md-h5" {...props} />,
                        p: ({node, ...props}) => <p className="md-p" {...props} />,
                        ul: ({node, ...props}) => <ul className="md-ul" {...props} />,
                        li: ({node, ...props}) => <li className="md-li" {...props} />,
                        strong: ({node, ...props}) => <strong className="md-strong" {...props} />,
                    }}>
                        {result.summary}
                    </ReactMarkdown>
                </div>
                {result.sources && result.sources.length > 0 && (
                    <div className="dossier-sources">
                        <h3>Sources</h3>
                        <ul>{result.sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul>
                    </div>
                )}
            </div>
    );
  }

  return (
    <InitialTaskView
        title="Deep Dive Market Analysis"
        description="Initiate a deep scan of the web. Our AI will scrape and analyze relevant articles, forums, and competitor sites to generate a detailed market analysis."
        buttonText="Initiate Deep Scan"
        onAction={handleScan}
        disabled={!canScan}
    />
  );
};