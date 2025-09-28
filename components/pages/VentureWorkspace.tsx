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
import PitchDeck from './PitchDeck';
import { WebsitePrototype } from './WebsitePrototype';
import { MarketResearchDisplay } from './MarketResearchDisplay';
import { CompetitorMatrix } from './CompetitorMatrix';
import MentorFeedbackDisplay from './MentorFeedbackDisplay';
import CustomerValidation from './CustomerValidation';
import Placeholder from './Placeholder';
import BrainstormIdea from './BrainstormIdea';
import { MarketPulseCheck } from './MarketPulseCheck';
import { MissionVision } from './MissionVision';
import { BrandIdentity } from './BrandIdentity';
import { BusinessPlan } from './BusinessPlan';
import { CustomerPersonas } from './CustomerPersonas';
import { InterviewScripts } from './InterviewScripts';
import UserFlowDiagram from './UserFlowDiagram';
import AIWireframeGenerator from './AIWireframeGenerator';
import GenerateTechStack from './GenerateTechStack';
import GenerateDatabaseSchema from './GenerateDatabaseSchema';
import GenerateApiEndpoints from './GenerateApiEndpoints';
import GenerateDevelopmentRoadmap from './GenerateDevelopmentRoadmap';
import EstimateCloudCosts from './EstimateCloudCosts';
import AIPricingStrategy from './AIPricingStrategy';
import GenerateMarketingCopy from './GenerateMarketingCopy';
import BuildWaitlistPage from './BuildWaitlistPage';
import ProductHuntLaunchKit from './ProductHuntLaunchKit';
import DraftPressRelease from './DraftPressRelease';
import IdentifyGrowthMetrics from './IdentifyGrowthMetrics';
import BrainstormABTestIdeas from './BrainstormABTestIdeas';
import GenerateSeoStrategy from './GenerateSeoStrategy';
import MapProcesses from './MapProcesses';
import DraftJobDescriptions from './DraftJobDescriptions';
import AIInvestorMatching from './AIInvestorMatching';
import DueDiligenceChecklist from './DueDiligenceChecklist';
import AIPitchCoach from './AIPitchCoach';

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
    const hasSetInitialView = React.useRef(false);

    const startup = useQuery(
        api.startups.getStartupById, 
        session && id ? { id } : 'skip'
    );

    const phases: Phase[] = useMemo(() => [
        {
            id: 'phase-1', name: 'Phase 1: Ideation & Discovery',
            tasks: [
                { id: 'brainstormIdea', name: 'Brainstorm & Refine Idea', isCompleted: !!startup?.brainstormResult },
                { id: 'marketPulseCheck', name: 'Initial Market Pulse Check', isCompleted: !!startup?.marketPulse },
                { id: 'defineMissionVision', name: 'Define Mission & Vision', isCompleted: !!startup?.missionVision },
            ]
        },
        {
            id: 'phase-2', name: 'Phase 2: Foundation & Blueprint',
            tasks: [
                { id: 'generateNameIdentity', name: 'Generate Brand Identity', isCompleted: !!startup?.brandIdentity },
                { id: 'scorecard', name: 'AI Scorecard Analysis', isCompleted: !!startup?.dashboard },
                { id: 'businessPlan', name: 'Develop Business Plan', isCompleted: !!startup?.businessPlan },
                { id: 'pitchDeck', name: 'Create Pitch Deck Outline', isCompleted: !!startup?.pitchDeck },
            ]
        },
        {
            id: 'phase-3', name: 'Phase 3: Market & Customer Research',
            tasks: [
                { id: 'marketResearch', name: 'Deep Dive Market Analysis', isCompleted: !!startup?.marketResearch },
                { id: 'competitorMatrix', name: 'Competitor Matrix', isCompleted: !!startup?.competitorMatrix },
                { id: 'generateCustomerPersonas', name: 'Generate Customer Personas', isCompleted: !!startup?.customerPersonas },
            ]
        },
        {
            id: 'phase-4', name: 'Phase 4: Problem & Solution Validation',
            tasks: [
                { id: 'generateInterviewScripts', name: 'Generate Interview Scripts', isCompleted: !!startup?.interviewScripts },
                { id: 'validateProblem', name: 'Simulate Customer Interviews', isCompleted: !!startup?.customerValidation },
                { id: 'aiMentor', name: 'Get Feedback from AI Mentor', isCompleted: !!startup?.aiMentor },
            ]
        },
        {
            id: 'phase-5', name: 'Phase 5: Prototyping & UX/UI',
            tasks: [
                { id: 'userFlowDiagrams', name: 'Generate User Flow Diagram', isCompleted: !!startup?.userFlowDiagram },
                { id: 'aiWireframing', name: 'AI-Powered Wireframing', isCompleted: !!startup?.aiWireframe },
                { id: 'website', name: 'Build Website Prototype', isCompleted: !!startup?.website },
            ]
        },
        {
            id: 'phase-6', name: 'Phase 6: Technical Blueprint & Planning',
            tasks: [
                { id: 'generateTechStack', name: 'Generate Technology Stack', isCompleted: !!startup?.techStack },
                { id: 'generateDatabaseSchema', name: 'Generate Database Schema', isCompleted: !!startup?.databaseSchema },
                { id: 'generateAPIEndpoints', name: 'Generate API Endpoints', isCompleted: !!startup?.apiEndpoints },
                { id: 'generateDevelopmentRoadmap', name: 'Generate Dev Roadmap', isCompleted: !!startup?.developmentRoadmap },
                { id: 'estimateCosts', name: 'Estimate Initial Cloud Costs', isCompleted: !!startup?.costEstimate },
            ]
        },
        {
            id: 'phase-7', name: 'Phase 7: Go-to-Market Strategy',
            tasks: [
                { id: 'pricingStrategy', name: 'AI Pricing Strategy', isCompleted: !!startup?.pricingStrategy },
                { id: 'marketingCopy', name: 'Generate Marketing Copy', isCompleted: !!startup?.marketingCopy },
                { id: 'preLaunchWaitlist', name: 'Build Waitlist Page', isCompleted: !!startup?.preLaunchWaitlist },
            ]
        },
        {
            id: 'phase-8', name: 'Phase 8: Launch & Promotion',
            tasks: [
                { id: 'productHuntKit', name: 'Product Hunt Launch Kit', isCompleted: !!startup?.productHuntKit },
                { id: 'pressRelease', name: 'Draft Press Release', isCompleted: !!startup?.pressRelease },
            ]
        },
        {
            id: 'phase-9', name: 'Phase 9: Growth Hacking & Analytics',
            tasks: [
                { id: 'growthMetrics', name: 'Identify Growth Metrics', isCompleted: !!startup?.growthMetrics },
                { id: 'abTestIdeas', name: 'Brainstorm A/B Test Ideas', isCompleted: !!startup?.abTestIdeas },
                { id: 'seoStrategy', name: 'Generate SEO Keyword Strategy', isCompleted: !!startup?.seoStrategy },
            ]
        },
        {
            id: 'phase-10', name: 'Phase 10: Scaling & Operations',
            tasks: [
                { id: 'processAutomation', name: 'Map Processes for Automation', isCompleted: !!startup?.processAutomation },
                { id: 'draftJobDescriptions', name: 'Draft Job Descriptions', isCompleted: !!startup?.draftJobDescriptions },
            ]
        },
        {
            id: 'phase-11', name: 'Phase 11: Fundraising & Investor Relations',
            tasks: [
                { id: 'investorMatching', name: 'AI Investor Matching', isCompleted: !!startup?.investorMatching },
                { id: 'dueDiligenceChecklist', name: 'Due Diligence Checklist', isCompleted: !!startup?.dueDiligenceChecklist },
                { id: 'aiPitchCoach', name: 'AI Pitch Coach', isCompleted: !!startup?.aiPitchCoach },
            ]
        },
    ], [startup]);

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
        if (startup && phases.length > 0 && !hasSetInitialView.current) {
            let latestUnfinishedStepId: TaskID | null = null;

            for (const phase of phases) {
                for (const task of phase.tasks) {
                    if (!task.isCompleted) {
                        latestUnfinishedStepId = task.id;
                        break;
                    }
                }
                if (latestUnfinishedStepId) {
                    break;
                }
            }

            if (latestUnfinishedStepId) {
                setActiveView(latestUnfinishedStepId);
            } else {
                const lastPhase = phases[phases.length - 1];
                const lastTask = lastPhase.tasks[lastPhase.tasks.length - 1];
                setActiveView(lastTask.id);
            }
            hasSetInitialView.current = true;
        }
    }, [startup, phases]);
    
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

    const renderActiveView = () => {
        if (!startup) return null;

        const websitePrototype = startup.website ? JSON.parse(startup.website) : {};
        const taskNames = allTasks.reduce((acc, task) => {
            acc[task.id] = task.name;
            return acc;
        }, {} as { [key in TaskID]: string });

        switch (activeView) {
            case 'brainstormIdea':
                return <BrainstormIdea startup={startup} />;
            case 'marketPulseCheck':
                return <MarketPulseCheck startup={startup} />;
            case 'defineMissionVision':
                return <MissionVision startup={startup} />;
            case 'generateNameIdentity':
                return <BrandIdentity startup={startup} />;
            case 'scorecard':
                return <Scorecard startup={startup} />;
            case 'businessPlan':
                return <BusinessPlan startup={startup} />;
            case 'pitchDeck':
                return <PitchDeck startup={startup} />;
            case 'website':
                return <WebsitePrototype startup={startup} />;
            case 'marketResearch':
                return <MarketResearchDisplay startup={startup} />;
            case 'competitorMatrix':
                return <CompetitorMatrix startup={startup} />;
            case 'generateCustomerPersonas':
                return <CustomerPersonas startup={startup} />;
            case 'generateInterviewScripts':
                return <InterviewScripts startup={startup} />;
            case 'aiMentor':
                return <MentorFeedbackDisplay startup={startup} />;
            case 'validateProblem':
                return <CustomerValidation startup={startup} />;
            case 'userFlowDiagrams':
                return <UserFlowDiagram startup={startup} />;
            case 'aiWireframing':
                return <AIWireframeGenerator startup={startup} />;
            case 'generateTechStack':
                return <GenerateTechStack startup={startup} />;
            case 'generateDatabaseSchema':
                return <GenerateDatabaseSchema startup={startup} />;
            case 'generateAPIEndpoints':
                return <GenerateApiEndpoints startup={startup} />;
            case 'generateDevelopmentRoadmap':
                return <GenerateDevelopmentRoadmap startup={startup} />;
            case 'estimateCosts':
                return <EstimateCloudCosts startup={startup} />;
            case 'pricingStrategy':
                return <AIPricingStrategy startup={startup} />;
            case 'marketingCopy':
                return <GenerateMarketingCopy startup={startup} />;
            case 'preLaunchWaitlist':
                return <BuildWaitlistPage startup={startup} />;
            case 'productHuntKit':
                return <ProductHuntLaunchKit startup={startup} />;
            case 'pressRelease':
                return <DraftPressRelease startup={startup} />;
            case 'growthMetrics':
                return <IdentifyGrowthMetrics startup={startup} startupId={id!} />;
            case 'abTestIdeas':
                return <BrainstormABTestIdeas startup={startup} />;
            case 'seoStrategy':
                return <GenerateSeoStrategy startup={startup} />;
            case 'processAutomation':
                return <MapProcesses startup={startup} />;
            case 'draftJobDescriptions':
                return <DraftJobDescriptions startup={startup} />;
            case 'investorMatching':
                return <AIInvestorMatching startup={startup} />;
            case 'dueDiligenceChecklist':
                return <DueDiligenceChecklist startup={startup} />;
            case 'aiPitchCoach':
                return <AIPitchCoach startup={startup} />;
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