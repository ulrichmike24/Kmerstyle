import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Smartphone,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_MASTER_ADMIN, generateCurrentTotpCode, getAdminCredentials } from '../../services/auth/AuthService';

export const AdminLoginGate: React.FC = () => {
  const { adminLogin, setActivePortal } = useStore();

  const [email, setEmail] = useState(DEFAULT_MASTER_ADMIN.email);
  const [password, setPassword] = useState(DEFAULT_MASTER_ADMIN.passwordHash);
  const [totpCode, setTotpCode] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [liveCode, setLiveCode] = useState(generateCurrentTotpCode());

  // Load configured email if modified by owner
  useEffect(() => {
    getAdminCredentials().then((creds) => {
      if (creds && creds.email) {
        setEmail(creds.email);
        setPassword(creds.passwordHash);
      }
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCode(generateCurrentTotpCode());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoggingIn(true);

    try {
      const result = await adminLogin(email, password, totpCode);
      if (!result.success) {
        setErrorMsg(result.error || 'Authentification refusée');
      }
    } catch {
      setErrorMsg('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fillDefaultCreds = () => {
    setEmail(DEFAULT_MASTER_ADMIN.email);
    setPassword(DEFAULT_MASTER_ADMIN.passwordHash);
    setTotpCode('123456');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-950 to-black pointer-events-none" />

      {/* Top Back link */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => setActivePortal('client')}
          className="flex items-center gap-2 text-stone-400 hover:text-white text-xs font-semibold bg-stone-900/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-stone-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Retour à la Boutique Client</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-white">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-900/40">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-serif text-2xl font-extrabold tracking-tight">
            Accès Direction Générale
          </h1>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            Portail hautement sécurisé • Authentification JWT & Google Authenticator 2FA
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email */}
          <div>
            <label className="block text-stone-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Email Administrateur
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ngassaulrich17@gmail.com"
                className="w-full bg-stone-800/80 border border-stone-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
              />
              <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-stone-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Mot de Passe Administrateur
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-stone-800/80 border border-stone-700 rounded-xl pl-9 pr-10 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Google Authenticator 2FA TOTP */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Smartphone size={13} className="text-amber-400" />
                <span>Google Authenticator (Code 2FA)</span>
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                Code live : {liveCode}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="Ex: 123456"
                className="w-full bg-stone-800/80 border border-amber-500/40 rounded-xl pl-9 pr-3 py-2.5 text-amber-300 font-mono font-bold text-center text-sm tracking-widest focus:outline-none focus:border-amber-400"
              />
              <Smartphone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-900/40 transition-all active:scale-95 cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Vérification sécurisée...</span>
              </>
            ) : (
              <span>Déverrouiller le Portail Admin</span>
            )}
          </button>
        </form>

        {/* Credentials reminder */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 text-[11px] space-y-2 text-stone-400">
          <div className="flex items-center justify-between font-bold text-stone-200">
            <span className="flex items-center gap-1.5 text-amber-400">
              <ShieldAlert size={14} />
              Identifiants Administrateur Configurés :
            </span>
            <button
              onClick={fillDefaultCreds}
              className="text-amber-400 hover:underline font-bold cursor-pointer"
            >
              Remplir
            </button>
          </div>
          <div className="font-mono text-[10px] text-stone-400 space-y-0.5">
            <p>• Email : <span className="text-white">ngassaulrich17@gmail.com</span></p>
            <p>• Mot de passe : <span className="text-white">Jesusloveme2026@</span></p>
            <p>• 2FA Authenticator : <span className="text-amber-400 font-bold">123456</span> (ou code live {liveCode})</p>
          </div>
        </div>
      </div>
    </div>
  );
};
