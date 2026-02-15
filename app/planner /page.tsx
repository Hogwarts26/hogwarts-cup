"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// 1. 확인된 Supabase 주소와 진짜 키(eyJ...) 직접 입력
const SUPABASE_URL = 'https://auleispwjviglpmllviy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bGVpc3B3anZpZ2xwbWxsdml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMzAxMTcsImV4cCI6MjA4NDgwNjExN30.D4q5vTPLWYOVsttxtXQ7Cuokbc3PLA6lhhkPGofXdSI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function PlannerPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [plannerData, setPlannerData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm, setBgm] = useState<HTMLAudioElement | null>(null);

  // 날짜 계산 함수
  const getPlanDate = () => {
    const now = new Date();
    if (now.getHours() < 4) now.setDate(now.getDate() - 1);
    return now.toLocaleDateString('en-CA');
  };

  // 초기 마운트 설정
  useEffect(() => {
    setMounted(true);
    
    // 테마 설정 불러오기
    const savedTheme = localStorage.getItem('planner_theme');
    if (savedTheme === 'light') setIsDarkMode(false);

    // BGM 객체 생성
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/hedwig.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      setBgm(audio);
    }
  }, []);

  // 데이터 로딩 (mounted 이후 실행)
  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      const authData = localStorage.getItem('hg_auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed.name) {
            setSelectedName(parsed.name);
            
            const { data, error } = await supabase
              .from('daily_planner')
              .select('content_json')
              .eq('student_name', parsed.name)
              .eq('plan_date', getPlanDate())
              .maybeSingle();
            
            if (data?.content_json) setPlannerData(data.content_json);
            if (error) console.error("데이터 로드 에러:", error);
          }
        } catch (e) {
          console.error("인증 파싱 에러:", e);
        }
      }
      setLoading(false);
    };

    loadData();

    // 페이지 나갈 때 소리 끄기
    return () => {
      if (bgm) {
        bgm.pause();
        bgm.src = "";
      }
    };
  }, [mounted, bgm]);

  // 저장 로직
  const saveEntry = async (time: string, text: string) => {
    const updatedData = { ...plannerData, [time]: text };
    setPlannerData(updatedData);
    if (!selectedName) return;

    await supabase.from('daily_planner').upsert({
      student_name: selectedName,
      plan_date: getPlanDate(),
      content_json: updatedData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_name,plan_date' });
  };

  // 시간 슬롯 생성
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 6; h < 24; h++) {
      const hh = String(h).padStart(2, '0');
      slots.push(`${hh}:00`, `${hh}:30`);
    }
    slots.push("00:00", "00:30", "01:00");
    return slots;
  }, []);

  // 테마 스타일 정의
  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-slate-200 shadow-sm',
    text: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'
  };

  // Hydration 방지: 서버 사이드에서 그리지 않음
  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className={`min-h-screen p-4 md:p-8 ${theme.bg} ${theme.text}`}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap" rel="stylesheet" />
      
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${theme.btn}`}>
            ← Back to Lobby
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={() => { if(bgm) isPlaying ? bgm.pause() : bgm.play().catch(()=>{}); setIsPlaying(!isPlaying); }} 
              className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-yellow-400/20 border-yellow-400/50' : theme.btn}`}
            >
              {isPlaying ? '🎵' : '🔇'}
            </button>
            <button 
              onClick={() => {
                const newMode = !isDarkMode;
                setIsDarkMode(newMode);
                localStorage.setItem('planner_theme', newMode ? 'dark' : 'light');
              }} 
              className={`w-10 h-10 border rounded-xl flex items-center justify-center ${theme.btn}`}
            >
              {isDarkMode ? '🌝' : '🌞'}
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-black mb-10 italic tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
          Daily Planner
        </h1>

        {loading ? (
          <div className="py-20 text-center animate-pulse opacity-50 uppercase tracking-widest">Opening Your Scroll...</div>
        ) : (
          <div className={`border rounded-[2.5rem] overflow-hidden backdrop-blur-sm transition-colors duration-500 ${theme.card}`}>
            <div className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
              {timeSlots.map((time) => (
                <div key={time} className="flex items-center group transition-colors hover:bg-white/[0.02]">
                  <div className={`w-20 md:w-24 py-5 text-center text-[11px] font-black opacity-30 border-r ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    {time}
                  </div>
                  <input 
                    className="flex-1 bg-transparent px-6 py-5 text-sm outline-none placeholder:opacity-10" 
                    defaultValue={plannerData[time] || ""} 
                    onBlur={(e) => saveEntry(time, e.target.value)}
                    placeholder="무엇을 학습했나요?"
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
