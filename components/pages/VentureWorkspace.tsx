import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { authClient } from '../../lib/auth-client';
import { toast } from 'sonner';

import { LoadingIndicator } from './LoadingIndicator';
import { HorizontalStepper } from './HorizontalStepper';
import { PhasesOverviewModal } from './PhasesOverviewModal';
import { StartupData, TaskID } from '../../types'; // Import StartupData and TaskID

import { Scorecard } from './Scorecard';
import { BusinessPlan } from './BusinessPlan';
import PitchDeck from './PitchDeck';
import { WebsitePrototype } from './WebsitePrototype';
import { MarketResearchDisplay } from './MarketResearchDisplay';
import { MentorFeedbackDisplay } from './MentorFeedbackDisplay';
import CustomerValidation from './CustomerValidation';
import Placeholder from './Placeholder';
import BrainstormIdea from './BrainstormIdea';

import { getMentorFeedback } from '../../services/geminiService';
import './VentureWorkspace.css';

// Define the shape of a task and phase for clarity
interface Task {
    id: TaskID;
    name: string;
    isCompleted: boolean;
}

interface Phase {
    id: string;
    name: string;
    tasks: Task[];
}

export const VentureWorkspace: React.FC = () => {
    const { id } = useParams<{ id: Id<"startups"> }>();
    const { data: session, isPending: isSessionPending } = authClient.useSession();
    
    const [activeView, setActiveView] = useState<TaskID>('brainstormIdea');
    const [isOverviewModalOpen, setOverviewModalOpen] = useState(false);
    const [mentorFeedback, setMentorFeedback] = useState<string | null>(null);
    const [isMentorLoading, setIsMentorLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateMentorFeedbackInDB = useMutation(api.startups.updateMentorFeedback);

    const startup = useQuery(
        api.startups.getStartupById, 
        session && id ? { id } : 'skip'
    );

    // Explicitly type the phases constant
    const phases: Phase[] = useMemo(() => [
        {
            id: 'phase-1', name: 'Phase 1: Ideation & Discovery',
            tasks: [
                { id: 'brainstormIdea', name: 'Brainstorm & Refine Idea', isCompleted: !!startup?.brainstormResult },
                { id: 'marketPulseCheck', name: 'Initial Market Pulse Check', isCompleted: false },
                { id: 'defineMissionVision', name: 'Define Mission & Vision', isCompleted: false },
            ]
        },
        {
            id: 'phase-2', name: 'Phase 2: Foundation & Blueprint',
            tasks: [
                { id: 'generateNameIdentity', name: 'Generate Business Name & Identity', isCompleted: false },
                { id: 'scorecard', name: 'AI-Powered Scorecard Analysis', isCompleted: !!startup?.dashboard },
                { id: 'businessPlan', name: 'Develop Initial Business Plan', isCompleted: !!startup?.businessPlan },
                { id: 'pitchDeck', name: 'Create Pitch Deck Outline', isCompleted: !!startup?.pitchDeck },
            ]
        },
        {
            id: 'phase-3', name: 'Phase 3: Market & Customer Research',
            tasks: [
                { id: 'marketResearch', name: 'Deep Dive Market Analysis', isCompleted: !!startup?.marketResearch },
                { id: 'competitorMatrix', name: 'Competitor Landscape Matrix', isCompleted: false },
                { id: 'generateCustomerPersonas', name: 'Generate Ideal Customer Personas', isCompleted: false },
            ]
        },
        {
            id: 'phase-4', name: 'Phase 4: Problem & Solution Validation',
            tasks: [
                { id: 'generateInterviewScripts', name: 'Generate Interview Scripts', isCompleted: false },
                { id: 'validateProblem', name: 'Simulate Customer Interviews', isCompleted: !!startup?.customerValidation },
                { id: 'aiMentor', name: 'Get Feedback from AI Mentor', isCompleted: !!mentorFeedback },
            ]
        },
        {
            id: 'phase-5', name: 'Phase 5: Prototyping & UX/UI',
            tasks: [
                { id: 'userFlowDiagrams', name: 'Generate User Flow Diagram', isCompleted: false },
                { id: 'aiWireframing', name: 'AI-Powered Wireframing', isCompleted: false },
                { id: 'website', name: 'Build Interactive Website Prototype', isCompleted: !!startup?.website },
            ]
        },
        {
            id: 'phase-6', name: 'Phase 6: MVP Development & Deployment',
            tasks: [
                { id: 'defineDataModels', name: 'Define Data Models & Database Schema', isCompleted: false },
                { id: 'configureBackend', name: 'Configure Backend Functions & Logic', isCompleted: false },
                { id: 'designFrontend', name: 'Design Frontend UI & Component Library', isCompleted: false },
                { id: 'connectFrontendBackend', name: 'Connect Frontend to Backend', isCompleted: false },
                { id: 'oneClickDeployment', name: 'One-Click Deployment', isCompleted: false },
            ]
        },
        {
            id: 'phase-7', name: 'Phase 7: Alpha & Beta Testing',
            tasks: [
                { id: 'alphaTesting', name: 'Internal Alpha Testing', isCompleted: false },
                { id: 'betaTesterRecruitment', name: 'Recruit Beta Testers', isCompleted: false },
                { id: 'feedbackAnalysis', name: 'AI-Powered Feedback Analysis', isCompleted: false },
            ]
        },
        {
            id: 'phase-8', name: 'Phase 8: Go-to-Market Strategy',
            tasks: [
                { id: 'pricingStrategy', name: 'AI-Assisted Pricing Strategy', isCompleted: false },
                { id: 'marketingCopy', name: 'Generate Marketing & Sales Copy', isCompleted: false },
                { id: 'preLaunchWaitlist', name: 'Build Pre-Launch Waitlist Page', isCompleted: false },
            ]
        },
        {
            id: 'phase-9', name: 'Phase 9: Launch & Promotion',
            tasks: [
                { id: 'productHuntKit', name: 'Product Hunt Launch Kit', isCompleted: false },
                { id: 'pressRelease', name: 'Draft Press Release & Media Outreach', isCompleted: false },
                { id: 'launchMonitoring', name: 'Real-time Launch Monitoring', isCompleted: false },
            ]
        },
        {
            id: 'phase-10', name: 'Phase 10: Growth Hacking & Analytics',
            tasks: [
                { id: 'growthMetrics', name: 'Identify Key Growth Metrics (AARRR)', isCompleted: false },
                { id: 'abTestIdeas', name: 'Brainstorm A/B Test Ideas', isCompleted: false },
                { id: 'seoStrategy', name: 'Generate SEO Keyword Strategy', isCompleted: false },
            ]
        },
        {
            id: 'phase-11', name: 'Phase 11: Scaling & Operations',
            tasks: [
                { id: 'processAutomation', name: 'Map Processes for Automation', isCompleted: false },
                { id: 'draftJobDescriptions', name: 'Draft Job Descriptions for Key Hires', isCompleted: false },
                { id: 'cloudCostEstimation', name: 'Cloud Cost Estimation', isCompleted: false },
            ]
        },
        {
            id: 'phase-12', name: 'Phase 12: Fundraising & Investor Relations',
            tasks: [
                { id: 'investorMatching', name: 'AI Investor Matching', isCompleted: false },
                { id: 'dueDiligenceChecklist', name: 'Due Diligence Checklist', isCompleted: false },
                { id: 'aiPitchCoach', name: 'AI Pitch Coach', isCompleted: false },
            ]
        },
    ], [startup, mentorFeedback]);

    const allTasks = useMemo(() => phases.flatMap(p => p.tasks), [phases]);

    const { currentPhaseIndex, currentStepIndex } = useMemo(() => {
        for (let i = 0; i < phases.length; i++) {
            for (let j = 0; j < phases[i].tasks.length; j++) {
                if (phases[i].tasks[j].id === activeView) {
                    return { currentPhaseIndex: i, currentStepIndex: j };
                }
            }
        }
        return { currentPhaseIndex: 0, currentStepIndex: 0 };
    }, [activeView, phases]);
    
    React.useEffect(() => {
        if (startup?.aiMentor) {
            setMentorFeedback(startup.aiMentor);
        }
    }, [startup]);

    const handleTaskClick = (taskId: TaskID) => {
        const taskIndex = allTasks.findIndex(t => t.id === taskId);
        if (taskIndex > 0) {
            const prevTask = allTasks[taskIndex - 1];
            if (!prevTask.isCompleted) {
                toast.info("Please complete the previous step first.");
                return;
            }
        }
        setActiveView(taskId);
    };

    const handleNext = () => {
        const nextStepIndex = currentStepIndex + 1;
        if (nextStepIndex < phases[currentPhaseIndex].tasks.length) {
            handleTaskClick(phases[currentPhaseIndex].tasks[nextStepIndex].id);
        } else if (currentPhaseIndex + 1 < phases.length) {
            handleTaskClick(phases[currentPhaseIndex + 1].tasks[0].id);
        }
    };

    const handlePrev = () => {
        const prevStepIndex = currentStepIndex - 1;
        if (prevStepIndex >= 0) {
            setActiveView(phases[currentPhaseIndex].tasks[prevStepIndex].id);
        } else if (currentPhaseIndex - 1 >= 0) {
            const prevPhase = phases[currentPhaseIndex - 1];
            setActiveView(prevPhase.tasks[prevPhase.tasks.length - 1].id);
        }
    };

    const handleGetMentorFeedback = async () => {
        if (!startup) return;

        setIsMentorLoading(true);
        setError(null);
        try {
            // Create a complete StartupData object for the first argument
            const startupData: StartupData = {
                name: startup.name || '',
                scorecard: startup.dashboard ? JSON.parse(startup.dashboard) : {},
                businessPlan: startup.businessPlan ? JSON.parse(startup.businessPlan) : {},
                websitePrototype: startup.website ? JSON.parse(startup.website) : {},
                pitchDeck: startup.pitchDeck ? JSON.parse(startup.pitchDeck) : {},
                marketResearch: startup.marketResearch ? JSON.parse(startup.marketResearch) : {},
            };
            // The second argument is just the market research part, as per the function signature
            const marketResearchForArg = startup.marketResearch ? JSON.parse(startup.marketResearch) : {};

            const feedback = await getMentorFeedback(startupData, marketResearchForArg);
            setMentorFeedback(feedback);

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

        const websitePrototype = startup.website ? JSON.parse(startup.website) : {};
        // Properly type the initial value for the reducer
        const taskNames = allTasks.reduce((acc, task) => {
            acc[task.id] = task.name;
            return acc;
        }, {} as { [key in TaskID]: string });

        switch (activeView) {
            case 'brainstormIdea':
                return <BrainstormIdea startup={startup} />;
            case 'scorecard':
                return <Scorecard startup={startup} />;
            case 'businessPlan':
                return <BusinessPlan startup={startup} />;
            case 'pitchDeck':
                return <PitchDeck startup={startup} />;
            case 'website':
                return <WebsitePrototype data={websitePrototype} idea={startup.name || ''} startupId={startup._id} />;
            case 'marketResearch':
                return <MarketResearchDisplay startup={startup} />;
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
            case 'validateProblem':
                return <CustomerValidation startup={startup} />;
            default:
                const taskName = taskNames[activeView] || "Selected Task";
                return <Placeholder taskName={taskName} />;
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
            <div className="workspace-header">
                <h1 className="venture-title">{startup.name}</h1>
                <p className="venture-subtitle">This is your dedicated workspace. Follow the steps below to turn your idea into a reality.</p>
            </div>

            <HorizontalStepper
                phases={phases}
                currentPhaseIndex={currentPhaseIndex}
                currentStepIndex={currentStepIndex}
                onNext={handleNext}
                onPrev={handlePrev}
                onShowOverview={() => setOverviewModalOpen(true)}
            />
            
            <main className="workspace-content">
                {renderActiveView()}
            </main>

            <PhasesOverviewModal
                isOpen={isOverviewModalOpen}
                onClose={() => setOverviewModalOpen(false)}
                phases={phases}
                activeTask={activeView}
                onTaskClick={(taskId) => {
                    handleTaskClick(taskId);
                    setOverviewModalOpen(false);
                }}
            />
        </div>
    );
};