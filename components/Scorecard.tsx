import React from 'react';
import { ScorecardData } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ScorecardProps {
    data: ScorecardData;
}

const ChartCard: React.FC<{ data: ScorecardData }> = ({ data }) => {
    const chartData = [
        { subject: 'Market Size', A: data.marketSize.score, fullMark: 100 },
        { subject: 'Feasibility', A: data.feasibility.score, fullMark: 100 },
        { subject: 'Innovation', A: data.innovation.score, fullMark: 100 },
    ];

    return (
        <div className="w-full h-80">
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 14, fontFamily: 'Poppins' }} />
                    <Radar name="Score" dataKey="A" stroke="#818cf8" fill="#6366f1" fillOpacity={0.6} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontFamily: 'Poppins', borderRadius: '0.75rem' }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

const ScoreInfoCard: React.FC<{ title: string; score: number; justification: string }> = ({ title, score, justification }) => (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 p-5 rounded-xl border border-gray-800/80">
        <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <span className="font-bold text-xl text-indigo-400">{score}/100</span>
        </div>
        <p className="text-sm text-gray-400">{justification}</p>
    </div>
);


export const Scorecard: React.FC<ScorecardProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-300 mb-4 text-center">Overall Startup Score</h2>
                <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-gray-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle
                            className="text-indigo-500"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - data.overallScore / 100)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        />
                    </svg>
                    <span className="text-5xl font-extrabold text-white">{data.overallScore}</span>
                </div>
                 <div className="w-full max-w-sm">
                    <ChartCard data={data} />
                 </div>
            </div>
            <div className="lg:col-span-3 space-y-4">
                <ScoreInfoCard title="Market Size" score={data.marketSize.score} justification={data.marketSize.justification} />
                <ScoreInfoCard title="Feasibility" score={data.feasibility.score} justification={data.feasibility.justification} />
                <ScoreInfoCard title="Innovation" score={data.innovation.score} justification={data.innovation.justification} />
            </div>
        </div>
    );
};