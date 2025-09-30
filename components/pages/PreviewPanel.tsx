import React, { useState, useEffect } from 'react';
import type { FileSystem } from '../../types';

interface PreviewPanelProps {
  fileSystem: FileSystem;
  refreshKey: number;
  isFullscreen: boolean;
  setIsFullscreen: (isToggled: boolean) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ fileSystem, refreshKey, isFullscreen, setIsFullscreen }) => {
    const [iframeSrcDoc, setIframeSrcDoc] = useState<string | null>(null);

    useEffect(() => {
        const indexHtmlFile = fileSystem['index.html'];
        if (!indexHtmlFile || typeof indexHtmlFile.content !== 'string') {
            setIframeSrcDoc(null);
            return;
        }

        const blobUrls = new Map<string, string>();
        const createdUrls: string[] = [];

        // Create blob URLs for all files except index.html
        for (const path in fileSystem) {
            if (path !== 'index.html' && fileSystem[path].content) {
                const file = fileSystem[path];
                const mimeType = path.endsWith('.css') ? 'text/css' : (path.endsWith('.js') ? 'text/babel' : 'application/javascript');
                const blob = new Blob([file.content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                blobUrls.set(path, url);
                createdUrls.push(url);
            }
        }
        
        let finalHtml = indexHtmlFile.content;
        const scriptFile = fileSystem['script.js'];

        // Handle CSS files
        finalHtml = finalHtml.replace(/(<link[^>]+href=)["']([./a-zA-Z0-9_-]+\.css)["']/g, (match, p1, p2) => {
            const cleanedPath = p2.startsWith('./') ? p2.substring(2) : p2;
            if (blobUrls.has(cleanedPath)) {
                const blobUrl = blobUrls.get(cleanedPath);
                return `${p1}"${blobUrl}"`;
            }
            return match;
        });

        // Handle script file - inline it
        if (scriptFile && typeof scriptFile.content === 'string') {
            finalHtml = finalHtml.replace(/<script[^>]+src=["'][./a-zA-Z0-9_-]+\.js["'][^>]*><\/script>/, 
                `<script type="text/babel">${scriptFile.content}</script>`);
        } else {
            finalHtml = finalHtml.replace(/(<script[^>]+src=)["']([./a-zA-Z0-9_-]+\.js)["']/g, (match, p1, p2) => {
                const cleanedPath = p2.startsWith('./') ? p2.substring(2) : p2;
                if (blobUrls.has(cleanedPath)) {
                    const blobUrl = blobUrls.get(cleanedPath);
                    return `${p1}"${blobUrl}"`;
                }
                return match;
            });
        }

        setIframeSrcDoc(finalHtml);

        // Cleanup blob URLs on unmount
        return () => {
            createdUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [fileSystem, refreshKey]);

    return (
        <div className="sw-preview-panel">
            <div className="preview-toolbar">
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="preview-fullscreen-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {isFullscreen ? (
                            <path d="M4.5 11.5H0V16H4.5V11.5ZM11.5 4.5H16V0H11.5V4.5ZM4.5 0H0V4.5H4.5V0ZM11.5 11.5H16V16H11.5V11.5Z" fill="currentColor"/>
                        ) : (
                            <path d="M11.5 4.5V0H16V4.5H11.5ZM0 11.5V16H4.5V11.5H0ZM11.5 11.5V16H16V11.5H11.5ZM0 4.5V0H4.5V4.5H0Z" fill="currentColor"/>
                        )}
                    </svg>
                    <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>
            </div>
            <div className="preview-content">
                {iframeSrcDoc && (
                    <iframe
                        key={refreshKey}
                        srcDoc={iframeSrcDoc}
                        title="Live Preview"
                        className="ide-preview"
                        sandbox="allow-scripts"
                    />
                )}
            </div>
        </div>
    );
}
