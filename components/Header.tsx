import React from 'react';

const QuestionMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.11a12.007 12.007 0 014.59 0c.55.103 1.02.568 1.11 1.11m-6.8 0a12.007 12.007 0 00-4.59 0c-.55-.103-1.02-.568-1.11-1.11m6.8 0c.09.542.56 1.007 1.11 1.11a12.007 12.007 0 014.59 0c.55.103 1.02.568 1.11 1.11m0 0a12.007 12.007 0 010 4.59c-.103.55-.568 1.02-1.11 1.11a12.007 12.007 0 01-4.59 0c-.55-.103-1.02-.568-1.11-1.11m0 0a12.007 12.007 0 000-4.59c.103-.55.568-1.02 1.11-1.11m0 0a12.007 12.007 0 004.59 0c.55.103 1.02.568 1.11 1.11M12 6.75a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5z" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
    </svg>
);

export const Header: React.FC = () => {
    const navLinks = ["Home", "About Us", "Services", "Features", "Contact"];

    return (
        <header className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <a href="#" className="flex items-center space-x-3 text-3xl font-bold text-purple-400">
                            <img src="/logo.png" alt="VentureForge Logo" className="h-8 w-8" />
                            <span>VentureForge</span>
                        </a>
                    </div>
                    
                    {/* Center: Navigation Links (Desktop) */}
                    <div className="hidden lg:flex flex-grow items-center justify-center">
                        <nav className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-full px-3 py-1">
                             <ul className="flex items-center space-x-1">
                                {navLinks.map(link => (
                                    <li key={link}>
                                        <a href="#" className="text-slate-300 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Right: Icons & Buttons (Desktop) */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <div className="flex items-center bg-slate-800/60 border border-slate-700/50 rounded-full p-2 space-x-2">
                             <a href="#" className="text-slate-400 hover:text-white transition-colors p-1 rounded-full"><QuestionMarkIcon /></a>
                             <a href="#" className="text-slate-400 hover:text-white transition-colors p-1 rounded-full"><SettingsIcon /></a>
                             <a href="#" className="text-slate-400 hover:text-white transition-colors p-1 rounded-full"><MenuIcon /></a>
                        </div>
                        <div className="flex items-center space-x-2">
                             <a href="#" className="text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors px-5 py-2.5 rounded-full text-sm font-semibold">
                                Sign in
                            </a>
                            <a href="#" className="text-white bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:opacity-90 transition-opacity px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
                                Sign up
                            </a>
                        </div>
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button className="text-slate-400 hover:text-white" aria-label="Open menu">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
