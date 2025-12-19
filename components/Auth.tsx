
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
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: email.split('@')[0] }
          }
        });
        
        if (error) throw error;
        
        // ÖNEMLİ: Auth tetikleyicisi bazen yavaş çalışabilir, 
        // profil kaydını garantiye almak için manuel deneme:
        if (data.user) {
          await supabase.from('profiles').upsert({ 
            id: data.user.id, 
            email: data.user.email 
          });
        }

        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl mb-4 text-3xl">
            <i className="fa-solid fa-person-skating"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">PilaTrack</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Disiplinli Pilates Takibi</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
          <button onClick={() => setIsRegistering(false)} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${!isRegistering ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>GİRİŞ</button>
          <button onClick={() => setIsRegistering(true)} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${isRegistering ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>KAYIT</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-Posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required minLength={6} />
          </div>

          {error && <div className="p-4 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl border border-rose-100">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 mt-4 uppercase tracking-widest">
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : (isRegistering ? 'Hesap Oluştur' : 'Oturum Aç')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
