
import React, { useState, useCallback } from 'react';
import { Routes, Route, Link, BrowserRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Added
import 'react-toastify/dist/ReactToastify.css'; // Added
import { StartupData } from './types';
import { generateStartupAssets } from './services/geminiService';
import { IdeaInputForm } from './components/IdeaInputForm';
import { InfoSection } from './components/InfoSection';
import { GrowthSection } from './components/GrowthSection';
import { TransformSection } from './components/TransformSection';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { useTheme } from './contexts/ThemeContext';
import { SignIn } from './components/pages/SignIn';
import { SignUp } from './components/pages/SignUp';
import { authClient } from './lib/auth-client';
import { LoginModal } from './components/LoginModal';
import './App.css';

const App: React.FC = () => {
    const { theme } = useTheme();
    const [idea, setIdea] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<StartupData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const { data: session, isPending } = authClient.useSession();

    const handleGenerate = useCallback(async (submittedIdea: string) => {
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
    }, [isLoading, session]);
    
    const handleReset = () => {
        setIdea('');
        setResults(null);
        setError(null);
        setIsLoading(false);
    }

    const renderContent = () => {
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
            <>
                <IdeaInputForm onGenerate={handleGenerate} />
                <InfoSection />
                <GrowthSection />
                <TransformSection />
            </>
        );
    };

    return (
        <BrowserRouter>
            <div className={`min-h-screen app-container flex flex-col`}>
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-7xl mx-auto">
                        <Routes>
                            <Route path="/" element={renderContent()} />
                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/signup" element={<SignUp />} />
                        </Routes>
                        <button onClick={() => toast("This is a test notification!")}>Toast</button>
                    </div>
                </main>
                <Footer />
                <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            </div>
            <ToastContainer
                theme={theme}
                className="toast-container"
            />
        </BrowserRouter>
    );
};

export default App;