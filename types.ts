
export enum SessionStatus {
  PLANNED = 'PLANNED',
  ATTENDED = 'ATTENDED',
  MISSED = 'MISSED',
  POSTPONED_BY_TEACHER = 'POSTPONED_BY_TEACHER',
  TEACHER_ABSENT = 'TEACHER_ABSENT'
}

export interface Session {
  id: string;
  date: string; // ISO format (YYYY-MM-DD)
  time: string; // HH:mm format
  status: SessionStatus;
  note?: string;
}
