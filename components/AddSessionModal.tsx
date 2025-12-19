
import React, { useState } from 'react';
import { DAYS_TR } from '../constants';

interface AddSessionModalProps {
  onAddMultiple: (sessions: { date: string; time: string }[]) => void;
  onClose: () => void;
}

const AddSessionModal: React.FC<AddSessionModalProps> = ({ onAddMultiple, onClose }) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  
  // Recurring state
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0: Pazartesi, 6: Pazar
  const [weeksCount, setWeeksCount] = useState(4);

  const toggleDay = (index: number) => {
    setSelectedDays(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isRecurring) {
      onAddMultiple([{ date, time }]);
    } else {
      if (selectedDays.length === 0) {
        alert("Lütfen en az bir gün seçin.");
        return;
      }

      const generatedSessions: { date: string; time: string }[] = [];
      const startDate = new Date(date);
      
      for (let w = 0; w < weeksCount; w++) {
        selectedDays.forEach(dayIndex => {
          // dayIndex is 0-6 (Pzt-Paz)
          // JS getDay() is 0-6 (Paz-Cmt)
          // Map Pzt(0) -> 1, Paz(6) -> 0
          const targetJsDay = dayIndex === 6 ? 0 : dayIndex + 1;
          
          const current = new Date(startDate);
          current.setDate(startDate.getDate() + (w * 7));
          
          // Move to the correct day of the week
          const currentJsDay = current.getDay();
          let diff = targetJsDay - currentJsDay;
          // If we want to ensure we don't go backwards from the start date in the first week
          if (w === 0 && diff < 0) return; 
          
          current.setDate(current.getDate() + diff);
          
          generatedSessions.push({
            date: current.toISOString().split('T')[0],
            time: time
          });
        });
      }
      onAddMultiple(generatedSessions);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Ders Programla</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setIsRecurring(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isRecurring ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tek Seferlik
          </button>
          <button 
            onClick={() => setIsRecurring(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isRecurring ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tekrarlayan (Çoklu)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {isRecurring ? 'Başlangıç Tarihi' : 'Tarih'}
              </label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Saat</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {isRecurring && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Hangi Günler?</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_TR.map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                        selectedDays.includes(idx) 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kaç Hafta Sürsün? ({weeksCount} Hafta)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="24" 
                  value={weeksCount}
                  onChange={(e) => setWeeksCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>1 Hafta</span>
                  <span>12 Hafta</span>
                  <span>24 Hafta</span>
                </div>
              </div>
            </>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
            >
              {isRecurring ? `${selectedDays.length * weeksCount} Dersi Programa Ekle` : 'Dersi Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSessionModal;
