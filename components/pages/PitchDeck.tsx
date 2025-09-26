import React, { useState, useEffect, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { PitchDeckData } from '../../types';
import ReactMarkdown from 'react-markdown';
import Vapi from '@vapi-ai/web';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PitchDeck.css';

interface PitchDeckProps {
  startup: {
    _id: Id<"startups">;
    idea?: string | undefined;
    pitchDeck?: string | undefined;
  };
}

interface TranscriptMessage {
    role: 'user' | 'assistant';
    text: string;
}

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_INVESTOR_ASSISTANT_ID = import.meta.env.VITE_VAPI_INVESTOR_ASSISTANT_ID;

const cleanText = (text: string) => {
    return text ? String(text).replace(/\*/g, '') : '';
};

const MissingVapiKeys: React.FC = () => (
    <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-lg">
        <p className="font-bold">Vapi Configuration is Incomplete.</p>
        <p className="text-sm">Please ensure VITE_VAPI_PUBLIC_KEY and VITE_VAPI_INVESTOR_ASSISTANT_ID are set in your .env file.</p>
    </div>
);

const PitchDeck: React.FC<PitchDeckProps> = ({ startup }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [pitchDeckData, setPitchDeckData] = useState<PitchDeckData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const generatePitchDeck = useAction(api.actions.generatePitchDeck);

    const [activeSlide, setActiveSlide] = useState(0);
    const [vapi] = useState(() => (VAPI_PUBLIC_KEY ? new Vapi(VAPI_PUBLIC_KEY) : null));
    const [isCallActive, setIsCallActive] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const chatboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (startup.pitchDeck) {
            try {
                setPitchDeckData(JSON.parse(startup.pitchDeck));
            } catch (e) {
                console.error("Failed to parse pitch deck data:", e);
                setError("Failed to load existing pitch deck data.");
            }
        }
    }, [startup.pitchDeck]);

    const handleGenerate = async () => {
        if (!startup.idea) {
            setError("Initial idea is missing.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generatePitchDeck({
                startupId: startup._id,
                idea: startup.idea,
            });
            setPitchDeckData(result);
        } catch (err: any) {
            setError("Failed to generate pitch deck. Please try again.");
            console.error("Error generating pitch deck:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (!vapi) return;

        const onCallStart = () => { setIsCallActive(true); setError(null); };
        const onCallEnd = () => { setIsCallActive(false); setIsSimulating(false); };
        const onError = (e: any) => { setError(`Vapi Error: ${e.message || 'Unknown error'}`); setIsCallActive(false); setIsSimulating(false); };
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
            if (isCallActive) vapi.stop();
        };
    }, [vapi, isCallActive]);

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [transcript]);

    const handleListen = async () => {
        if (!vapi || !pitchDeckData) { setError("Vapi is not configured or pitch deck data is missing."); return; }
        if (isCallActive) vapi.stop();
        else {
            try {
                await vapi.start({ model: { provider: "openai", model: "gpt-3.5-turbo", messages: [{ role: "system", content: "You are a voice assistant. Read the following pitch script clearly and professionally." }] }, voice: { provider: "11labs", voiceId: "burt" }, firstMessage: cleanText(pitchDeckData.script) });
            } catch (e: any) { console.error("Failed to start Vapi call:", e); setError(`Failed to start call: ${e.message}`); }
        }
    };

    const handleSimulation = async () => {
        if (!vapi || !VAPI_INVESTOR_ASSISTANT_ID) { setError("Investor Simulation is not configured."); return; }
        if (isCallActive) { vapi.stop(); setIsSimulating(false); }
        else {
            setTranscript([]);
            setIsSimulating(true);
            try {
                await vapi.start(VAPI_INVESTOR_ASSISTANT_ID);
            } catch (e: any) { console.error("Failed to start Vapi simulation:", e); setError(`Failed to start simulation: ${e.message}`); setIsSimulating(false); }
        }
    };

    const handleExportPDF = async () => {
        if (!pitchDeckData) return;
        setIsExporting(true);
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
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

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="spinner"></div>
                <p className="mt-6 text-xl font-semibold animate-pulse">
                    AI is building your professional pitch deck...
                </p>
            </div>
        );
    }

    if (!pitchDeckData) {
        return (
            <div className="text-center p-12">
                <h3 className="text-3xl font-bold mb-4">Generate Your Pitch Deck</h3>
                <p className="text-slate-300 mb-8 max-w-3xl mx-auto">
                    Let our AI create a compelling 8-10 slide pitch deck for your startup, complete with a 1-minute pitch script.
                </p>
                <button onClick={handleGenerate} className="cta-button">
                    Generate Pitch Deck
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        );
    }

    const { script, slides } = pitchDeckData;
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
                    <div key={index} className="pdf-slide-render">
                        <h3>{cleanText(slide.title)}</h3>
                        <div><ReactMarkdown>{cleanText(slide.content)}</ReactMarkdown></div>
                    </div>
                ))}
            </div>

            <div className="pitch-deck-grid">
                <div className="slide-viewer">
                    <div className="slide-content-container">
                        <h3 className="slide-title">{cleanText(currentSlide.title)}</h3>
                        <div className="slide-body"><ReactMarkdown>{cleanText(currentSlide.content)}</ReactMarkdown></div>
                    </div>
                    <div className="slide-controls">
                        <button onClick={goToPrevSlide} className="slide-nav-button">Previous</button>
                        <span className="slide-counter">Slide {activeSlide + 1} of {slides.length}</span>
                        <button onClick={goToNextSlide} className="slide-nav-button">Next</button>
                    </div>
                </div>

                <div className="sidebar">
                    {isSimulating ? (
                        <>
                            <h3 className="sidebar-title">Investor Q&A</h3>
                            <div ref={chatboxRef} className="transcript-viewer">
                                {transcript.map((msg, index) => (
                                    <div key={index} className={`transcript-message ${msg.role}`}>
                                        <p className={`message-role ${msg.role}`}>{msg.role === 'assistant' ? 'Investor' : 'You'}</p>
                                        <p className="message-text">{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="sidebar-title">Pitch Script</h3>
                            <div className="script-viewer">
                                <p className="script-text">{cleanText(script)}</p>
                            </div>
                        </>
                    )}
                    {error && <p className="error-message">{error}</p>}
                    <div className="sidebar-actions">
                        <button onClick={handleListen} disabled={isSimulating} className={`sidebar-button ${isCallActive && !isSimulating ? 'stop-button' : 'listen-button'}`}>
                            {isCallActive && !isSimulating ? 'Stop Listening' : 'Listen to Pitch'}
                        </button>
                        <button onClick={handleSimulation} className={`sidebar-button ${isCallActive && isSimulating ? 'stop-button' : 'qa-button'}`}>
                            {isCallActive && isSimulating ? 'Stop Simulation' : 'Start Investor Q&A'}
                        </button>
                        <button onClick={handleExportPDF} disabled={isExporting || isCallActive} className="sidebar-button export-button">
                            {isExporting ? 'Exporting...' : 'Export Slides to PDF'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PitchDeck;
