"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// 1. Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PlannerPage() {
  const [selectedName, setSelectedName] = useState("");
  const [plannerData, setPlannerData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false); // ✅ Hydration 에러 방지 핵심
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm, setBgm] = useState<HTMLAudioElement | null>(null);

  // 2. 시간 슬롯 생성 (useMemo로 고정시켜 불일치 방지)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 6; h < 24; h++) {
      const hour = String(h).padStart(2, '0');
      slots.push(`${hour}:00`, `${hour}:30`);
    }
    slots.push("00:00", "00:30", "01:00");
    return slots;
  }, []);

  // 3. 날짜 계산 함수
  const getPlannerDate = () => {
    const now = new Date();
    if (now.getHours() < 4) {
      now.setDate(now.getDate() - 1);
    }
    return now.toLocaleDateString('en-CA');
  };

  // 4. 초기 마운트 및 데이터 로드
  useEffect(() => {
    setMounted(true); // ✅ 브라우저 로드 완료 표시
    
    // BGM 초기화
    let audio: HTMLAudioElement | null = null;
    if (typeof Audio !== 'undefined') {
      audio = new Audio('/hedwig.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      setBgm(audio);
    }

    // 테마 설정
    const savedTheme = localStorage.getItem('planner_theme');
    if (savedTheme === 'light') setIsDarkMode(false);

    // 유저 정보 확인 및 데이터 페치
    const authData = localStorage.getItem('hg_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.name) {
          setSelectedName(parsed.name);
          // fetchPlannerData를 여기서 직접 호출하지 않고 함수 정의 후 실행
          const loadData = async (name: string) => {
            try {
              const planDate = getPlannerDate(); 
              const { data } = await supabase
                .from('daily_planner')
                .select('content_json')
                .eq('student_name', name)
                .eq('plan_date', planDate)
                .maybeSingle();
              if (data?.content_json) setPlannerData(data.content_json);
            } catch (err) {
              console.error("데이터 로드 실패:", err);
            } finally {
              setLoading(false);
            }
          };
          loadData(parsed.name);
          return () => { if (audio) audio.pause(); }; // ✅ 언마운트 시 음악 정지
        }
      } catch (e) {
        console.error("인증 에러:", e);
      }
    }
    setLoading(false);
    
    return () => { if (audio) audio.pause(); }; // ✅ 인증 데이터 없을 때도 정지 로직 포함
  }, []);

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
    isPlaying ? bgm.pause() : bgm.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60 border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-slate-200/50',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm',
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    divider: isDarkMode ? 'divide-white/5' : 'divide-slate-100'
  };

  // ✅ Hydration 에러 차단: 마운트 전엔 아무것도 안 그림
  if (!mounted) return null;

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className={`${theme.textMain} font-serif animate-pulse uppercase tracking-[0.3em]`}>Opening Your Scroll...</div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${theme.bg} ${theme.textMain}`}>
      {/* 폰트 에러 방지를 위해 외부 링크 수정 */}
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
