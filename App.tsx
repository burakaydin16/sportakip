
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Session, SessionStatus } from './types';
import SessionCard from './components/SessionCard';
import AddSessionModal from './components/AddSessionModal';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch sessions from Supabase
  const fetchSessions = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // If Supabase is not configured, show a helpful setup screen instead of crashing
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mx-auto mb-6">
            <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-4">Yapılandırma Gerekli</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            PilaTrack'in çalışabilmesi için Supabase bağlantı bilgilerini Netlify paneline eklemelisin.
          </p>
          <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 font-mono text-xs">
            <p className="flex justify-between"><span>SUPABASE_URL</span> <span className="text-rose-500">Eksik</span></p>
            <p className="flex justify-between"><span>SUPABASE_ANON_KEY</span> <span className="text-rose-500">Eksik</span></p>
          </div>
          <a 
            href="https://app.netlify.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all"
          >
            Netlify Paneline Git
          </a>
          <p className="mt-4 text-xs text-slate-400">
            Değişkenleri ekledikten sonra sayfayı yenilemeyi unutma.
          </p>
        </div>
      </div>
    );
  }

  const addMultipleSessions = async (newSessionsData: { date: string; time: string }[]) => {
    const newSessions = newSessionsData.map(data => ({
      date: data.date,
      time: data.time,
      status: SessionStatus.PLANNED
    }));

    try {
      const { error } = await supabase.from('sessions').insert(newSessions);
      if (error) throw error;
      fetchSessions(); // Refresh list
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding sessions:', err);
      alert('Dersler eklenirken bir hata oluştu.');
    }
  };

  const updateStatus = async (id: string, status: SessionStatus) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const rescheduleSession = async (id: string, newDate: string, newTime: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ date: newDate, time: newTime })
        .eq('id', id);

      if (error) throw error;
      fetchSessions(); // Refresh to maintain order
    } catch (err) {
      console.error('Error rescheduling session:', err);
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm('Bu dersi silmek istediğine emin misin?')) return;
    
    try {
      const { error } = await supabase.from('sessions').delete().eq('id', id);
      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const stats = useMemo(() => {
    const total = sessions.length;
    const attended = sessions.filter(s => s.status === SessionStatus.ATTENDED).length;
    const missed = sessions.filter(s => s.status === SessionStatus.MISSED).length;
    const teacherAbsent = sessions.filter(s => s.status === SessionStatus.TEACHER_ABSENT).length;
    const planned = sessions.filter(s => s.status === SessionStatus.PLANNED).length;
    
    const completedCount = total - planned;
    const attendanceRate = completedCount > 0 ? Math.round((attended / completedCount) * 100) : 0;
    
    return { total, attended, missed, teacherAbsent, planned, attendanceRate };
  }, [sessions]);

  const today = new Date().toISOString().split('T')[0];
  const upcomingSessions = useMemo(() => sessions.filter(s => s.date >= today), [sessions, today]);
  const pastSessions = useMemo(() => sessions.filter(s => s.date < today).reverse(), [sessions, today]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <i className="fa-solid fa-person-skating text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">PilaTrack</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bulut Senkronize</span>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md shadow-emerald-100"
          >
            <i className="fa-solid fa-calendar-plus"></i>
            <span>Ders Tanımla</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-10">
        
        {/* Reports Section */}
        <section className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <i className="fa-solid fa-chart-pie text-emerald-500"></i>
              Gelişim Raporu
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="space-y-1">
                <p className="text-slate-400 text-[10px] font-bold uppercase">Toplam</p>
                <p className="text-3xl font-black text-slate-800">{stats.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-emerald-500 text-[10px] font-bold uppercase">Katılım</p>
                <p className="text-3xl font-black text-emerald-600">{stats.attended}</p>
              </div>
              <div className="space-y-1">
                <p className="text-rose-500 text-[10px] font-bold uppercase">Kaçırılan</p>
                <p className="text-3xl font-black text-rose-600">{stats.missed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-purple-500 text-[10px] font-bold uppercase">İptal (Hoca)</p>
                <p className="text-3xl font-black text-purple-600">{stats.teacherAbsent}</p>
              </div>
              <div className="space-y-1">
                <p className="text-emerald-700 text-[10px] font-bold uppercase">Performans</p>
                <p className="text-3xl font-black text-emerald-700">%{stats.attendanceRate}</p>
              </div>
            </div>

            <div className="mt-10 h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: `${(stats.attended / (stats.total || 1)) * 100}%` }} className="bg-emerald-500 h-full transition-all duration-1000"></div>
              <div style={{ width: `${(stats.missed / (stats.total || 1)) * 100}%` }} className="bg-rose-500 h-full transition-all duration-1000"></div>
              <div style={{ width: `${(stats.teacherAbsent / (stats.total || 1)) * 100}%` }} className="bg-purple-500 h-full transition-all duration-1000"></div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Gidilen</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Gidilmeyen</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Hoca Gelmedi</span>
              <span className="flex items-center gap-1.5 ml-auto text-emerald-600 uppercase">Bekleyen: {stats.planned}</span>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Veriler Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section>
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-2 h-7 bg-emerald-500 rounded-full"></div>
                Güncel Program
              </h2>
              <div className="space-y-4">
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
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <i className="fa-solid fa-calendar-day text-2xl"></i>
                    </div>
                    <h3 className="text-slate-600 font-bold">Henüz ders girişi yapılmadı</h3>
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-emerald-600 font-bold hover:underline">Başlamak için tıkla</button>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3 opacity-60">
                <div className="w-2 h-7 bg-slate-300 rounded-full"></div>
                Ders Geçmişi
              </h2>
              <div className="space-y-4 opacity-80">
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
                  <div className="p-8 text-center text-slate-400 font-medium italic">Geçmiş ders kaydı bulunmuyor.</div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 md:hidden">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-16 h-16 bg-emerald-600 rounded-2xl shadow-2xl shadow-emerald-400 text-white flex items-center justify-center text-3xl active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-plus"></i>
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
