import React from 'react';

const Card = ({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) => (
    <div style={{backgroundColor: `var(--bg-slate-800)`}} className="p-6 rounded-2xl shadow-lg backdrop-blur-xl h-full">
        <div className="flex items-start mb-4">
            <div style={{color: `var(--primary-color)`}} className="mr-4">{icon}</div>
            <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p style={{color: `var(--text-slate-400)`}} className="text-sm">{description}</p>
            </div>
        </div>
    </div>
);

export const TransformSection: React.FC = () => {
    return (
        <div className="py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
                    <div>
                        <h2 className="text-5xl font-bold leading-tight mb-8">Transforming Ambitions into Reality with Advanced AI.</h2>
                        <button style={{backgroundColor: `var(--primary-color)`}} className="text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl transform rotate-45">
                            →
                        </button>
                    </div>
                    <div className="relative h-96">
                        <div 
                            className="absolute inset-0 bg-no-repeat bg-cover bg-center rounded-3xl"
                            style={{
                                backgroundImage: `url(/rocket.jpg)`
                            }}
                        >
                            <div style={{backgroundColor: `var(--primary-color)`, mixBlendMode: `var(--blend-mode)`}} className="absolute inset-0 opacity-50 rounded-3xl"></div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <Card 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>} 
                        title="Today with AI Startup Solutions." 
                        description="Step into the forefront of innovation with our AI Startup & Technology solutions."
                    />
                    <Card 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M12 21a9 9 0 110-18 9 9 0 010 18zm0-5a4 4 0 100-8 4 4 0 000 8z" /></svg>} 
                        title="Join Us in Shaping the Future of Technology." 
                        description="Step into the forefront of innovation with our AI Startup & Technology solutions."
                    />
                    <div style={{backgroundColor: `var(--bg-slate-800)`}} className="p-6 rounded-2xl shadow-lg backdrop-blur-xl h-full flex flex-col justify-between">
                        <div>
                            <div style={{color: `var(--primary-color)`}} className="flex items-center mb-2">
                                <span className="text-3xl font-bold mr-2">10+</span>
                                <span>Years of Industry Expertise</span>
                            </div>
                            <div style={{backgroundColor: `var(--bg-slate-700)`}} className="w-full rounded-full h-2.5">
                                <div style={{ backgroundColor: `var(--primary-color)`, width: '45%' }} className="h-2.5 rounded-full"></div>
                            </div>
                        </div>
                        <p style={{color: `var(--text-slate-400)`}} className="text-sm mt-4">Step into the forefront of innovation with our AI Startup & Technology solutions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};