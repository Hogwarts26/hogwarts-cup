"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase 초기화 (코드 안으로 직접 배치)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function PlannerPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [plannerData, setPlannerData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm, setBgm] = useState<HTMLAudioElement | null>(null);

  // 1. 마운트 상태 확인 (Hydration 에러 방지 최우선)
  useEffect(() => {
    setMounted(true);
    
    // 테마 및 BGM 초기화
    const savedTheme = localStorage.getItem('planner_theme');
    if (savedTheme === 'light') setIsDarkMode(false);

    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/hedwig.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      setBgm(audio);
    }
  }, []);

  // 2. 유저 정보 및 데이터 로드 (mounted 이후 실행)
  useEffect(() => {
    if (!mounted) return;

    const loadUserAndData = async () => {
      const authData = localStorage.getItem('hg_auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed.name) {
            setSelectedName(parsed.name);
            
            // 데이터 페치
            const now = new Date();
            if (now.getHours() < 4) now.setDate(now.getDate() - 1);
            const planDate = now.toLocaleDateString('en-CA');

            const { data } = await supabase
              .from('daily_planner')
              .select('content_json')
              .eq('student_name', parsed.name)
              .eq('plan_date', planDate)
              .maybeSingle();
            
            if (data?.content_json) setPlannerData(data.content_json);
          }
        } catch (e) {
          console.error("Auth error:", e);
        }
      }
      setLoading(false);
    };

    loadUserAndData();

    return () => {
      if (bgm) {
        bgm.pause();
        bgm.src = "";
      }
    };
  }, [mounted, bgm]);

  // 저장 함수
  const saveEntry = async (time: string, text: string) => {
    const updatedData = { ...plannerData, [time]: text };
    setPlannerData(updatedData);
    if (!selectedName) return;
    
    const now = new Date();
    if (now.getHours() < 4) now.setDate(now.getDate() - 1);
    const planDate = now.toLocaleDateString('en-CA');

    await supabase.from('daily_planner').upsert({
      student_name: selectedName,
      plan_date: planDate,
      content_json: updatedData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_name,plan_date' });
  };

  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  const timeSlots = [];
  for (let h = 6; h < 24; h++) {
    const hh = String(h).padStart(2, '0');
    timeSlots.push(`${hh}:00`, `${hh}:30`);
  }
  timeSlots.push("00:00", "00:30", "01:00");

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60 border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-slate-200/50',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm',
    divider: isDarkMode ? 'divide-white/5' : 'divide-slate-100'
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${theme.bg} ${theme.textMain}`}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap" rel="stylesheet" />
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-10">
          <div className="flex flex-col gap-4">
            <Link href="/" className={`px-4 py-2 rounded-xl text-xs font-bold border ${theme.btn}`}>← Back</Link>
            <h1 className="text-3xl font-black italic uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>Daily Planner</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if(bgm) isPlaying ? bgm.pause() : bgm.play(); setIsPlaying(!isPlaying); }} className={`w-10 h-10 rounded-xl border ${isPlaying ? 'bg-yellow-400/20' : theme.btn}`}>{isPlaying ? '🎵' : '🔇'}</button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 rounded-xl border ${theme.btn}`}>{isDarkMode ? '🌝' : '🌞'}</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse uppercase tracking-widest opacity-50">Loading Scroll...</div>
        ) : (
          <div className={`border rounded-[2rem] overflow-hidden ${theme.card}`}>
            <div className={`grid grid-cols-1 divide-y ${theme.divider}`}>
              {timeSlots.map((time) => (
                <div key={time} className="flex items-center">
                  <div className={`w-20 md:w-24 py-4 text-center text-[10px] font-bold opacity-40 border-r ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>{time}</div>
                  <input 
                    className="flex-1 bg-transparent px-6 py-4 text-sm outline-none" 
                    defaultValue={plannerData[time] || ""} 
                    onBlur={(e) => saveEntry(time, e.target.value)}
                    placeholder="..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
