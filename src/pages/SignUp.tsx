import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { demoLogin } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await sendEmailVerification(userCredential.user);
      setSuccess('Account created! Please check your email to verify your account.');
      // Optional: navigate to login after a delay
      setTimeout(() => navigate('/login'), 5000);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign up is disabled in Firebase. Using Demo Mode instead.');
        setTimeout(() => {
          demoLogin();
          navigate('/');
        }, 1500);
      } else {
        setError(err.message || 'Failed to create an account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Apple');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen flex flex-col justify-center overflow-y-auto pb-24 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="md:max-w-md md:mx-auto md:w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Join PicVibez to start sharing memories.</p>
          <Link to="/join" className="inline-flex items-center justify-center gap-1 mt-4 text-sm font-bold text-[#a855f7] hover:text-[#d946ef] transition-colors hover:underline">
            Why PicVibez? Discover our features <span aria-hidden="true">→</span>
          </Link>
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

        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#a855f7] transition-colors shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input 
                required
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#a855f7] transition-colors shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-xl py-4 font-bold text-lg text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">OR CONTINUE WITH</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button 
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button 
            onClick={handleAppleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.06-3.23 1.98-2.73 5.96.42 7.14-.72 1.63-1.63 3.11-2.74 3.81zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </button>
        </div>

        <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-[#a855f7] font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
