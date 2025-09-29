import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './SmithBuild.css';
import '../chatbot/VentureChatbot.css';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SmallSpinner } from './SmallSpinner';
import { useSmithChat } from '../../hooks/useSmithChat';
import { ChatInput } from './ChatInput';
import type { FileSystem } from '@/types';

// =========== STAGE 1: IDEA INPUT VIEW ===========

const IdeaInputView = ({ onBuildStart }: { onBuildStart: (files: FileSystem, prompt: string, chatResponse: string) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const generateFiles = useAction(api.actions.generateInitialFiles);

  const handleBuild = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const result = await generateFiles({ prompt });
      // The Convex action returns a JSON object with files and a chatResponse
      onBuildStart(result.files, prompt, result.chatResponse);
    } catch (error) {
      console.error("Failed to generate initial files via Convex action:", error);
      // Optionally, display an error to the user
      setIsLoading(false);
    }
  };

  return (
    <div className="idea-input-container">
      <h2>Let's build something new.</h2>
      <p>Describe the web app or component you want to create.</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A simple counter button with a display that increments on click."
        rows={5}
      />
      <button onClick={handleBuild} disabled={isLoading}>
        {isLoading ? <SmallSpinner /> : 'Start Building'}
      </button>
    </div>
  );
};

// =========== STAGE 2: WORKSPACE VIEW ===========

const FileExplorer = ({ files, activeFile, onFileSelect }) => (
  <div className="ide-panel file-explorer">
    <div className="ide-panel-header">File Explorer</div>
    <div className="ide-panel-content">
      <ul>
        {Object.keys(files).map(fileName => (
          <li 
            key={fileName} 
            className={fileName === activeFile ? 'active-file' : ''}
            onClick={() => onFileSelect(fileName)}
          >
            📄 {fileName}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const ChatPanel = ({ messages, aiStatus, onSendMessage }: { messages: any[], aiStatus: string, onSendMessage: (prompt: string) => void }) => {
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
                        {m.text}
                    </div>
                ))}
                 {aiStatus === 'streaming' && (
                    <div className="message assistant">
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

const EditorPanel = ({ activeFile, files, onCodeChange }) => {
    if (!activeFile || !files[activeFile]) {
        return <div className="ide-main-panel">Select a file to edit.</div>;
    }

    const getLanguage = (filename) => {
        const extension = filename.split('.').pop();
        switch(extension) {
            case 'js': return 'javascript';
            case 'css': return 'css';
            case 'html': return 'html';
            default: return 'plaintext';
        }
    }

    return (
        <div className="ide-main-panel">
            <Editor
                height="100%"
                language={getLanguage(activeFile)}
                value={files[activeFile].content}
                onChange={onCodeChange}
                theme="vs-dark"
                options={{ minimap: { enabled: false } }}
            />
        </div>
    );
}

const PreviewPanel = ({ fileSystem, refreshKey }) => {
    const [iframeSrc, setIframeSrc] = useState('');

    useEffect(() => {
        const indexHtmlFile = fileSystem['index.html'];
        if (!indexHtmlFile) {
            setIframeSrc('');
            return;
        }

        const blobUrls = new Map();
        const createdUrls = [];

        for (const path in fileSystem) {
            if (path !== 'index.html') {
                const file = fileSystem[path];
                const mimeType = path.endsWith('.css') ? 'text/css' : 'text/javascript';
                const blob = new Blob([file.content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                blobUrls.set(path, url);
                createdUrls.push(url);
            }
        }
        
        let finalHtml = indexHtmlFile.content;
        finalHtml = finalHtml.replace(/(src|href)="([./a-zA-Z0-9_-]+)"/g, (match, attr, path) => {
            if (blobUrls.has(path)) {
                return `${attr}="${blobUrls.get(path)}"`;
            }
            return match;
        });

        const finalBlob = new Blob([finalHtml], { type: 'text/html' });
        const finalUrl = URL.createObjectURL(finalBlob);
        createdUrls.push(finalUrl);

        setIframeSrc(finalUrl);

        return () => {
            createdUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [fileSystem, refreshKey]);

    return (
        <div className="ide-right-panel">
            <iframe
                key={refreshKey}
                src={iframeSrc}
                title="Live Preview"
                className="ide-preview"
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
}

const WorkspaceView = ({ initialFiles, initialPrompt, initialResponse }: { initialFiles: FileSystem, initialPrompt: string, initialResponse: string }) => {
  const [files, setFiles] = useState<FileSystem>(initialFiles);
  const [activeFile, setActiveFile] = useState('index.html');
  const [refreshKey, setRefreshKey] = useState(0);

  const { messages, setMessages, sendMessage, aiStatus } = useSmithChat(files, setFiles);

  // Set initial messages when component mounts
  useEffect(() => {
    setMessages([
        { id: '0', role: 'user', text: initialPrompt },
        { id: '1', role: 'ai', text: initialResponse },
    ]);
  }, [initialPrompt, initialResponse, setMessages]);

  const handleCodeChange = (newCode: string | undefined) => {
    if (!activeFile || newCode === undefined) return;
    setFiles(prevFiles => ({
      ...prevFiles,
      [activeFile]: { ...prevFiles[activeFile], content: newCode },
    }));
  };

  // Trigger a refresh of the preview when files change
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [files]);

  return (
    <div className="workspace-container">
        <div className="workspace-left">
            <ChatPanel 
                messages={messages}
                aiStatus={aiStatus}
                onSendMessage={sendMessage}
            />
        </div>
        <div className="workspace-right">
            <div className="ide-body">
                <FileExplorer files={files} activeFile={activeFile} onFileSelect={setActiveFile} />
                <EditorPanel activeFile={activeFile} files={files} onCodeChange={handleCodeChange} />
                <PreviewPanel fileSystem={files} refreshKey={refreshKey} />
            </div>
        </div>
    </div>
  );
};

// =========== MAIN COMPONENT ===========

export const SmithBuild: React.FC = () => {
  const [stage, setStage] = useState('ideaInput');
  const [initialData, setInitialData] = useState<{ files: FileSystem, prompt: string, chatResponse: string } | null>(null);

  const handleBuildStart = (files: FileSystem, prompt: string, chatResponse: string) => {
    setInitialData({ files, prompt, chatResponse });
    setStage('workspace');
  };

  return (
    <div className="smith-build-container">
      {stage === 'ideaInput' && <IdeaInputView onBuildStart={handleBuildStart} />}
      {stage === 'workspace' && initialData &&
        <WorkspaceView 
            initialFiles={initialData.files} 
            initialPrompt={initialData.prompt} 
            initialResponse={initialData.chatResponse} 
        />}
    </div>
  );
};