import React, { useState, useEffect, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import Vapi from '@vapi-ai/web';

import { InitialTaskView } from './InitialTaskView';
import { TaskResultHeader } from './TaskResultHeader';
import './AIPitchCoach.css';

// --- TYPES ---
interface AIPitchCoachProps {
  startup: {
    _id: Id<"startups">;
    name?: string;
    businessPlan?: string;
    pitchDeck?: string;
    aiPitchCoach?: string;
  };
}

interface FeedbackPoint {
  feedback: string;
  isPositive: boolean;
}

interface FeedbackCategory {
  category: string;
  icon: string;
  points: FeedbackPoint[];
}

interface PitchCoachResult {
  overallScore: number;
  feedback: FeedbackCategory[];
  bodyLanguageTips: string[];
  vapiAssistantPrompt: string;
}

interface TranscriptMessage {
    role: 'user' | 'assistant';
    text: string;
}

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

const loadingTexts = [
    "Analyzing pitch structure...",
    "Evaluating clarity and impact...",
    "Assessing storytelling elements...",
    "Generating delivery feedback...",
    "Compiling personalized coaching tips...",
];

// --- MAIN COMPONENT ---
const AIPitchCoach: React.FC<AIPitchCoachProps> = ({ startup }) => {
  const [isProducing, setIsProducing] = useState(false);
  const [result, setResult] = useState<PitchCoachResult | null>(null);
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  // Vapi State
  const [vapi] = useState(() => (VAPI_PUBLIC_KEY ? new Vapi(VAPI_PUBLIC_KEY) : null));
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const generatePitchCoachAnalysis = useAction(api.actions.generatePitchCoachAnalysis);
  const canProduce = startup.businessPlan && startup.pitchDeck;

  useEffect(() => {
    if (startup.aiPitchCoach) {
      try {
        setResult(JSON.parse(startup.aiPitchCoach));
      } catch (error) {
        console.error("Failed to parse AI Pitch Coach data:", error);
        toast.error("Failed to load existing pitch coach analysis.");
      }
    }
  }, [startup.aiPitchCoach]);

  useEffect(() => {
    if (isProducing) {
      const interval = setInterval(() => {
        setCurrentLoadingText(prev => {
          const currentIndex = loadingTexts.indexOf(prev);
          return loadingTexts[(currentIndex + 1) % loadingTexts.length];
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isProducing]);

  useEffect(() => {
    if (!vapi) return;
    const onCallStart = () => setIsCallActive(true);
    const onCallEnd = () => setIsCallActive(false);
    const onError = (e: any) => {
      toast.error(`Vapi Error: ${e.message || 'Unknown error'}`);
      setIsCallActive(false);
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
    };
  }, [vapi]);

  useEffect(() => {
    if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleProduce = async () => {
    if (!canProduce) {
      toast.error("Business Plan and Pitch Deck must be generated first.");
      return;
    }
    setIsProducing(true);
    setResult(null);
    try {
      const produceResult = await generatePitchCoachAnalysis({ startupId: startup._id });
      // Artificial delay for animation
      setTimeout(() => {
        setResult(produceResult);
        setIsProducing(false);
      }, 4000);
    } catch (err: any) {
      toast.error(`Failed to generate analysis: ${err.message}`);
      setIsProducing(false);
    }
  };

  const handlePractice = () => {
    if (!vapi || !result) return;
    if (isCallActive) {
      vapi.stop();
    } else {
      setTranscript([]);
      const pitchDeckData = startup.pitchDeck ? JSON.parse(startup.pitchDeck) : null;
      const pitchScript = pitchDeckData?.script || "I don't have a script to practice with yet.";
      const startupName = startup.name || 'your startup';
      
      vapi.start({
        model: {
          provider: "google",
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: result.vapiAssistantPrompt },
            { role: "system", content: `Here is the user's pitch script for context: "${pitchScript}"` }
          ]
        },
        voice: {
          provider: "11labs",
          voiceId: "burt"
        },
        name: `Pitch Coach for ${startupName}`,
        firstMessage: "Welcome to the practice room. I'm ready to listen to your pitch whenever you're ready to begin."
      });
    }
  };

  if (isProducing) {
    return (
      <div className="pitch-coach-loading-container">
        <div className="sound-wave-container">
          {[...Array(7)].map((_, i) => <div key={i} className="wave-bar"></div>)}
        </div>
        <p className="loading-status-text">{currentLoadingText}</p>
      </div>
    );
  }

  if (result) {
    const score = result.overallScore;
    const scoreAngle = (score / 100) * 360;
    let scoreColor = '#f87171'; // Red
    if (score > 75) {
      scoreColor = '#4ade80'; // Green
    } else if (score > 50) {
      scoreColor = '#facc15'; // Yellow
    }

    return (
      <div className="pitch-coach-container">
        <TaskResultHeader title="AI Pitch Coach Analysis" onRegenerate={handleProduce} />
        <div className="pitch-coach-result-layout">
          <div className="feedback-main-panel">
            <div 
              className="overall-score-card" 
              style={{
                '--score-angle': `${scoreAngle}deg`,
                '--score-color': scoreColor
              } as React.CSSProperties}
            >
              <h3>Overall Pitch Score</h3>
              <div className="score">{result.overallScore}</div>
              <p>Based on clarity, impact, and delivery potential.</p>
            </div>
            {result.feedback.map(category => (
              <div key={category.category} className="feedback-category">
                <h4 className="feedback-category-header">
                  <i className={category.icon}></i> {category.category}
                </h4>
                {category.points.map((point, index) => (
                  <div key={index} className="feedback-point">
                    <span className="icon">
                      <i className={point.isPositive ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'}></i>
                    </span>
                    <p>{point.feedback}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sidebar-panel">
            <div className="sidebar-card body-language">
              <h4><i className="fas fa-walking"></i> Body Language</h4>
              <ul>
                {result.bodyLanguageTips.map((tip, index) => (
                  <li key={index}><i className="fas fa-dot-circle"></i><p>{tip}</p></li>
                ))}
              </ul>
            </div>
            <div className="sidebar-card practice-room">
              <h4><i className="fas fa-headset"></i> Practice Room</h4>
              <p>Ready to practice your pitch live? Our AI coach is here to listen and help.</p>
              <button 
                onClick={handlePractice} 
                className={`action-button ${isCallActive ? 'stop-practice' : 'start-practice'}`}
              >
                <i className={`fas ${isCallActive ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
                {isCallActive ? 'Stop Practice' : 'Start Live Practice'}
              </button>
              {transcript.length > 0 && (
                <div ref={transcriptRef} className="practice-transcript">
                  {transcript.map((msg, i) => (
                    <p key={i}><strong>{msg.role === 'assistant' ? 'Coach' : 'You'}:</strong> {msg.text}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InitialTaskView
      title="AI Pitch Coach"
      description={
        <>
          Receive expert feedback on your pitch and practice live with an AI coach. We'll analyze your pitch deck script to give you actionable insights on content, structure, and delivery.
          {!canProduce && <p className="disabled-reason-text">Please generate your Business Plan and Pitch Deck first.</p>}
        </>
      }
      buttonText="Start Analysis"
      onAction={handleProduce}
      disabled={!canProduce}
    />
  );
};

export default AIPitchCoach;
