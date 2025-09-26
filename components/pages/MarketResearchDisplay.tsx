
import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MarketResearchDisplay.css';

interface Source {
    title: string;
    url: string;
}

interface MarketResearchDisplayProps {
    summary: string;
    sources: Source[];
    topic: string;
}

export const MarketResearchDisplay: React.FC<MarketResearchDisplayProps> = ({ summary, sources, topic }) => {
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
                    {summary}
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

