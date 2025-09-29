import React, { useEffect, useRef } from 'react';
import { ChatInput } from './ChatInput';
import type { Message } from '../../types';

interface ChatPanelProps {
  messages: Message[];
  aiStatus: string;
  onSendMessage: (prompt: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, aiStatus, onSendMessage }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-panel">
            <div className="chat-messages" ref={chatContainerRef}>
                {messages.map(m => (
                    <div key={m.id} className={`message ${m.role}`}>
                        {/* This is a simple version, we can enhance this later to render code changes etc. */}
                        {m.text}
                    </div>
                ))}
                 {aiStatus === 'streaming' && (
                    <div className="message ai">
                        <div className="loading-dots"><span></span><span></span><span></span></div>
                    </div>
                )}
            </div>
            <ChatInput 
                onSendMessage={onSendMessage} 
                isLoading={aiStatus === 'thinking' || aiStatus === 'streaming'} 
            />
        </div>
    );
}