import React from 'react';
import { toast } from 'sonner';
import './PhaseChecklist.css';

// Define and export the TaskID type
export type TaskID =
  // Phase 1
  | 'brainstormIdea'
  | 'marketPulseCheck'
  | 'defineMissionVision'
  // Phase 2
  | 'generateNameIdentity'
  | 'scorecard'
  | 'businessPlan'
  | 'pitchDeck'
  // Phase 3
  | 'marketResearch'
  | 'competitorMatrix'
  | 'generateCustomerPersonas'
  // Phase 4
  | 'generateInterviewScripts'
  | 'validateProblem'
  | 'aiMentor'
  // Phase 5
  | 'userFlowDiagrams'
  | 'aiWireframing'
  | 'website'
  // Phase 6
  | 'defineDataModels'
  | 'configureBackend'
  | 'designFrontend'
  | 'connectFrontendBackend'
  | 'oneClickDeployment'
  // Phase 7
  | 'alphaTesting'
  | 'betaTesterRecruitment'
  | 'feedbackAnalysis'
  // Phase 8
  | 'pricingStrategy'
  | 'marketingCopy'
  | 'preLaunchWaitlist'
  // Phase 9
  | 'productHuntKit'
  | 'pressRelease'
  | 'launchMonitoring'
  // Phase 10
  | 'growthMetrics'
  | 'abTestIdeas'
  | 'seoStrategy'
  // Phase 11
  | 'processAutomation'
  | 'draftJobDescriptions'
  | 'cloudCostEstimation'
  // Phase 12
  | 'investorMatching'
  | 'dueDiligenceChecklist'
  | 'aiPitchCoach';


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

interface PhaseChecklistProps {
    startup: any; // Replace 'any' with a proper type later
    onTaskClick: (taskId: TaskID) => void;
    activeTask: TaskID;
    mentorFeedback: string | null;
}

export const PhaseChecklist: React.FC<PhaseChecklistProps> = ({ startup, onTaskClick, activeTask, mentorFeedback }) => {

    const phases: Phase[] = [
        {
            id: 'phase-1',
            name: 'Phase 1: Ideation & Discovery',
            tasks: [
                { id: 'brainstormIdea', name: 'Brainstorm & Refine Idea', isCompleted: !!startup.brainstormResult },
                { id: 'marketPulseCheck', name: 'Initial Market Pulse Check', isCompleted: false },
                { id: 'defineMissionVision', name: 'Define Mission & Vision', isCompleted: false },
            ]
        },
        {
            id: 'phase-2',
            name: 'Phase 2: Foundation & Blueprint',
            tasks: [
                { id: 'generateNameIdentity', name: 'Generate Business Name & Identity', isCompleted: false },
                { id: 'scorecard', name: 'AI-Powered Scorecard Analysis', isCompleted: !!startup.dashboard },
                { id: 'businessPlan', name: 'Develop Initial Business Plan', isCompleted: !!startup.businessPlan },
                { id: 'pitchDeck', name: 'Create Pitch Deck Outline', isCompleted: !!startup.pitchDeck },
            ]
        },
        {
            id: 'phase-3',
            name: 'Phase 3: Market & Customer Research',
            tasks: [
                { id: 'marketResearch', name: 'Deep Dive Market Analysis', isCompleted: !!startup.marketResearch },
                { id: 'competitorMatrix', name: 'Competitor Landscape Matrix', isCompleted: false },
                { id: 'generateCustomerPersonas', name: 'Generate Ideal Customer Personas', isCompleted: false },
            ]
        },
        {
            id: 'phase-4',
            name: 'Phase 4: Problem & Solution Validation',
            tasks: [
                { id: 'generateInterviewScripts', name: 'Generate Interview Scripts', isCompleted: false },
                { id: 'validateProblem', name: 'Simulate Customer Interviews', isCompleted: !!startup.customerValidation },
                { id: 'aiMentor', name: 'Get Feedback from AI Mentor', isCompleted: !!mentorFeedback },
            ]
        },
        {
            id: 'phase-5',
            name: 'Phase 5: Prototyping & UX/UI',
            tasks: [
                { id: 'userFlowDiagrams', name: 'Generate User Flow Diagram', isCompleted: false },
                { id: 'aiWireframing', name: 'AI-Powered Wireframing', isCompleted: false },
                { id: 'website', name: 'Build Interactive Website Prototype', isCompleted: !!startup.website },
            ]
        },
        {
            id: 'phase-6',
            name: 'Phase 6: MVP Development & Deployment',
            tasks: [
                { id: 'defineDataModels', name: 'Define Data Models & Database Schema', isCompleted: false },
                { id: 'configureBackend', name: 'Configure Backend Functions & Logic', isCompleted: false },
                { id: 'designFrontend', name: 'Design Frontend UI & Component Library', isCompleted: false },
                { id: 'connectFrontendBackend', name: 'Connect Frontend to Backend', isCompleted: false },
                { id: 'oneClickDeployment', name: 'One-Click Deployment', isCompleted: false },
            ]
        },
        {
            id: 'phase-7',
            name: 'Phase 7: Alpha & Beta Testing',
            tasks: [
                { id: 'alphaTesting', name: 'Internal Alpha Testing', isCompleted: false },
                { id: 'betaTesterRecruitment', name: 'Recruit Beta Testers', isCompleted: false },
                { id: 'feedbackAnalysis', name: 'AI-Powered Feedback Analysis', isCompleted: false },
            ]
        },
        {
            id: 'phase-8',
            name: 'Phase 8: Go-to-Market Strategy',
            tasks: [
                { id: 'pricingStrategy', name: 'AI-Assisted Pricing Strategy', isCompleted: false },
                { id: 'marketingCopy', name: 'Generate Marketing & Sales Copy', isCompleted: false },
                { id: 'preLaunchWaitlist', name: 'Build Pre-Launch Waitlist Page', isCompleted: false },
            ]
        },
        {
            id: 'phase-9',
            name: 'Phase 9: Launch & Promotion',
            tasks: [
                { id: 'productHuntKit', name: 'Product Hunt Launch Kit', isCompleted: false },
                { id: 'pressRelease', name: 'Draft Press Release & Media Outreach', isCompleted: false },
                { id: 'launchMonitoring', name: 'Real-time Launch Monitoring', isCompleted: false },
            ]
        },
        {
            id: 'phase-10',
            name: 'Phase 10: Growth Hacking & Analytics',
            tasks: [
                { id: 'growthMetrics', name: 'Identify Key Growth Metrics (AARRR)', isCompleted: false },
                { id: 'abTestIdeas', name: 'Brainstorm A/B Test Ideas', isCompleted: false },
                { id: 'seoStrategy', name: 'Generate SEO Keyword Strategy', isCompleted: false },
            ]
        },
        {
            id: 'phase-11',
            name: 'Phase 11: Scaling & Operations',
            tasks: [
                { id: 'processAutomation', name: 'Map Processes for Automation', isCompleted: false },
                { id: 'draftJobDescriptions', name: 'Draft Job Descriptions for Key Hires', isCompleted: false },
                { id: 'cloudCostEstimation', name: 'Cloud Cost Estimation', isCompleted: false },
            ]
        },
        {
            id: 'phase-12',
            name: 'Phase 12: Fundraising & Investor Relations',
            tasks: [
                { id: 'investorMatching', name: 'AI Investor Matching', isCompleted: false },
                { id: 'dueDiligenceChecklist', name: 'Due Diligence Checklist', isCompleted: false },
                { id: 'aiPitchCoach', name: 'AI Pitch Coach', isCompleted: false },
            ]
        },
    ];

    const allTasks = phases.flatMap(phase => phase.tasks);

    return (
        <div className="phase-checklist-container">
            {phases.map(phase => (
                <div key={phase.id} className="phase-card">
                    <h2 className="phase-name">{phase.name}</h2>
                    <ul className="task-list">
                        {phase.tasks.map(task => {
                            const globalTaskIndex = allTasks.findIndex(t => t.id === task.id);
                            const isLocked = globalTaskIndex > 0 && !allTasks[globalTaskIndex - 1].isCompleted;

                            return (
                                <li
                                    key={task.id}
                                    className={`task-item ${task.isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${activeTask === task.id ? 'active' : ''}`}
                                    onClick={() => {
                                        if (isLocked) {
                                            toast.info("Please complete the previous step first.");
                                        } else {
                                            onTaskClick(task.id);
                                        }
                                    }}
                                >
                                    <span className="task-checkbox">
                                        {isLocked ? '🔒' : (task.isCompleted ? '✅' : '🔲')}
                                    </span>
                                    <span className="task-name">{task.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
};