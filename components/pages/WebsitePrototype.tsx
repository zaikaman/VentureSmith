
import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { WebsitePrototypeData } from '../../types';

interface WebsitePrototypeProps {
    data: WebsitePrototypeData;
}

export const WebsitePrototype: React.FC<WebsitePrototypeProps> = ({ data }) => {
    const scope = { React };

    return (
        <div>
            <h2 className="text-3xl font-bold text-[var(--text-color)] mb-6 text-center">Landing Page Prototype</h2>
            <div className="w-full bg-[var(--bg-slate-900)] rounded-xl overflow-hidden shadow-2xl border-4 border-[var(--border-slate-700)]">
                {/* Browser bar */}
                <div className="h-10 bg-[var(--bg-slate-700)] flex items-center px-4 space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                
                {/* Website content */}
                <div className="bg-[var(--bg-slate-800)] min-h-[600px] overflow-y-auto p-4">
                    <LiveProvider code={`${data.code}\nrender(<WebsitePrototypeComponent />);`} scope={scope} noInline={true}>
                        <LiveError className="text-red-500 whitespace-pre-wrap" />
                        <LivePreview />
                        <h3 className="text-xl font-bold text-[var(--text-color)] mt-4 mb-2">Generated Code:</h3>
                        <LiveEditor className="bg-[var(--bg-slate-700)] p-4 rounded-md text-sm overflow-auto max-h-96" />
                    </LiveProvider>
                </div>
            </div>
        </div>
    );
};
