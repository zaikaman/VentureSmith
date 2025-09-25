
import { toast } from 'sonner';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client';
import './Auth.css';

export const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await authClient.signIn.email({
            email,
            password,
        }, {
            onSuccess: () => {
                setLoading(false);
                toast.success("Signed in successfully!");
                navigate('/');
            },
            onError: (err) => {
                setLoading(false);
                toast.error(err.error.message);
                console.error("Sign in error:", err);
            }
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Sign In</h2>
                <form onSubmit={handleSignIn} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};
