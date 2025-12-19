
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Session, SessionStatus } from './types';
import SessionCard from './components/SessionCard';
import AddSessionModal from './components/AddSessionModal';
import Auth from './components/Auth';
import { supabase, isConfigValid } from './lib/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<{type: 'config' | 'schema' | 'auth', message: string} | null>(null);

  // 1. Oturum Kontrolü
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Veri Çekme
  const fetchSessions = useCallback(async () => {
    if (!user || !supabase) return;
    
    setIsLoading(true);
    setErrorState(null);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        // Tablo bulunamadı hatası (Postgres Code: 42P01)
        if (error.code === '42P01') {
          setErrorState({
            type: 'schema',
            message: 'Veritabanı tabloları bulunamadı. Lütfen SQL Editor üzerinden tabloları oluşturun.'
          });
        } else {
          throw error;
        }
      } else {
        setSessions(data || []);
      }
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setErrorState({ type: 'auth', message: err.message || 'Veriler yüklenemedi.' });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user, fetchSessions]);

  // Yardımcı Fonksiyonlar
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      setSessions([]);
    }
  };

  // --- EKRAN DURUMLARI ---

  // A. Yapılandırma Eksikse
  if (!isConfigValid || !supabase) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center">
           <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <i className="fa-solid fa-plug-circle-xmark text-amber-500 text-4xl"></i>
           </div>
           <h1 className="text-2xl font-black text-slate-800 mb-4">Bağlantı Kurulamadı</h1>
           <p className="text-slate-500 text-sm mb-8">
             Netlify panelinde <b>SUPABASE_URL</b> ve <b>SUPABASE_KEY</b> değerlerini tanımladığınızdan emin olun.
           </p>
           <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all">
             Sayfayı Yenile
           </button>
        </div>
      </div>
    );
  }

  // B. Yükleniyor
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sistem Hazırlanıyor</p>
        </div>
      </div>
    );
  }

  // C. Giriş Yapılmamışsa
  if (!user) return <Auth />;

  // D. Tablo Hatası Varsa
  if (errorState?.type === 'schema') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white p-10 rounded-[2.5rem] shadow-2xl">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 text-xl">
               <i className="fa-solid fa-database"></i>
             </div>
             <div>
               <h1 className="text-xl font-black text-slate-800">Veritabanı Hazır Değil</h1>
               <p className="text-slate-500 text-xs">Aşağıdaki SQL kodunu Supabase SQL Editor'de çalıştırmalısınız.</p>
             </div>
           </div>
           <pre className="bg-slate-900 text-emerald-400 p-6 rounded-2xl text-[10px] overflow-x-auto mb-8 font-mono border border-slate-800 leading-relaxed">
{`CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text
);

CREATE TABLE public.sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  status text DEFAULT 'PLANNED'
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own" ON public.sessions FOR ALL USING (auth.uid() = user_id);`}
           </pre>
           <button onClick={() => fetchSessions()} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
             Tabloları Oluşturdum, Devam Et
           </button>
        </div>
      </div>
    );
  }

  // --- ANA UYGULAMA MANTIĞI ---

  const addMultipleSessions = async (newSessionsData: { date: string; time: string }[]) => {
    if (!supabase || !user) return;
    const newSessions = newSessionsData.map(data => ({
      date: data.date,
      time: data.time,
      status: SessionStatus.PLANNED,
      user_id: user.id
    }));

    try {
      const { error } = await supabase.from('sessions').insert(newSessions);
      if (error) throw error;
      fetchSessions();
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  const updateStatus = async (id: string, status: SessionStatus) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('sessions').update({ status }).eq('id', id);
      if (error) throw error;
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch (err: any) {
      console.error(err);
    }
  };

  const stats = {
    total: sessions.length,
    attended: sessions.filter(s => s.status === SessionStatus.ATTENDED).length,
    missed: sessions.filter(s => s.status === SessionStatus.MISSED).length,
    rate: sessions.length > 0 ? Math.round((sessions.filter(s => s.status === SessionStatus.ATTENDED).length / sessions.length) * 100) : 0
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = sessions.filter(s => s.date >= today);
  const past = sessions.filter(s => s.date < today).reverse();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-calendar-check text-xl"></i>
            </div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">PilaTrack</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md">
              <i className="fa-solid fa-plus mr-2"></i> Yeni Ders
            </button>
            <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:text-rose-500 transition-all">
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-12">
        {/* İstatistikler */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Toplam Ders" value={stats.total} color="text-slate-800" />
          <StatCard label="Katılım" value={stats.attended} color="text-emerald-600" />
          <StatCard label="Eksik" value={stats.missed} color="text-rose-600" />
          <StatCard label="Başarı Oranı" value={`%${stats.rate}`} color="text-blue-600" />
        </section>

        {/* Ders Listeleri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ListSection title="Bekleyen Dersler" count={upcoming.length} sessions={upcoming} onUpdate={updateStatus} emptyText="Planlı dersiniz yok." />
          <ListSection title="Geçmiş" count={past.length} sessions={past} onUpdate={updateStatus} emptyText="Geçmiş kaydı yok." isPast />
        </div>
      </main>

      {isModalOpen && <AddSessionModal onAddMultiple={addMultipleSessions} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm text-center">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

const ListSection = ({ title, count, sessions, onUpdate, emptyText, isPast = false }: any) => (
  <section className={isPast ? "opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all" : ""}>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-black text-slate-800">{title}</h2>
      <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black">{count}</span>
    </div>
    <div className="space-y-4">
      {sessions.length > 0 ? (
        sessions.map((s: any) => (
          <SessionCard key={s.id} session={s} onUpdateStatus={onUpdate} onReschedule={() => {}} onDelete={() => {}} />
        ))
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-400 text-sm font-bold">
          {emptyText}
        </div>
      )}
    </div>
  </section>
);

export default App;
