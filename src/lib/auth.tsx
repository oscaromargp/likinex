'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthMessage {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  enterDemoMode: () => void;
  recoverPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  recoverUsername: (email: string) => Promise<{ success: boolean; message: string }>;
  message: AuthMessage | null;
  clearMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (urlParams.get('demo') === 'true') {
      setIsDemo(true);
      const demoUser = {
        id: 'demo_user',
        email: 'demo@likinex.app',
        name: 'Usuario Demo',
        created_at: new Date().toISOString()
      };
      setUser(demoUser);
      localStorage.setItem('likinex_user', JSON.stringify(demoUser));
    }

    let users = JSON.parse(localStorage.getItem('likinex_users') || '[]');
    const defaultUser = {
      id: 'user_default',
      email: 'oscaromargp@gmail.com',
      name: 'Oscar',
      password: 'Carlo$0311++',
      created_at: new Date().toISOString()
    };
    if (!users.find((u: any) => u.email === 'oscaromargp@gmail.com')) {
      users.push(defaultUser);
      localStorage.setItem('likinex_users', JSON.stringify(users));
    }
    
    const savedUser = localStorage.getItem('likinex_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let users = JSON.parse(localStorage.getItem('likinex_users') || '[]');
    
    const defaultUser = {
      id: 'user_default',
      email: 'oscaromargp@gmail.com',
      name: 'Oscar',
      password: 'Carlo$0311++',
      created_at: new Date().toISOString()
    };
    
    if (email === 'oscaromargp@gmail.com' && password === 'Carlo$0311++') {
      if (!users.find((u: any) => u.email === 'oscaromargp@gmail.com')) {
        users.push(defaultUser);
        localStorage.setItem('likinex_users', JSON.stringify(users));
      }
      const userData = { id: defaultUser.id, email: defaultUser.email, name: defaultUser.name, created_at: defaultUser.created_at };
      setUser(userData);
      localStorage.setItem('likinex_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    const foundUser = users.find((u: User & { password: string }) => u.email === email);
    
    if (foundUser && foundUser.password === password) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('likinex_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('likinex_users') || '[]');
    
    if (users.find((u: User & { password: string }) => u.email === email)) {
      setIsLoading(false);
      return false;
    }
    
    const newUser: User & { password: string } = {
      id: `user_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      password,
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('likinex_users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('likinex_user', JSON.stringify(userWithoutPassword));
    
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsDemo(false);
    localStorage.removeItem('likinex_user');
  };

  const enterDemoMode = () => {
    setIsDemo(true);
    const demoUser = {
      id: 'demo_user',
      email: 'demo@likinex.app',
      name: 'Usuario Demo',
      created_at: new Date().toISOString()
    };
    setUser(demoUser);
    localStorage.setItem('likinex_user', JSON.stringify(demoUser));
  };

  const recoverPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem('likinex_users') || '[]');
    const foundUser = users.find((u: User & { password: string }) => u.email === email);
    
    setIsLoading(false);
    
    if (foundUser) {
      setMessage({
        type: 'success',
        title: 'Contraseña Recuperada',
        message: `Tu contraseña es: ${foundUser.password}\n\nRecuerda guardarla en un lugar seguro.`
      });
      return { success: true, message: 'Contraseña recuperada exitosamente' };
    } else {
      setMessage({
        type: 'error',
        title: 'Usuario No Encontrado',
        message: 'El correo electrónico no está registrado en nuestro sistema.'
      });
      return { success: false, message: 'El email no está registrado' };
    }
  };

  const recoverUsername = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem('likinex_users') || '[]');
    const foundUser = users.find((u: User & { password: string }) => u.email === email);
    
    setIsLoading(false);
    
    if (foundUser) {
      setMessage({
        type: 'success',
        title: 'Usuario Recuperado',
        message: `Tu usuario es: ${foundUser.name}\n\n¡Bienvenido de nuevo!`
      });
      return { success: true, message: 'Usuario recuperado exitosamente' };
    } else {
      setMessage({
        type: 'error',
        title: 'Correo No Encontrado',
        message: 'No encontramos ninguna cuenta asociada a este correo electrónico.'
      });
      return { success: false, message: 'El email no está registrado' };
    }
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isDemo, login, register, logout, enterDemoMode, recoverPassword, recoverUsername, message, clearMessage }}>
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