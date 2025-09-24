
import React, { useState } from 'react';

interface IdeaInputFormProps {
    onGenerate: (idea: string) => void;
}

export const IdeaInputForm: React.FC<IdeaInputFormProps> = ({ onGenerate }) => {
    const [idea, setIdea] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) {
            onGenerate(idea);
        }
    };

    const placeholderExamples = [
        "An AI app to help students find part-time jobs by matching skills to listings.",
        "A platform for local artists to sell their work using NFTs.",
        "A subscription box for eco-friendly home cleaning products.",
        "A mobile game that teaches coding concepts through puzzles."
    ];

    return (
        <div className="text-center p-8 transition-all duration-500 ease-in-out">
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto">
                Turn your brilliant idea into a comprehensive startup plan in minutes. Just type your concept below.
            </p>
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : 'scale-100'}`}>
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={`e.g., "${placeholderExamples[Math.floor(Math.random() * placeholderExamples.length)]}"`}
                        className="w-full h-32 p-4 text-lg bg-slate-800 border-2 border-slate-700 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none transition-all duration-300 resize-none text-slate-100"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!idea.trim()}
                    className="mt-8 inline-flex items-center gap-3 text-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 py-4 px-10 rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.5 21.75l-.398-1.188a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.188-.398a2.25 2.25 0 001.423-1.423L16.5 15.75l.398 1.188a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.188.398a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    Build My Startup
                </button>
            </form>
        </div>
    );
};