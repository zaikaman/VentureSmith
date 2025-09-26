
import * as React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { WebsitePrototypeData } from '../../types';
import { regenerateWebsitePrototype } from '../../services/geminiService';
import './WebsitePrototype.css';

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
        <div className="website-prototype-container">
            <div className="wp-header">
                <h2 className="wp-title">Landing Page Prototype</h2>
                <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="regenerate-button"
                >
                    {isRegenerating ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Regenerating...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span>Regenerate</span>
                        </>
                    )}
                </button>
            </div>
            {error && <p className="live-error">Error: {error}</p>}
            <div className="browser-window">
                <div className="browser-header">
                    <div className="browser-dot dot-red"></div>
                    <div className="browser-dot dot-yellow"></div>
                    <div className="browser-dot dot-green"></div>
                </div>
                <div className="preview-and-editor">
                    <LiveProvider code={`${currentCode}\nrender(<WebsitePrototypeComponent />);`} scope={scope} noInline={true}>
                        <div className="live-preview-container">
                            <LiveError className="live-error" />
                            <LivePreview />
                        </div>
                        <h3 className="generated-code-title">Generated Code:</h3>
                        <LiveEditor className="live-editor" />
                    </LiveProvider>
                </div>
            </div>
        </div>
    );
};
