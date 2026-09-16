import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, ShieldCheck, ArrowRight, Cloud, Check } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';
import { signUpWithSupabase, signInWithSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { VistoraLogo } from '../ui/VistoraLogo';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentUser, showToast, setIsOnboardingOpen } = useVistora();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCloud = isSupabaseConfigured();

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim() || !username.trim()) {
          setErrorMsg('Please provide your name and a username.');
          setIsLoading(false);
          return;
        }

        const res = await signUpWithSupabase(email, password, displayName, username);
        if (res.success && res.user) {
          setCurrentUser(res.user);
          showToast(`Welcome to VISTORA, ${res.user.displayName}!`, 'success');
          setIsAuthModalOpen(false);
          setIsOnboardingOpen(true);
        } else {
          setErrorMsg(res.error || 'Failed to create account.');
        }
      } else {
        const res = await signInWithSupabase(email, password);
        if (res.success && res.user) {
          setCurrentUser(res.user);
          showToast(`Welcome back, ${res.user.displayName}!`, 'success');
          setIsAuthModalOpen(false);
        } else {
          setErrorMsg(res.error || 'Invalid credentials.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await signInWithSupabase('demo@vistora.app', 'demo1234');
    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast('Signed in with Demo Curator account', 'success');
      setIsAuthModalOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl overflow-hidden border border-[#EAEAEA] dark:border-[#2A2A2A] relative"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#171717] dark:hover:text-white rounded-full transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Branding */}
        <div className="pt-8 pb-4 px-6 text-center border-b border-[#F0F0F0] dark:border-[#262626]">
          <div className="flex justify-center mb-2">
            <VistoraLogo size="md" />
          </div>
          <h2 className="font-display text-2xl font-black text-[#171717] dark:text-white">
            {mode === 'signin' ? 'Welcome back to VISTORA' : 'Create your VISTORA Account'}
          </h2>
          <p className="text-xs text-[#666666] dark:text-[#A0A0A0] mt-1">
            Discover, save boards, and share visual inspirations with the global community.
          </p>

          {/* Cloud Auth Status Pill */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F5F5F5] dark:bg-[#222222] text-[#555555] dark:text-gray-300 border border-[#E5E5E5] dark:border-[#333333]">
            <Cloud className="w-3.5 h-3.5 text-[#FFD21F]" />
            <span>
              {isCloud ? 'Connected to Supabase Cloud' : 'Supabase Auth Ready (Local Sandbox)'}
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all cursor-pointer ${
              mode === 'signin'
                ? 'border-b-2 border-[#FFD21F] text-[#171717] dark:text-white bg-[#FFF4B8]/10'
                : 'text-[#888888] hover:text-[#171717] dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'border-b-2 border-[#FFD21F] text-[#171717] dark:text-white bg-[#FFF4B8]/10'
                : 'text-[#888888] hover:text-[#171717] dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-[#666666] dark:text-[#A0A0A0] mb-1">
                  Full Display Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#666666] dark:text-[#A0A0A0] mb-1">
                  Username *
                </label>
                <div className="relative">
                  <span className="text-gray-400 absolute left-3.5 top-2.5 font-bold text-xs">@</span>
                  <input
                    type="text"
                    required
                    placeholder="alexrivera"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-[#666666] dark:text-[#A0A0A0] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#666666] dark:text-[#A0A0A0] mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F5F5F5] dark:bg-[#222222] text-[#171717] dark:text-white rounded-xl border border-transparent focus:border-[#FFD21F] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#FFD21F] hover:bg-[#F2C410] active:scale-98 text-[#171717] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to VISTORA' : 'Create Vistora Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Login Option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 rounded-full bg-[#F5F5F5] dark:bg-[#252525] hover:bg-[#EEEEEE] dark:hover:bg-[#2D2D2D] text-[#171717] dark:text-white text-xs font-bold transition-all cursor-pointer"
            >
              ⚡ Instant Explore with Demo Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
