import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader'; // Assuming this component exists and works
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
interface Section {
    title: string;
    content: string;
}

// --- HELPER FUNCTION ---
const parseMarkdownSections = (markdown: string): Section[] => {
    if (!markdown) return [];
    
    const sections = markdown.split(/(?=^##\s)/m);
    const firstSection = sections[0];
    let overviewSection: Section | null = null;

    if (firstSection && !firstSection.startsWith('## ')) {
        const content = firstSection.trim();
        if (content) {
            overviewSection = { title: "Executive Summary", content };
        }
        sections.shift();
    }

    const parsedSections = sections.map(section => {
        const trimmedSection = section.trim();
        if (!trimmedSection) return null;

        const lines = trimmedSection.split('\n');
        const title = lines[0].replace(/^##\s+/, '');
        const content = lines.slice(1).join('\n').trim();
        
        return { title, content };
    }).filter((s): s is Section => s !== null && s.content !== '');

    return overviewSection ? [overviewSection, ...parsedSections] : parsedSections;
};


// --- MAIN COMPONENT ---
export const MarketResearchDisplay: React.FC<MarketResearchDisplayProps> = ({ startup }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<MarketResearchData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const generateMarketResearch = useAction(api.actions.generateMarketResearch);

  const canScan = !!startup.brainstormResult;

  useEffect(() => {
    if (startup.marketResearch) {
        try {
            const parsedData = JSON.parse(startup.marketResearch);
            setResult(parsedData);
            setSections(parseMarkdownSections(parsedData.summary));
        } catch (error) {
            console.error("Failed to parse market research data:", error);
            // Handle corrupted data, maybe show an error or allow regeneration
            setResult(null);
        }
    }
  }, [startup.marketResearch]);

  const handleScan = async () => {
    if (!canScan) { toast.error("Brainstorm step must be completed first."); return; }
    setIsScanning(true);
    setResult(null);
    setSections([]);

    try {
      const scanResult = await generateMarketResearch({ startupId: startup._id });
      // Keep animation for a bit to feel substantial
      setTimeout(() => {
        setResult(scanResult);
        setSections(parseMarkdownSections(scanResult.summary));
        setIsScanning(false);
      }, 6000);
    } catch (err: any) {
      toast.error("Failed to perform deep scan. Please try again.");
      setIsScanning(false);
    }
  };

  return (
    <div>
        {isScanning ? (
            <div className="data-stream-container">
                {[...Array(50)].map((_, i) => <div key={i} className="stream-line" style={{ '--index': i } as React.CSSProperties}></div>)}
                <div className="stream-core"></div>
                <div className="mobile-spinner"></div>
                <div className="stream-status-text">PERFORMING DEEP WEB ANALYSIS...</div>
            </div>
        ) : result ? (
            <div className="dossier-container">
                <TaskResultHeader title="Market Research Dossier" onRegenerate={handleScan} />
                
                <div className="dossier-grid">
                    {sections.map((section, index) => (
                        <div key={index} className="report-card">
                            <div className="report-card-header">
                                <h4>{section.title}</h4>
                            </div>
                            <div className="report-card-content">
                                <ReactMarkdown components={{
                                    h3: ({node, ...props}) => <h3 className="md-h3" {...props} />,
                                    h4: ({node, ...props}) => <h4 className="md-h4" {...props} />,
                                    p: ({node, ...props}) => <p className="md-p" {...props} />,
                                    ul: ({node, ...props}) => <ul className="md-ul" {...props} />,
                                    li: ({node, ...props}) => <li className="md-li" {...props} />,
                                    strong: ({node, ...props}) => <strong className="md-strong" {...props} />,
                                }}>
                                    {section.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>

                {result.sources && result.sources.length > 0 && (
                    <div className="dossier-sources">
                        <h3>Sources & Further Reading</h3>
                        <ul>{result.sources.map((s, i) => (
                            <li key={i}>
                                <a href={s.url} target="_blank" rel="noopener noreferrer" title={s.title}>
                                    {s.title}
                                </a>
                            </li>
                        ))}</ul>
                    </div>
                )}
            </div>
        ) : (
            <InitialTaskView
                title="Deep Dive Market Analysis"
                description="Initiate a deep scan of the web. Our AI will scrape and analyze relevant articles, forums, and competitor sites to generate a detailed market analysis."
                buttonText="Initiate Deep Scan"
                onAction={handleScan}
                disabled={!canScan}
            />
        )}
    </div>
  );
};