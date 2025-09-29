import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import type { FileSystem } from '../../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// FileExplorer component, defined in the same file for now
const FileExplorer = ({ files, activeFile, onFileSelect }: { files: FileSystem, activeFile: string, onFileSelect: (fileName: string) => void }) => {
  const handleDownload = () => {
    const zip = new JSZip();
    Object.keys(files).forEach(fileName => {
      zip.file(fileName, files[fileName].content);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, 'VentureSmith-Project.zip');
    });
  };

  return (
    <div className="file-explorer ide-panel">
      <div className="ide-panel-header">
        <span>File Explorer</span>
        <button onClick={handleDownload} className="download-btn" title="Download as ZIP">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15L12 3M12 15L8 11M12 15L16 11M4 17L4 21L20 21L20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
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
};

// EditorPanel component, defined in the same file for now
const EditorPanel = ({ activeFile, files, onCodeChange }: { activeFile: string | null, files: FileSystem, onCodeChange: (code: string | undefined) => void }) => {
    if (!activeFile || !files[activeFile]) {
        return <div className="ide-main-panel">Select a file to edit.</div>;
    }

    const getLanguage = (filename: string) => {
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


// Main CodeIDEPanel component
interface CodeIDEPanelProps {
    files: FileSystem;
    setFiles: React.Dispatch<React.SetStateAction<FileSystem>>;
}

export const CodeIDEPanel: React.FC<CodeIDEPanelProps> = ({ files, setFiles }) => {
    const [activeFile, setActiveFile] = useState<string | null>('index.html');

    const handleCodeChange = (newCode: string | undefined) => {
        if (!activeFile || newCode === undefined) return;
        setFiles(prevFiles => ({
          ...prevFiles,
          [activeFile]: { ...prevFiles[activeFile], content: newCode },
        }));
    };

    return (
        <div className="ide-body">
            <FileExplorer files={files} activeFile={activeFile || ''} onFileSelect={setActiveFile} />
            <EditorPanel activeFile={activeFile} files={files} onCodeChange={handleCodeChange} />
        </div>
    );
};
