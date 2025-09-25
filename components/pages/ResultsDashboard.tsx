
import React, { useState } from 'react';
import { StartupData } from '../../types';
import { Scorecard } from './Scorecard';
import { BusinessPlan } from './BusinessPlan';
import { WebsitePrototype } from './WebsitePrototype';
import { PitchDeck } from './PitchDeck';
import { MarketResearchDisplay } from './MarketResearchDisplay';

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
}

type Tab = 'Dashboard' | 'Business Plan' | 'Website' | 'Pitch Deck' | 'Market Research';

const icons: Record<Tab, JSX.Element> = {
    Dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    'Business Plan': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
    Website: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0h10v8H5V5z" clipRule="evenodd" /><path d="M5 3a1 1 0 000 2h10a1 1 0 100-2H5z" /></svg>,
    'Pitch Deck': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V5.5a1 1 0 00-1.555-.832L4.555 5.168zM15.445 5.168A1 1 0 0014 6v8a1 1 0 001.555.832L20 11.202V5.5a1 1 0 00-1.555-.832l-3.000-1.83z" /></svg>,
    'Market Research': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.414l2.26-2.26A4 4 0 1011 5z" clipRule="evenodd" /></svg>,
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data, idea, marketResearch, onReset }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return <Scorecard data={data.scorecard} />;
            case 'Business Plan':
                return <BusinessPlan data={data.businessPlan} />;
            case 'Website':
                return <WebsitePrototype data={data.websitePrototype} idea={idea} />;
            case 'Pitch Deck':
                return <PitchDeck data={data.pitchDeck} />;
            case 'Market Research':
                return <MarketResearchDisplay 
                    isLoading={false} // Data is preloaded, so not loading
                    error={null}      // Data is preloaded, so no error state to manage here
                    landscape={marketResearch.landscape}
                    competitors={marketResearch.competitors}
                    trends={marketResearch.trends}
                    topic={idea}
                />;
            default:
                return null;
        }
    };
    
    const tabs: Tab[] = ['Dashboard', 'Business Plan', 'Website', 'Pitch Deck', 'Market Research'];

    return (
        <div className="w-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[var(--text-color)]">Your Venture Blueprint</h1>
                <button
                    onClick={onReset}
                    className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-colors duration-300 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Start Over
                </button>
            </div>
             <div className="mb-6">
                <div className="border-b border-[var(--border-slate-700)]">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                         {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${activeTab === tab ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-[var(--text-slate-400)] hover:text-[var(--text-slate-200)] hover:border-[var(--border-slate-500)]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                            >
                                {icons[tab]} {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            <div className="bg-[var(--bg-slate-800)]/50 p-4 sm:p-6 md:p-8 rounded-xl border border-[var(--border-slate-700)]/50">
                {renderTabContent()}
            </div>
        </div>
    );
};
