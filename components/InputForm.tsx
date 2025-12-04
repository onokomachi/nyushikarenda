import React, { useState, useRef } from 'react';
import { School, CalendarEvent, EventType } from '../types';
import { Plus, Trash2, Lock, Unlock, Download, Upload, Printer, Calendar as CalendarIcon, Cloud } from 'lucide-react';
import { exportToCSV, importFromCSV } from '../services/csvUtils';

interface InputFormProps {
  schools: School[];
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  calendarConfig: { startDate: string; endDate: string };
  setCalendarConfig: React.Dispatch<React.SetStateAction<{ startDate: string; endDate: string }>>;
}

const ADMIN_PASSWORD = "215124";

// Reusable styling for inputs: Dark background, White text
const INPUT_STYLE = "bg-slate-700 text-white border border-slate-600 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-400 outline-none placeholder-slate-400";
const SELECT_STYLE = "bg-slate-700 text-white border border-slate-600 rounded px-1 py-1 text-xs focus:ring-1 focus:ring-blue-400 outline-none";

const InputForm: React.FC<InputFormProps> = ({ schools, setSchools, calendarConfig, setCalendarConfig }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'file'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
    } else {
        alert("パスワードが違います");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // --- CRUD Operations ---
  const addSchool = () => {
    const newSchool: School = {
        id: crypto.randomUUID(),
        name: '新しい学校',
        courses: []
    };
    setSchools([...schools, newSchool]);
  };

  const updateSchoolName = (id: string, name: string) => {
    setSchools(schools.map(s => s.id === id ? { ...s, name } : s));
  };

  const deleteSchool = (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    setSchools(schools.filter(s => s.id !== id));
  };

  const addCourse = (schoolId: string) => {
    setSchools(schools.map(s => {
        if (s.id !== schoolId) return s;
        return {
            ...s,
            courses: [...s.courses, {
                id: crypto.randomUUID(),
                name: '新規コース',
                events: []
            }]
        };
    }));
  };

  const updateCourseName = (schoolId: string, courseId: string, name: string) => {
    setSchools(schools.map(s => {
        if (s.id !== schoolId) return s;
        return {
            ...s,
            courses: s.courses.map(c => c.id === courseId ? { ...c, name } : c)
        };
    }));
  };

  const deleteCourse = (schoolId: string, courseId: string) => {
    setSchools(schools.map(s => {
        if (s.id !== schoolId) return s;
        return {
            ...s,
            courses: s.courses.filter(c => c.id !== courseId)
        };
    }));
  };

  const addEvent = (schoolId: string, courseId: string) => {
      setSchools(schools.map(s => {
        if (s.id !== schoolId) return s;
        return {
            ...s,
            courses: s.courses.map(c => {
                if (c.id !== courseId) return c;
                return {
                    ...c,
                    events: [...c.events, {
                        id: crypto.randomUUID(),
                        type: EventType.EXAM,
                        startDate: '', // Empty by default
                        endDate: '', // Empty by default
                        name: ''
                    }]
                }
            })
        };
    }));
  };

  const updateEvent = (schoolId: string, courseId: string, eventId: string, field: keyof CalendarEvent, value: any) => {
    setSchools(schools.map(s => {
        if (s.id !== schoolId) return s;
        return {
            ...s,
            courses: s.courses.map(c => {
                if (c.id !== courseId) return c;
                return {
                    ...c,
                    events: c.events.map(e => {
                        if (e.id !== eventId) return e;
                        
                        const updatedEvent = { ...e, [field]: value };
                        
                        // User Convenience: If setting StartDate and EndDate is empty, auto-fill EndDate
                        if (field === 'startDate' && !e.endDate && value) {
                            updatedEvent.endDate = value;
                        }

                        return updatedEvent;
                    })
                }
            })
        };
    }));
  };

  const deleteEvent = (schoolId: string, courseId: string, eventId: string) => {
     setSchools(schools.map(s => {
        if (s.id !== schoolId) return s;
        return {
            ...s,
            courses: s.courses.map(c => {
                if (c.id !== courseId) return c;
                return {
                    ...c,
                    events: c.events.filter(e => e.id !== eventId)
                }
            })
        };
    }));
  };

  // --- CSV / Print Operations ---
  const handleExportCSV = () => {
    const csv = exportToCSV(schools);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exam_schedule_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
            try {
                const newSchools = importFromCSV(text);
                setSchools(newSchools);
                alert('CSVを読み込みました');
            } catch (err) {
                alert('CSVの読み込みに失敗しました。フォーマットを確認してください。');
                console.error(err);
            }
        }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 no-print">
            <div className="w-full max-w-xs bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-center mb-4 text-blue-600">
                    <Lock className="w-10 h-10" />
                </div>
                <h3 className="text-center font-bold text-gray-800 mb-4">管理画面ログイン</h3>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="パスワードを入力"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">
                        ログイン
                    </button>
                    <p className="text-[10px] text-gray-400 text-center">
                        ※変更はクラウドに自動保存されます
                    </p>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 no-print">
      <div className="p-4 border-b border-gray-200 bg-slate-50">
        <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-green-600" /> 管理パネル
            </h3>
            <button onClick={handleLogout} className="text-xs text-red-500 underline">ログアウト</button>
        </div>
        <div className="flex gap-2 bg-gray-200 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('edit')}
                className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all ${activeTab === 'edit' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
                データ編集
            </button>
            <button 
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all ${activeTab === 'file' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
                入出力・印刷
            </button>
        </div>
        <div className="mt-2 text-[10px] text-blue-600 flex items-center gap-1 justify-end">
             <Cloud className="w-3 h-3" /> 変更は自動保存されます
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'file' ? (
          <div className="space-y-6">
             {/* Calendar Config */}
             <div className="space-y-2 bg-slate-100 p-3 rounded border border-slate-200">
                <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> カレンダー設定
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">開始日</label>
                        <input 
                            type="date"
                            value={calendarConfig.startDate}
                            onChange={(e) => setCalendarConfig({ ...calendarConfig, startDate: e.target.value })}
                            className={`${INPUT_STYLE} w-full`}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">終了日</label>
                        <input 
                            type="date"
                            value={calendarConfig.endDate}
                            onChange={(e) => setCalendarConfig({ ...calendarConfig, endDate: e.target.value })}
                            className={`${INPUT_STYLE} w-full`}
                        />
                    </div>
                </div>
             </div>

             <div className="space-y-2">
                <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" /> CSV エクスポート
                </h4>
                <p className="text-xs text-gray-500">現在のスケジュールをExcel編集可能なCSV形式でダウンロードします。</p>
                <button onClick={handleExportCSV} className="w-full py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-50 text-gray-700 font-medium">
                    CSVをダウンロード
                </button>
             </div>

             <div className="border-t border-gray-200 pt-4 space-y-2">
                <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4" /> CSV インポート
                </h4>
                <p className="text-xs text-gray-500">編集したCSVファイルを読み込みます。※現在のデータは上書きされます。</p>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleImportCSV}
                        className="hidden" 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 bg-blue-50 border border-blue-200 rounded shadow-sm text-sm hover:bg-blue-100 text-blue-700 font-medium"
                    >
                        ファイルを選択して読み込み
                    </button>
                </div>
             </div>

             <div className="border-t border-gray-200 pt-4 space-y-2">
                <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <Printer className="w-4 h-4" /> 印刷
                </h4>
                <p className="text-xs text-gray-500">カレンダーのみを印刷します（A4横向き推奨）。</p>
                <button onClick={handlePrint} className="w-full py-3 bg-slate-800 text-white rounded shadow hover:bg-slate-700 font-bold flex items-center justify-center gap-2">
                    <Printer className="w-5 h-5" /> 印刷プレビュー
                </button>
             </div>
          </div>
        ) : (
          <div className="space-y-6">
            {schools.map((school) => (
                <div key={school.id} className="border border-gray-200 rounded-lg overflow-hidden bg-slate-50">
                    <div className="bg-slate-100 p-2 border-b border-gray-200 flex justify-between items-center">
                        <input 
                            value={school.name}
                            onChange={(e) => updateSchoolName(school.id, e.target.value)}
                            className={`${INPUT_STYLE} w-full font-bold`}
                            placeholder="学校名"
                        />
                        <button onClick={() => deleteSchool(school.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    
                    <div className="p-2 space-y-3">
                        {school.courses.map(course => (
                            <div key={course.id} className="bg-white border border-gray-200 rounded p-2 shadow-sm relative group">
                                <div className="flex justify-between items-center mb-2 gap-2">
                                     <input 
                                        value={course.name}
                                        onChange={(e) => updateCourseName(school.id, course.id, e.target.value)}
                                        className={`${INPUT_STYLE} w-full`}
                                        placeholder="コース名"
                                    />
                                    <div className="flex gap-1 shrink-0">
                                        <button 
                                            onClick={() => deleteCourse(school.id, course.id)}
                                            className="text-xs text-gray-300 hover:text-red-500 p-1"
                                            title="コース削除"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={() => addEvent(school.id, course.id)}
                                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 whitespace-nowrap"
                                        >
                                            + イベント
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {course.events.map(event => (
                                        <div key={event.id} className="flex flex-col gap-1 p-2 bg-gray-100 rounded text-xs border border-gray-200">
                                            <div className="flex gap-1 mb-1">
                                                <select 
                                                    value={event.type}
                                                    onChange={(e) => updateEvent(school.id, course.id, event.id, 'type', e.target.value)}
                                                    className={`${SELECT_STYLE} w-24`}
                                                >
                                                    {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                <input 
                                                    value={event.name || ''} 
                                                    onChange={(e) => updateEvent(school.id, course.id, event.id, 'name', e.target.value)}
                                                    placeholder="詳細(例:1次)"
                                                    className={`${INPUT_STYLE} flex-1 w-0`}
                                                />
                                                <button onClick={() => deleteEvent(school.id, course.id, event.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input 
                                                    type="date" 
                                                    value={event.startDate}
                                                    onChange={(e) => updateEvent(school.id, course.id, event.id, 'startDate', e.target.value)}
                                                    className={`${INPUT_STYLE} flex-1`}
                                                />
                                                <span className="text-gray-500">~</span>
                                                <input 
                                                    type="date" 
                                                    value={event.endDate}
                                                    onChange={(e) => updateEvent(school.id, course.id, event.id, 'endDate', e.target.value)}
                                                    className={`${INPUT_STYLE} flex-1`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={() => addCourse(school.id)} className="w-full py-1 text-xs border border-dashed border-gray-300 rounded text-gray-500 hover:bg-white hover:text-blue-500">
                            + コース追加
                        </button>
                    </div>
                </div>
            ))}
            <button onClick={addSchool} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 font-bold flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> 学校を追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputForm;