"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Todo = { id: string; subject: string; content: string; completed: boolean };
type WeeklyData = { [key: string]: Todo[] };

// 타임블록: 각 시간 슬롯(1시간 단위)에 저장되는 데이터
type TimeBlock = { subject: string; content: string; completed: boolean };
// key: "월요일_05", "월요일_06", ...
type TimeBlockData = { [key: string]: TimeBlock };

const DAYS_ORDER = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

// 오전 5시(05) ~ 새벽 1시(25, 즉 다음날 01:00) → 총 21개 슬롯
const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const hour = i + 5; // 5 ~ 25
  const displayHour = hour >= 24 ? hour - 24 : hour;
  const label = `${displayHour.toString().padStart(2, '0')}:00`;
  const key = hour.toString().padStart(2, '0'); // "05" ~ "25"
  const isPM = hour >= 12 && hour < 24;
  const isMidnight = hour >= 24;
  return { hour, displayHour, label, key, isPM, isMidnight };
});

// 과목 색상 공통 상수
const SUBJECT_COLORS = [
  { bar: 'border-l-blue-400',    bg: 'bg-blue-500/10' },
  { bar: 'border-l-purple-400',  bg: 'bg-purple-500/10' },
  { bar: 'border-l-emerald-400', bg: 'bg-emerald-500/10' },
  { bar: 'border-l-amber-400',   bg: 'bg-amber-500/10' },
  { bar: 'border-l-rose-400',    bg: 'bg-rose-500/10' },
  { bar: 'border-l-cyan-400',    bg: 'bg-cyan-500/10' },
  { bar: 'border-l-orange-400',  bg: 'bg-orange-500/10' },
  { bar: 'border-l-pink-400',    bg: 'bg-pink-500/10' },
];
const DOT_COLORS = ['bg-blue-400','bg-purple-400','bg-emerald-400','bg-amber-400','bg-rose-400','bg-cyan-400','bg-orange-400','bg-pink-400'];

// --- 과목 색상 범례 (공통) ---
function SubjectLegend({ subjects }: { subjects: string[] }) {
  const filtered = subjects.filter(s => s !== '');
  if (filtered.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pb-3">
      {filtered.map((s, i) => (
        <span key={i} className="text-[9px] font-black flex items-center gap-1 opacity-60">
          <span className={`w-2 h-2 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`}></span>
          {s}
        </span>
      ))}
    </div>
  );
}

// --- 개별 투두 아이템 컴포넌트 (Sortable) ---
function SortableTodoItem({ 
  todo, day, isEditable, subjects, theme, updateTodo, deleteTodo 
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  // 과목 색상 계산
  const subjectIndex = subjects.findIndex((s: string) => s === todo.subject);
  const color = subjectIndex >= 0 ? SUBJECT_COLORS[subjectIndex % SUBJECT_COLORS.length] : null;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-2 md:gap-3 p-2 rounded-xl border-l-2 transition-all
        ${color ? `${color.bar} ${color.bg}` : 'border-l-transparent'}
        ${todo.completed ? 'opacity-30' : ''} 
        ${isDragging ? 'bg-blue-500/10' : ''}`}
    >
      {isEditable && (
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-3 -ml-2 opacity-30 hover:opacity-100 transition-opacity touch-none"
        >
          <div className="flex flex-col gap-[2px]">
            <div className="w-4 h-[1.5px] bg-current"></div>
            <div className="w-4 h-[1.5px] bg-current"></div>
            <div className="w-4 h-[1.5px] bg-current"></div>
          </div>
        </div>
      )}

      <select 
        value={todo.subject} 
        onChange={(e) => updateTodo(day, todo.id, 'subject', e.target.value)} 
        disabled={!isEditable}
        className={`text-[9px] md:text-[10px] font-black p-1.5 rounded-lg border outline-none ${theme.select} w-16 md:w-20`}
      >
        {subjects.filter((s: string) => s !== "").map((s: string, i: number) => <option key={i} value={s}>{s}</option>)}
        {subjects.every((s: string) => s === "") && <option>과목</option>}
      </select>
      
      <input 
        type="text" 
        value={todo.content} 
        onChange={(e) => updateTodo(day, todo.id, 'content', e.target.value)} 
        placeholder="계획을 입력하세요" 
        disabled={!isEditable}
        className={`flex-1 bg-transparent px-1 py-1 text-sm outline-none ${todo.completed ? 'line-through text-slate-500' : theme.textMain}`} 
      />
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <input 
          type="checkbox" 
          checked={todo.completed} 
          onChange={(e) => updateTodo(day, todo.id, 'completed', e.target.checked)} 
          disabled={!isEditable}
          className="w-5 h-5 md:w-4 md:h-4 cursor-pointer accent-blue-500" 
        />
        {isEditable && (
          <button onClick={() => deleteTodo(day, todo.id)} className="text-red-500/70 hover:text-red-500 transition-colors font-bold text-[10px] p-1">✕</button>
        )}
      </div>
    </div>
  );
}

// --- 타임블록 셀 컴포넌트 ---
function TimeBlockCell({
  blockKey, block, subjects, theme, isEditable, onChange
}: {
  blockKey: string;
  block: TimeBlock;
  subjects: string[];
  theme: any;
  isEditable: boolean;
  onChange: (key: string, field: keyof TimeBlock, value: any) => void;
}) {
  const hasContent = block.content.trim() !== '';
  const hasSubject = block.subject !== '' && block.subject !== '__empty__';

  const subjectIndex = subjects.findIndex(s => s === block.subject);
  const color = (hasSubject && subjectIndex >= 0) ? SUBJECT_COLORS[subjectIndex % SUBJECT_COLORS.length] : null;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-l-2 transition-all min-h-[52px]
      ${(hasContent && color) ? `${color.bar} ${color.bg}` : 'border-l-transparent'}
      ${block.completed && hasContent ? 'opacity-40' : ''}
    `}>
      <select
        value={block.subject}
        onChange={(e) => onChange(blockKey, 'subject', e.target.value)}
        disabled={!isEditable}
        className={`text-[9px] font-black p-1 rounded-lg border outline-none ${theme.select} w-14 md:w-[70px] flex-shrink-0`}
      >
        <option value="__empty__">—</option>
        {subjects.filter(s => s !== '').map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>

      <input
        type="text"
        value={block.content}
        onChange={(e) => onChange(blockKey, 'content', e.target.value)}
        placeholder="계획 입력..."
        disabled={!isEditable}
        className={`flex-1 bg-transparent text-xs outline-none px-1 
          ${block.completed && hasContent ? 'line-through text-slate-500' : theme.textMain}
          placeholder:opacity-20`}
      />

      <input
        type="checkbox"
        checked={block.completed}
        onChange={(e) => onChange(blockKey, 'completed', e.target.checked)}
        disabled={!isEditable}
        className="w-4 h-4 cursor-pointer accent-blue-500 flex-shrink-0"
      />
    </div>
  );
}

// --- 메인 페이지 ---
export default function PlannerPage() {
  const [selectedName, setSelectedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState<'todo' | 'timeblock'>('todo');
  const [currentWeekMonday, setCurrentWeekMonday] = useState("");
  const [viewingWeek, setViewingWeek] = useState(""); 
  const [subjects, setSubjects] = useState<string[]>(Array(8).fill(""));
  const [examDate, setExamDate] = useState("");
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    "월요일": [], "화요일": [], "수요일": [], "목요일": [], "금요일": [], "토요일": [], "일요일": []
  });
  const [timeBlockData, setTimeBlockData] = useState<TimeBlockData>({});
  const [openDays, setOpenDays] = useState<{ [key: string]: boolean }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm, setBgm] = useState<HTMLAudioElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    const savedView = localStorage.getItem('planner_view');
    if (savedView === 'timeblock') setViewMode('timeblock');

    const today = new Date();
    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const todayName = dayNames[today.getDay()];
    setOpenDays({ [todayName]: true });
    
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
        if (data.timeblock_json) setTimeBlockData(data.timeblock_json);
        else setTimeBlockData({});
      } else {
        setWeeklyData({ "월요일": [], "화요일": [], "수요일": [], "목요일": [], "금요일": [], "토요일": [], "일요일": [] });
        setTimeBlockData({});
      }
    } catch (err) { console.error("Fetch Error:", err); } finally { setLoading(false); }
  };

  const saveAllToDB = async (
    updatedWeekly: WeeklyData, 
    updatedSubjects: string[], 
    updatedExamDate: string,
    updatedTimeBlock?: TimeBlockData
  ) => {
    if (!selectedName) return;
    // 이번 주 또는 다음 주만 편집 가능
    const nextWeekMonday = getMonday(7);
    if (viewingWeek !== currentWeekMonday && viewingWeek !== nextWeekMonday) return;
    try {
      await supabase.from('daily_planner').upsert({
        student_name: selectedName, 
        plan_date: viewingWeek, 
        content_json: updatedWeekly,
        subjects_json: updatedSubjects, 
        exam_date: updatedExamDate, 
        timeblock_json: updatedTimeBlock ?? timeBlockData,
        updated_at: new Date().toISOString()
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

  const toggleViewMode = () => {
    const newMode = viewMode === 'todo' ? 'timeblock' : 'todo';
    setViewMode(newMode);
    localStorage.setItem('planner_view', newMode);
  };

  // --- Todo 관련 ---
  const addTodo = (day: string) => {
    const _editableWeeks = [currentWeekMonday, getMonday(7)];
    if (!_editableWeeks.includes(viewingWeek)) return;
    recordEditDay(day);
    const newData = { ...weeklyData };
    if (!newData[day]) newData[day] = [];
    newData[day] = [...newData[day], { id: Date.now().toString(), subject: subjects.find(s => s !== "") || "과목", content: "", completed: false }];
    setWeeklyData(newData);
    saveAllToDB(newData, subjects, examDate);
  };

  const updateTodo = (day: string, id: string, field: keyof Todo, value: any) => {
    const _editableWeeks = [currentWeekMonday, getMonday(7)];
    if (!_editableWeeks.includes(viewingWeek)) return;
    recordEditDay(day);
    const newData = { ...weeklyData };
    newData[day] = newData[day].map(t => t.id === id ? { ...t, [field]: value } : t);
    setWeeklyData(newData);
    saveAllToDB(newData, subjects, examDate);
  };

  const deleteTodo = (day: string, id: string) => {
    const _editableWeeks = [currentWeekMonday, getMonday(7)];
    if (!_editableWeeks.includes(viewingWeek)) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const newData = { ...weeklyData };
    newData[day] = newData[day].filter(t => t.id !== id);
    setWeeklyData(newData);
    saveAllToDB(newData, subjects, examDate);
  };

  const handleDragEnd = (event: DragEndEvent, day: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWeeklyData((prev) => {
        const oldIndex = prev[day].findIndex((t) => t.id === active.id);
        const newIndex = prev[day].findIndex((t) => t.id === over.id);
        const newList = arrayMove(prev[day], oldIndex, newIndex);
        const updated = { ...prev, [day]: newList };
        saveAllToDB(updated, subjects, examDate);
        return updated;
      });
    }
  };

  // --- TimeBlock 관련 ---
  const getTimeBlockKey = (day: string, hourKey: string) => `${day}_${hourKey}`;

  const getTimeBlock = (day: string, hourKey: string): TimeBlock => {
    const key = getTimeBlockKey(day, hourKey);
    return timeBlockData[key] ?? { 
      subject: '__empty__', 
      content: '', 
      completed: false 
    };
  };

  const updateTimeBlock = (blockKey: string, field: keyof TimeBlock, value: any) => {
    const _editableWeeks = [currentWeekMonday, getMonday(7)];
    if (!_editableWeeks.includes(viewingWeek)) return;
    const newData = { 
      ...timeBlockData, 
      [blockKey]: { 
        ...getTimeBlock('', ''), 
        ...timeBlockData[blockKey], 
        [field]: value 
      } 
    };
    setTimeBlockData(newData);
    saveAllToDB(weeklyData, subjects, examDate, newData);
  };

  const calcTimeBlockProgress = (day: string) => {
    const filledSlots = TIME_SLOTS.filter(slot => {
      const b = getTimeBlock(day, slot.key);
      return b.content.trim() !== '';
    });
    if (filledSlots.length === 0) return 0;
    const completedSlots = filledSlots.filter(slot => getTimeBlock(day, slot.key).completed);
    return Math.round((completedSlots.length / filledSlots.length) * 100);
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm',
    input: isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800',
    select: isDarkMode ? 'bg-slate-700 border-white/10 text-slate-900' : 'bg-slate-100 border-slate-200 text-slate-800',
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    timeHeader: isDarkMode ? 'text-slate-500' : 'text-slate-400',
    timeDivider: isDarkMode ? 'border-white/5' : 'border-slate-100',
    timeHighlight: isDarkMode ? 'bg-white/[0.02]' : 'bg-slate-50/80',
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className={`${theme.textMain} font-serif animate-pulse tracking-[0.3em]`}>REVEALING YOUR SCROLL...</div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 font-sans ${theme.bg} ${theme.textMain}`}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap" rel="stylesheet" />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* ── 상단 헤더 ── */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${theme.btn}`}>← BACK TO LOBBY</Link>
          <div className="flex gap-2">
            <button onClick={toggleMusic} className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${isPlaying ? 'border-yellow-400 bg-yellow-400/10 animate-pulse' : theme.btn}`}>
              {isPlaying ? '🎵' : '🔇'}
            </button>

            {/* ── Time Block 전환 버튼 ── */}
            <button 
              onClick={toggleViewMode} 
              className={`px-3 h-9 rounded-xl border flex items-center gap-1.5 text-[10px] font-black transition-all
                ${viewMode === 'timeblock' 
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400' 
                  : theme.btn}`}
            >
              {viewMode === 'timeblock' ? (
                <>
                  <span className="text-[13px] leading-none">☰</span>
                  <span className="hidden md:inline">TODO</span>
                </>
              ) : (
                <>
                  <span className="text-[13px] leading-none">⏱</span>
                  <span className="hidden md:inline">TIME BLOCK</span>
                </>
              )}
            </button>

            <button onClick={toggleTheme} className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${theme.btn}`}>
              {isDarkMode ? '🌝' : '🌞'}
            </button>
          </div>
        </div>

        {/* ── 주간 이동 ── */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {/* 지난주 */}
          <button onClick={() => { const m = getMonday(-7); setViewingWeek(m); fetchPlannerData(selectedName, m); }} 
                  className={`px-5 py-2.5 rounded-2xl text-[11px] font-black border transition-all ${viewingWeek === getMonday(-7) ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : theme.btn + ' opacity-60 hover:opacity-100'}`}>
            {viewingWeek === getMonday(-7) ? '● 지난주 기록 확인 중' : '← 지난주 기록 보기'}
          </button>

          {/* 이번 주로 돌아오기 (이번 주가 아닐 때만) */}
          {viewingWeek !== currentWeekMonday && (
            <button onClick={() => { setViewingWeek(currentWeekMonday); fetchPlannerData(selectedName, currentWeekMonday); }} 
                    className="px-5 py-2.5 rounded-2xl text-[11px] font-black bg-emerald-600 text-white border border-emerald-500 shadow-lg animate-bounce">
              이번 주로 →
            </button>
          )}

          {/* 다음주 */}
          <button onClick={() => { const m = getMonday(7); setViewingWeek(m); fetchPlannerData(selectedName, m); }} 
                  className={`px-5 py-2.5 rounded-2xl text-[11px] font-black border transition-all ${viewingWeek === getMonday(7) ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : theme.btn + ' opacity-60 hover:opacity-100'}`}>
            {viewingWeek === getMonday(7) ? '● 다음주 미리 작성 중' : '다음주 미리 보기 →'}
          </button>
        </div>

        {/* ── D-Day & 과목 입력 ── */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="w-full md:w-auto">
            <h1 className="text-6xl font-black italic tracking-tighter mb-1" style={{ fontFamily: 'Cinzel' }}>{calculateDDay()}</h1>
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${theme.accent}`}>졸업시험: {examDate || "시험일을 등록하세요"}</p>
          </div>
          <div className={`p-6 rounded-[2rem] border w-full md:w-[400px] ${theme.card}`}>
            <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase opacity-40">
              <span>My Subjects</span>
              <div className="relative">
                {!examDate && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold pointer-events-none text-blue-500">졸업 시험</span>}
                <input type="date" value={examDate} onChange={(e) => { setExamDate(e.target.value); saveAllToDB(weeklyData, subjects, e.target.value); }} 
                       className={`font-bold p-1.5 rounded-lg outline-none border w-[120px] text-center ${theme.input} ${!examDate ? 'text-transparent' : ''}`} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {subjects.map((sub, i) => {
                const dotColor = DOT_COLORS[i % DOT_COLORS.length];
                const borderColors = [
                  'border-blue-400/60 focus:border-blue-400',
                  'border-purple-400/60 focus:border-purple-400',
                  'border-emerald-400/60 focus:border-emerald-400',
                  'border-amber-400/60 focus:border-amber-400',
                  'border-rose-400/60 focus:border-rose-400',
                  'border-cyan-400/60 focus:border-cyan-400',
                  'border-orange-400/60 focus:border-orange-400',
                  'border-pink-400/60 focus:border-pink-400',
                ];
                const bgColors = [
                  'bg-blue-500/10',
                  'bg-purple-500/10',
                  'bg-emerald-500/10',
                  'bg-amber-500/10',
                  'bg-rose-500/10',
                  'bg-cyan-500/10',
                  'bg-orange-500/10',
                  'bg-pink-500/10',
                ];
                return (
                  <input key={i} value={sub} onChange={(e) => {
                    const newSubs = [...subjects];
                    newSubs[i] = e.target.value;
                    setSubjects(newSubs);
                    saveAllToDB(weeklyData, newSubs, examDate);
                  }} placeholder={`과목 ${i+1}`} className={`text-[10px] font-bold p-2 rounded-xl border-2 outline-none text-center transition-all
                    ${sub ? `${borderColors[i % borderColors.length]} ${bgColors[i % bgColors.length]}` : (isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100')}
                    ${theme.textMain}`} />
                );
              })}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            TODO 뷰
        ════════════════════════════════════════ */}
        {viewMode === 'todo' && (
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
                    {(viewingWeek === currentWeekMonday || viewingWeek === getMonday(7)) && (
                      <button onClick={(e) => { e.stopPropagation(); addTodo(day); }} className="p-2 transition-all opacity-30 hover:opacity-100">
                        <span className="text-xl font-light">+</span>
                      </button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="px-4 md:px-6 pb-6 pt-0 space-y-2">
                      {/* ── 과목 색상 범례 ── */}
                      <SubjectLegend subjects={subjects} />

                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleDragEnd(e, day)}
                      >
                        <SortableContext 
                          items={dayTodos.map(t => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {dayTodos.map((todo) => (
                            <SortableTodoItem 
                              key={todo.id}
                              todo={todo}
                              day={day}
                              isEditable={viewingWeek === currentWeekMonday || viewingWeek === getMonday(7)}
                              subjects={subjects}
                              theme={theme}
                              updateTodo={updateTodo}
                              deleteTodo={deleteTodo}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                      
                      {dayTodos.length === 0 && (
                        <div className="text-center py-4 text-[10px] opacity-20 italic">입력된 계획이 없습니다.</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════════════
            TIME BLOCK 뷰
        ════════════════════════════════════════ */}
        {viewMode === 'timeblock' && (
          <div className="space-y-6">
            {DAYS_ORDER.map((day, idx) => {
              const progress = calcTimeBlockProgress(day);
              const isOpen = openDays[day];

              return (
                <div key={day} className={`rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${theme.card} ${isOpen ? 'ring-2 ring-blue-500/10' : ''}`}>
                  {/* 요일 헤더 */}
                  <div 
                    onClick={() => setOpenDays(prev => ({ ...prev, [day]: !prev[day] }))} 
                    className="p-5 flex items-center justify-between cursor-pointer"
                  >
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
                  </div>

                  {/* 타임블록 슬롯 목록 */}
                  {isOpen && (
                    <div className="pb-5">
                      {/* ── 과목 색상 범례 ── */}
                      <div className="px-5 pb-1">
                        <SubjectLegend subjects={subjects} />
                      </div>

                      {/* AM / PM / 새벽 구분 렌더 */}
                      {TIME_SLOTS.map((slot) => {
                        const blockKey = getTimeBlockKey(day, slot.key);
                        const block = getTimeBlock(day, slot.key);

                        const showAmLabel = slot.hour === 5;
                        const showPmLabel = slot.hour === 12;
                        const showMidnightLabel = slot.hour === 24;

                        return (
                          <React.Fragment key={slot.key}>
                            {showAmLabel && (
                              <div className="flex items-center gap-3 px-5 py-2">
                                <span className={`text-[9px] font-black tracking-widest uppercase ${theme.timeHeader}`}>오전 AM</span>
                                <div className={`flex-1 border-t ${theme.timeDivider}`}></div>
                              </div>
                            )}
                            {showPmLabel && (
                              <div className="flex items-center gap-3 px-5 py-2 mt-1">
                                <span className={`text-[9px] font-black tracking-widest uppercase ${theme.timeHeader}`}>오후 PM</span>
                                <div className={`flex-1 border-t ${theme.timeDivider}`}></div>
                              </div>
                            )}
                            {showMidnightLabel && (
                              <div className="flex items-center gap-3 px-5 py-2 mt-1">
                                <span className={`text-[9px] font-black tracking-widest uppercase ${theme.timeHeader}`}>자정 MIDNIGHT</span>
                                <div className={`flex-1 border-t ${theme.timeDivider}`}></div>
                              </div>
                            )}

                            <div className={`flex items-stretch gap-0 mx-3 rounded-xl overflow-hidden
                              ${slot.hour % 2 === 0 ? theme.timeHighlight : ''}`}>
                              {/* 시간 레이블 */}
                              <div className={`w-14 flex-shrink-0 flex items-center justify-center text-[10px] font-black ${theme.timeHeader} border-r ${theme.timeDivider} py-1`}>
                                {slot.label}
                              </div>
                              {/* 블록 셀 */}
                              <div className="flex-1 py-1 px-2">
                                <TimeBlockCell
                                  blockKey={blockKey}
                                  block={block}
                                  subjects={subjects}
                                  theme={theme}
                                  isEditable={viewingWeek === currentWeekMonday || viewingWeek === getMonday(7)}
                                  onChange={updateTimeBlock}
                                />
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
