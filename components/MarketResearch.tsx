
import React from 'react';
import { MarketResearchData } from '../types';

interface MarketResearchProps {
    data: MarketResearchData;
}

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-slate-700 text-sky-300 text-sm font-medium px-3 py-1 rounded-full">
        {children}
    </span>
);

export const MarketResearch: React.FC<MarketResearchProps> = ({ data }) => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Market Research Summary</h2>
            <div className="space-y-8">
                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-indigo-400 mb-3">Market Landscape</h3>
                    <p className="text-slate-300 leading-relaxed">{data.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-xl font-bold text-indigo-400 mb-4">Potential Competitors</h3>
                        <div className="flex flex-wrap gap-3">
                            {data.competitors.map((competitor, index) => (
                                <Chip key={index}>{competitor}</Chip>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-xl font-bold text-indigo-400 mb-4">Key Trends</h3>
                        <div className="flex flex-wrap gap-3">
                            {data.trends.map((trend, index) => (
                                <Chip key={index}>{trend}</Chip>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
