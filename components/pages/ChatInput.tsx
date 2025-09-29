import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 200;
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [prompt]);

  const handleSend = () => {
    if (isLoading || !prompt.trim()) return;
    onSendMessage(prompt);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-area">
        <div className="chat-input-form"> 
            <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for a change..."
                rows={1}
                disabled={isLoading}
            />
            <button type="button" onClick={handleSend} className="icon-button" disabled={isLoading || !prompt.trim()}>
                <i className="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
  );
};