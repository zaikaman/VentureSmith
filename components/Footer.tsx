import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="mb-8 md:mb-0">
                        <h3 className="text-3xl font-bold text-purple-400 mb-2">VentureForge</h3>
                        <p className="text-gray-400">AI Startup & Technology</p>
                        <p className="text-gray-500 mt-6 text-sm">Step into the forefront of innovation with our AI Startup & Technology solutions.</p>
                    </div>
                    <div className="mb-8 md:mb-0">
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Autocapture</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Data Governance</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Virtual Events</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Virtual Users</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Behavioral Analytics</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Connect</a></li>
                        </ul>
                    </div>
                    <div className="mb-8 md:mb-0">
                        <h4 className="font-bold text-white mb-4">Explore</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Documents</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">OFFICE LOCATION</h4>
                        <p className="text-gray-400 mb-8">Address Line Lorem Ipsum Dolore Sit Amet</p>
                        <h4 className="font-bold text-white mb-4">News letter</h4>
                        <form>
                            <div className="relative">
                                <input 
                                    className="bg-transparent w-full text-white py-2 px-3 leading-tight focus:outline-none border-b-2 border-gray-600 focus:border-purple-500 transition-colors"
                                    type="email" 
                                    placeholder="Enter your email address" 
                                />
                                <button className="absolute right-0 top-0 mt-2 text-purple-400" type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h14" /></svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    <p>© By VentureForge Design. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};