
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Session, SessionStatus } from './types';
import SessionCard from './components/SessionCard';
import AddSessionModal from './components/AddSessionModal';
import Auth from './components/Auth';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Auth State Listener - Supabase null kontrolü ile
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSessions = useCallback(async () => {
    if (!user || !supabase) return;
    
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('schema cache')) {
          throw new Error("Veritabanı yapısı (tablolar) bulunamadı. Lütfen README.md dosyasındaki SQL kodlarını Supabase panelinde çalıştırın.");
        }
        throw new Error(error.message);
      }
      setSessions(data || []);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setFetchError(err.message || 'Veriler yüklenirken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSessions([]);
    }
  };

  // Yapılandırma hatası ekranı
  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-200">
           <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <i className="fa-solid fa-triangle-exclamation text-amber-500 text-4xl"></i>
           </div>
           <h1 className="text-2xl font-black text-slate-800 mb-4">Bağlantı Bekleniyor</h1>
           <p className="text-slate-500 text-sm mb-8 leading-relaxed">
             Uygulamanın çalışması için Supabase URL ve Key değerleri Netlify paneline girilmeli veya kodda tanımlanmalıdır.
           </p>
           <a 
            href="https://app.netlify.com" 
            target="_blank" 
            className="block w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
           >
            Netlify Ayarlarını Aç
           </a>
        </div>
      </div>
    );
  }

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sistem Yükleniyor</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const addMultipleSessions = async (newSessionsData: { date: string; time: string }[]) => {
    if (!supabase) return;
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
      alert('Dersler eklenirken hata: ' + err.message);
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

  const rescheduleSession = async (id: string, newDate: string, newTime: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('sessions').update({ date: newDate, time: newTime, status: SessionStatus.PLANNED }).eq('id', id);
      if (error) throw error;
      fetchSessions();
    } catch (err: any) {
      console.error(err);
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm('Bu dersi silmek istediğine emin misin?') || !supabase) return;
    try {
      const { error } = await supabase.from('sessions').delete().eq('id', id);
      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      console.error(err);
    }
  };

  const stats = useMemo(() => {
    const total = sessions.length;
    const attended = sessions.filter(s => s.status === SessionStatus.ATTENDED).length;
    const missed = sessions.filter(s => s.status === SessionStatus.MISSED).length;
    const teacherIssues = sessions.filter(s => 
      s.status === SessionStatus.TEACHER_ABSENT || 
      s.status === SessionStatus.POSTPONED_BY_TEACHER
    ).length;
    const cancelled = sessions.filter(s => s.status === SessionStatus.CANCELLED).length;
    const planned = sessions.filter(s => s.status === SessionStatus.PLANNED).length;
    const completedCount = total - planned;
    const attendanceRate = completedCount > 0 ? Math.round((attended / completedCount) * 100) : 0;
    return { total, attended, missed, teacherIssues, cancelled, planned, attendanceRate };
  }, [sessions]);

  const today = new Date().toISOString().split('T')[0];
  const upcomingSessions = useMemo(() => sessions.filter(s => s.date >= today), [sessions, today]);
  const pastSessions = useMemo(() => sessions.filter(s => s.date < today).reverse(), [sessions, today]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <i className="fa-solid fa-person-skating text-xl"></i>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 leading-none">PilaTrack</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">SaaS Pilates Takibi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              Ders Planla
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
            
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-3 rounded-2xl border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs overflow-hidden">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black text-slate-800 leading-none truncate max-w-[120px]">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-8 h-8 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:text-rose-500 transition-all shadow-sm border border-slate-100"
              >
                <i className="fa-solid fa-power-off text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-8 animate-in fade-in duration-500">
        {fetchError ? (
          <section className="bg-rose-50 border border-rose-200 rounded-[2.5rem] p-12 text-center shadow-xl shadow-rose-100/10">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
              <i className="fa-solid fa-database text-3xl"></i>
            </div>
            <h3 className="text-rose-900 text-xl font-black mb-3">Veritabanı Senkronizasyonu Gerekli</h3>
            <p className="text-rose-700 text-sm mb-8 max-w-lg mx-auto leading-relaxed">{fetchError}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={fetchSessions} className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
                Tekrar Bağlan
              </button>
              <a href="https://supabase.com/dashboard" target="_blank" className="bg-white text-slate-700 px-8 py-3 rounded-2xl font-black text-sm border border-slate-200 hover:bg-slate-50 transition-all">
                SQL Editor'ü Aç
              </a>
            </div>
          </section>
        ) : (
          <>
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-50 rounded-full opacity-40 group-hover:scale-110 transition-transform duration-1000"></div>
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <h2 className="text-slate-800 font-black text-lg">Haftalık Özet</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Disiplin Puanı</p>
                      <p className="text-3xl font-black text-emerald-600 leading-none mt-1">%{stats.attendanceRate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="space-y-1">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Ders Sayısı</p>
                      <p className="text-3xl font-black text-slate-800">{stats.total}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Katılım</p>
                      <p className="text-3xl font-black text-emerald-600">{stats.attended}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">Eksik</p>
                      <p className="text-3xl font-black text-rose-600">{stats.missed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-purple-500 text-[10px] font-bold uppercase tracking-widest">Hoca</p>
                      <p className="text-3xl font-black text-purple-600">{stats.teacherIssues}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">İptaller</p>
                      <p className="text-3xl font-black text-slate-400">{stats.cancelled}</p>
                    </div>
                  </div>

                  <div className="mt-12 h-4 bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner border border-slate-50">
                    <div style={{ width: `${(stats.attended / (stats.total || 1)) * 100}%` }} className="bg-emerald-500 h-full transition-all duration-1000"></div>
                    <div style={{ width: `${(stats.missed / (stats.total || 1)) * 100}%` }} className="bg-rose-500 h-full transition-all duration-1000"></div>
                    <div style={{ width: `${(stats.teacherIssues / (stats.total || 1)) * 100}%` }} className="bg-purple-500 h-full transition-all duration-1000"></div>
                    <div style={{ width: `${(stats.cancelled / (stats.total || 1)) * 100}%` }} className="bg-slate-300 h-full transition-all duration-1000"></div>
                  </div>
               </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                    Bekleyen Dersler
                  </h2>
                  <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border border-emerald-100">{upcomingSessions.length} Kayıt</span>
                </div>
                <div className="space-y-5">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map(session => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        onUpdateStatus={updateStatus} 
                        onReschedule={rescheduleSession}
                        onDelete={deleteSession}
                      />
                    ))
                  ) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center group hover:border-emerald-300 transition-all cursor-pointer" onClick={() => setIsModalOpen(true)}>
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 group-hover:text-emerald-200 transition-colors">
                        <i className="fa-solid fa-calendar-plus text-4xl"></i>
                      </div>
                      <p className="text-slate-400 font-bold mb-2">Henüz ders girişi yapılmadı.</p>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Planlamak için tıklayın</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3 opacity-40">
                  <div className="w-2 h-8 bg-slate-400 rounded-full"></div>
                  Geçmiş Dersler
                </h2>
                <div className="space-y-5 opacity-70 hover:opacity-100 transition-all">
                  {pastSessions.length > 0 ? (
                    pastSessions.map(session => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        onUpdateStatus={updateStatus} 
                        onReschedule={rescheduleSession}
                        onDelete={deleteSession}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Geçmiş kaydı bulunmuyor.</div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      <div className="fixed bottom-8 right-8 md:hidden z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-16 h-16 bg-emerald-600 rounded-3xl shadow-2xl shadow-emerald-400 text-white flex items-center justify-center text-2xl active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-calendar-plus"></i>
        </button>
      </div>

      {isModalOpen && (
        <AddSessionModal 
          onAddMultiple={addMultipleSessions} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
