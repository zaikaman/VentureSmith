import React from 'react';
import { useScrollAndHighlight } from '../../contexts/ScrollAndHighlightContext'; // Import the hook

export const InfoSection: React.FC = () => {
    const { scrollToTopAndHighlight } = useScrollAndHighlight(); // Get the function from context

    return (
        <div style={{color: `var(--text-color)`}} className="py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-5xl font-bold mb-4">Validate Your Startup Idea with AI-Powered Precision.</h2>
                        <p style={{color: `var(--text-slate-400)`}} className="text-lg mb-8">Turn your innovative concepts into actionable business plans, market research, and pitch decks, all powered by advanced AI.</p>

                    </div>
                    <div className="space-y-8">
                        <div style={{backgroundColor: `var(--bg-white-10)`}} className="p-4 rounded-2xl shadow-lg backdrop-blur-xl">
                            <img src="/website.png" alt="AI representation" className="rounded-lg w-full h-auto" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div style={{backgroundColor: `var(--bg-slate-800)`}} className="bg-opacity-50 p-8 rounded-lg text-center">
                                <h3 style={{color: `var(--primary-color)`}} className="text-6xl font-bold">Instant</h3>
                                <p style={{color: `var(--text-slate-400)`}} className="mt-2">Business Plans</p>
                            </div>
                            <div style={{backgroundColor: `var(--bg-slate-800)`}} className="bg-opacity-50 p-8 rounded-lg flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-lg mb-2">From Idea to Execution.</h4>
                                    <p style={{color: `var(--text-slate-400)`}} className="text-sm">Leverage AI to generate comprehensive business plans, market analysis, and compelling pitch decks for your startup.</p>
                                </div>
                                <button onClick={scrollToTopAndHighlight} style={{color: `var(--primary-color)`}} className="mt-4 text-2xl self-start">→</button> {/* Add onClick */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};