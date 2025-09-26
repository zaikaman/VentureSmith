
import React, { useState, useEffect } from 'react';
import './LoadingIndicator.css';

interface LoadingIndicatorProps {
    idea: string;
}

const loadingSteps = [
    "Analyzing startup idea...",
    "Generating business plan...",
    "Conducting market research...",
    "Designing website prototype...",
    "Writing pitch deck script...",
    "Calculating startup score...",
    "Finalizing assets..."
];

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ idea }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStepIndex(prevIndex => (prevIndex + 1) % loadingSteps.length);
        }, 1800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <h2 className="loading-title">Forging Your Venture</h2>
            <p className="loading-idea">"{idea}"</p>
            <p className="loading-step">{loadingSteps[currentStepIndex]}</p>
        </div>
    );
};