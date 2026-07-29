import { Button } from '../ui/Button';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Mail, Lock, User, AtSign, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const getFriendlyErrorMessage = (error: any) => {
    const code = error?.code || error?.message;
    switch (code) {
      case 'auth/unauthorized-domain':
        return "This domain is not authorized for login. Please contact the administrator.";
      case 'auth/user-not-found':
        return "No account found with this email.";
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return "Incorrect password. Please try again.";
      case 'auth/email-already-in-use':
        return "An account with this email already exists.";
      case 'auth/weak-password':
        return "Password should be at least 6 characters.";
      case 'auth/invalid-email':
        return "Please enter a valid email address.";
      case 'auth/network-request-failed':
        return "Network error. Please check your internet connection.";
      case 'auth/popup-blocked':
        return "Popup blocked. Please open this app in a new tab to sign in.";
      case 'auth/popup-closed-by-user':
        return "Sign-in popup was closed before completion.";
      default:
        // Attempt to clean up generic Firebase errors if they leak through
        const msg = error?.message || 'An unexpected error occurred. Please try again.';
        return msg.replace(/Firebase:\s(.*)\s\([^)]+\)./, '$1');
    }
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
      onClose();
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error("Auth Error (Google):", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F5F5F7] backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md overflow-hidden bg-bg-card rounded-2xl shadow-2xl border border-ui-borderSubtle dark:border-slate-700"
        >
          <Button onClick={onClose}
            className="absolute top-5 right-5 p-2 text-txt-tertiary hover:text-txt-secondary rounded-full hover:bg-slate-100 transition-colors z-10 text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="px-8 pt-10 pb-8">
            <h2 className="text-txt-primary dark:text-white mb-2 text-xl font-semibold text-txt-primary tracking-tight mb-4">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mb-8 text-base font-normal text-txt-secondary leading-relaxed">
              {isLogin ? 'Sign in to access your estimates' : 'Sign up to save your estimation data safely'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="auth-name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name <span className="text-rose-500" aria-hidden="true">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input id="auth-name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                      }}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="auth-email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Work Email Address <span className="text-rose-500" aria-hidden="true">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <AtSign className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="auth-email"
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="auth-password" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password <span className="text-rose-500" aria-hidden="true">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                loadingText={isLogin ? 'Signing In...' : 'Creating Account...'}
                className="mt-2 text-base shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.3)] bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            

            <p className="mt-8 text-center text-base font-normal text-txt-secondary leading-relaxed">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors rounded-full"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </Button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
