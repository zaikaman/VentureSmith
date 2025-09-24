import React from 'react';

export const InfoSection: React.FC = () => {
    return (
        <div className="text-white py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-5xl font-bold mb-4">Building Smart Solutions for Smarter Startups.</h2>
                        <p className="text-lg text-gray-400 mb-8">From developing intuitive algorithms to scalable AI-driven applications, we transform visions into impactful realities.</p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-transparent border border-purple-500 text-white py-3 px-6 rounded-full hover:bg-purple-500 transition-colors">Today with AI Startup Solutions</button>
                            <button className="bg-transparent border border-gray-600 text-gray-400 py-3 px-6 rounded-full hover:bg-gray-600 hover:text-white transition-colors">AI Technology</button>
                            <button className="bg-transparent border border-gray-600 text-gray-400 py-3 px-6 rounded-full hover:bg-gray-600 hover:text-white transition-colors">Innovating Tomorrow</button>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="p-4 bg-white/10 rounded-2xl shadow-lg backdrop-blur-xl">
                            <img src="/website.png" alt="AI representation" className="rounded-lg w-full h-auto" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg text-center">
                                <h3 className="text-purple-400 text-6xl font-bold">75+</h3>
                                <p className="text-gray-400 mt-2">Experience Technology</p>
                            </div>
                            <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-lg mb-2">Building Smart Solutions for Smarter Startups.</h4>
                                    <p className="text-sm text-gray-400">Step into the forefront of innovation with our AI Startup & Technology solutions.</p>
                                </div>
                                <button className="mt-4 text-purple-400 text-2xl self-start">→</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};