import { HOLIDAYS } from '../constants';

export const getDaysArray = (start: string, end: string) => {
  const arr = [];
  const dt = new Date(start);
  const endDate = new Date(end);

  while (dt <= endDate) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDayOfWeek = (date: Date): string => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[date.getDay()];
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const isHoliday = (date: Date): boolean => {
  const dateStr = formatDate(date);
  return HOLIDAYS.includes(dateStr);
};

export const getCellColor = (date: Date): string => {
  const day = date.getDay();
  const dateStr = formatDate(date);

  // Holiday or Sunday
  if (day === 0 || HOLIDAYS.includes(dateStr)) {
    return 'bg-pink-100/70';
  }
  // Saturday
  if (day === 6) {
    return 'bg-blue-50/70';
  }
  return 'bg-white';
};

// Calculate grid position for events
export const getGridPosition = (eventStart: string, eventEnd: string, gridStart: string) => {
  const start = new Date(eventStart);
  const end = new Date(eventEnd);
  const gridS = new Date(gridStart);

  const diffTimeStart = Math.abs(start.getTime() - gridS.getTime());
  const diffDaysStart = Math.ceil(diffTimeStart / (1000 * 60 * 60 * 24)); 
  
  const diffTimeDuration = Math.abs(end.getTime() - start.getTime());
  const durationDays = Math.floor(diffTimeDuration / (1000 * 60 * 60 * 24)) + 1;

  // CSS Grid columns start at 1
  // If event starts before grid, we need to handle clipping (simplified here to assume within range or handled by parent)
  const colStart = diffDaysStart + 1; // +1 because grid lines start at 1
  
  return {
    gridColumnStart: colStart + 2, // +2 for School and Course columns
    gridColumnEnd: `span ${durationDays}`
  };
};