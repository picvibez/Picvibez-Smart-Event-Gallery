import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="md:max-w-md md:mx-auto md:w-full">
        <button onClick={() => navigate('/login')} className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
          <ChevronLeft size={20} />
          <span>Back to Login</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center gap-3 text-green-600 dark:text-green-400">
            <CheckCircle size={20} className="shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input 
                required
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#a855f7] transition-colors shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-xl py-4 font-bold text-lg text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
