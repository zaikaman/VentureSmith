import React, { useState, useEffect, useRef } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import Vapi from '@vapi-ai/web';

import './VentureChatbot.css';

// --- TYPES ---
interface VentureChatbotProps {
  startup: {
    _id: Id<"startups">;
    name?: string;
    [key: string]: any; // Allow any other startup fields
  };
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

// --- MAIN COMPONENT ---
export const VentureChatbot: React.FC<VentureChatbotProps> = ({ startup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Vapi State
  const [vapi] = useState(() => (VAPI_PUBLIC_KEY ? new Vapi(VAPI_PUBLIC_KEY) : null));
  const [isCallActive, setIsCallActive] = useState(false);

  const chatAction = useAction(api.actions.chatWithVentureContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Vapi event listeners
  useEffect(() => {
    if (!vapi) return;
    const onCallStart = () => {
      setIsCallActive(true);
      setMessages(prev => [...prev, { role: 'system', text: 'Voice call started.' }]);
    };
    const onCallEnd = () => {
      setIsCallActive(false);
      setMessages(prev => [...prev, { role: 'system', text: 'Voice call ended.' }]);
    };
    const onError = (e: any) => {
      toast.error(`Vapi Error: ${e.message || 'Unknown error'}`);
      setIsCallActive(false);
    };
    const onMessage = (msg: any) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        const role = msg.role === 'assistant' ? 'assistant' : 'user';
        setMessages(prev => [...prev, { role, text: msg.transcript }]);
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

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // First time opening
      setMessages([
        { role: 'assistant', text: `Hello! I'm your AI assistant for ${startup.name}. How can I help you validate and build your venture today?` }
      ]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const messageHistory = [...messages, userMessage].map(m => `${m.role}: ${m.text}`).join('\n');
      const responseText = await chatAction({ startupId: startup._id, messageHistory });
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (error) {
      console.error("Failed to get chat response:", error);
      toast.error("Sorry, I couldn't get a response. Please try again.");
      setMessages(prev => [...prev, { role: 'system', text: 'Error sending message.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const getVentureContextForVapi = () => {
    const context: { [key: string]: string } = {
        startupName: startup.name || 'Unnamed Venture',
        startupIdea: startup.idea || 'Not yet defined.',
    };

    const fieldsToExclude = [
        '_id',
        '_creationTime',
        '_updateTime',
        'name', // Already handled as startupName
        'idea', // Already handled as startupIdea
    ];

    for (const field in startup) {
        if (startup.hasOwnProperty(field) && !fieldsToExclude.includes(field)) {
            const value = startup[field as keyof typeof startup];
            if (value && typeof value === 'string') {
                context[field] = value;
            } else if (value) {
                context[field] = JSON.stringify(value);
            } else {
                context[field] = 'not generated yet';
            }
        }
    }

    return context;
  };

  const handleCall = () => {
    if (!vapi) return toast.error("Voice services are currently unavailable.");

    if (isCallActive) {
      vapi.stop();
    } else {
      const contextForVapi = getVentureContextForVapi();
      
      let contextString = '';
      for (const [key, value] of Object.entries(contextForVapi)) {
        contextString += `${key}: ${value}\n`;
      }

      const systemPrompt = `You are a helpful assistant for a startup founder. You have been provided with the following context about their venture. Use this information to answer their questions.\n\n--- CONTEXT ---\n${contextString}--- END CONTEXT ---`;

      const assistant = {
        name: "Venture Helper",
        model: {
          provider: 'google' as const,
          model: 'gemini-2.5-flash' as const,
          messages: [
            {
              role: 'system' as const,
              content: systemPrompt,
            },
          ],
        },
        voice: {
          provider: '11labs' as const,
          voiceId: 'paula',
        },
        firstMessage: `Hello! I'm your AI assistant for ${startup.name}. How can I help you validate and build your venture today?`
      };

      vapi.start(assistant);
    }
  };

  return (
    <div className="venture-chatbot-container">
      <div className={`chat-window ${!isOpen ? 'closed' : ''}`}>
        <div className="chat-header">
          <h3>Venture Assistant</h3>
          <div className="chat-header-buttons">
            <button type="button" onClick={handleCall} className={`icon-button call-button ${isCallActive ? 'active' : ''}`} disabled={isSending}>
                <i className={`fas ${isCallActive ? 'fa-stop-circle' : 'fa-phone-alt'}`}></i>
            </button>
            <button onClick={toggleOpen} className="icon-button close-btn"><i className="fas fa-times"></i></button>
          </div>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            msg.role === 'system' ? (
              <div key={index} className="message system-message">{msg.text}</div>
            ) : (
              <div key={index} className={`message ${msg.role}`}>
                {msg.text}
              </div>
            )
          ))}
          {isSending && (
            <div className="message assistant">
              <div className="loading-dots"><span></span><span></span><span></span></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isSending || isCallActive}
            />
            <button type="submit" className="icon-button" disabled={!input.trim() || isSending || isCallActive}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
      <button onClick={toggleOpen} className="chat-bubble">
        <i className={`icon fas ${isOpen ? 'fa-times' : 'fa-comments'}`}></i>
      </button>
    </div>
  );
};
