import React, { useMemo } from 'react';
import { School, EventType } from '../types';
import { getDaysArray, getCellColor, isHoliday } from '../services/dateUtils';
import { EVENT_COLORS } from '../constants';

interface CalendarViewProps {
  schools: School[];
  startDate: string;
  endDate: string;
}

const CalendarViewRobust: React.FC<CalendarViewProps> = ({ schools, startDate, endDate }) => {
  const days = useMemo(() => {
    // Basic validation to prevent crash if dates are empty (though InputForm enforces type="date")
    if (!startDate || !endDate) return [];
    return getDaysArray(startDate, endDate);
  }, [startDate, endDate]);
  
  // Total Width calculation
  const COL_WIDTH = 28; // px
  const HEADER_WIDTH = 300; // px
  const totalWidth = HEADER_WIDTH + (days.length * COL_WIDTH);

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-gray-300 shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-blue-600 text-white p-1 rounded">令和8年度</span>
                入試日程カレンダー
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
                    <div className="sticky left-0 w-[300px] bg-slate-100 border-r border-gray-300 flex items-center justify-center font-bold text-gray-600 z-40">
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
                        {school.courses.map((course, cIdx) => (
                            <div key={course.id} className="flex h-12 border-b border-gray-200 group hover:bg-slate-50 transition-colors">
                                {/* Sticky Headers */}
                                <div className="sticky left-0 w-[300px] z-20 flex bg-white border-r border-gray-300 group-hover:bg-slate-50">
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
                                        // Ignore events with unset dates
                                        if (!event.startDate || !event.endDate) return null;

                                        // Calculate Position
                                        const eventStart = new Date(event.startDate);
                                        const eventEnd = new Date(event.endDate);
                                        const gridStart = new Date(startDate);
                                        
                                        // Skip if end before start of grid or start after end of grid
                                        // (optional optimization, but good for cleanliness)
                                        
                                        const startDiff = (eventStart.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24);
                                        const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
                                        
                                        // If starts before grid, we should technically clip it, but simple hide for now if totally out of bounds
                                        // Allowing negative left if it started earlier, but we might just want to clamp
                                        // For simplicity:
                                        
                                        const left = startDiff * COL_WIDTH;
                                        const width = duration * COL_WIDTH;
                                        const colors = EVENT_COLORS[event.type];

                                        return (
                                            <div
                                                key={event.id}
                                                className={`absolute top-2 bottom-2 rounded-sm text-[9px] flex items-center justify-center px-1 overflow-hidden whitespace-nowrap shadow-sm border ${colors.bg} ${colors.text} ${colors.border} z-10 hover:z-20 hover:scale-105 transition-transform cursor-pointer`}
                                                style={{ 
                                                    left: `${left + 2}px`, 
                                                    width: `${Math.max(width - 4, 4)}px` 
                                                }}
                                                title={`${event.name || event.type}: ${event.startDate} ~ ${event.endDate}`}
                                            >
                                                {event.name || event.type}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
  );
};

export default CalendarViewRobust;