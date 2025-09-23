
import React, { useState } from 'react';
import { PitchDeckData } from '../types';

interface PitchDeckProps {
    data: PitchDeckData;
}

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1H8zm4 0a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1h-1z" clipRule="evenodd" />
    </svg>
);


export const PitchDeck: React.FC<PitchDeckProps> = ({ data }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        // This is a simulation, so we just toggle the state
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">AI Voice Pitch Deck</h2>
            <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-700 space-y-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-colors shadow-lg"
                        aria-label={isPlaying ? 'Pause pitch' : 'Play pitch'}
                    >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <div>
                        <h3 className="text-xl font-bold text-white">AI CEO Pitch</h3>
                        <p className="text-slate-400">Duration: ~1 minute</p>
                    </div>
                </div>
                
                <div className="border-t border-slate-700 pt-6">
                    <h4 className="text-lg font-semibold text-indigo-400 mb-3">Pitch Script:</h4>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed italic">{data.script}</p>
                </div>
            </div>
        </div>
    );
};
