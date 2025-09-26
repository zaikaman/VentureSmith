import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStartupAssets } from '../../services/geminiService';
import { LoadingIndicator } from './LoadingIndicator';
import { authClient } from '../../lib/auth-client';
import { LoginModal } from './LoginModal';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { IdeaInputForm } from './IdeaInputForm'; // Import the form
import './BlueprintBuilder.css';

export const BlueprintBuilder: React.FC = () => {
    const [idea, setIdea] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const { data: session, isPending } = authClient.useSession();
    const navigate = useNavigate();

    const startups = useQuery(api.startups.getStartupsForUser);
    // Get Convex actions
    const performMarketAnalysis = useAction(api.firecrawl.performMarketAnalysis);
    const createStartup = useMutation(api.startups.createStartup);

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
        setError(null);

        try {
            // Run all data fetching in parallel
            const [mainData, marketAnalysisResult] = await Promise.all([
                generateStartupAssets(submittedIdea),
                performMarketAnalysis({ keyword: submittedIdea }),
            ]);

            // Save to database and get the new ID
            const newStartupId = await createStartup({
                name: mainData.name,
                dashboard: JSON.stringify(mainData.scorecard, null, 2),
                businessPlan: JSON.stringify(mainData.businessPlan, null, 2),
                website: JSON.stringify(mainData.websitePrototype, null, 2),
                pitchDeck: JSON.stringify(mainData.pitchDeck, null, 2),
                marketResearch: JSON.stringify(marketAnalysisResult, null, 2),
            });

            // Navigate directly to the new venture workspace
            navigate(`/venture/${newStartupId}`);

        } catch (err: any) {
            console.error("Error caught during parallel generation:", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [session, isLoading, performMarketAnalysis, createStartup, navigate]);

    const handleHistoryItemClick = (startup: any) => {
        navigate(`/venture/${startup._id}`);
    };

    const handleReset = () => {
        setIdea('');
        setError(null);
        setIsLoading(false);
        navigate('/blueprint-builder');
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

    if (error) {
        return (
            <div className="blueprint-builder-container">
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
            </div>
        );
    }

    return (
        <div className="blueprint-builder-container">
            <div className="text-center p-8">
                <h1 className="text-4xl font-bold mb-4">Create Your Startup Blueprint</h1>
                <p className="text-lg text-slate-400 mb-8">Describe your business idea below to get started.</p>
                <IdeaInputForm onGenerate={handleGenerate} />
            </div>
            {session && (
                <div className="history-section">
                    <button onClick={() => setShowHistory(!showHistory)} className="history-toggle-button">
                        {showHistory ? "Hide" : "Show"} History
                    </button>
                    {showHistory && (
                        <div className="startups-section">
                            <h2>My Startups</h2>
                            {startups && startups.length > 0 ? (
                                <ul className="startup-list">
                                    {startups.map((startup) => {
                                        return (
                                            <li key={startup._id} className="startup-item" onClick={() => handleHistoryItemClick(startup)}>
                                                <p><strong>Name:</strong> {startup.name}</p>
                                                <p><strong>Created At:</strong> {new Date(startup.createdAt).toLocaleDateString()}</p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p>You haven't created any startups yet.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
    );
};