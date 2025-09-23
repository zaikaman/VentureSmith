import React, { useState, useEffect, useCallback } from 'react';
import { StartupData } from './types';
import { generateStartupAssets } from './services/geminiService';
import { IdeaInputForm } from './components/IdeaInputForm';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ResultsDashboard } from './components/ResultsDashboard';

const App: React.FC = () => {
    const [idea, setIdea] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<StartupData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async (submittedIdea: string) => {
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
    }, [isLoading]);
    
    const handleReset = () => {
        setIdea('');
        setResults(null);
        setError(null);
        setIsLoading(false);
    }

    const renderContent = () => {
        if (isLoading) {
            return <LoadingIndicator idea={idea} />;
        }
        if (results) {
            return <ResultsDashboard data={results} onReset={handleReset} />;
        }
        if (error) {
            return (
                <div className="text-center p-8 max-w-2xl mx-auto">
                    <div className="bg-red-900/50 border border-red-700/50 rounded-2xl p-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-red-300 mb-4">Generation Failed</h2>
                        <p className="text-red-300/80 mb-6">{error}</p>
                        <button
                            onClick={handleReset}
                            className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-colors duration-300"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }
        return <IdeaInputForm onGenerate={handleGenerate} />;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
            <div className="w-full max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default App;