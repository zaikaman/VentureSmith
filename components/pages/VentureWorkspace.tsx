import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { authClient } from '../../lib/auth-client';
import { LoadingIndicator } from './LoadingIndicator';
import { PhaseChecklist, TaskID } from './PhaseChecklist';
import { Scorecard } from './Scorecard';
import { BusinessPlan } from './BusinessPlan';
import { PitchDeck } from './PitchDeck';
import { WebsitePrototype } from './WebsitePrototype';
import { MarketResearchDisplay } from './MarketResearchDisplay';
import './VentureWorkspace.css';

export const VentureWorkspace: React.FC = () => {
    const { id } = useParams<{ id: Id<"startups"> }>();
    const { data: session, isPending: isSessionPending } = authClient.useSession();
    const [activeView, setActiveView] = useState<TaskID>('scorecard');

    const startup = useQuery(
        api.startups.getStartupById, 
        session && id ? { id } : 'skip'
    );

    const handleTaskClick = (taskId: TaskID) => {
        setActiveView(taskId);
    };

    const renderActiveView = () => {
        if (!startup) return null;

        // Parse the stringified JSON data
        const scorecard = startup.dashboard ? JSON.parse(startup.dashboard) : {};
        const businessPlan = startup.businessPlan ? JSON.parse(startup.businessPlan) : {};
        const pitchDeck = startup.pitchDeck ? JSON.parse(startup.pitchDeck) : {};
        const websitePrototype = startup.website ? JSON.parse(startup.website) : {};
        const marketResearch = startup.marketResearch ? JSON.parse(startup.marketResearch) : { landscape: [], competitors: [], trends: [] };

        switch (activeView) {
            case 'scorecard':
                return <Scorecard data={scorecard} />;
            case 'businessPlan':
                return <BusinessPlan data={businessPlan} idea={startup.name || ''} />;
            case 'pitchDeck':
                return <PitchDeck data={pitchDeck} />;
            case 'website':
                return <WebsitePrototype data={websitePrototype} idea={startup.name || ''} startupId={startup._id} />;
            case 'marketResearch':
                return <MarketResearchDisplay 
                    isLoading={false} 
                    error={null} 
                    topic={startup.name || ''} 
                    {...marketResearch} 
                />;
            default:
                return <div className="p-4">Select a task to view its content.</div>;
        }
    };

    if (isSessionPending || (session && startup === undefined)) {
        return <LoadingIndicator idea="Loading Venture..." />;
    }

    if (!session) {
        return (
            <div className="venture-workspace-container text-center">
                <h1 className="venture-title">Authentication Required</h1>
                <p>Please sign in to view your venture workspace.</p>
            </div>
        );
    }

    if (startup === null) {
        return (
            <div className="venture-workspace-container text-center">
                <h1 className="venture-title">Venture Not Found</h1>
                <p>The requested startup could not be found or you do not have permission to view it.</p>
            </div>
        );
    }

    return (
        <div className="venture-workspace-container">
            <h1 className="venture-title">{startup.name}</h1>
            <p className="venture-subtitle">This is your dedicated workspace. Follow the steps below to turn your idea into a reality.</p>
            
            <div className="workspace-layout">
                <aside className="workspace-sidebar">
                    <PhaseChecklist startup={startup} onTaskClick={handleTaskClick} activeTask={activeView} />
                </aside>
                <main className="workspace-content">
                    {renderActiveView()}
                </main>
            </div>
        </div>
    );
};