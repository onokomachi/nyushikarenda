import { EventType } from './types';

// Default Calendar Range for "Reiwa 8 Exam Season" (Approx Dec 2026 - Mar 2027)
// Used for initial state configuration
export const DEFAULT_START_DATE = '2026-12-01';
export const DEFAULT_END_DATE = '2027-03-31';

export const EVENT_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  [EventType.APPLICATION_WEB]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  [EventType.APPLICATION_PAPER]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  [EventType.EXAM]: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
  [EventType.INTERVIEW]: { bg: 'bg-orange-400', text: 'text-white', border: 'border-orange-500' },
  [EventType.ANNOUNCEMENT]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  [EventType.PROCEDURE]: { bg: 'bg-gray-200', text: 'text-gray-700', border: 'border-gray-400' },
  [EventType.OTHER]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
};

// Simplified Japanese Holidays for the target period (2026-2027)
export const HOLIDAYS = [
  '2027-01-01', // New Year
  '2027-01-11', // Coming of Age
  '2027-02-11', // Foundation Day
  '2027-02-23', // Emperor's Birthday
  '2027-03-21', // Vernal Equinox
  '2027-03-22', // Observed Holiday for Vernal Equinox
];

// Helper to create simple events with EMPTY dates initially
const createEvent = (type: EventType, name?: string) => ({
    id: crypto.randomUUID(),
    type,
    startDate: '', // Empty as requested
    endDate: '',   // Empty as requested
    name: name || ''
});

// Initial data reflecting the provided images
// Structure is preserved, but dates are blanked out.
export const INITIAL_SCHOOLS_DATA = [
  {
    id: 's1', name: '共愛学園',
    courses: [
      { id: 'c1-1', name: '学特・推薦I', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web出願'),
          createEvent(EventType.EXAM, '学特試験'),
          createEvent(EventType.ANNOUNCEMENT, '発表')
      ]},
      { id: 'c1-2', name: '一般', events: [
          createEvent(EventType.EXAM, '一般試験')
      ]}
    ]
  },
  {
    id: 's2', name: '前橋育英',
    courses: [
      { id: 'c2-1', name: '学特I・推薦', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web出願'),
          createEvent(EventType.EXAM, '学特試験'),
          createEvent(EventType.PROCEDURE, '入学手続')
      ]},
      { id: 'c2-2', name: '一般・学特II', events: [
          createEvent(EventType.EXAM, '一般試験')
      ]}
    ]
  },
  {
    id: 's3', name: '高商大附',
    courses: [
      { id: 'c3-1', name: '推薦・学特I', events: [
         createEvent(EventType.APPLICATION_WEB, 'Web出願'),
         createEvent(EventType.EXAM, '試験')
      ]},
      { id: 'c3-2', name: '一般・トライ', events: [
         createEvent(EventType.EXAM, '一般試験')
      ]}
    ]
  },
  {
    id: 's4', name: '東農大二',
    courses: [
      { id: 'c4-1', name: '推薦・学特', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web出願'),
          createEvent(EventType.EXAM, '推薦試験'),
          createEvent(EventType.EXAM, '学特試験')
      ]},
      { id: 'c4-2', name: '一般', events: [] }
    ]
  },
  {
    id: 's5', name: '健大高崎',
    courses: [
      { id: 'c5-1', name: '推薦・学特', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web出願'),
          createEvent(EventType.EXAM, '試験')
      ]}
    ]
  },
  {
    id: 's6', name: '明和県央',
    courses: [
      { id: 'c6-1', name: '推薦・学特A', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web出願'),
          createEvent(EventType.EXAM, '試験')
      ]}
    ]
  },
  {
    id: 's7', name: '桐生第一',
    courses: [
      { id: 'c7-1', name: '学特・推薦', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web出願'),
          createEvent(EventType.EXAM, '試験')
      ]},
      { id: 'c7-2', name: '一般', events: [
          createEvent(EventType.EXAM, '一般試験')
      ]}
    ]
  },
  {
    id: 's8', name: '樹徳',
    courses: [
      { id: 'c8-1', name: '学特・推薦', events: [
          createEvent(EventType.EXAM, '試験')
      ]}
    ]
  },
  {
    id: 's9', name: '常磐',
    courses: [
      { id: 'c9-1', name: '特待・推薦', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web出願'),
          createEvent(EventType.EXAM, '試験')
      ]}
    ]
  },
  {
    id: 's10', name: '本庄東',
    courses: [
      { id: 'c10-1', name: '単願・併願1回', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web登録'),
          createEvent(EventType.EXAM, '試験')
      ]},
      { id: 'c10-2', name: '併願3回', events: [
          createEvent(EventType.EXAM, '試験')
      ]}
    ]
  },
  {
    id: 's11', name: '本庄第一',
    courses: [
      { id: 'c11-1', name: '推薦①・②', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web出願'),
          createEvent(EventType.EXAM, '試験')
      ]}
    ]
  },
  {
    id: 's12', name: '白鴎足利',
    courses: [
      { id: 'c12-1', name: '学特・単願', events: [
          createEvent(EventType.EXAM, '試験')
      ]},
      { id: 'c12-2', name: '一般', events: [
          createEvent(EventType.EXAM, '一般試験')
      ]}
    ]
  },
  {
    id: 's13', name: '足工大附',
    courses: [
      { id: 'c13-1', name: '学特・単願', events: [
          createEvent(EventType.APPLICATION_WEB, 'Web出願'),
          createEvent(EventType.EXAM, '試験')
      ]}
    ]
  },
  {
    id: 's14', name: '足短附',
    courses: [
      { id: 'c14-1', name: '学特・推薦', events: [
          createEvent(EventType.EXAM, '試験')
      ]}
    ]
  },
  {
    id: 's15', name: '群馬高専',
    courses: [
      { id: 'c15-1', name: '推薦', events: [
          createEvent(EventType.APPLICATION_PAPER, '書類提出'),
          createEvent(EventType.EXAM, '試験')
      ]},
      { id: 'c15-2', name: '一般', events: [
          createEvent(EventType.EXAM, '試験')
      ]}
    ]
  },
  {
    id: 's16', name: '群馬公立',
    courses: [
      { id: 'c16-1', name: '本試験', events: [
          createEvent(EventType.APPLICATION_PAPER, '入学願書'),
          createEvent(EventType.EXAM, '試験'),
          createEvent(EventType.ANNOUNCEMENT, '発表')
      ]}
    ]
  }
];