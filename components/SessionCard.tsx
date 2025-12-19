
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
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all ${session.status === SessionStatus.PLANNED ? 'border-l-4 border-l-blue-500' : ''}`}>
      {!isRescheduling ? (
        <>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{session.time}</h3>
              <p className="text-sm text-slate-500">
                {new Date(session.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border ${config.color}`}>
              {config.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={() => onUpdateStatus(session.id, SessionStatus.ATTENDED)}
              className="text-xs py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors font-medium border border-emerald-100"
            >
              <i className="fa-solid fa-check mr-1"></i> Gittim
            </button>
            <button 
              onClick={() => onUpdateStatus(session.id, SessionStatus.MISSED)}
              className="text-xs py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors font-medium border border-rose-100"
            >
              <i className="fa-solid fa-xmark mr-1"></i> Gitmedim
            </button>
            <button 
              onClick={() => {
                onUpdateStatus(session.id, SessionStatus.POSTPONED_BY_TEACHER);
                setIsRescheduling(true);
              }}
              className="text-xs py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors font-medium border border-amber-100"
            >
              <i className="fa-solid fa-clock mr-1"></i> Erteledi / Kaydır
            </button>
            <button 
              onClick={() => onUpdateStatus(session.id, SessionStatus.TEACHER_ABSENT)}
              className="text-xs py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors font-medium border border-purple-100"
            >
              <i className="fa-solid fa-user-slash mr-1"></i> Hoca Gelmedi
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => setIsRescheduling(true)}
              className="text-[11px] text-blue-600 font-semibold hover:underline"
            >
              <i className="fa-solid fa-calendar-day mr-1"></i> Tarihi Değiştir
            </button>
            <button 
              onClick={() => onDelete(session.id)}
              className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
            >
              <i className="fa-solid fa-trash-alt"></i>
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 mb-2">Dersi Kaydır</h4>
          <div className="space-y-3">
            <input 
              type="date" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              required
            />
            <input 
              type="time" 
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
              required
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-emerald-600 text-white text-xs py-2 rounded-lg font-bold"
            >
              Güncelle
            </button>
            <button 
              type="button"
              onClick={() => setIsRescheduling(false)}
              className="flex-1 bg-slate-100 text-slate-600 text-xs py-2 rounded-lg"
            >
              İptal
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SessionCard;
