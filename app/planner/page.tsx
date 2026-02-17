"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

type Todo = { id: string; subject: string; content: string; completed: boolean };
type WeeklyData = { [key: string]: Todo[] };

const DAYS_ORDER = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

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
  const [openDays, setOpenDays] = useState<{ [key: string]: boolean }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm, setBgm] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/hedwig.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      setBgm(audio);
    }
  }, []);

  const getMonday = (offsetDays = 0) => {
    const now = new Date();
    if (now.getHours() < 4) now.setDate(now.getDate() - 1);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.getFullYear(), now.getMonth(), diff + offsetDays);
    return monday.toLocaleDateString('en-CA'); 
  };

  const getFormattedDate = (mondayString: string, dayIndex: number) => {
    const date = new Date(mondayString);
    date.setDate(date.getDate() + dayIndex);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const monday = getMonday();
    setCurrentWeekMonday(monday);
    setViewingWeek(monday);
    const savedTheme = localStorage.getItem('planner_theme');
    if (savedTheme === 'light') setIsDarkMode(false);
    const lastOpened = localStorage.getItem('last_edited_day') || "월요일";
    setOpenDays({ [lastOpened]: true });
    
    const authData = localStorage.getItem('hg_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setSelectedName(parsed.name);
        fetchPlannerData(parsed.name, monday);
      } catch (e) {
        console.error("인증 에러", e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPlannerData = async (name: string, mondayDate: string) => {
    setLoading(true);
    try {
      const { data } = await supabase.from('daily_planner').select('*').eq('student_name', name).eq('plan_date', mondayDate).maybeSingle();
      if (data) {
        if (data.content_json) setWeeklyData(data.content_json);
        if (data.subjects_json) setSubjects(data.subjects_json);
        if (data.exam_date) setExamDate(data.exam_date);
      } else {
        setWeeklyData({ "월요일": [], "화요일": [], "수요일": [], "목요일": [], "금요일": [], "토요일": [], "일요일": [] });
      }
    } catch (err) { console.error("Fetch Error:", err); } finally { setLoading(false); }
  };

  const saveAllToDB = async (updatedWeekly: WeeklyData, updatedSubjects: string[], updatedExamDate: string) => {
    if (!selectedName || viewingWeek !== currentWeekMonday) return;
    try {
      await supabase.from('daily_planner').upsert({
        student_name: selectedName, plan_date: viewingWeek, content_json: updatedWeekly,
        subjects_json: updatedSubjects, exam_date: updatedExamDate, updated_at: new Date().toISOString()
      }, { onConflict: 'student_name,plan_date' });
    } catch (err) { console.error("Save Error:", err); }
  };

  const calculateDDay = () => {
    if (!examDate) return "D-?";
    const target = new Date(examDate); target.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = target.getTime() - today.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? "D-Day" : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
  };

  const toggleMusic = () => {
    if (!bgm) return;
    if (isPlaying) { bgm.pause(); } else { bgm.play().catch(e => console.log("BGM Play Error", e)); }
    setIsPlaying(!isPlaying);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('planner_theme', newMode ? 'dark' : 'light');
  };

  const addTodo = (day: string) => {
    if (viewingWeek !== currentWeekMonday) return;
    const newData = { ...weeklyData };
    if (!newData[day]) newData[day] = [];
    newData[day] = [...newData[day], { id: Date.now().toString(), subject: subjects.find(s => s !== "") || "과목", content: "", completed: false }];
    setWeeklyData(newData);
    saveAllToDB(newData, subjects, examDate);
  };

  const updateTodo = (day: string, id: string, field: keyof Todo, value: any) => {
    if (viewingWeek !== currentWeekMonday) return;
    const newData = { ...weeklyData };
    newData[day] = newData[day].map(t => t.id === id ? { ...t, [field]: value } : t);
    setWeeklyData(newData);
    saveAllToDB(newData, subjects, examDate);
  };

  const deleteTodo = (day: string, id: string) => {
    if (viewingWeek !== currentWeekMonday) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const newData = { ...weeklyData };
    newData[day] = newData[day].filter(t => t.id !== id);
    setWeeklyData(newData);
    saveAllToDB(newData, subjects, examDate);
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#0a0a0a]' : 'bg-[#fcfcfc]',
    card: isDarkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-slate-200',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-[#222] border-[#333] text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm',
    input: isDarkMode ? 'bg-[#111] border-[#222] text-white' : 'bg-slate-50 border-slate-200 text-slate-800',
    accent: isDarkMode ? 'text-blue-500' : 'text-blue-600',
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className={`${theme.textMain} font-serif tracking-widest`}>LOADING...</div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-20 font-sans ${theme.bg} ${theme.textMain}`}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap" rel="stylesheet" />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Nav */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all ${theme.btn}`}>BACK</Link>
          <div className="flex gap-2">
            <button onClick={toggleMusic} className={`w-10 h-10 rounded-lg border flex items-center justify-center ${theme.btn}`}>{isPlaying ? '🎵' : '🔇'}</button>
            <button onClick={toggleTheme} className={`w-10 h-10 rounded-lg border flex items-center justify-center ${theme.btn}`}>{isDarkMode ? '🌝' : '🌞'}</button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h1 className="text-7xl font-black tracking-tighter mb-2" style={{ fontFamily: 'Cinzel' }}>{calculateDDay()}</h1>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold tracking-widest uppercase ${theme.accent}`}>Weekly Focus</span>
              <input type="date" value={examDate} onChange={(e) => { setExamDate(e.target.value); saveAllToDB(weeklyData, subjects, e.target.value); }} 
                     className={`text-[11px] font-bold p-1 bg-transparent outline-none border-b border-current opacity-50 focus:opacity-100 transition-opacity`} />
            </div>
          </div>
          
          <div className={`p-6 rounded-2xl border ${theme.card} w-full md:w-[320px]`}>
            <div className="grid grid-cols-4 gap-2">
              {subjects.map((sub, i) => (
                <input key={i} value={sub} onChange={(e) => {
                  const newSubs = [...subjects];
                  newSubs[i] = e.target.value;
                  setSubjects(newSubs);
                  saveAllToDB(weeklyData, newSubs, examDate);
                }} placeholder={`S${i+1}`} className={`text-[10px] font-bold p-2 rounded-lg border outline-none text-center ${theme.input}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Days */}
        <div className="space-y-4">
          {DAYS_ORDER.map((day, idx) => {
            const dayTodos = weeklyData[day] || [];
            const progress = dayTodos.length > 0 ? Math.round((dayTodos.filter(t => t.completed).length / dayTodos.length) * 100) : 0;
            const isOpen = openDays[day];

            return (
              <div key={day} className={`border rounded-2xl transition-all ${theme.card} ${progress === 100 ? 'border-blue-500/50' : ''}`}>
                <div onClick={() => setOpenDays(prev => ({ ...prev, [day]: !prev[day] }))} className="p-6 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-black italic tracking-tight">{day}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1 bg-slate-500/10 rounded-full">
                        <div className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${progress}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${progress === 100 ? theme.accent : 'opacity-20'}`}>{progress}%</span>
                    </div>
                  </div>
                  {viewingWeek === currentWeekMonday && (
                    <button onClick={(e) => { e.stopPropagation(); addTodo(day); }} className="text-2xl font-light opacity-20 hover:opacity-100 transition-opacity">+</button>
                  )}
                </div>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-3">
                    {dayTodos.map((todo) => (
                      <div key={todo.id} className="flex items-center gap-4 group">
                        <input type="checkbox" checked={todo.completed} onChange={(e) => updateTodo(day, todo.id, 'completed', e.target.checked)} 
                               className="w-5 h-5 rounded border border-slate-500 appearance-none checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer" />
                        <select value={todo.subject} onChange={(e) => updateTodo(day, todo.id, 'subject', e.target.value)}
                                className={`text-[10px] font-bold bg-transparent outline-none border-none opacity-40 w-16`}>
                          {subjects.map((s, i) => s && <option key={i} value={s}>{s}</option>)}
                          <option value="과목">과목</option>
                        </select>
                        <input type="text" value={todo.content} onChange={(e) => updateTodo(day, todo.id, 'content', e.target.value)} 
                               className={`flex-1 bg-transparent text-sm outline-none ${todo.completed ? 'line-through opacity-30' : ''}`} />
                        <button onClick={() => deleteTodo(day, todo.id)} className="opacity-0 group-hover:opacity-30 hover:!opacity-100 transition-opacity text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
