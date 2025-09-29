import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { FileSystem, Message, MessageRole } from '../../types';
import { useDebouncedCallback } from 'use-debounce';
import { Id } from '../../convex/_generated/dataModel';

// Import child components
import { ChatPanel } from './ChatPanel';
import { CodeIDEPanel } from './CodeIDEPanel';
import { PreviewPanel } from './PreviewPanel';
import { SkeletonLoader } from './SkeletonLoader';

// Main Workspace Component
export const SmithWorkspace: React.FC = () => {
  const [view, setView] = useState('preview'); // 'preview' or 'code'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();

  const workspace = useQuery(api.smithWorkspaces.getWorkspace, { id: sessionId as Id<"smithWorkspaces"> });
  const updateFilesMutation = useMutation(api.smithWorkspaces.updateWorkspaceFiles);
  const updateMessagesMutation = useMutation(api.smithWorkspaces.updateWorkspaceMessages);
  const generateCode = useAction(api.gemini.generateCodeChanges);

  const [files, setFiles] = useState<FileSystem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiStatus, setAiStatus] = useState('idle');
  const initialPromptSent = useRef(false);

  const filesRef = useRef(files);
  filesRef.current = files;

  const debouncedUpdateFiles = useDebouncedCallback((newFiles) => {
    if (workspace?._id) {
      updateFilesMutation({ id: workspace._id, files: newFiles });
    }
  }, 1000);

  const debouncedUpdateMessages = useDebouncedCallback((newMessages) => {
    if (workspace?._id) {
      updateMessagesMutation({ id: workspace._id, messages: newMessages });
    }
  }, 1000);

  const sendMessage = async (text: string, displayMessage?: string) => {
    const currentFiles = filesRef.current;
    if (!currentFiles) {
        console.error("sendMessage called with null files");
        return;
    };

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: displayMessage || text };
    
    setMessages(prev => [...prev, userMessage]);
    setAiStatus('thinking');

    try {
              const result = await generateCode({ files: currentFiles, prompt: text });
              const aiMessage: Message = { id: Date.now().toString(), role: 'ai', text: result.chatResponse };
              
              const newFiles: FileSystem = result.files.reduce((acc: FileSystem, file: { path: string, content: string }) => {
                const fileType = file.path.split('.').pop() || 'plaintext';
                acc[file.path] = { content: file.content, type: fileType };
                return acc;
              }, {});
        
              setFiles(newFiles);
              setMessages(prev => [...prev, aiMessage]);    } catch (error) {
        console.error(error);
        const errorMessage: Message = { id: Date.now().toString(), role: 'ai', text: "Sorry, I encountered an error." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setAiStatus('idle');
    }
  };

  useEffect(() => {
    if (workspace) {
      if (!files) {
        setFiles(workspace.files);
      }
      if (messages.length === 0) {
        setMessages(workspace.messages);
      }
    }
  }, [workspace]);

  useEffect(() => {
    if (workspace && files && messages.length === 0 && workspace.prompt && !initialPromptSent.current) {
      initialPromptSent.current = true;
      const ventureName = location.state?.ventureName;
      const displayMessage = ventureName ? `Using context from venture: "${ventureName}"` : workspace.prompt;
      sendMessage(workspace.prompt, displayMessage);
    }
  }, [workspace, files, messages, sendMessage, location.state]);

  useEffect(() => {
    if (files) {
      debouncedUpdateFiles(files);
      setRefreshKey(prev => prev + 1);
    }
  }, [files, debouncedUpdateFiles]);

  useEffect(() => {
    if (messages.length > (workspace?.messages.length || 0)) {
        debouncedUpdateMessages(messages);
    }
  }, [messages, workspace?.messages.length, debouncedUpdateMessages]);

  if (workspace === undefined) {
    return <SkeletonLoader />;
  }

  if (workspace === null || files === null) {
    return <div>Workspace not found or you don't have access.</div>;
  }

  return (
    <div className={`smith-workspace-container ${isFullscreen ? 'fullscreen-preview' : ''}`}>
      <div className="sw-left-panel">
        <ChatPanel 
            messages={messages}
            aiStatus={aiStatus as any}
            onSendMessage={sendMessage}
        />
      </div>

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