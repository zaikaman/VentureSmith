
import React from 'react';

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
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-block bg-[var(--bg-slate-700)] text-[var(--accent-color)] text-sm font-medium px-3 py-2 rounded-full hover:bg-[var(--bg-slate-600)] transition-colors duration-200"
    >
        {children}
    </a>
);

const ResultCard: React.FC<{ item: SearchResultItem }> = ({ item }) => (
    <div className="bg-[var(--bg-slate-800)]/60 p-4 rounded-lg border border-[var(--border-slate-700)] hover:border-[var(--accent-color)] transition-all duration-200">
        <h4 className="font-bold text-md text-[var(--primary-color)] mb-2">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.title}
            </a>
        </h4>
        <p className="text-sm text-[var(--text-slate-300)] leading-relaxed">{item.description}</p>
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
        <div className="space-y-12 animate-fade-in-up">
            <div className="bg-[var(--bg-slate-900)]/50 p-6 rounded-lg border border-[var(--border-slate-700)]">
                <h3 className="text-xl font-bold text-[var(--primary-color)] mb-4">Market Landscape</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {landscape.map((item) => <ResultCard key={item.position} item={item} />)}
                </div>
            </div>

            <div className="bg-[var(--bg-slate-900)]/50 p-6 rounded-lg border border-[var(--border-slate-700)]">
                <h3 className="text-xl font-bold text-[var(--primary-color)] mb-4">Potential Competitors</h3>
                <div className="flex flex-wrap gap-3">
                    {competitors.map((item) => <Chip key={item.position} href={item.url}>{item.title}</Chip>)}
                </div>
            </div>

            <div className="bg-[var(--bg-slate-900)]/50 p-6 rounded-lg border border-[var(--border-slate-700)]">
                <h3 className="text-xl font-bold text-[var(--primary-color)] mb-4">Key Trends</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {trends.map((item) => <ResultCard key={item.position} item={item} />)}
                </div>
            </div>
        </div>
    );
};
