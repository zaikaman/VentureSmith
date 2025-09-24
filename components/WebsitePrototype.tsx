
import React from 'react';
import { WebsitePrototypeData } from '../types';

interface WebsitePrototypeProps {
    data: WebsitePrototypeData;
}

export const WebsitePrototype: React.FC<WebsitePrototypeProps> = ({ data }) => {
    const imageUrl = "https://picsum.photos/seed/startup/1200/800";

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Landing Page Prototype</h2>
            <div className="w-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700">
                {/* Browser bar */}
                <div className="h-10 bg-slate-700 flex items-center px-4 space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                
                {/* Website content */}
                <div className="bg-slate-800 min-h-[600px] overflow-y-auto">
                    {/* Hero Section */}
                    <div className="relative text-center py-20 px-6 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95)), url(${imageUrl})` }}>
                        <h1 className="text-5xl font-extrabold text-white mb-4">{data.headline}</h1>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">{data.subheading}</p>
                        <button className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-purple-500 transition-colors">
                            {data.cta}
                        </button>
                    </div>

                    {/* Features Section */}
                    <div className="py-20 px-6">
                        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            {data.features.map((feature, index) => (
                                <div key={index} className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                                    <h3 className="text-2xl font-bold text-pink-400 mb-3">{feature.title}</h3>
                                    <p className="text-slate-400">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
