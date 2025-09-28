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

  const [vapi] = useState(() => (VAPI_PUBLIC_KEY ? new Vapi(VAPI_PUBLIC_KEY) : null));
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePitchDeck = useAction(api.actions.generatePitchDeck);
  const canProduce = startup.businessPlan;

  useEffect(() => {
    if (startup.pitchDeck) {
      setResult(JSON.parse(startup.pitchDeck));
    }
  }, [startup.pitchDeck]);

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

  // ... (other handlers)

  return (
    <div>
        {isProducing ? (
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
        ) : result ? (
            <div className="presentation-container">
                {/* ... result content ... */}
            </div>
        ) : (
            <InitialTaskView
                title="Generate Your Pitch Deck"
                description="Step into the Director's Room and let our AI produce a professional, 8-10 slide pitch deck complete with a compelling script."
                buttonText="Produce Pitch Deck"
                onAction={handleProduce}
                disabled={!canProduce}
            />
        )}
    </div>
  );
};

export default PitchDeck;