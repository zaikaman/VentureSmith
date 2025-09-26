import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
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
import { MentorFeedbackDisplay } from './MentorFeedbackDisplay';
import { getMentorFeedback } from '../../services/geminiService';
import './VentureWorkspace.css';

export const VentureWorkspace: React.FC = () => {
    const { id } = useParams<{ id: Id<"startups"> }>();
    const { data: session, isPending: isSessionPending } = authClient.useSession();
    const [activeView, setActiveView] = useState<TaskID>('scorecard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
    const [mentorFeedback, setMentorFeedback] = useState<string | null>(null);
    const [isMentorLoading, setIsMentorLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateMentorFeedbackInDB = useMutation(api.startups.updateMentorFeedback);

    const startup = useQuery(
        api.startups.getStartupById, 
        session && id ? { id } : 'skip'
    );

    // Initialize mentorFeedback state when startup data loads
    React.useEffect(() => {
        if (startup?.aiMentor) {
            setMentorFeedback(startup.aiMentor);
        }
    }, [startup]);

    const handleTaskClick = (taskId: TaskID) => {
        setActiveView(taskId);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleGetMentorFeedback = async () => {
        if (!startup) return;

        setIsMentorLoading(true);
        setError(null);
        try {
            const results = {
                name: startup.name || '',
                scorecard: startup.dashboard ? JSON.parse(startup.dashboard) : {},
                businessPlan: startup.businessPlan ? JSON.parse(startup.businessPlan) : {},
                websitePrototype: startup.website ? JSON.parse(startup.website) : {},
                pitchDeck: startup.pitchDeck ? JSON.parse(startup.pitchDeck) : {},
            };
            const marketResearch = startup.marketResearch ? JSON.parse(startup.marketResearch) : {};

            const feedback = await getMentorFeedback(results, marketResearch);
            setMentorFeedback(feedback);

            // Save feedback to the database
            await updateMentorFeedbackInDB({ startupId: startup._id, feedback });
            toast.success("AI Mentor feedback saved!");

        } catch (err: any) {
            console.error("Error getting mentor feedback:", err);
            setError("Failed to get feedback from AI Mentor. Please try again.");
            setMentorFeedback(null);
        } finally {
            setIsMentorLoading(false);
        }
    };

    const renderActiveView = () => {
        if (!startup) return null;

        // Parse the stringified JSON data
        const scorecard = startup.dashboard ? JSON.parse(startup.dashboard) : {};
        const businessPlan = startup.businessPlan ? JSON.parse(startup.businessPlan) : {};
        const pitchDeck = startup.pitchDeck ? JSON.parse(startup.pitchDeck) : {};
        const websitePrototype = startup.website ? JSON.parse(startup.website) : {};
        const marketResearch = startup.marketResearch ? JSON.parse(startup.marketResearch) : { summary: "", sources: [] };

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
                    summary={marketResearch.summary} 
                    sources={marketResearch.sources} 
                    topic={startup.name || ''} 
                />;
            case 'aiMentor':
                if (isMentorLoading) {
                    return (
                        <div className="flex flex-col items-center justify-center p-10 text-center">
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
                            onClick={handleGetMentorFeedback}
                            className="cta-button"
                        >
                            Analyze & Get Feedback
                        </button>
                        {error && <p className="text-red-500 mt-4">{error}</p>}
                    </div>
                );
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

            <button onClick={toggleSidebar} className={`sidebar-toggle-button ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            
            <div className={`workspace-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <aside className={`workspace-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                    <PhaseChecklist startup={startup} onTaskClick={handleTaskClick} activeTask={activeView} mentorFeedback={mentorFeedback} />
                </aside>
                <main className="workspace-content">
                    {renderActiveView()}
                </main>
            </div>
        </div>
    );
};