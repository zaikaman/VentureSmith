import React, { useState, useRef, useEffect } from 'react';

interface IdeaInputFormProps {
    onGenerate: (idea: string) => void;
    initialIdea?: string;
}

export const IdeaInputForm: React.FC<IdeaInputFormProps> = ({ onGenerate, initialIdea = '' }) => {
    const [idea, setIdea] = useState(initialIdea);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        setIdea(initialIdea);
    }, [initialIdea]);

    useEffect(() => {
        adjustHeight();
    }, [idea]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) {
            onGenerate(idea);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const placeholderExamples = [
        "AI app to help students find part-time jobs...",
        "A platform for artists to sell their work...",
        "A subscription box for eco products...",
        "A mobile game that teaches coding..."
    ];

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="relative flex items-end">
                <textarea
                    ref={textareaRef}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`e.g., "${placeholderExamples[Math.floor(Math.random() * placeholderExamples.length)]}"`}
                    className="w-full p-4 text-lg bg-[var(--bg-slate-900)] border border-[var(--border-slate-700)] rounded-2xl focus:ring-2 focus:ring-[var(--primary-color)]/50 focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300 text-[var(--text-slate-200)] pr-24 resize-none overflow-y-hidden"
                    rows={1}
                />
                <button
                    type="submit"
                    disabled={!idea.trim()}
                    className="build-page-button absolute top-1/2 right-3 transform -translate-y-1/2 text-md font-semibold py-2 px-4 rounded-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    Build
                </button>
            </div>
        </form>
    );
};