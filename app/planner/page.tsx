"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

type Todo = { id: string; subject: string; content: string; completed: boolean };
type WeeklyData = { [key: string]: Todo[] };
// 세련된 효과를 위한 Sparkle 타입 정의
type Sparkle = { id: number; x: number; y: number; tx: number; ty: number; size: number; duration: number; delay: number };

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
  
  // 🔥 금빛 글리터 상태
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/hedwig.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      setBgm(audio);
    }
  }, []);

  // 🎇 세련된 금빛 피날레 실행 로직
  const fireCelebrate = useCallback(() => {
    const newSparkles: Sparkle[] = [];
    // 150개의 미세한 금빛 입자가 화면 전체에서 쏟아짐
    for (let i = 0; i < 150; i++) {
      newSparkles.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * -20, // 화면 위쪽에서 시작
        tx: (Math.random() - 0.5) * 200, // 좌우 흔들림 범위
        ty: Math.random() * 500 + 500, // 아래로 떨어지는 거리
        size: Math.random() * 3 + 1, // 아주 미세한 입자
        duration: 3 + Math.random() * 2, // 떨어지는 속도 조절
        delay: Math.random() * 0.8
      });
    }
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 6000);
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

  const recordEditDay = (day: string) => { localStorage.setItem('last_edited_day', day); };

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
    recordEditDay(day);
    const newData = { ...weeklyData };
    if (!newData[day]) newData[day] = [];
    newData[day] = [...newData[day], { id: Date.now().toString(), subject: subjects.find(s => s !== "") || "과목", content: "", completed: false }];
    setWeeklyData(newData);
    saveAllToDB(newData, subjects, examDate);
  };

  const updateTodo = (day: string, id: string, field: keyof Todo, value: any) => {
    if (viewingWeek !== currentWeekMonday) return;
    recordEditDay(day);
    const newData = { ...weeklyData };
    newData[day] = newData[day].map(t => t.id === id ? { ...t, [field]: value } : t);
    
    if (field === 'completed' && value === true) {
      const dayTasks = newData[day];
      const allDone = dayTasks.length > 0 && dayTasks.every(t => t.completed);
      if (allDone) {
        fireCelebrate(); // 완료 시 금빛 피날레 호출
      }
    }

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
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm',
    input: isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800',
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className={`${theme.textMain} font-serif animate-pulse tracking-[0.3em]`}>REVEALING YOUR SCROLL...</div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 font-sans ${theme.bg} ${theme.textMain}`}>
      
      {/* 🎇 세련된 골드 글리터 애니메이션 스타일 */}
      <style jsx global>{`
        .gold-sparkle {
          position: fixed;
          top: var(--y);
          left: var(--x);
          width: var(--size);
          height: var(--size);
          background: linear-gradient(45deg, #FFD700, #FFFACD, #F0E68C);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          opacity: 0;
          box-shadow: 0 0 8px 1px rgba(255, 215, 0, 0.6);
          animation: gold-fall var(--duration) ease-out forwards;
          animation-delay: var(--delay);
        }

        @keyframes gold-fall {
          0% { transform: translateY(0) rotate(0deg) scale(0); opacity: 0; }
          10% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          100% { 
            transform: translate(var(--tx), var(--ty)) rotate(720deg) scale(0); 
            opacity: 0; 
          }
        }
      `}</style>

      {/* 글리터 렌더링 */}
      {sparkles.map(s => (
        <div 
          key={s.id} 
          className="gold-sparkle"
          style={{ 
            '--x': `${s.x}vw`, '--y': `${s.y}vh`, '--tx': `${s.tx}px`, '--ty': `${s.ty}px`, 
            '--size': `${s.size}px`, '--duration': `${s.duration}s`, '--delay': `${s.delay}s`
          } as any}
        />
      ))}

      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap" rel="stylesheet" />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${theme.btn}`}>← BACK TO LOBBY</Link>
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
          <button onClick={() => { const m = getMonday(-7); setViewingWeek(m); fetchPlannerData(selectedName, m); }} 
                  className={`px-5 py-2.5 rounded-2xl text-[11px] font-black border transition-all ${viewingWeek !== currentWeekMonday ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : theme.btn + ' opacity-60 hover:opacity-100'}`}>
            {viewingWeek !== currentWeekMonday ? '● 지난주 기록 확인 중' : '← 지난주 기록 보기'}
          </button>
          {viewingWeek !== currentWeekMonday && (
            <button onClick={() => { setViewingWeek(currentWeekMonday); fetchPlannerData(selectedName, currentWeekMonday); }} 
                    className="px-5 py-2.5 rounded-2xl text-[11px] font-black bg-emerald-600 text-white border border-emerald-500 shadow-lg animate-bounce">
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
            <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase opacity-40">
              <span>My Subjects (Synced)</span>
              <div className="relative">
                {!examDate && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold pointer-events-none text-blue-500">결전의 날</span>}
                <input type="date" value={examDate} onChange={(e) => { setExamDate(e.target.value); saveAllToDB(weeklyData, subjects, e.target.value); }} 
                       className={`font-bold p-1.5 rounded-lg outline-none border w-[120px] text-center ${theme.input} ${!examDate ? 'text-transparent' : ''}`} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {subjects.map((sub, i) => (
                <input key={i} value={sub} onChange={(e) => {
                  const newSubs = [...subjects];
                  newSubs[i] = e.target.value;
                  setSubjects(newSubs);
                  saveAllToDB(weeklyData, newSubs, examDate);
                }} placeholder={`과목 ${i+1}`} className={`text-[10px] font-bold p-2 rounded-xl border outline-none text-center transition-all ${theme.input}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {DAYS_ORDER.map((day, idx) => {
            const dayTodos = weeklyData[day] || [];
            const completedCount = dayTodos.filter(t => t.completed).length;
            const progress = dayTodos.length > 0 ? Math.round((completedCount / dayTodos.length) * 100) : 0;
            const isOpen = openDays[day];

            return (
              <div key={day} className={`rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${theme.card} ${isOpen ? 'ring-2 ring-blue-500/10' : ''}`}>
                <div onClick={() => setOpenDays(prev => ({ ...prev, [day]: !prev[day] }))} className="p-5 flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] opacity-30 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>▼</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black italic tracking-tight">{day}</span>
                        <span className="text-[10px] font-bold opacity-30 tracking-tighter">{getFormattedDate(viewingWeek, idx)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1 bg-slate-800/20 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className={`text-[10px] font-black ${progress === 100 ? 'text-yellow-500' : 'opacity-40'}`}>{progress}%</span>
                      </div>
                    </div>
                  </div>
                  {viewingWeek === currentWeekMonday && (
                    <button onClick={(e) => { e.stopPropagation(); addTodo(day); }} className="p-2 transition-all opacity-30 hover:opacity-100">
                      <span className="text-xl font-light">+</span>
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="px-4 md:px-6 pb-6 pt-0 space-y-2">
                    {dayTodos.map((todo) => (
                      <div key={todo.id} className={`flex items-center gap-2 md:gap-3 p-2 rounded-xl transition-all ${todo.completed ? 'opacity-30' : ''}`}>
                        <select value={todo.subject} onChange={(e) => updateTodo(day, todo.id, 'subject', e.target.value)} disabled={viewingWeek !== currentWeekMonday}
                                className={`text-[9px] md:text-[10px] font-black p-1.5 rounded-lg border outline-none ${theme.input} w-16 md:w-20`}>
                          {subjects.filter(s => s !== "").map((s, i) => <option key={i} value={s}>{s}</option>)}
                          {subjects.every(s => s === "") && <option>과목</option>}
                        </select>
                        <input type="text" value={todo.content} onChange={(e) => updateTodo(day, todo.id, 'content', e.target.value)} placeholder="계획을 입력하세요" disabled={viewingWeek !== currentWeekMonday}
                               className={`flex-1 bg-transparent px-1 py-1 text-sm outline-none ${todo.completed ? 'line-through text-slate-500' : theme.textMain}`} />
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <input type="checkbox" checked={todo.completed} onChange={(e) => updateTodo(day, todo.id, 'completed', e.target.checked)} disabled={viewingWeek !== currentWeekMonday}
                                 className="w-5 h-5 md:w-4 md:h-4 cursor-pointer accent-blue-500" />
                          {viewingWeek === currentWeekMonday && (
                            <button onClick={() => deleteTodo(day, todo.id)} className="text-red-500/10 hover:text-red-500 transition-colors font-bold text-[10px] p-1">✕</button>
                          )}
                        </div>
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
