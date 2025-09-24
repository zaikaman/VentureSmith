import React from 'react';

export const InfoSection: React.FC = () => {
    return (
        <div style={{color: `var(--text-color)`}} className="py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-5xl font-bold mb-4">Building Smart Solutions for Smarter Startups.</h2>
                        <p style={{color: `var(--text-slate-400)`}} className="text-lg mb-8">From developing intuitive algorithms to scalable AI-driven applications, we transform visions into impactful realities.</p>
                        <div className="flex flex-wrap gap-4">
                            <button style={{borderColor: `var(--primary-color)`, color: `var(--text-color)`}} className="bg-transparent border py-3 px-6 rounded-full hover:bg-[var(--primary-color)] transition-colors">Today with AI Startup Solutions</button>
                            <button style={{borderColor: `var(--border-slate-700)`, color: `var(--text-slate-400)`}} className="bg-transparent border py-3 px-6 rounded-full hover:bg-[var(--border-slate-700)] hover:text-[var(--text-color)] transition-colors">AI Technology</button>
                            <button style={{borderColor: `var(--border-slate-700)`, color: `var(--text-slate-400)`}} className="bg-transparent border py-3 px-6 rounded-full hover:bg-[var(--border-slate-700)] hover:text-[var(--text-color)] transition-colors">Innovating Tomorrow</button>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div style={{backgroundColor: `var(--bg-white-10)`}} className="p-4 rounded-2xl shadow-lg backdrop-blur-xl">
                            <img src="/website.png" alt="AI representation" className="rounded-lg w-full h-auto" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div style={{backgroundColor: `var(--bg-slate-800)`}} className="bg-opacity-50 p-8 rounded-lg text-center">
                                <h3 style={{color: `var(--primary-color)`}} className="text-6xl font-bold">75+</h3>
                                <p style={{color: `var(--text-slate-400)`}} className="mt-2">Experience Technology</p>
                            </div>
                            <div style={{backgroundColor: `var(--bg-slate-800)`}} className="bg-opacity-50 p-8 rounded-lg flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-lg mb-2">Building Smart Solutions for Smarter Startups.</h4>
                                    <p style={{color: `var(--text-slate-400)`}} className="text-sm">Step into the forefront of innovation with our AI Startup & Technology solutions.</p>
                                </div>
                                <button style={{color: `var(--primary-color)`}} className="mt-4 text-2xl self-start">→</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};