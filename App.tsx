import React, { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Footer } from './components/pages/Footer';
import { Header } from './components/pages/Header';
import { useTheme } from './contexts/ThemeContext';
import { SignIn } from './components/pages/SignIn';
import { SignUp } from './components/pages/SignUp';
import { BlueprintBuilder } from './components/pages/BlueprintBuilder';
import { Home } from './components/pages/Home';
import { LoginModal } from './components/pages/LoginModal';
import AccountPage from './components/pages/AccountPage';
import { VentureWorkspace } from './components/pages/VentureWorkspace';
import { VentureChatbot } from './components/chatbot/VentureChatbot';
import { useMatch } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from './convex/_generated/api';
import { Id } from './convex/_generated/dataModel';
import DueDiligenceChecklist from './components/pages/DueDiligenceChecklist';
import './App.css';

const WorkspaceWithChatbot = () => {
  const match = useMatch('/venture/:id');
  const startupId = match?.params.id as Id<"startups"> | undefined;

  const startup = useQuery(
    api.startups.getStartupById,
    startupId ? { id: startupId } : 'skip'
  );

  return (
    <>
      <VentureWorkspace />
      {startup && <VentureChatbot startup={startup} />}
    </>
  );
};

const App: React.FC = () => {
    const { theme } = useTheme();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

    return (
        <BrowserRouter>
            <div className={`min-h-screen app-container flex flex-col`}>
                <Header />
                <main className="flex-grow p-4">
                    <div className="w-full max-w-7xl mx-auto">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/blueprint-builder" element={<BlueprintBuilder />} />
                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/account" element={<AccountPage />} />
                            <Route path="/venture/:id" element={<WorkspaceWithChatbot />} />
                            <Route path="/due-diligence-checklist/:startupId" element={<DueDiligenceChecklist />} />
                        </Routes>
                    </div>
                </main>
                <Footer />
                <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            </div>
            <Toaster position="top-right" richColors theme={theme} closeButton offset={100} />
        </BrowserRouter>
    );
};

export default App;