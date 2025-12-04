import React, { useMemo } from 'react';
import { School, EventType, CalendarEvent } from '../types';
import { getDaysArray, getCellColor, isHoliday } from '../services/dateUtils';
import { EVENT_COLORS } from '../constants';

interface CalendarViewProps {
  schools: School[];
  startDate: string;
  endDate: string;
}

const CalendarViewRobust: React.FC<CalendarViewProps> = ({ schools, startDate, endDate }) => {
  const days = useMemo(() => {
    // Basic validation to prevent crash if dates are empty
    if (!startDate || !endDate) return [];
    return getDaysArray(startDate, endDate);
  }, [startDate, endDate]);
  
  // 年度を計算（開始日の年 + 1 を「令和○年度」の基準と仮定、または西暦表示）
  const startYear = new Date(startDate).getFullYear();
  const nendo = startYear + 1; // 2026年12月開始 -> 2027年度入試
  const reiwaYear = nendo - 2018; // 2027 - 2018 = 9

  // Total Width calculation
  const COL_WIDTH = 30; // px (Slightly wider for readability)
  const HEADER_WIDTH = 300; // px
  const totalWidth = HEADER_WIDTH + (days.length * COL_WIDTH);

  // Layout Constants for Event Stacking
  const EVENT_HEIGHT = 24; // Increased height
  const EVENT_GAP = 4; // Increased gap between stacked events
  const ROW_PADDING_Y = 12; // Increased padding inside the row
  const BASE_ROW_HEIGHT = 56; // minimum height

  // Helper to calculate stacking positions for events in a course
  const getEventLayout = (events: CalendarEvent[]) => {
    // 終了日がなくても開始日があれば有効とする
    const validEvents = events.filter(e => e.startDate);
    
    // Sort by start date, then duration (longer first for aesthetics)
    const sorted = [...validEvents].sort((a, b) => {
        const startA = new Date(a.startDate).getTime();
        const startB = new Date(b.startDate).getTime();
        if (startA !== startB) return startA - startB;
        
        // 終了日がない場合は開始日を終了日とみなす
        const endA = a.endDate ? new Date(a.endDate).getTime() : startA;
        const endB = b.endDate ? new Date(b.endDate).getTime() : startB;
        return endB - endA;
    });

    const tracks: Date[] = []; // End date of last event in track
    const positions = new Map<string, number>();

    sorted.forEach(event => {
        const start = new Date(event.startDate);
        // 終了日がない場合は開始日と同じ（1日イベント）として扱う
        const end = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
        
        let trackIndex = -1;
        for (let i = 0; i < tracks.length; i++) {
            // Check for overlap. If start > last end of this track, it fits.
            // Using > ensures they don't visually touch if ends on same day starts
            if (start > tracks[i]) {
                trackIndex = i;
                break;
            }
        }

        if (trackIndex === -1) {
            trackIndex = tracks.length;
            tracks.push(end);
        } else {
            tracks[trackIndex] = end;
        }
        positions.set(event.id, trackIndex);
    });

    return { positions, totalTracks: Math.max(1, tracks.length) };
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-gray-300 shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-blue-600 text-white p-1 rounded">令和{reiwaYear}年度</span>
                入試日程カレンダー ({nendo}年度)
            </h2>
            <div className="flex flex-wrap gap-3 text-xs">
                {Object.entries(EVENT_COLORS).map(([type, colors]) => (
                    <span key={type} className={`px-2 py-1 rounded border ${colors.bg} ${colors.text} ${colors.border} font-bold`}>
                        {type}
                    </span>
                ))}
            </div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-auto relative custom-scrollbar bg-white">
            <div style={{ width: `${totalWidth}px`, position: 'relative' }}>
                
                {/* 1. Header Rows (Sticky Top) */}
                <div className="sticky top-0 z-30 bg-white flex shadow-sm h-16 border-b border-gray-300">
                    <div className="sticky left-0 w-[300px] bg-slate-100 border-r border-gray-300 flex items-center justify-center font-bold text-gray-600 z-40 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        学校 / コース
                    </div>
                    {days.map((date, i) => {
                        const isMonthStart = date.getDate() === 1 || i === 0;
                        const cellColor = getCellColor(date);
                        const isSun = date.getDay() === 0 || isHoliday(date);
                        const isSat = date.getDay() === 6;
                        return (
                            <div key={i} className={`flex flex-col border-r border-gray-200 ${cellColor}`} style={{ width: COL_WIDTH }}>
                                <div className="h-1/2 flex items-end justify-start px-0.5 text-[10px] font-bold text-slate-500 border-b border-gray-100">
                                    {isMonthStart && `${date.getMonth() + 1}月`}
                                </div>
                                <div className={`h-1/2 flex items-center justify-center text-[10px] ${isSun ? 'text-red-500 font-bold' : isSat ? 'text-blue-500' : ''}`}>
                                    {date.getDate()}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* 2. Data Rows */}
                {schools.map((school) => (
                    <React.Fragment key={school.id}>
                        {school.courses.map((course, cIdx) => {
                            const { positions, totalTracks } = getEventLayout(course.events);
                            
                            // Calculate dynamic row height based on number of tracks
                            // Stacking logic: if overlap exists, totalTracks increases, expanding row height.
                            const calculatedHeight = ROW_PADDING_Y * 2 + (totalTracks * EVENT_HEIGHT) + ((totalTracks - 1) * EVENT_GAP);
                            const rowHeight = Math.max(BASE_ROW_HEIGHT, calculatedHeight);

                            return (
                                <div 
                                    key={course.id} 
                                    className="flex border-b border-gray-200 group hover:bg-slate-50 transition-colors"
                                    style={{ height: `${rowHeight}px` }}
                                >
                                    {/* Sticky Headers */}
                                    <div className="sticky left-0 w-[300px] z-20 flex bg-white border-r border-gray-300 group-hover:bg-slate-50 shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                        <div className="w-1/2 p-2 flex items-center font-bold text-xs text-gray-800 border-r border-gray-100 truncate" title={school.name}>
                                            {cIdx === 0 ? school.name : ''}
                                        </div>
                                        <div className="w-1/2 p-2 flex items-center text-xs text-gray-600 truncate" title={course.name}>
                                            {course.name}
                                        </div>
                                    </div>

                                    {/* Date Cells & Events Container */}
                                    <div className="relative flex">
                                        {/* Background Grid */}
                                        {days.map((date, i) => (
                                            <div 
                                                key={i} 
                                                className={`border-r border-gray-100 h-full ${getCellColor(date)}`} 
                                                style={{ width: COL_WIDTH }}
                                            />
                                        ))}

                                        {/* Events Overlay */}
                                        {course.events.map(event => {
                                            // Ignore events with unset start date
                                            if (!event.startDate) return null;
                                            
                                            // Get visual track index
                                            const trackIndex = positions.get(event.id);
                                            if (trackIndex === undefined) return null;

                                            // Calculate Horizontal Position
                                            const eventStart = new Date(event.startDate);
                                            // Fallback to startDate if endDate is missing
                                            const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
                                            const gridStart = new Date(startDate);
                                            
                                            // Days from grid start
                                            const startDiff = (eventStart.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24);
                                            // Duration in days (+1 to include the end date)
                                            const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
                                            
                                            const left = startDiff * COL_WIDTH;
                                            const width = duration * COL_WIDTH;
                                            const colors = EVENT_COLORS[event.type];
                                            
                                            // Calculate Vertical Position (Stacking)
                                            // Ensures overlapping events appear on separate lines
                                            const top = ROW_PADDING_Y + (trackIndex * (EVENT_HEIGHT + EVENT_GAP));

                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`absolute rounded-sm text-[10px] flex items-center justify-center px-1 overflow-hidden whitespace-nowrap shadow-sm border ${colors.bg} ${colors.text} ${colors.border} z-10 hover:z-30 hover:scale-105 transition-all cursor-pointer`}
                                                    style={{ 
                                                        left: `${left + 2}px`, 
                                                        width: `${Math.max(width - 4, 4)}px`,
                                                        top: `${top}px`,
                                                        height: `${EVENT_HEIGHT}px`
                                                    }}
                                                    title={`${event.name || event.type}: ${event.startDate} ~ ${event.endDate || event.startDate}`}
                                                >
                                                    {event.name || event.type}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
  );
};

export default CalendarViewRobust;