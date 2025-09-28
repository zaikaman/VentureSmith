import React, { useState, useEffect, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { PitchDeckData } from '../../types';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import Vapi from '@vapi-ai/web';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './PitchDeck.css';

// --- PROPS, INTERFACES, HELPERS ---
interface PitchDeckProps {
  startup: {
    _id: Id<"startups">;
    pitchDeck?: string | undefined;
    businessPlan?: string | undefined; // For context
  };
}

interface TranscriptMessage {
    role: 'user' | 'assistant';
    text: string;
}

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_INVESTOR_ASSISTANT_ID = import.meta.env.VITE_VAPI_INVESTOR_ASSISTANT_ID;

const cleanText = (text: string | undefined) => text ? String(text).replace(/\*/g, '') : '';

// --- MAIN COMPONENT ---
const PitchDeck: React.FC<PitchDeckProps> = ({ startup }) => {
  const [isProducing, setIsProducing] = useState(false);
  const [result, setResult] = useState<PitchDeckData | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const teleprompterRef = useRef<HTMLDivElement>(null);

  // State for Vapi and PDF export
  const [vapi] = useState(() => (VAPI_PUBLIC_KEY ? new Vapi(VAPI_PUBLIC_KEY) : null));
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePitchDeck = useAction(api.actions.generatePitchDeck);
  const canProduce = startup.businessPlan;

  // Main data loading effect
  useEffect(() => {
    if (startup.pitchDeck) {
      setResult(JSON.parse(startup.pitchDeck));
    }
  }, [startup.pitchDeck]);

  // Vapi event listeners effect
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
    };
  }, [vapi]);

  // Scroll transcript effect
  useEffect(() => {
    if (teleprompterRef.current) {
        teleprompterRef.current.scrollTop = teleprompterRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleProduce = async () => {
    if (!canProduce) { toast.error("Business Plan must be generated first."); return; }
    setIsProducing(true);
    setResult(null);
    try {
      const produceResult = await generatePitchDeck({ startupId: startup._id });
      setTimeout(() => {
        setResult(produceResult);
        setActiveSlide(0);
        setIsProducing(false);
      }, 4000);
    } catch (err: any) {
      toast.error("Failed to produce pitch deck.");
      setIsProducing(false);
    }
  };

  const handleListen = async () => {
    if (!vapi || !result) return;
    if (isCallActive) vapi.stop();
    else vapi.start({ model: { provider: "openai", model: "gpt-3.5-turbo", messages: [{ role: "system", content: "You are a voice assistant. Read the following pitch script clearly and professionally." }] }, voice: { provider: "11labs", voiceId: "burt" }, firstMessage: cleanText(result.script) });
  };

  const handleSimulation = async () => {
    if (!vapi || !VAPI_INVESTOR_ASSISTANT_ID) { toast.error("Investor Simulation is not configured."); return; }
    if (isCallActive) { vapi.stop(); }
    else {
      setTranscript([]);
      setIsSimulating(true);
      vapi.start(VAPI_INVESTOR_ASSISTANT_ID);
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    toast.info("Preparing PDF... This may take a moment.");
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
    const slideElements = document.querySelectorAll('.pdf-slide-render');
    for (let i = 0; i < slideElements.length; i++) {
        const slideElement = slideElements[i] as HTMLElement;
        const canvas = await html2canvas(slideElement, { scale: 2 });
        if (i > 0) pdf.addPage([1920, 1080], 'landscape');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    }
    pdf.save("pitch-deck.pdf");
    setIsExporting(false);
    toast.success("PDF exported successfully!");
  };

  // RENDER LOGIC
  if (isProducing) {
    return (
        <div className="directors-room-container">
            <div className="screen">
                <div className="film-leader"></div>
                <div className="render-bars">
                    {[...Array(10)].map((_, i) => <div key={i} className="render-bar" style={{animationDelay: `${i * 0.1}s`}}></div>)}
                </div>
            </div>
            <div className="mobile-spinner"></div>
            <div className="production-status-text">PRODUCING PITCH DECK...</div>
        </div>
    );
  }

  if (result) {
    const { script, slides } = result;
    const currentSlide = slides[activeSlide];
    const goToNextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
    const goToPrevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="presentation-container">
            {/* Hidden div for PDF rendering */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {slides.map((slide, index) => (
                    <div key={index} className="pdf-slide-render pdf-slide-render-style">
                        <h3>{cleanText(slide.title)}</h3>
                        <div><ReactMarkdown>{cleanText(slide.content)}</ReactMarkdown></div>
                    </div>
                ))}
            </div>

            <TaskResultHeader title="Pitch Deck" onRegenerate={handleProduce} />
            <div className="presentation-layout">
                <div className="slide-viewer">
                    <div className="slide-display">
                        <h3 className="slide-title">{cleanText(currentSlide.title)}</h3>
                        <div className="slide-body"><ReactMarkdown>{cleanText(currentSlide.content)}</ReactMarkdown></div>
                    </div>
                    <div className="slide-controls">
                        <button onClick={goToPrevSlide}>&larr; Previous</button>
                        <span>{activeSlide + 1} / {slides.length}</span>
                        <button onClick={goToNextSlide}>Next &rarr;</button>
                    </div>
                </div>
                <div className="teleprompter">
                    {isSimulating ? (
                        <>
                            <h4>Investor Q&A</h4>
                            <div ref={teleprompterRef} className="script-content transcript">
                                {transcript.map((msg, i) => <p key={i}><strong>{msg.role === 'assistant' ? 'Investor' : 'You'}:</strong> {msg.text}</p>)}
                            </div>
                        </>
                    ) : (
                        <>
                            <h4>Teleprompter</h4>
                            <div ref={teleprompterRef} className="script-content">
                                <p>{cleanText(script)}</p>
                            </div>
                        </>
                    )}
                    <div className="teleprompter-actions">
                        {error && <p className="error-message">{error}</p>}
                        <button onClick={handleListen} disabled={isSimulating} className="action-button">{isCallActive && !isSimulating ? 'Stop Listening' : 'Listen to Pitch'}</button>
                        <button onClick={handleSimulation} className="action-button">{isCallActive && isSimulating ? 'Stop Simulation' : 'Start Investor Q&A'}</button>
                        <button onClick={handleExportPDF} disabled={isExporting || isCallActive} className="action-button">{isExporting ? 'Exporting...' : 'Export Slides to PDF'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <InitialTaskView
        title="Generate Your Pitch Deck"
        description="Step into the Director's Room and let our AI produce a professional, 8-10 slide pitch deck complete with a compelling script."
        buttonText="Produce Pitch Deck"
        onAction={handleProduce}
        disabled={!canProduce}
    />
  );
};

export default PitchDeck;
