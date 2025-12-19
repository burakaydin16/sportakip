
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Kayıt başarılı! Lütfen giriş yapın.');
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Oturum işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 mb-4">
            <i className="fa-solid fa-person-skating text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">PilaTrack</h1>
          <p className="text-slate-400 font-medium text-sm mt-1">Kişisel Pilates Takip Asistanı</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isRegistering ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            Giriş Yap
          </button>
          <button 
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isRegistering ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            Kayıt Ol
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">E-Posta</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Şifre</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : (isRegistering ? 'Hesap Oluştur' : 'Oturum Aç')}
          </button>
        </form>

        <p className="text-center text-slate-400 text-[10px] mt-8 uppercase font-bold tracking-widest">
          Sadece sizin için, sizin disiplininizle.
        </p>
      </div>
    </div>
  );
};

export default Auth;
