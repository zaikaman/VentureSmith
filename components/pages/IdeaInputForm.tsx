import React, { useState } from 'react';

interface IdeaInputFormProps {
    onGenerate: (idea: string) => void;
}

export const IdeaInputForm: React.FC<IdeaInputFormProps> = ({ onGenerate }) => {
    const [idea, setIdea] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) {
            onGenerate(idea);
        }
    };

    const placeholderExamples = [
        "An AI app to help students find part-time jobs...",
        "A platform for local artists to sell their work...",
        "A subscription box for eco-friendly products...",
        "A mobile game that teaches coding..."
    ];

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder={`e.g., "${placeholderExamples[Math.floor(Math.random() * placeholderExamples.length)]}"`}
                    className="w-full p-5 text-lg bg-[var(--bg-slate-900)] border border-[var(--border-slate-700)] rounded-full focus:ring-2 focus:ring-[var(--primary-color)]/50 focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300 text-[var(--text-slate-200)] pr-32"
                />
                <button
                    type="submit"
                    disabled={!idea.trim()}
                    className="build-page-button absolute top-1/2 right-2 transform -translate-y-1/2 text-md font-semibold py-3 px-6 rounded-full hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    Build
                </button>
            </div>
        </form>
    );
};