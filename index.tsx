
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from './lib/auth-client';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <ConvexBetterAuthProvider client={convex} authClient={authClient}>
                <App />
            </ConvexBetterAuthProvider>
        </ThemeProvider>
    </React.StrictMode>
);
