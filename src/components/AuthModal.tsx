import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLinks } from '../context/LinkContext';
import { Logo } from './Logo';
import {
  checkRateLimit,
  recordFailedAttempt,
  resetFailedAttempts,
  generateAntiBotChallenge
} from '../utils/security';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    login,
    register,
    loginAsDemo,
    isSupabaseActive
  } = useAuth();
  const { addToast } = useLinks();

  const [isRegister, setIsRegister] = useState(authModalMode === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Bot Protection States
  const [botChallenge, setBotChallenge] = useState(() => generateAntiBotChallenge());
  const [userChallengeInput, setUserChallengeInput] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Refresh captcha challenge on modal open or mode change
  useEffect(() => {
    setBotChallenge(generateAntiBotChallenge());
    setUserChallengeInput('');
    setErrorMsg('');
  }, [isAuthModalOpen, isRegister]);

  // Lockout Timer countdown
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Rate-limit Lockout Check
    const rateCheck = checkRateLimit('auth');
    if (rateCheck.isLocked || lockoutSeconds > 0) {
      setLockoutSeconds(rateCheck.remainingSeconds || lockoutSeconds);
      setErrorMsg(`Too many failed attempts. Security cooldown active (${rateCheck.remainingSeconds || lockoutSeconds}s).`);
      return;
    }

    // 2. Basic Input Validations
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters');
      return;
    }

    // 3. Anti-Bot Math Challenge Verification
    if (parseInt(userChallengeInput.trim(), 10) !== botChallenge.answer) {
      setErrorMsg(`Incorrect anti-bot verification answer (${botChallenge.text}).`);
      setBotChallenge(generateAntiBotChallenge());
      setUserChallengeInput('');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name');
          setLoading(false);
          return;
        }

        const res = await register(name, email, password);

        if (res.success) {
          resetFailedAttempts('auth');
          addToast(`Welcome to URLSnip, ${name}!`, 'success');
        } else {
          const lock = recordFailedAttempt('auth');
          if (lock.isLocked) setLockoutSeconds(lock.remainingSeconds);
          setErrorMsg(res.error || 'Registration failed. Check your inputs or try another email.');
        }
      } else {
        const res = await login(email, password);

        if (res.success) {
          resetFailedAttempts('auth');
          addToast(`Signed in as ${email}`, 'success');
        } else {
          const lock = recordFailedAttempt('auth');
          if (lock.isLocked) setLockoutSeconds(lock.remainingSeconds);
          setErrorMsg(
            res.error || (isSupabaseActive ? 'Invalid Supabase login credentials. Did you create an account first?' : 'Invalid login credentials.')
          );
        }
      }
    } catch (err: any) {
      const lock = recordFailedAttempt('auth');
      if (lock.isLocked) setLockoutSeconds(lock.remainingSeconds);
      setErrorMsg(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loginAsDemo();
    addToast('Signed in as Alex Morgan (Demo Account)', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Logo variant="full" size="lg" showTagline className="mb-4" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isRegister ? 'Create your Account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your URL shortener dashboard & analytics studio
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Anti-Bot Interactive Captcha Challenge */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                <span>Anti-Bot Verification: {botChallenge.text}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setBotChallenge(generateAntiBotChallenge());
                  setUserChallengeInput('');
                }}
                className="text-[11px] text-brand-600 hover:underline flex items-center space-x-0.5"
                title="Refresh Captcha"
              >
                <RefreshCw className="w-3 h-3 mr-0.5" />
                <span>New</span>
              </button>
            </div>
            <input
              type="number"
              value={userChallengeInput}
              onChange={(e) => setUserChallengeInput(e.target.value)}
              placeholder="Enter answer (e.g. 12)"
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
          </div>

          {/* Error Banner / Lockout Warning */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium space-y-1 text-center flex items-center justify-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || lockoutSeconds > 0}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>
              {lockoutSeconds > 0
                ? `Locked (${lockoutSeconds}s)`
                : loading
                ? 'Verifying & Submitting...'
                : isRegister
                ? 'Create Account'
                : 'Sign In to Dashboard'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Anti-Bot Protection Badge */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Protected by Anti-Bot Verification & Rate Limiting</span>
          </span>
        </div>

        {/* Quick Demo Access */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase">
            Quick Demo Access
          </span>
        </div>

        <button
          type="button"
          onClick={handleDemoSignIn}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>One-Click Demo Account Login</span>
        </button>

      </div>
    </div>
  );
};
