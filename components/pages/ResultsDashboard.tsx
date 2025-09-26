
import React, { useState } from 'react';
import { StartupData } from '../../types';
import { Scorecard } from './Scorecard';
import { BusinessPlan } from './BusinessPlan';
import { WebsitePrototype } from './WebsitePrototype';
import { PitchDeck } from './PitchDeck';
import { MarketResearchDisplay } from './MarketResearchDisplay';
import { MentorFeedbackDisplay } from './MentorFeedbackDisplay';
import './ResultsDashboard.css';

// Define types here for clarity
type SearchResultItem = {
    url: string;
    title: string;
    description: string;
    position: number;
};

interface MarketResearchProps {
    landscape: SearchResultItem[];
    competitors: SearchResultItem[];
    trends: SearchResultItem[];
}

interface ResultsDashboardProps {
    data: StartupData;
    idea: string;
    marketResearch: MarketResearchProps;
    onReset: () => void;
    mentorFeedback: string | null;
    isMentorLoading: boolean;
    onGetMentorFeedback: () => void;
}

type Tab = 'Dashboard' | 'Business Plan' | 'Website' | 'Pitch Deck' | 'Market Research' | 'AI Mentor';

const icons: Record<Tab, JSX.Element> = {
    Dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    'Business Plan': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
    Website: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0h10v8H5V5z" clipRule="evenodd" /><path d="M5 3a1 1 0 000 2h10a1 1 0 100-2H5z" /></svg>,
    'Pitch Deck': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V5.5a1 1 0 00-1.555-.832L4.555 5.168zM15.445 5.168A1 1 0 0014 6v8a1 1 0 001.555.832L20 11.202V5.5a1 1 0 00-1.555-.832l-3.000-1.83z" /></svg>,
    'Market Research': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.414l2.26-2.26A4 4 0 1011 5z" clipRule="evenodd" /></svg>,
    'AI Mentor': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a.5.5 0 01.5.5v2.222l1.803.901a.5.5 0 01.22.67L11.5 9.472V13.5a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5V9.472L7.477 7.793a.5.5 0 01.22-.67L9.5 6.222V4a.5.5 0 01.5-.5zM5.5 13a.5.5 0 000 1h9a.5.5 0 000-1h-9z" /><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" /></svg>,
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
    data,
    idea,
    marketResearch,
    onReset,
    mentorFeedback,
    isMentorLoading,
    onGetMentorFeedback
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return <Scorecard data={data.scorecard} />;
            case 'Business Plan':
                return <BusinessPlan data={data.businessPlan} idea={idea} />;
            case 'Website':
                return <WebsitePrototype data={data.websitePrototype} idea={idea} />;
            case 'Pitch Deck':
                return <PitchDeck data={data.pitchDeck} />;
            case 'Market Research':
                return <MarketResearchDisplay 
                    isLoading={false}
                    error={null}
                    landscape={marketResearch.landscape}
                    competitors={marketResearch.competitors}
                    trends={marketResearch.trends}
                    topic={idea}
                />;
            case 'AI Mentor':
                if (isMentorLoading) {
                    return (
                        <div className="flex flex-col items-center justify-center p-20">
                            <div className="spinner"></div>
                            <p className="mt-6 text-xl font-semibold animate-pulse">Our AI Mentor is analyzing your venture...</p>
                        </div>
                    );
                }
                if (mentorFeedback) {
                    return <MentorFeedbackDisplay feedback={mentorFeedback} />;
                }
                return (
                    <div className="text-center p-12">
                        <h3 className="text-3xl font-bold mb-4">Unlock Expert AI Analysis</h3>
                        <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
                            Let our AI Mentor, modeled after a seasoned venture capitalist, analyze your generated assets. It will provide critical feedback on strengths, weaknesses, and investor questions to help you strengthen your business case.
                        </p>
                        <button
                            onClick={onGetMentorFeedback}
                            className="cta-button"
                        >
                            Analyze & Get Feedback
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const tabs: Tab[] = ['Dashboard', 'Business Plan', 'Website', 'Pitch Deck', 'Market Research', 'AI Mentor'];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">{idea}</h1>
                <button onClick={onReset} className="reset-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span className="button-text">Start Over</span>
                </button>
            </div>
             <div className="tabs-container">
                <nav className="tabs-nav" aria-label="Tabs">
                     {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                        >
                            {icons[tab]} <span className="button-text">{tab}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};
