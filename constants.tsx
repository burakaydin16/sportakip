
import React from 'react';
import { SessionStatus } from './types';

export const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [SessionStatus.PLANNED]: {
    label: 'Planlandı',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <i className="fa-solid fa-calendar-clock"></i>
  },
  [SessionStatus.ATTENDED]: {
    label: 'Katıldım',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <i className="fa-solid fa-check-circle"></i>
  },
  [SessionStatus.MISSED]: {
    label: 'Gidemedim',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: <i className="fa-solid fa-times-circle"></i>
  },
  [SessionStatus.POSTPONED_BY_TEACHER]: {
    label: 'Hoca Erteledi',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <i className="fa-solid fa-clock-rotate-left"></i>
  },
  [SessionStatus.TEACHER_ABSENT]: {
    label: 'Hoca Gelmedi',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <i className="fa-solid fa-user-slash"></i>
  },
  [SessionStatus.CANCELLED]: {
    label: 'İptal Edildi',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <i className="fa-solid fa-ban"></i>
  }
};

export const DAYS_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
