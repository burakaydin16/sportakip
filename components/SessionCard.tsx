
import React, { useState } from 'react';
import { Session, SessionStatus } from '../types';
import { STATUS_CONFIG } from '../constants';

interface SessionCardProps {
  session: Session;
  onUpdateStatus: (id: string, status: SessionStatus) => void;
  onReschedule: (id: string, newDate: string, newTime: string) => void;
  onDelete: (id: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onUpdateStatus, onReschedule, onDelete }) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(session.date);
  const [newTime, setNewTime] = useState(session.time);

  const config = STATUS_CONFIG[session.status];

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReschedule(session.id, newDate, newTime);
    setIsRescheduling(false);
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md ${session.status === SessionStatus.PLANNED ? 'border-l-4 border-l-blue-500' : ''}`}>
      {!isRescheduling ? (
        <>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${config.color.split(' ')[0]}`}>
                {config.icon}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{session.time}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                  {new Date(session.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-black border tracking-wider shadow-sm ${config.color}`}>
              {config.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button 
              onClick={() => onUpdateStatus(session.id, SessionStatus.ATTENDED)}
              className="text-[11px] py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all font-bold border border-emerald-100 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-check"></i> Katıldım
            </button>
            <button 
              onClick={() => onUpdateStatus(session.id, SessionStatus.MISSED)}
              className="text-[11px] py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl transition-all font-bold border border-rose-100 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-xmark"></i> Gidemedim
            </button>
            <button 
              onClick={() => setIsRescheduling(true)}
              className="text-[11px] py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl transition-all font-bold border border-amber-100 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-clock-rotate-left"></i> Ertele/Kaydır
            </button>
            <button 
              onClick={() => onUpdateStatus(session.id, SessionStatus.TEACHER_ABSENT)}
              className="text-[11px] py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition-all font-bold border border-purple-100 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-user-slash"></i> Hoca Gelmedi
            </button>
            <button 
              onClick={() => onUpdateStatus(session.id, SessionStatus.CANCELLED)}
              className="text-[11px] py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all font-bold border border-slate-200 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-ban"></i> Genel İptal
            </button>
            <button 
              onClick={() => onDelete(session.id)}
              className="text-[11px] py-2.5 bg-white text-slate-400 hover:text-rose-600 rounded-xl transition-all font-bold border border-slate-100 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-trash-can"></i> Sil
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-calendar-plus text-amber-500"></i>
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Ders Tarihini Güncelle</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Yeni Tarih</label>
              <input 
                type="date" 
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Yeni Saat</label>
              <input 
                type="time" 
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-emerald-600 text-white text-xs py-3 rounded-xl font-black shadow-md shadow-emerald-100"
            >
              DEĞİŞİKLİKLERİ KAYDET
            </button>
            <button 
              type="button"
              onClick={() => setIsRescheduling(false)}
              className="flex-1 bg-slate-100 text-slate-600 text-xs py-3 rounded-xl font-bold"
            >
              VAZGEÇ
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SessionCard;
