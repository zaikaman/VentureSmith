import React from 'react';
import './PhaseChecklist.css';

// Define and export the TaskID type
export type TaskID = 'scorecard' | 'businessPlan' | 'pitchDeck' | 'website' | 'marketResearch' | 'aiMentor' | 'validateProblem';

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
            name: 'Phase 1: Foundation & Blueprint',
            tasks: [
                { id: 'scorecard', name: 'Review Your Scorecard', isCompleted: !!startup.dashboard },
                { id: 'businessPlan', name: 'Review Your Business Plan', isCompleted: !!startup.businessPlan },
                { id: 'pitchDeck', name: 'Review Your Pitch Deck', isCompleted: !!startup.pitchDeck },
                { id: 'website', name: 'Review Your Website Prototype', isCompleted: !!startup.website },
            ]
        },
        {
            id: 'phase-2',
            name: 'Phase 2: Validation & Strategy',
            tasks: [
                { id: 'marketResearch', name: 'Analyze Market & Competitor Research', isCompleted: !!startup.marketResearch },
                { id: 'aiMentor', name: 'Get Feedback from AI Mentor', isCompleted: !!mentorFeedback }, // Use the prop here
                { id: 'validateProblem', name: 'Validate Problem with 4 Potential Customers', isCompleted: !!startup.customerValidation },
            ]
        },
        {
            id: 'phase-3',
            name: 'Phase 3: Prototyping & MVP',
            tasks: [
                // Future tasks will be dynamically generated here
            ]
        }
    ];

    return (
        <div className="phase-checklist-container">
            {phases.map(phase => (
                <div key={phase.id} className="phase-card">
                    <h2 className="phase-name">{phase.name}</h2>
                    <ul className="task-list">
                        {phase.tasks.map(task => (
                            <li 
                                key={task.id}
                                className={`task-item ${task.isCompleted ? 'completed' : ''} ${activeTask === task.id ? 'active' : ''}`}
                                onClick={() => onTaskClick(task.id)}
                            >
                                <span className="task-checkbox">{task.isCompleted ? '✅' : '🔲'}</span>
                                <span className="task-name">{task.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};