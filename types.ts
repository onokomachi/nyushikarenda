export enum EventType {
  APPLICATION_WEB = 'WEB出願',
  APPLICATION_PAPER = '書類郵送',
  EXAM = '試験',
  INTERVIEW = '面接',
  ANNOUNCEMENT = '合格発表',
  PROCEDURE = '入学手続',
  OTHER = 'その他'
}

export interface CalendarEvent {
  id: string;
  type: EventType;
  name?: string; // Optional custom name
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description?: string;
}

export interface Course {
  id: string;
  name: string; // e.g., "特進コース", "一般"
  events: CalendarEvent[];
}

export interface School {
  id: string;
  name: string; // e.g., "◯◯高校"
  courses: Course[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type ViewMode = 'edit' | 'calendar';