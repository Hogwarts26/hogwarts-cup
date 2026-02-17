"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

// 타입 정의
type Todo = { id: string; subject: string; content: string; completed: boolean };
type WeeklyData = { [key: string]: Todo[] };

export default function PlannerPage() {
  const [selectedName, setSelectedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [currentWeekMonday, setCurrentWeekMonday] = useState("");
  const [viewingWeek, setViewingWeek] = useState(""); 

  const [subjects, setSubjects] = useState<string[]>(Array(8).fill(""));
  const [examDate, setExamDate] = useState("");
  
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    "월요일": [], "화요일": [], "수요일": [], "목요일": [], "금요일": [], "토요일": [], "일요일": []
  });
  const [openDays, setOpenDays] = useState<{ [key: string]: boolean }>({ "월요일": true });

  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm] = useState(() => typeof Audio !== 'undefined' ? new Audio('/hedwig.mp3') : null);

  const getMonday = (offsetDays = 0) => {
    const now = new Date();
    if (now.getHours() < 4) now.setDate(now.getDate() - 1);
    
    const day = now.getDay(); 
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.getFullYear(), now.getMonth(), diff + offsetDays);
    return monday.toLocaleDateString('en-CA'); 
  };

  useEffect(() => {
    const monday = getMonday();
    setCurrentWeekMonday(monday);
    setViewingWeek(monday);

    const savedTheme = localStorage.getItem('planner_theme');
    if (savedTheme === 'light') setIsDarkMode(false);
    
    const savedSubjects = localStorage.getItem('hg_subjects');
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    
    const savedExamDate = localStorage.getItem('hg_exam_date');
    if (savedExamDate) setExamDate(savedExamDate);

    const authData = localStorage.getItem('hg_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setSelectedName(parsed.name);
        fetchPlannerData(parsed.name, monday);
      } catch (e) {
        console.error("인증 파싱 에러", e);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPlannerData = async (name: string, mondayDate: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('daily_planner')
        .select('content_json')
        .eq('student_name', name)
        .eq('plan_date', mondayDate)
        .maybeSingle();

      if (data?.content_json) {
        setWeeklyData(data.content_json);
      } else {
        setWeeklyData({
          "월요일": [], "화요일": [], "수요일": [], "목요일": [], "금요일": [], "토요일": [], "일요일": []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const switchWeek = (targetMonday: string) => {
    setViewingWeek(targetMonday);
    fetchPlannerData(selectedName, targetMonday);
  };

  const saveData = async (newData: WeeklyData) => {
    setWeeklyData(newData);
    if (!selectedName || viewingWeek !== currentWeekMonday) return;
    
    await supabase.from('daily_planner').upsert({
      student_name: selectedName,
      plan_date: viewingWeek, 
      content_json: newData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_name,plan_date' });
  };

  const addTodo = (day: string) => {
    if (viewingWeek !== currentWeekMonday) return;
    const newData = { ...weeklyData };
    newData[day] = [...newData[day], { id: Date.now().toString(), subject: subjects.find(s => s !== "") || "과목", content: "", completed: false }];
    saveData(newData);
  };

  const updateTodo = (day: string, id: string, field: keyof Todo, value: any) => {
    if (viewingWeek !== currentWeekMonday) return;
    const newData = { ...weeklyData };
    newData[day] = newData[day].map(t => t.id === id ? { ...t, [field]: value } : t);
    saveData(newData);
  };

  const deleteTodo = (day: string, id: string) => {
    if (viewingWeek !== currentWeekMonday) return;
    const newData = { ...weeklyData };
    newData[day] = newData[day].filter(t => t.id !== id);
    saveData(newData);
  };

  const toggleMusic = () => {
    if (!bgm) return;
    if (isPlaying) { bgm.pause(); } 
    else { bgm.loop = true; bgm.volume = 0.4; bgm.play().catch(e => console.log(e)); }
    setIsPlaying(!isPlaying);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('planner_theme', newMode ? 'dark' : 'light');
  };

  // 🎯 오차 없는 디데이 계산 로직
  const calculateDDay = () => {
    if (!examDate) return "D-?";
    const target = new Date(examDate);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diff = target.getTime() - today.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    return days === 0 ? "D-Day" : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm',
    input: isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800',
    option: isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900',
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
  };

  const isPastWeek = viewingWeek !== currentWeekMonday;

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className={`${theme.textMain} font-serif animate-pulse tracking-[0.3em]`}>REVEALING YOUR SCROLL...</div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 font-sans ${theme.bg} ${theme.textMain}`} style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap" rel="stylesheet" />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${theme.btn}`}>
            ← BACK TO LOBBY
          </Link>
          <div className="flex gap-2">
            <button onClick={toggleMusic} className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${isPlaying ? 'border-yellow-400 bg-yellow-400/10 animate-pulse' : theme.btn}`}>
              {isPlaying ? '🎵' : '🔇'}
            </button>
            <button onClick={toggleTheme} className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${theme.btn}`}>
              {isDarkMode ? '🌝' : '🌞'}
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-10">
          <button onClick={() => switchWeek(getMonday(-7))} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black border transition-all ${isPastWeek ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : theme.btn + ' opacity-60 hover:opacity-100'}`}>
            {isPastWeek ? '● 지난주 기록 확인 중' : '← 지난주 기록 보기'}
          </button>
          {isPastWeek && (
            <button onClick={() => switchWeek(currentWeekMonday)} className="px-5 py-2.5 rounded-2xl text-[11px] font-black bg-emerald-600 text-white border border-emerald-500 shadow-lg animate-bounce">
              이번 주로 돌아오기 →
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="w-full md:w-auto">
            <h1 className="text-6xl font-black italic tracking-tighter mb-1" style={{ fontFamily: 'Cinzel' }}>{calculateDDay()}</h1>
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${theme.accent}`}>Goal: {examDate || "결전의 날을 설정하세요"}</p>
          </div>
          <div className={`p-6 rounded-[2rem] border w-full md:w-[400px] ${theme.card}`}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase opacity-40">My Subjects (Fixed)</span>
              <input type="date" value={examDate} onChange={(e) => { setExamDate(e.target.value); localStorage.setItem('hg_exam_date', e.target.value); }} className={`text-[10px] font-bold p-1.5 rounded-lg outline-none border ${theme.input}`} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {subjects.map((sub, i) => (
                <input key={i} value={sub} onChange={(e) => { const newSubs = [...subjects]; newSubs[i] = e.target.value; setSubjects(newSubs); localStorage.setItem('hg_subjects', JSON.stringify(newSubs)); }} placeholder={`과목 ${i+1}`} className={`text-[10px] font-bold p-2 rounded-xl border outline-none text-center transition-all ${theme.input}`} />
              ))}
            </div>
          </div>
        </div>

        {isPastWeek && (
          <div className="bg-blue-600 text-white text-center p-4 rounded-2xl mb-8 text-xs font-black tracking-widest shadow-xl">※ 현재 지난주 기록을 열람 중입니다. (수정 불가)</div>
        )}

        <div className="space-y-6">
          {Object.keys(weeklyData).map((day) => {
            const dayTodos = weeklyData[day];
            const completedCount = dayTodos.filter(t => t.completed).length;
            const progress = dayTodos.length > 0 ? Math.round((completedCount / dayTodos.length) * 100) : 0;
            const isOpen = openDays[day];

            return (
              <div key={day} className={`rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${theme.card} ${isOpen ? 'ring-2 ring-blue-500/20' : ''}`}>
                <div onClick={() => setOpenDays(prev => ({ ...prev, [day]: !prev[day] }))} className="p-6 flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <span className={`text-xl font-black transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>▼</span>
                    <span className="text-2xl font-black italic tracking-tight">{day}</span>
                    <div className="hidden md:flex items-center gap-3">
                      <div className="w-32 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                      </div>
                      <span className={`text-[11px] font-black ${progress === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>{progress}%</span>
                    </div>
                  </div>
                  {!isPastWeek && (
                    <button onClick={(e) => { e.stopPropagation(); addTodo(day); }} className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg transition-all active:scale-95">+ ADD TASK</button>
                  )}
                </div>

                {isOpen && (
                  <div className="p-6 pt-2 space-y-3 border-t border-white/5 animate-in fade-in duration-500">
                    {dayTodos.length === 0 && <div className="text-center py-10 opacity-20 text-xs font-bold tracking-widest">NO PLANS RECORDED</div>}
                    {dayTodos.map((todo) => (
                      <div key={todo.id} className={`flex items-center gap-4 p-2 rounded-2xl transition-all ${todo.completed ? 'opacity-40' : ''}`}>
                        {/* ✅ 체크박스 보완: 배경색 및 체크 표시 명확화 */}
                        <input 
                          type="checkbox" 
                          checked={todo.completed}
                          onChange={(e) => updateTodo(day, todo.id, 'completed', e.target.checked)}
                          disabled={isPastWeek}
                          className="w-6 h-6 rounded-lg border-2 border-slate-400 cursor-pointer accent-blue-500 transition-all flex-shrink-0"
                        />
                        
                        {/* ✅ 다크모드 드롭다운 가독성 해결 */}
                        <select
                          value={todo.subject}
                          onChange={(e) => updateTodo(day, todo.id, 'subject', e.target.value)}
                          disabled={isPastWeek}
                          className={`text-[11px] font-black p-2 rounded-xl border outline-none transition-all ${theme.input} w-24`}
                        >
                          {subjects.filter(s => s !== "").map((s, i) => (
                            <option key={i} value={s} className={theme.option}>{s}</option>
                          ))}
                          {subjects.every(s => s === "") && <option className={theme.option}>과목 설정</option>}
                        </select>

                        <input
                          type="text"
                          value={todo.content}
                          onChange={(e) => updateTodo(day, todo.id, 'content', e.target.value)}
                          placeholder="어떤 내용을 공부 할까요?"
                          disabled={isPastWeek}
                          className={`flex-1 bg-transparent px-2 py-1 text-sm font-medium outline-none border-b border-transparent focus:border-blue-500/50 transition-all ${
                            todo.completed ? 'line-through text-slate-500' : theme.textMain
                          }`}
                        />

                        {!isPastWeek && (
                          <button onClick={() => deleteTodo(day, todo.id)} className="text-red-500/30 hover:text-red-500 transition-colors px-2 font-bold text-lg">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Records reset every Monday at 04:00 AM</p>
        </div>
      </div>
    </div>
  );
}
