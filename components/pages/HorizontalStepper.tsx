import React from 'react';
import './HorizontalStepper.css';
import { TaskID } from '../../types';

interface Task {
    id: TaskID;
    name: string;
}

interface Phase {
    id: string;
    name: string;
    tasks: Task[];
}

interface HorizontalStepperProps {
    phases: Phase[];
    currentPhaseIndex: number;
    currentStepIndex: number;
    onNext: () => void;
    onPrev: () => void;
    onShowOverview: () => void;
}

export const HorizontalStepper: React.FC<HorizontalStepperProps> = ({
    phases,
    currentPhaseIndex,
    currentStepIndex,
    onNext,
    onPrev,
    onShowOverview,
}) => {
    // Guard against rendering before data is ready
    if (!phases || phases.length === 0) {
        return null; 
    }

    const currentPhase = phases[currentPhaseIndex];
    // Add another guard for the current phase and tasks
    if (!currentPhase || !currentPhase.tasks) {
        return null;
    }
    const currentStep = currentPhase.tasks[currentStepIndex];
    if (!currentStep) {
        return null; // Or some fallback UI
    }

    const isFirstStep = currentPhaseIndex === 0 && currentStepIndex === 0;
    const isLastStep = currentPhaseIndex === phases.length - 1 && currentStepIndex === currentPhase.tasks.length - 1;

    return (
        <div className="stepper-container">
            <button onClick={onPrev} disabled={isFirstStep} className="stepper-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <div className="stepper-content">
                <div className="phase-info">
                    <span className="phase-name">{currentPhase.name}</span>
                </div>
                <h3 className="step-name">{currentStep.name}</h3>
            </div>
            <button onClick={onNext} disabled={isLastStep} className="stepper-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
            <button onClick={onShowOverview} className="overview-button">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span>All Steps</span>
            </button>
        </div>
    );
};