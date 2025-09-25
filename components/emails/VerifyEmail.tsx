import React from 'react';

interface VerifyEmailProps {
  otp: string;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ otp }) => {
  return (
    <div>
      <h1>Verify Your Email</h1>
      <p>Your one-time password is: <strong>{otp}</strong></p>
    </div>
  );
};

export default VerifyEmail;
