import React, { useState, useEffect, useRef } from 'react';
import { PitchDeckData } from '../../types';
import ReactMarkdown from 'react-markdown';
import Vapi from '@vapi-ai/web';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PitchDeckProps {
    data: PitchDeckData;
}

interface TranscriptMessage {
    role: 'user' | 'assistant';
    text: string;
}

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_INVESTOR_ASSISTANT_ID = import.meta.env.VITE_VAPI_INVESTOR_ASSISTANT_ID;

const MissingVapiKeys: React.FC = () => (
    <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-lg">
        <p className="font-bold">Vapi Configuration is Incomplete.</p>
        <p className="text-sm">Please ensure VITE_VAPI_PUBLIC_KEY and VITE_VAPI_INVESTOR_ASSISTANT_ID are set in your .env file.</p>
    </div>
);

export const PitchDeck: React.FC<PitchDeckProps> = ({ data }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [vapi] = useState(() => (VAPI_PUBLIC_KEY ? new Vapi(VAPI_PUBLIC_KEY) : null));
    const [isCallActive, setIsCallActive] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const chatboxRef = useRef<HTMLDivElement>(null);

    const { script, slides } = data;

    useEffect(() => {
        if (!vapi) return;

        const onCallStart = () => {
            setIsCallActive(true);
            setError(null);
        }
        const onCallEnd = () => {
            setIsCallActive(false);
            setIsSimulating(false); // Ensure simulation state is reset
        };
        const onError = (e: any) => {
            setError(`Vapi Error: ${e.message || 'Unknown error'}`);
            setIsCallActive(false);
            setIsSimulating(false);
        };
        const onMessage = (msg: any) => {
            if (msg.type === 'transcript' && msg.transcriptType === 'final') {
                setTranscript(prev => [...prev, { role: msg.role, text: msg.transcript }]);
            }
        };

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('error', onError);
        vapi.on('message', onMessage);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('error', onError);
            vapi.off('message', onMessage);
            if (isCallActive) {
                vapi.stop();
            }
        };
    }, [vapi, isCallActive]);

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [transcript]);

    const handleListen = async () => {
        if (!vapi) {
            setError("Vapi is not configured. Check your API key.");
            return;
        }
        if (isCallActive) {
            vapi.stop();
        } else {
            try {
                await vapi.start({
                    model: {
                        provider: "openai",
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "system", content: "You are a voice assistant. Read the following pitch script clearly and professionally." }],
                    },
                    voice: {
                        provider: "11labs",
                        voiceId: "burt",
                    },
                    firstMessage: script,
                });
            } catch (e: any) {
                console.error("Failed to start Vapi call:", e);
                setError(`Failed to start call: ${e.message}`);
            }
        }
    };

    const handleSimulation = async () => {
        if (!vapi || !VAPI_INVESTOR_ASSISTANT_ID) {
            setError("Investor Simulation is not configured. Check your VAPI_INVESTOR_ASSISTANT_ID.");
            return;
        }
        if (isCallActive) {
            vapi.stop();
            setIsSimulating(false);
        } else {
            setTranscript([]); // Clear previous transcript
            setIsSimulating(true);
            try {
                await vapi.start(VAPI_INVESTOR_ASSISTANT_ID);
            } catch (e: any) {
                console.error("Failed to start Vapi simulation:", e);
                setError(`Failed to start simulation: ${e.message}`);
                setIsSimulating(false);
            }
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1920, 1080]
        });
        const slideElements = document.querySelectorAll('.pdf-slide-render');
        for (let i = 0; i < slideElements.length; i++) {
            const slideElement = slideElements[i] as HTMLElement;
            const canvas = await html2canvas(slideElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            if (i > 0) pdf.addPage([1920, 1080], 'landscape');
            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        }
        pdf.save("pitch-deck.pdf");
        setIsExporting(false);
    };

    const goToNextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
    const goToPrevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const currentSlide = slides[activeSlide];

    if (!VAPI_PUBLIC_KEY || !VAPI_INVESTOR_ASSISTANT_ID || !vapi) {
        return <MissingVapiKeys />;
    }

    return (
        <div>
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {slides.map((slide, index) => (
                    <div key={index} className="pdf-slide-render" style={{ width: '1920px', height: '1080px', backgroundColor: '#1E293B' }}>
                        <div className="w-full h-full flex flex-col justify-center items-center p-16">
                            <h3 className="text-7xl font-bold text-center text-purple-400 mb-8">{slide.title}</h3>
                            <div className="prose prose-2xl prose-invert text-center text-gray-300"><ReactMarkdown>{slide.content}</ReactMarkdown></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[var(--bg-slate-900)]/50 p-6 rounded-lg border border-[var(--border-slate-700)]">
                    <div className="aspect-video bg-[var(--bg-slate-800)] rounded-md flex flex-col justify-center items-center p-8 mb-4 shadow-inner">
                        <h3 className="text-3xl font-bold text-center text-[var(--primary-color)] mb-4">{currentSlide.title}</h3>
                        <div className="prose prose-invert text-center text-lg text-[var(--text-slate-300)]"><ReactMarkdown>{currentSlide.content}</ReactMarkdown></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <button onClick={goToPrevSlide} className="px-4 py-2 bg-[var(--bg-slate-700)] rounded-md hover:bg-[var(--bg-slate-600)] transition-colors">Previous</button>
                        <span className="text-sm text-[var(--text-slate-400)]">Slide {activeSlide + 1} of {slides.length}</span>
                        <button onClick={goToNextSlide} className="px-4 py-2 bg-[var(--bg-slate-700)] rounded-md hover:bg-[var(--bg-slate-600)] transition-colors">Next</button>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-[var(--bg-slate-900)]/50 p-6 rounded-lg border border-[var(--border-slate-700)] flex flex-col">
                    {isSimulating ? (
                        <>
                            <h3 className="text-xl font-bold text-[var(--primary-color)] mb-4">Investor Q&A</h3>
                            <div ref={chatboxRef} className="flex-grow overflow-y-auto p-4 bg-[var(--bg-slate-800)] rounded-md mb-4 h-64">
                                {transcript.map((msg, index) => (
                                    <div key={index} className={`mb-2 p-2 rounded-lg ${msg.role === 'assistant' ? 'bg-purple-500/20 text-left' : 'bg-blue-500/20 text-right'}`}>
                                        <p className={`text-sm font-bold ${msg.role === 'assistant' ? 'text-purple-300' : 'text-blue-300'}`}>{msg.role === 'assistant' ? 'Investor' : 'You'}</p>
                                        <p className="text-white">{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-[var(--primary-color)] mb-4">Pitch Script</h3>
                            <div className="flex-grow overflow-y-auto p-4 bg-[var(--bg-slate-800)] rounded-md mb-4">
                                <p className="whitespace-pre-line leading-relaxed text-[var(--text-slate-300)]">{script}</p>
                            </div>
                        </>
                    )}
                    {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleListen}
                            disabled={isSimulating}
                            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-3 ${isCallActive && !isSimulating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                            {isCallActive && !isSimulating ? 'Stop Listening' : 'Listen to Pitch'}
                        </button>
                        <button
                            onClick={handleSimulation}
                            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-3 ${isCallActive && isSimulating ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
                            {isCallActive && isSimulating ? 'Stop Simulation' : 'Start Investor Q&A'}
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting || isCallActive}
                            className="w-full py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isExporting ? 'Exporting...' : 'Export to PDF'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};