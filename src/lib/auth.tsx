'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export interface LikinexUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

interface AuthMessage {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface AuthContextType {
  user: LikinexUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isDemo: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  message: AuthMessage | null;
  clearMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LikinexUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const router = useRouter();

  const mapSupabaseUser = useCallback((sbUser: SupabaseUser | null): LikinexUser | null => {
    if (!sbUser) return null;
    return {
      id: sbUser.id,
      email: sbUser.email || '',
      name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || '',
      created_at: sbUser.created_at,
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (urlParams.get('demo') === 'true') {
      setIsDemo(true); // eslint-disable-line react-hooks/set-state-in-effect
      const demoUser: LikinexUser = {
        id: 'demo_user',
        email: 'demo@likinex.app',
        name: 'Usuario Demo',
        created_at: new Date().toISOString(),
      };
      setUser(demoUser);
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUser(mapSupabaseUser(session.user));
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUser(mapSupabaseUser(session.user));
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [mapSupabaseUser]);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0] },
        },
      });

      if (error) {
        setMessage({ type: 'error', title: 'Error de Registro', message: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        setSupabaseUser(data.user);
        setUser(mapSupabaseUser(data.user));
        setMessage({ type: 'success', title: '¡Cuenta Creada!', message: 'Bienvenido a LikinEX.' });
        return { success: true };
      }

      return { success: false, error: 'No se pudo crear la cuenta' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setMessage({ type: 'error', title: 'Error', message: msg });
      return { success: false, error: msg };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', title: 'Error de Acceso', message: 'Email o contraseña incorrectos.' });
        return { success: false, error: error.message };
      }

      if (data.user) {
        setSupabaseUser(data.user);
        setUser(mapSupabaseUser(data.user));
        setMessage({ type: 'success', title: '¡Bienvenido!', message: `Hola ${data.user.email}` });
        return { success: true };
      }

      return { success: false, error: 'No se pudo iniciar sesión' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setMessage({ type: 'error', title: 'Error', message: msg });
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setUser(null);
    setIsDemo(false);
    setMessage({ type: 'info', title: 'Sesión Cerrada', message: 'Has cerrado sesión exitosamente.' });
  };

  const enterDemoMode = () => {
    setIsDemo(true);
    const demoUser: LikinexUser = {
      id: 'demo_user',
      email: 'demo@likinex.app',
      name: 'Usuario Demo',
      created_at: new Date().toISOString(),
    };
    setUser(demoUser);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        setMessage({ type: 'error', title: 'Error', message: error.message });
        return { success: false, error: error.message };
      }

      setMessage({
        type: 'success',
        title: 'Email Enviado',
        message: 'Revisa tu correo para restablecer tu contraseña.',
      });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setMessage({ type: 'error', title: 'Error', message: msg });
      return { success: false, error: msg };
    }
  };

  const clearMessage = () => setMessage(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isLoading,
        isDemo,
        signUp,
        signIn,
        signOut,
        enterDemoMode,
        resetPassword,
        message,
        clearMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
