import React, { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Footer } from './components/pages/Footer';
import { Header } from './components/pages/Header';
import { useTheme } from './contexts/ThemeContext';
import { SignIn } from './components/pages/SignIn';
import { SignUp } from './components/pages/SignUp';
import { Build } from './components/pages/Build';
import { Home } from './components/pages/Home';
import { LoginModal } from './components/pages/LoginModal';
import './App.css';

const App: React.FC = () => {
    const { theme } = useTheme();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

    return (
        <BrowserRouter>
            <div className={`min-h-screen app-container flex flex-col`}>
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-7xl mx-auto">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/build" element={<Build />} />
                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/signup" element={<SignUp />} />
                        </Routes>
                    </div>
                </main>
                <Footer />
                <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            </div>
            <ToastContainer
                theme={theme}
                className="toast-container"
            />
        </BrowserRouter>
    );
};

export default App;