'use client';

import { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Info, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';

type AuthMode = 'login' | 'register' | 'recoverPassword' | 'recoverUsername';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`p-4 rounded-xl border shadow-2xl backdrop-blur-xl ${
              toast.type === 'success' 
                ? 'bg-emerald-500/20 border-emerald-500/30' 
                : toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/30'
                : 'bg-indigo-500/20 border-indigo-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${
                toast.type === 'success' ? 'text-emerald-400' : toast.type === 'error' ? 'text-red-400' : 'text-indigo-400'
              }`}>
                {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                {toast.type === 'info' && <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-sm ${
                  toast.type === 'success' ? 'text-emerald-300' : toast.type === 'error' ? 'text-red-300' : 'text-indigo-300'
                }`}>
                  {toast.title}
                </h4>
                <p className="text-white/80 text-sm mt-1 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/5 to-transparent rounded-full"
      />
    </div>
  );
}

function ModeCard({ 
  mode, 
  isActive, 
  onClick, 
  icon: Icon, 
  title, 
  description 
}: { 
  mode: AuthMode; 
  isActive: boolean; 
  onClick: () => void; 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border transition-all duration-300 text-left group ${
        isActive 
          ? 'bg-emerald-500/20 border-emerald-500/40' 
          : 'bg-slate-800/30 border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/30' : 'bg-slate-700/50 group-hover:bg-emerald-500/20'} transition-colors`}>
          <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-emerald-400'}`} />
        </div>
        <div>
          <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

function AuthContent() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const { login, register, recoverPassword, recoverUsername } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/app';

  useEffect(() => {
    const timer = setTimeout(() => setShowInfoCard(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string, duration = 5000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success: boolean;
      
      if (mode === 'login') {
        success = await login(email, password);
        if (!success) {
          setError('Email o contraseña incorrectos. Por favor verifica tus credenciales.');
          addToast('error', 'Error de Acceso', 'Las credenciales proporcionadas no son correctas. Por favor intenta de nuevo.');
        } else {
          addToast('success', '¡Bienvenido de Nuevo!', `Hola ${email.split('@')[0]}! Es un placer tenerte de vuelta en LikinEX.`);
          setTimeout(() => router.push(from), 1500);
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
          setError('Por favor ingresa tu nombre');
          setLoading(false);
          return;
        }
        success = await register(email, password, name);
        if (!success) {
          setError('El email ya está registrado. ¿Quizás quieres iniciar sesión?');
          addToast('error', 'Cuenta Existente', 'Ya existe una cuenta con este correo electrónico.');
        } else {
          addToast('success', '¡Cuenta Creada!', `Bienvenido ${name} a LikinEX. Tu cuenta ha sido creada exitosamente.`);
          setTimeout(() => router.push(from), 1500);
        }
      } else if (mode === 'recoverPassword') {
        const result = await recoverPassword(email);
        if (result.success) {
          addToast('success', '¡Contraseña Recuperada!', 'Tu contraseña ha sido mostrada. Por favor revisa el mensaje.');
          setTimeout(() => setMode('login'), 3000);
        } else {
          addToast('error', 'Usuario No Encontrado', 'El correo electrónico no está registrado en nuestro sistema.');
        }
      } else if (mode === 'recoverUsername') {
        const result = await recoverUsername(email);
        if (result.success) {
          addToast('success', '¡Usuario Recuperado!', 'Tu nombre de usuario ha sido mostrado. Por favor revisa el mensaje.');
          setTimeout(() => setMode('login'), 3000);
        } else {
          addToast('error', 'Correo No Encontrado', 'No encontramos ninguna cuenta asociada a este correo.');
        }
      }
    } catch (err) {
      setError('Ocurrió un error. Por favor intenta de nuevo.');
      addToast('error', 'Error Inesperado', 'Hubo un problema. Por favor contacta soporte si persiste.');
    } finally {
      setLoading(false);
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'login': return 'Bienvenido de nuevo';
      case 'register': return 'Crea tu cuenta';
      case 'recoverPassword': return 'Recupera tu contraseña';
      case 'recoverUsername': return 'Recupera tu usuario';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'login': return 'Ingresa tus credenciales para acceder';
      case 'register': return 'Únete a LikinEX y toma control de tus finanzas';
      case 'recoverPassword': return 'Ingresa tu email para recuperar tu contraseña';
      case 'recoverUsername': return 'Ingresa tu email para recuperar tu usuario';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/30"
          >
            <span className="text-4xl">💰</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-100 to-indigo-200 bg-clip-text text-transparent mb-2"
          >
            LikinEX
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400"
          >
            {getModeTitle()}
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`card-${mode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6"
              >
                <p className="text-sm text-slate-400 text-center">{getModeDescription()}</p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode !== 'recoverPassword' && mode !== 'recoverUsername' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={mode === 'register' ? "Tu nombre completo" : "Nombre"}
                      disabled={mode === 'login'}
                      autoComplete="name"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {mode !== 'recoverPassword' && mode !== 'recoverUsername' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-500/50 disabled:to-emerald-600/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' && 'Iniciar Sesión'}
                    {mode === 'register' && 'Crear Cuenta'}
                    {mode === 'recoverPassword' && 'Recuperar Contraseña'}
                    {mode === 'recoverUsername' && 'Recuperar Usuario'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {mode === 'login' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-slate-900/60 text-slate-500">Opciones de recuperación</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setMode('recoverPassword'); addToast('info', 'Recuperación', 'Ingresa tu correo para recuperar tu contraseña.'); }}
                      className="text-xs text-slate-400 hover:text-emerald-400 transition-colors py-2"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                    <button
                      onClick={() => { setMode('recoverUsername'); addToast('info', 'Recuperación', 'Ingresa tu correo para recuperar tu usuario.'); }}
                      className="text-xs text-slate-400 hover:text-emerald-400 transition-colors py-2"
                    >
                      ¿Olvidaste tu usuario?
                    </button>
                  </div>
                </>
              )}

              <div className="text-center pt-2">
                {mode === 'login' && (
                  <p className="text-slate-500 text-sm">
                    ¿No tienes cuenta?{' '}
                    <button
                      onClick={() => { setMode('register'); addToast('info', 'Nuevo Usuario', 'Completa el formulario para crear tu cuenta.'); }}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Regístrate gratis
                    </button>
                  </p>
                )}
                {(mode === 'register' || mode === 'recoverPassword' || mode === 'recoverUsername') && (
                  <button
                    onClick={() => { setMode('login'); addToast('info', 'Inicio de Sesión', 'Ingresa tus credenciales para continuar.'); }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-slate-600 text-sm mt-6"
        >
          "Porque Dios es el que en vosotros produce así el querer como el hacer" - Filipenses 2:13
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}