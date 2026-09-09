import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'snipurl_auth_user_v1';

export interface AuthResult {
  success: boolean;
  requiresVerification?: boolean;
  email?: string;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, pass?: string) => Promise<AuthResult>;
  loginAsDemo: () => void;
  register: (name: string, email: string, pass?: string) => Promise<AuthResult>;
  logout: () => Promise<void> | void;
  updateProfile: (updates: Partial<User>) => void;
  generateApiKey: () => string;
  isSupabaseActive: boolean;
  resendVerificationEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return null; // Default unauthenticated state so email verification is strictly required
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Supabase Auth State Change Listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && session.user.email_confirmed_at) {
        const u: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || 'User')}&background=4f46e5&color=fff`,
          createdAt: session.user.created_at,
          apiKey: `snip_live_${session.user.id.substring(0, 8)}`
        };
        setUser(u);
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && session.user.email_confirmed_at) {
        const u: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || 'User')}&background=4f46e5&color=fff`,
          createdAt: session.user.created_at,
          apiKey: `snip_live_${session.user.id.substring(0, 8)}`
        };
        setUser(u);
      } else if (event === 'SIGNED_OUT' || !session?.user?.email_confirmed_at) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync user object with localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error storing auth state', err);
    }
  }, [user]);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, pass?: string): Promise<AuthResult> => {
    if (!email || !email.includes('@')) return { success: false, error: 'Please enter a valid email address' };

    if (isSupabaseConfigured && supabase && pass) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass.trim()
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            requiresVerification: true,
            email: email.trim(),
            error: 'Email verification required. Please check your email inbox and click the verification link to log in.'
          };
        }
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        // Enforce email verification check
        if (!data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          return {
            success: false,
            requiresVerification: true,
            email: email.trim(),
            error: 'Your email address is not verified yet. Please check your email inbox and verify your account.'
          };
        }

        const u: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || email,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=4f46e5&color=fff`,
          createdAt: data.user.created_at,
          apiKey: `snip_live_${data.user.id.substring(0, 8)}`
        };
        setUser(u);
        setIsAuthModalOpen(false);
        return { success: true };
      }

      return { success: false, error: 'Invalid login credentials' };
    }

    // Offline Demo mode
    const loggedUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase()),
      email: email.toLowerCase(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=4f46e5&color=fff`,
      createdAt: new Date().toISOString(),
      apiKey: `snip_live_${Math.random().toString(36).substring(2, 15)}`
    };
    setUser(loggedUser);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const loginAsDemo = () => {
    const demoUser: User = {
      id: 'user-demo-101',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      apiKey: 'snip_live_9f83a21b4c7e5d6098231',
      defaultExpiration: 'never'
    };
    setUser(demoUser);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, pass?: string): Promise<AuthResult> => {
    if (!name || !email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid name and email address' };
    }

    if (isSupabaseConfigured && supabase && pass) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass.trim(),
        options: {
          data: { name: name.trim() }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // If Supabase email confirmation is enabled, session is null
        if (!data.session || !data.user.email_confirmed_at) {
          return {
            success: true,
            requiresVerification: true,
            email: email.trim()
          };
        }

        const newUser: User = {
          id: data.user.id,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
          createdAt: new Date().toISOString(),
          apiKey: `snip_live_${data.user.id.substring(0, 8)}`
        };
        setUser(newUser);
        setIsAuthModalOpen(false);
        return { success: true };
      }
    }

    // Offline fallback
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
      createdAt: new Date().toISOString(),
      apiKey: `snip_live_${Math.random().toString(36).substring(2, 15)}`
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !email) return false;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim()
    });
    return !error;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const generateApiKey = () => {
    const newKey = `snip_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`;
    updateProfile({ apiKey: newKey });
    return newKey;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        loginAsDemo,
        register,
        logout,
        updateProfile,
        generateApiKey,
        isSupabaseActive: isSupabaseConfigured,
        resendVerificationEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
