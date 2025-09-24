import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StartupData } from '../../types';
import { generateStartupAssets } from '../../services/geminiService';
import { LoadingIndicator } from './LoadingIndicator';
import { ResultsDashboard } from './ResultsDashboard';
import { authClient } from '../../lib/auth-client';
import { LoginModal } from './LoginModal';
import './Build.css';

export const Build: React.FC = () => {
    const [idea, setIdea] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<StartupData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const { data: session, isPending } = authClient.useSession();
    const location = useLocation();
    const navigate = useNavigate();

    const handleGenerate = async (submittedIdea: string) => {
        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }
        if (!submittedIdea || isLoading) return;
        setIdea(submittedIdea);
        setIsLoading(true);
        setResults(null);
        setError(null);

        try {
            const data = await generateStartupAssets(submittedIdea);
            setResults(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setIdea('');
        setResults(null);
        setError(null);
        setIsLoading(false);
        navigate('/');
    }

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const ideaFromQuery = searchParams.get('idea');
        if (ideaFromQuery) {
            handleGenerate(ideaFromQuery);
        }
    }, [location.search, session]);

    if (isPending) {
        return <LoadingIndicator idea="Checking session..." />;
    }

    if (isLoading) {
        return <LoadingIndicator idea={idea} />;
    }
    if (results) {
        return <ResultsDashboard data={results} onReset={handleReset} />;
    }
    if (error) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Generation Failed</h2>
                <p className="text-red-300 mb-6 max-w-2xl mx-auto">{error}</p>
                <button
                    onClick={handleReset}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-colors duration-300"
                >
                    Try Again
                </button>
            </div>
        );
    }
    return (
        <div className="build-container">
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
    );
}