"use client";
import React, { useState } from "react";

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToSignIn }) => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Simulate sending OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address.");
      } else {
        setOtpSent(true);
      }
    }, 800);
  };

  // Simulate verifying OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (otp.trim().length < 4) {
        setError("Invalid OTP.");
      } else {
        setError("");
        alert("OTP Verified! You can now reset your password.");
        onBackToSignIn();
      }
    }, 800);
  };

  return (
    <div>
      <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
        {!otpSent ? (
          <>
            <label className="block text-sm font-medium text-gray-700">
              Enter your email address
            </label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-therasynced-primary text-white py-2 rounded hover:bg-therasynced-primary-dark transition"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <button
              type="button"
              className="w-full mt-2 text-therasynced-primary underline"
              onClick={onBackToSignIn}
              disabled={loading}
            >
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700">
              Enter the OTP sent to your email
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
              maxLength={6}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-therasynced-primary text-white py-2 rounded hover:bg-therasynced-primary-dark transition"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="w-full mt-2 text-therasynced-primary underline"
              onClick={onBackToSignIn}
              disabled={loading}
            >
              Back to Sign In
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordForm;