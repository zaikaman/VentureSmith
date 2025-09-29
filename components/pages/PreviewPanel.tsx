import React, { useState, useEffect } from 'react';
import type { FileSystem } from '../../types';

interface PreviewPanelProps {
  fileSystem: FileSystem;
  refreshKey: number;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ fileSystem, refreshKey }) => {
    const [iframeSrc, setIframeSrc] = useState('');

    useEffect(() => {
        const indexHtmlFile = fileSystem['index.html'];
        if (!indexHtmlFile || typeof indexHtmlFile.content !== 'string') {
            setIframeSrc('');
            return;
        }

        const blobUrls = new Map<string, string>();
        const createdUrls: string[] = [];

        // Create blob URLs for all files except index.html
        for (const path in fileSystem) {
            if (path !== 'index.html') {
                const file = fileSystem[path];
                const mimeType = path.endsWith('.css') ? 'text/css' : 'application/javascript';
                const blob = new Blob([file.content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                blobUrls.set(path, url);
                createdUrls.push(url);
            }
        }
        
        // Replace relative paths in index.html with blob URLs
        let finalHtml = indexHtmlFile.content;
        finalHtml = finalHtml.replace(/(src|href)=\"([./a-zA-Z0-9_-]+\.(?:js|css))\"/g, (match, attr, path) => {
            const cleanedPath = path.startsWith('./') ? path.substring(2) : path;
            if (blobUrls.has(cleanedPath)) {
                return `${attr}="${blobUrls.get(cleanedPath)}"`;
            }
            return match;
        });

        const finalBlob = new Blob([finalHtml], { type: 'text/html' });
        const finalUrl = URL.createObjectURL(finalBlob);
        createdUrls.push(finalUrl);

        setIframeSrc(finalUrl);

        // Cleanup blob URLs on unmount
        return () => {
            createdUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [fileSystem, refreshKey]);

    return (
        <div className="sw-preview-panel">
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
