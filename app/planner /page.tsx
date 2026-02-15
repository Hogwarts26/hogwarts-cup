"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase 선언 - 안전 장치 추가
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function PlannerPage() {
  // 1. 상태 선언
  const [mounted, setMounted] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [plannerData, setPlannerData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm, setBgm] = useState<HTMLAudioElement | null>(null);

  // 2. 날짜 계산 (함수를 useEffect 밖에서 호출하지 않도록 주의)
  const getPlannerDate = () => {
    const now = new Date();
    if (now.getHours() < 4) {
      now.setDate(now.getDate() - 1);
    }
    return now.toLocaleDateString('en-CA');
  };

  // 3. 마운트 시점에 모든 설정 몰아넣기 (Hydration 에러 해결 핵심)
  useEffect(() => {
    setMounted(true); // 이제 브라우저에서 렌더링을 시작해도 좋다는 신호

    // BGM 초기화
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/hedwig.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      setBgm(audio);
    }

    // 테마 설정
    const savedTheme = localStorage.getItem('planner_theme');
    if (savedTheme === 'light') setIsDarkMode(false);

    // 인증 데이터 로드
    const authData = localStorage.getItem('hg_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.name) {
          setSelectedName(parsed.name);
          
          // 데이터 페치 함수 실행
          const planDate = getPlannerDate(); 
          supabase
            .from('daily_planner')
            .select('content_json')
            .eq('student_name', parsed.name)
            .eq('plan_date', planDate)
            .maybeSingle()
            .then(({ data }) => {
              if (data?.content_json) setPlannerData(data.content_json);
              setLoading(false);
            })
            .catch(() => setLoading(false));
          return;
        }
      } catch (e) {
        console.error("Auth error:", e);
      }
    }
    setLoading(false);
  }, []);

  // BGM 종료 로직 별도 관리
  useEffect(() => {
    return () => {
      if (bgm) {
        bgm.pause();
        bgm.src = ""; 
      }
    };
  }, [bgm]);

  // 저장 로직
  const saveEntry = async (time: string, text: string) => {
    const updatedData = { ...plannerData, [time]: text };
    setPlannerData(updatedData);
    if (!selectedName) return;
    await supabase.from('daily_planner').upsert({
      student_name: selectedName,
      plan_date: getPlannerDate(),
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

  // 4. 시간 슬롯
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

  // ⚠️ 중요: 마운트되기 전에는 절대 아무것도 렌더링하지 않음 (Hydration 에러 방지용)
  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className={`${theme.textMain} font-serif animate-pulse uppercase tracking-[0.3em]`}>Opening Your Scroll...</div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${theme.bg} ${theme.textMain}`}>
      {/* 폰트 링크에서 불필요한 따옴표 제거 */}
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap" rel="stylesheet" />
      
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
              <p className="text-[10px] font-medium opacity-40 uppercase">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

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
                    className="w-full bg-transparent px-6 py-4 text-sm font-medium outline-none"
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
