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
        const styleCssFile = fileSystem['style.css'];
        const scriptJsFile = fileSystem['script.js'];

        if (!indexHtmlFile || typeof indexHtmlFile.content !== 'string') {
            setIframeSrcDoc(null);
            return;
        }

        let finalHtml = indexHtmlFile.content;

        // Inline CSS
        if (styleCssFile && styleCssFile.content) {
            finalHtml = finalHtml.replace(/<link[^>]+href=[\"\'](style\.css)[\"\'][^>]*>/,
                `<style>${styleCssFile.content}</style>`);
        }

        // Inline JS
        if (scriptJsFile && scriptJsFile.content) {
            // Determine script type and inline accordingly
            if (finalHtml.includes('type="text/babel"')) {
                 finalHtml = finalHtml.replace(/<script[^>]+src=[\"\'](script\.js)[\"\'][^>]*><\/script>/, 
                    `<script type="text/babel">${scriptJsFile.content}</script>`);
            } else {
                finalHtml = finalHtml.replace(/<script[^>]+src=[\"\'](script\.js)[\"\'][^>]*><\/script>/, 
                    `<script>${scriptJsFile.content}</script>`);
            }
        }

        setIframeSrcDoc(finalHtml);

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
                        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                    />
                )}
            </div>
        </div>
    );
}
