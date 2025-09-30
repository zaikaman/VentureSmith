import React, { useState } from 'react';
import { Routes, Route, BrowserRouter, useMatch } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Footer } from './components/pages/Footer';
import { Header } from './components/pages/Header';
import { useTheme } from './contexts/ThemeContext';
import { SignIn } from './components/pages/SignIn';
import { SignUp } from './components/pages/SignUp';
import { BlueprintBuilder } from './components/pages/BlueprintBuilder';
import { SmithBuild } from './components/pages/SmithBuild';
import { Home } from './components/pages/Home';
import { LoginModal } from './components/pages/LoginModal';
import AccountPage from './components/pages/AccountPage';
import { VentureWorkspace } from './components/pages/VentureWorkspace';
import { SmithWorkspace } from './components/pages/SmithWorkspace';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import TermsPage from './components/pages/TermsPage';
import PrivacyPage from './components/pages/PrivacyPage';
import HelpCenterPage from './components/pages/HelpCenterPage';
import './App.css';

const AppLayout: React.FC = () => {
    const { theme } = useTheme();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

    const isSmithWorkspace = useMatch('/smith-build/:sessionId');

    const mainContentPaddingClass = isSmithWorkspace ? '' : 'p-4 main-content-padding';
    const contentWrapperClass = isSmithWorkspace ? '' : 'w-full max-w-7xl mx-auto';

    return (
        <div className={`min-h-screen app-container flex flex-col`}>
            {!isSmithWorkspace && <Header />}
            <main className={`flex-grow ${mainContentPaddingClass}`}>
                <div className={contentWrapperClass}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/blueprint-builder" element={<BlueprintBuilder />} />
                        <Route path="/smith-build" element={<SmithBuild />} />
                        <Route path="/smith-build/:sessionId" element={<SmithWorkspace />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/venture/:id" element={<VentureWorkspace />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/help-center" element={<HelpCenterPage />} />
                    </Routes>
                </div>
            </main>
            {!isSmithWorkspace && <Footer />}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <Toaster position="top-right" richColors theme={theme} closeButton offset={100} />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
};

export default App;