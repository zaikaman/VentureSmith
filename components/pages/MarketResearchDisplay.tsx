
import React from 'react';
import './MarketResearchDisplay.css';

// This type will be moved to a more central location or imported, but defined here for clarity
type SearchResultItem = {
    url: string;
    title: string;
    description: string;
    position: number;
};

interface MarketResearchDisplayProps {
    isLoading: boolean;
    error: string | null;
    landscape: SearchResultItem[];
    competitors: SearchResultItem[];
    trends: SearchResultItem[];
    topic: string;
}

const Chip: React.FC<{ children: React.ReactNode; href: string }> = ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="competitor-chip">
        {children}
    </a>
);

const ResultCard: React.FC<{ item: SearchResultItem }> = ({ item }) => (
    <div className="result-card">
        <h4 className="result-card-title">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
            </a>
        </h4>
        <p className="result-card-description">{item.description}</p>
    </div>
);

export const MarketResearchDisplay: React.FC<MarketResearchDisplayProps> = ({ isLoading, error, landscape, competitors, trends, topic }) => {
    if (isLoading) {
        return <div className="text-center p-10">Loading market research for "{topic}"...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    return (
        <div className="market-research-container">
            <div className="mr-section">
                <h3 className="mr-section-title">Market Landscape</h3>
                <div className="mr-grid">
                    {landscape.map((item) => <ResultCard key={item.position} item={item} />)}
                </div>
            </div>

            <div className="mr-section">
                <h3 className="mr-section-title">Potential Competitors</h3>
                <div className="competitor-chips">
                    {competitors.map((item) => <Chip key={item.position} href={item.url}>{item.title}</Chip>)}
                </div>
            </div>

            <div className="mr-section">
                <h3 className="mr-section-title">Key Trends</h3>
                <div className="mr-grid">
                     {trends.map((item) => <ResultCard key={item.position} item={item} />)}
                </div>
            </div>
        </div>
    );
};
