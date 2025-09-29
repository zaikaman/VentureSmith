import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSmithChat } from '../../hooks/useSmithChat';
import type { FileSystem } from '../../types';

// Import child components
import { ChatPanel } from './ChatPanel';
import { CodeIDEPanel } from './CodeIDEPanel';
import { PreviewPanel } from './PreviewPanel';

// Main Workspace Component
export const SmithWorkspace: React.FC = () => {
  const [view, setView] = useState('preview'); // 'preview' or 'code'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const initialPrompt = location.state?.prompt;

  const [files, setFiles] = useState<FileSystem>({
    'index.html': { content: '<!-- HTML will be generated here -->', type: 'html' },
    'style.css': { content: '/* CSS will be generated here */', type: 'css' },
    'script.js': { content: '// JavaScript will be generated here', type: 'javascript' },
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const { messages, sendMessage, aiStatus } = useSmithChat(files, setFiles);
  const initialPromptSent = useRef(false);

  // Effect to send the initial prompt once
  useEffect(() => {
    if (initialPrompt && !initialPromptSent.current) {
      sendMessage(initialPrompt);
      initialPromptSent.current = true;
    }
  }, [initialPrompt, sendMessage]);

  // Effect to trigger preview refresh when files change
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [files]);

  return (
    <div className={`smith-workspace-container ${isFullscreen ? 'fullscreen-preview' : ''}`}>
      {/* Left Panel: Chat and Logs */}
      <div className="sw-left-panel">
        <ChatPanel 
            messages={messages}
            aiStatus={aiStatus}
            onSendMessage={sendMessage}
        />
      </div>

      {/* Right Panel: Main View with Toggler */}
      <div className="sw-right-panel">
        <div className="sw-view-toggler">
          <button onClick={() => setView('preview')} className={view === 'preview' ? 'active' : ''}>Preview</button>
          <button onClick={() => setView('code')} className={view === 'code' ? 'active' : ''}>Code</button>
        </div>
        <div className="sw-main-view">
          {view === 'preview' ? (
            <PreviewPanel 
              fileSystem={files} 
              refreshKey={refreshKey} 
              isFullscreen={isFullscreen}
              setIsFullscreen={setIsFullscreen}
            />
          ) : (
            <CodeIDEPanel files={files} setFiles={setFiles} />
          )}
        </div>
      </div>
    </div>
  );
};
