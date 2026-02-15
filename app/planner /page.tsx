"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// 1. Supabase 클라이언트를 함수 밖에서 선언 (lib/supabase.ts 역할 대체)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function PlannerPage() {
  const [selectedName, setSelectedName] = useState("");
  const [plannerData, setPlannerData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 🎵 BGM 객체 (이전 방식 그대로 복구)
  const [bgm] = useState(() => typeof Audio !== 'undefined' ? new Audio('/hedwig.mp3') : null);

  const toggleMusic = () => {
    if (!bgm) return;
    if (isPlaying) {
      bgm.pause();
    } else {
      bgm.loop = true;
      bgm.volume = 0.4;
      bgm.play().catch(e => console.log("음악 재생 실패:", e));
    }
    setIsPlaying(!isPlaying);
  };

  // 페이지 떠날 때 음악 끄기 (이전 로직 복구)
  useEffect(() => {
    return () => {
      if (bgm) {
        bgm.pause();
        setIsPlaying(false);
      }
    };
  }, [bgm]);

  const getPlannerDate = () => {
    const now = new Date();
    if (now.getHours() < 4) {
      now.setDate(now.getDate() - 1);
    }
    return now.toLocaleDateString('en-CA');
  };

  // 데이터 불러오기 함수
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

  useEffect(() => {
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

  // ✅ 흰 화면 방지를 위해 로딩 중일 때 '최소한의 구조'라도 보여주기
  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className={`${theme.textMain} font-serif animate-pulse uppercase tracking-[0.3em]`}>Opening Your Scroll...</div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${theme.bg} ${theme.textMain}`} style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap" rel="stylesheet" />
      
      <div className="max-w-3xl mx-auto">
        {/* 상단 헤더 부분 */}
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
              <button onClick={toggleMusic} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isPlaying ? 'border-yellow-400 bg-yellow-400/10 animate-pulse' : theme.btn}`}>
                {isPlaying ? '🎵' : '🔇'}
              </button>
              <button onClick={() => {
                const newMode = !isDarkMode;
                setIsDarkMode(newMode);
                localStorage.setItem('planner_theme', newMode ? 'dark' : 'light');
              }} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${theme.btn}`}>
                {isDarkMode ? '🌝' : '🌞'}
              </button>
            </div>
            <div className="text-right">
              <p className={`text-[11px] font-bold uppercase tracking-tighter ${theme.accent}`}>Wizard: {selectedName || "Unknown"}</p>
              <p className="text-[10px] font-medium opacity-40 uppercase">
                {new Date(getPlannerDate()).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </p>
            </div>
          </div>
        </div>

        {/* 플래너 본문 */}
        <div className={`border rounded-[2rem] overflow-hidden backdrop-blur-md shadow-2xl ${theme.card}`}>
          <div className={`grid grid-cols-1 divide-y ${theme.divider}`}>
            {timeSlots.map((time) => (
              <div key={time} className={`flex items-center group transition-colors ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                <div className={`w-20 md:w-24 py-4 px-6 text-[11px] font-black border-r text-center ${isDarkMode ? 'border-white/5 text-white/60' : 'border-slate-100 text-slate-500'}`}>
                  {time}
                </div>
                <div className="flex-1">
                  <input 
                    type="text"
                    defaultValue={plannerData[time] || ""}
                    onBlur={(e) => saveEntry(time, e.target.value)}
                    placeholder="무엇을 학습했나요?"
                    className="w-full bg-transparent px-6 py-4 text-sm font-medium outline-none text-inherit"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
