
import React, { useState } from 'react';
import { authClient } from '../../lib/auth-client';

export const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        }

        if (data) {
            // Handle successful sign in
            console.log(data);
        }
    };

    return (
        <div>
            <h2>Sign In</h2>
            <form onSubmit={handleSignIn}>
                <div>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};
