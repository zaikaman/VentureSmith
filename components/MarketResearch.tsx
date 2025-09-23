import React from 'react';
import { MarketResearchData } from '../types';

interface MarketResearchProps {
    data: MarketResearchData;
}

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-gray-700/50 text-sky-300 text-sm font-medium px-4 py-2 rounded-full border border-gray-700">
        {children}
    </span>
);

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-800/50 p-6 rounded-2xl border border-gray-800/80 ${className}`}>
        <h3 className="text-xl font-bold text-indigo-400 mb-4">{title}</h3>
        {children}
    </div>
);

export const MarketResearch: React.FC<MarketResearchProps> = ({ data }) => {
    return (
        <div>
            <h2 className="text-4xl font-extrabold text-white mb-10 text-center">Market Research Summary</h2>
            <div className="space-y-8">
                <Section title="Market Landscape">
                    <p className="text-gray-300 leading-relaxed">{data.summary}</p>
                </Section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Section title="Potential Competitors">
                        <div className="flex flex-wrap gap-3">
                            {data.competitors.map((competitor, index) => (
                                <Chip key={index}>{competitor}</Chip>
                            ))}
                        </div>
                    </Section>
                    <Section title="Key Trends">
                        <div className="flex flex-wrap gap-3">
                            {data.trends.map((trend, index) => (
                                <Chip key={index}>{trend}</Chip>
                            ))}
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};