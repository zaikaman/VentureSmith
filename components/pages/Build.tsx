
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StartupData } from '../../types';
import { generateStartupAssets, getMentorFeedback } from '../../services/geminiService';
import { LoadingIndicator } from './LoadingIndicator';
import { ResultsDashboard } from './ResultsDashboard';
import { authClient } from '../../lib/auth-client';
import { LoginModal } from './LoginModal';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { IdeaInputForm } from './IdeaInputForm'; // Import the form
import './Build.css';

// Define types here for clarity
type SearchResultItem = {
    url: string;
    title: string;
    description: string;
    position: number;
};

export const Build: React.FC = () => {
    const [idea, setIdea] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<StartupData | null>(null);
    const [marketResearch, setMarketResearch] = useState<{ landscape: SearchResultItem[], competitors: SearchResultItem[], trends: SearchResultItem[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [mentorFeedback, setMentorFeedback] = useState<string | null>(null); // Mentor feedback state
    const [isMentorLoading, setIsMentorLoading] = useState<boolean>(false); // Mentor feedback loading state
    const { data: session, isPending } = authClient.useSession();
    const navigate = useNavigate();

    // Get Convex actions for market research
    const getMarketLandscape = useAction(api.firecrawl.getMarketLandscape);
    const getCompetitorsAction = useAction(api.firecrawl.getCompetitors);
    const getKeyTrendsAction = useAction(api.firecrawl.getKeyTrends);

    const handleGenerate = useCallback(async (submittedIdea: string) => {
        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }
        if (!submittedIdea || isLoading) {
            return;
        }
        setIdea(submittedIdea);
        setIsLoading(true);
        setResults(null);
        setMarketResearch(null);
        setError(null);

        try {
            // Run all data fetching in parallel
            const [mainData, landscapeRes, competitorsRes, trendsRes] = await Promise.all([
                generateStartupAssets(submittedIdea),
                getMarketLandscape({ keyword: submittedIdea }),
                getCompetitorsAction({ keyword: submittedIdea }),
                getKeyTrendsAction({ keyword: submittedIdea })
            ]);

            setResults(mainData);
            setMarketResearch({
                landscape: landscapeRes.web || [],
                competitors: competitorsRes.web || [],
                trends: trendsRes.web || [],
            });

        } catch (err: any) {
            console.error("Error caught during parallel generation:", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [session, isLoading, getMarketLandscape, getCompetitorsAction, getKeyTrendsAction]);

    const handleGetMentorFeedback = async () => {
        if (!results || !marketResearch) return;

        setIsMentorLoading(true);
        setError(null);
        try {
            const feedback = await getMentorFeedback(results, marketResearch);
            setMentorFeedback(feedback);
        } catch (err: any) {
            console.error("Error getting mentor feedback:", err);
            setError("Failed to get feedback from AI Mentor. Please try again.");
            // Optionally clear previous feedback
            setMentorFeedback(null);
        } finally {
            setIsMentorLoading(false);
        }
    };

    const handleReset = () => {
        setIdea('');
        setResults(null);
        setMarketResearch(null);
        setError(null);
        setIsLoading(false);
        navigate('/');
    }

    useEffect(() => {
        if (!isPending && !session) {
            setIsLoginModalOpen(true);
        }
    }, [isPending, session]);

    if (isPending) {
        return <LoadingIndicator idea="Checking session..." />;
    }

    if (isLoading) {
        return <LoadingIndicator idea={idea} />;
    }

    if (results && marketResearch) {
        return <ResultsDashboard 
            data={results} 
            idea={idea} 
            marketResearch={marketResearch}
            onReset={handleReset} 
            mentorFeedback={mentorFeedback}
            isMentorLoading={isMentorLoading}
            onGetMentorFeedback={handleGetMentorFeedback}
        />;
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Generation Failed</h2>
                <p className="text-red-300 mb-6 max-w-2xl mx-auto">{error}</p>
                <button
                    onClick={handleReset}
                    className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors duration-300"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="build-container">
            <div className="text-center p-8">
                <h1 className="text-4xl font-bold mb-4">Let's build your startup</h1>
                <p className="text-lg text-slate-400 mb-8">Describe your business idea below to get started.</p>
                <IdeaInputForm onGenerate={handleGenerate} />
            </div>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
    );
};