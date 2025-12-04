import React, { useState, useEffect, useRef } from 'react';
import CalendarViewRobust from './components/CalendarView';
import InputForm from './components/InputForm';
import { School } from './types';
import { INITIAL_SCHOOLS_DATA, DEFAULT_START_DATE, DEFAULT_END_DATE } from './constants';
import { Calendar, Settings, Loader2, AlertTriangle } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const App: React.FC = () => {
  const [schools, setSchools] = useState<School[]>(INITIAL_SCHOOLS_DATA);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const isFirstLoad = useRef(true);
  
  // State for Calendar Range
  const [calendarConfig, setCalendarConfig] = useState({
    startDate: DEFAULT_START_DATE,
    endDate: DEFAULT_END_DATE
  });

  // Load Data from Firestore on Mount
  useEffect(() => {
    const fetchData = async () => {
      // If DB is not initialized (missing config), skip fetch
      if (!db) {
        console.warn("Firebase DB not initialized. Using local data.");
        setIsOfflineMode(true);
        setIsLoading(false);
        isFirstLoad.current = false;
        return;
      }

      const dataDocRef = doc(db, "settings", "main");

      try {
        const docSnap = await getDoc(dataDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.schools) setSchools(data.schools);
          if (data.config) setCalendarConfig(data.config);
        } else {
          // If no data exists yet, save the initial data
          await setDoc(dataDocRef, {
            schools: INITIAL_SCHOOLS_DATA,
            config: { startDate: DEFAULT_START_DATE, endDate: DEFAULT_END_DATE }
          });
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        // Handle offline or permission errors by falling back to local data without crashing
        if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
            setIsOfflineMode(true);
        }
      } finally {
        setIsLoading(false);
        isFirstLoad.current = false;
      }
    };
    fetchData();
  }, []);

  // Auto-save to Firestore when schools or config changes (Debounced)
  useEffect(() => {
    if (isFirstLoad.current || isLoading || isOfflineMode || !db) return;

    setIsSaving(true);
    const dataDocRef = doc(db, "settings", "main");
    
    const timer = setTimeout(async () => {
      try {
        await setDoc(dataDocRef, {
            schools: schools,
            config: calendarConfig
        });
      } catch (error) {
        console.error("Error saving data:", error);
        setIsOfflineMode(true); // Switch to offline mode if save fails
      } finally {
        setIsSaving(false);
      }
    }, 2000); // Wait 2 seconds after last change before saving

    return () => clearTimeout(timer);
  }, [schools, calendarConfig, isLoading, isOfflineMode]);

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-gray-600 font-bold">データを読み込んでいます...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* App Header */}
      <header className="h-14 bg-slate-900 text-white flex items-center px-6 justify-between shadow-md shrink-0 z-50 no-print">
        <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">ExamPlanner Pro</h1>
            {isSaving && (
                <span className="text-xs text-yellow-400 animate-pulse ml-2 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> 保存中...
                </span>
            )}
            {isOfflineMode && (
                <span className="text-xs text-orange-400 ml-2 flex items-center gap-1" title="データはローカルのみで、保存されていません">
                    <AlertTriangle className="w-3 h-3" /> オフラインモード
                </span>
            )}
        </div>
        <div className="flex items-center gap-4">
             <span className="text-xs text-slate-400 hidden sm:inline">
                管理者専用モード
             </span>
             <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${showSidebar ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
                title="Toggle Admin Panel"
             >
                <Settings className="w-5 h-5" />
             </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Calendar Area */}
        <div className="flex-1 flex flex-col min-w-0 p-4 print-container">
             <CalendarViewRobust 
                schools={schools} 
                startDate={calendarConfig.startDate} 
                endDate={calendarConfig.endDate} 
             />
             <div className="mt-2 text-[10px] text-gray-400 text-right no-print">
                ※ 表示されている休日は2027年のものです。{isOfflineMode ? "オフライン編集中。" : "自動保存有効。"}
             </div>
        </div>

        {/* Sidebar / Admin Panel */}
        <div 
            className={`
                border-l border-gray-200 bg-white transition-all duration-300 ease-in-out shadow-2xl z-40 no-print
                ${showSidebar ? 'w-96 translate-x-0' : 'w-0 translate-x-full overflow-hidden opacity-0'}
            `}
        >
            <InputForm 
                schools={schools} 
                setSchools={setSchools}
                calendarConfig={calendarConfig}
                setCalendarConfig={setCalendarConfig}
            />
        </div>
      </main>
    </div>
  );
};

export default App;