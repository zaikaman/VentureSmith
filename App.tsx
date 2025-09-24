
import React, { useState, useCallback } from 'react';
import { StartupData } from './types';
import { generateStartupAssets } from './services/geminiService';
import { IdeaInputForm } from './components/IdeaInputForm';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Header } from './components/Header';

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
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Generation Failed</h2>
                    <p className="text-red-300 mb-6 max-w-2xl mx-auto">{error}</p>
                    <button
                        onClick={handleReset}
                        className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-colors duration-300"
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return <IdeaInputForm onGenerate={handleGenerate} />;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default App;