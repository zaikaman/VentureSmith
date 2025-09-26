
import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client';
import './Auth.css';

export const SignUp: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await authClient.signUp.email({
            name,
            email,
            password,
        }, {
            onSuccess: () => {
                setLoading(false);
                toast.success("Sign up request sent! Please check your email for the OTP.");
                setIsOtpStep(true);
                setResendCooldown(60);
            },
            onError: (err) => {
                setLoading(false);
                toast.error(err.error.message);
                console.error("Sign up error:", err);
            }
        });
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await authClient.emailOtp.verifyEmail({
            email,
            otp,
        }, {
            onSuccess: () => {
                setLoading(false);
                toast.success("Email verified successfully! You are now signed in.");
                navigate('/');
            },
            onError: (err) => {
                setLoading(false);
                toast.error(err.error.message);
                console.error("OTP verification error:", err);
            }
        });
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "email-verification",
        }, {
            onSuccess: () => {
                setLoading(false);
                toast.success("A new OTP has been sent to your email.");
                setResendCooldown(60);
            },
            onError: (err) => {
                setLoading(false);
                toast.error(err.error.message);
                console.error("Resend OTP error:", err);
            }
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Sign Up</h2>
                {!isOtpStep ? (
                    <form onSubmit={handleSignUp} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                        </div>
                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={loading} />
                        </div>
                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0 || loading} className="secondary-button">
                                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
