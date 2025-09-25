
import * as React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { WebsitePrototypeData } from '../../types';
import { regenerateWebsitePrototype } from '../../services/geminiService';

interface WebsitePrototypeProps {
    data: WebsitePrototypeData;
    idea: string;
}

export const WebsitePrototype: React.FC<WebsitePrototypeProps> = ({ data, idea }) => {
    const [currentCode, setCurrentCode] = React.useState(data.code);
    const [isRegenerating, setIsRegenerating] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const scope = { React };

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        setError(null);
        try {
            const result = await regenerateWebsitePrototype(idea);
            setCurrentCode(result.code);
        } catch (err: any) {
            setError(err.message || 'Failed to regenerate website.');
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[var(--text-color)] text-center">Landing Page Prototype</h2>
                <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold py-2 px-5 rounded-lg hover:opacity-90 transition-colors duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRegenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Regenerating...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Regenerate
                        </>
                    )}
                </button>
            </div>
            {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
            <div className="w-full bg-[var(--bg-slate-900)] rounded-xl overflow-hidden shadow-2xl border-4 border-[var(--border-slate-700)]">
                <div className="h-10 bg-[var(--bg-slate-700)] flex items-center px-4 space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-[var(--bg-slate-800)] min-h-[600px] overflow-y-auto p-4">
                    <LiveProvider code={`${currentCode}\nrender(<WebsitePrototypeComponent />);`} scope={scope} noInline={true}>
                        <LiveError className="text-red-500 whitespace-pre-wrap" />
                        <LivePreview />
                        <h3 className="text-xl font-bold text-[var(--text-color)] mt-4 mb-2">Generated Code:</h3>
                        <LiveEditor className="bg-[var(--bg-slate-700)] p-4 rounded-md text-sm overflow-auto max-h-96" />
                    </LiveProvider>
                </div>
            </div>
        </div>
    );
};
