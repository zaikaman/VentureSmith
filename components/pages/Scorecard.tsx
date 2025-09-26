import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ScorecardData } from '../../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './Scorecard.css';

interface ScorecardProps {
  startup: {
    _id: Id<"startups">;
    idea?: string | undefined;
    dashboard?: string | undefined; // This holds the scorecard data
  };
}

const ChartCard: React.FC<{ data: ScorecardData }> = ({ data }) => {
    const chartData = [
        { subject: 'Market Size', A: data.marketSize.score, fullMark: 100 },
        { subject: 'Feasibility', A: data.feasibility.score, fullMark: 100 },
        { subject: 'Innovation', A: data.innovation.score, fullMark: 100 },
    ];

    return (
        <div className="radar-chart-container">
            <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="var(--border-slate-700)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-slate-400)', fontSize: 14 }} />
                    <Radar name="Score" dataKey="A" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.6} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-slate-800)', border: '1px solid var(--border-slate-700)', color: 'var(--text-slate-200)' }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

const ScoreInfoCard: React.FC<{ title: string; score: number; justification: string }> = ({ title, score, justification }) => (
    <div className="score-info-card">
        <div className="score-info-header">
            <h3 className="score-info-title">{title}</h3>
            <span className="score-info-value">{score}/100</span>
        </div>
        <p className="score-info-justification">{justification}</p>
    </div>
);

export const Scorecard: React.FC<ScorecardProps> = ({ startup }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [scorecardData, setScorecardData] = useState<ScorecardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generateScorecard = useAction(api.actions.generateScorecard);

  useEffect(() => {
    if (startup.dashboard) {
      try {
        setScorecardData(JSON.parse(startup.dashboard));
      } catch (e) {
        console.error("Failed to parse scorecard data:", e);
        setError("Failed to load existing scorecard data.");
      }
    }
  }, [startup.dashboard]);

  const handleGenerate = async () => {
    if (!startup.idea) {
      setError("Initial idea is missing.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateScorecard({
        startupId: startup._id,
        idea: startup.idea,
      });
      setScorecardData(result);
    } catch (err: any) {
      setError("Failed to generate scorecard. Please try again.");
      console.error("Error generating scorecard:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="spinner"></div>
        <p className="mt-6 text-xl font-semibold animate-pulse">
          AI is analyzing your idea and generating a scorecard...
        </p>
      </div>
    );
  }

  if (!scorecardData) {
    return (
      <div className="text-center p-12">
        <h3 className="text-3xl font-bold mb-4">Generate Your Startup Scorecard</h3>
        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
          Let our AI analyze your idea's potential based on market size, feasibility, and innovation to give you a comprehensive score.
        </p>
        <button onClick={handleGenerate} className="cta-button">
          Generate Scorecard
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  const data = scorecardData;
  const circumference = 2 * Math.PI * 45;

  return (
    <div className="scorecard-grid">
      <div className="overall-score-container">
        <h2 className="overall-score-title">Overall Startup Score</h2>
        <div className="score-circle-container">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100">
            <circle className="score-circle-bg" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
            <circle
              className="score-circle-fg"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - data.overallScore / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
          </svg>
          <span className="overall-score-text">{data.overallScore}</span>
        </div>
        <ChartCard data={data} />
      </div>
      <div className="score-details-container">
        <ScoreInfoCard title="Market Size" score={data.marketSize.score} justification={data.marketSize.justification} />
        <ScoreInfoCard title="Feasibility" score={data.feasibility.score} justification={data.feasibility.justification} />
        <ScoreInfoCard title="Innovation" score={data.innovation.score} justification={data.innovation.justification} />
      </div>
    </div>
  );
};