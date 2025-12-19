
export enum SessionStatus {
  PLANNED = 'PLANNED',
  ATTENDED = 'ATTENDED',
  MISSED = 'MISSED',
  POSTPONED_BY_TEACHER = 'POSTPONED_BY_TEACHER',
  TEACHER_ABSENT = 'TEACHER_ABSENT',
  CANCELLED = 'CANCELLED'
}

export interface Session {
  id: string;
  user_id: string;
  date: string;
  time: string;
  status: SessionStatus;
  note?: string;
  created_at?: string;
}
