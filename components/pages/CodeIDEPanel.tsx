import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import type { FileSystem } from '../../types';

// FileExplorer component, defined in the same file for now
const FileExplorer = ({ files, activeFile, onFileSelect }: { files: FileSystem, activeFile: string, onFileSelect: (fileName: string) => void }) => (
  <div className="file-explorer ide-panel">
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
