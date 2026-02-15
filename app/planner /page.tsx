"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PlannerPage() {
  const [selectedName, setSelectedName] = useState("");
  const [plannerData, setPlannerData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false); // ✅ Hydration 방지용 추가

  // BGM 로직
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm, setBgm] = useState<HTMLAudioElement | null>(null);

  // 날짜 계산 함수
  const getPlannerDate = () => {
    const now = new Date();
    if (now.getHours() < 4) {
      now.setDate(now.getDate() - 1);
    }
    return now.toLocaleDateString('en-CA');
  };

  // ✅ 초기 마운트 설정
  useEffect(() => {
    setMounted(true);
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/hedwig.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      setBgm(audio);
    }

    const savedTheme = localStorage.getItem('planner_theme');
    if (savedTheme === 'light') setIsDarkMode(false);

    const authData = localStorage.getItem('hg_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.name) {
          setSelectedName(parsed.name);
          fetchPlannerData(parsed.name);
          return;
        }
      } catch (e) {
        console.error("인증 데이터 파싱 에러:", e);
      }
    }
    setLoading(false);
  }, []);

  const fetchPlannerData = async (name: string) => {
    try {
      const planDate = getPlannerDate(); 
      const { data } = await supabase
        .from('daily_planner')
        .select('content_json')
        .eq('student_name', name)
        .eq('plan_date', planDate)
        .maybeSingle();

      if (data && data.content_json) {
        setPlannerData(data.content_json);
      }
    } catch (err) {
      console.error("플래너 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (time: string, text: string) => {
    const updatedData = { ...plannerData, [time]: text };
    setPlannerData(updatedData);
    if (!selectedName) return;
    const planDate = getPlannerDate();
    await supabase.from('daily_planner').upsert({
      student_name: selectedName,
      plan_date: planDate,
      content_json: updatedData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_name,plan_date' });
  };

  const toggleMusic = () => {
    if (!bgm) return;
    if (isPlaying) {
      bgm.pause();
    } else {
      bgm.play().catch(e => console.log("음악 재생 실패:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('planner_theme', newMode ? 'dark' : 'light');
  };

  const timeSlots = [];
  for (let h = 6; h < 24; h++) {
    const hour = String(h).padStart(2, '0');
    timeSlots.push(`${hour}:00`, `${hour}:30`);
  }
  timeSlots.push("00:00", "00:30", "01:00");

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60 border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-slate-200/50',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm',
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    divider: isDarkMode ? 'divide-white/5' : 'divide-slate-100'
  };

  // ✅ 마운트되기 전에는 아무것도 그리지 않음 (흰 화면 방지)
  if (!mounted) return null;

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className={`${theme.textMain} font-serif animate-pulse uppercase tracking-[0.3em]`}>Opening Your Scroll...</div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${theme.bg} ${theme.textMain}`} style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
      
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-10">
          <div className="flex flex-col gap-4">
            <Link href="/" className={`inline-block px-4 py-2 rounded-xl text-xs font-bold border transition-all w-fit ${theme.btn}`}>
              ← Back to Lobby
            </Link>
            <h1 className="text-3xl font-black italic uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
              Daily Planner
            </h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
              <button 
                onClick={toggleMusic} 
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  isPlaying ? 'border-yellow-400 bg-yellow-400/10 animate-pulse' : theme.btn
                }`}
              >
                {isPlaying ? '🎵' : '🔇'}
              </button>
              <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${theme.btn}`}>
                {isDarkMode ? '🌝' : '🌞'}
              </button>
            </div>
            <div className="text-right">
              <p className={`text-[11px] font-bold uppercase tracking-tighter ${theme.accent}`}>
                Wizard: {selectedName || "Unknown"}
              </p>
              <p className="text-[10px] font-medium opacity-40 uppercase">
                {new Date(getPlannerDate()).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </p>
            </div>
          </div>
        </div>

        <div className={`border transition-all duration-500 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-2xl ${theme.card}`}>
          <div className={`grid grid-cols-1 divide-y ${theme.divider}`}>
            {timeSlots.map((time) => (
              <div key={time} className={`flex items-center group transition-colors ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                <div className={`w-20 md:w-24 py-4 px-6 text-[11px] font-black border-r text-center ${
                  isDarkMode 
                    ? `border-white/5 ${time.endsWith(':00') ? 'text-white/60' : 'text-white/20'}` 
                    : `border-slate-100 ${time.endsWith(':00') ? 'text-slate-500' : 'text-slate-300'}`
                }`}>
                  {time}
                </div>
                
                <div className="flex-1">
                  <input 
                    type="text"
                    defaultValue={plannerData[time] || ""}
                    onBlur={(e) => saveEntry(time, e.target.value)}
                    placeholder="무엇을 학습했나요?"
                    className={`w-full bg-transparent px-6 py-4 text-sm font-medium outline-none transition-all ${
                      isDarkMode 
                        ? 'text-white/80 placeholder:text-white/5 focus:bg-white/[0.05]'
                        : 'text-slate-700 placeholder:text-slate-200 focus:bg-slate-50/50'
                    }`}
                  />
                </div>

                <div className="px-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
            새벽 4시에 학습내역이 초기화됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
