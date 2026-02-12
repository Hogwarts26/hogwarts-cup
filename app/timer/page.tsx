"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SCHEDULE = [
  { label: "1교시", start: "07:00", end: "08:40", isStudy: true },
  { label: "2교시", start: "09:00", end: "10:40", isStudy: true },
  { label: "3교시", start: "11:00", end: "12:40", isStudy: true },
  { label: "점심시간", start: "12:40", end: "14:00", isStudy: false },
  { label: "4교시", start: "14:00", end: "15:40", isStudy: true },
  { label: "5교시", start: "16:00", end: "17:40", isStudy: true },
  { label: "저녁시간", start: "17:40", end: "19:00", isStudy: false },
  { label: "6교시", start: "19:00", end: "20:40", isStudy: true },
  { label: "7교시", start: "20:50", end: "22:30", isStudy: true }
];

export default function TimerPage() {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeconds = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  const nowTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const currentPeriod = SCHEDULE.find(p => {
    const start = getSeconds(p.start);
    const end = getSeconds(p.end);
    return nowTotalSec >= start && nowTotalSec < end;
  });

  const isStudyTime = currentPeriod?.isStudy ?? false;

  const playSound = (id: string) => {
    if (isMuted) return;
    const audio = document.getElementById(id) as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    SCHEDULE.forEach(p => {
      const start = getSeconds(p.start);
      const end = getSeconds(p.end);
      if (nowTotalSec === start) playSound('studyBell');
      if (nowTotalSec === end - 1) {
        if (p.label === "7교시") playSound('endBell');
        else playSound('breakBell');
      }
    });
  }, [nowTotalSec]);

  if (!mounted) return null;

  const circleRadius = 180;
  const circumference = 2 * Math.PI * circleRadius;
  let strokeDashoffset = circumference;

  if (currentPeriod) {
    const start = getSeconds(currentPeriod.start);
    const end = getSeconds(currentPeriod.end);
    const total = end - start;
    const elapsed = nowTotalSec - start;
    const remainingRatio = Math.max(0, (total - elapsed) / total);
    strokeDashoffset = circumference * (1 - remainingRatio);
  }

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/40' : 'bg-white',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSub: isDarkMode ? 'text-slate-500' : 'text-slate-400',
    btnBg: isDarkMode ? 'bg-slate-800/40 hover:bg-slate-700/60' : 'bg-white hover:bg-slate-100 shadow-md',
    accent: isStudyTime 
      ? (isDarkMode ? '#3b82f6' : '#2563eb') 
      : (isDarkMode ? '#f59e0b' : '#d97706'),
    accentClass: isStudyTime 
      ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') 
      : (isDarkMode ? 'text-amber-400' : 'text-amber-600'),
  };

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&family=Pretendard:wght@400;700&display=swap');
        body { margin: 0; font-family: 'Pretendard', sans-serif; transition: background-color 0.5s ease; overflow-x: hidden; }
        .timer-font { font-family: 'JetBrains+Mono', monospace !important; font-weight: 800; letter-spacing: -0.05em; }
        .circle-progress { transform: rotate(-90deg) scaleY(-1); transform-origin: 50% 50%; transition: stroke-dashoffset 1s linear, stroke 0.5s ease; }
      `}} />

      <main className={`${theme.bg} ${theme.textMain} min-h-screen flex flex-col items-center p-4 py-8 transition-colors duration-500`}>
        
        <div className="w-full max-w-2xl flex justify-between items-center mb-6">
          {/* 이전 페이지로 돌아가는 버튼 (사용자 경험상 필수!) */}
          <Link href="/" className={`px-4 py-2 ${theme.btnBg} backdrop-blur-xl border border-slate-700/20 rounded-xl transition-all flex items-center gap-2 font-bold text-sm`}>
            <span>📊</span> <span>학습내역</span>
          </Link>

          <div className="flex gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 flex items-center justify-center ${theme.btnBg} border border-slate-700/20 rounded-xl transition-all`}>
              <span className="text-xl">{isDarkMode ? '🌝' : '🌞'}</span>
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className={`w-10 h-10 flex items-center justify-center ${theme.btnBg} border border-slate-700/20 rounded-xl transition-all`}>
              <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
            </button>
          </div>
        </div>

        <div className={`text-5xl md:text-7xl font-black mb-4 text-center transition-colors duration-500 ${theme.accentClass}`}>
          {currentPeriod ? currentPeriod.label : "자율학습"}
        </div>

        <div className="relative flex items-center justify-center mb-8 scale-95 md:scale-110">
          <svg width="420" height="420">
            <circle cx="210" cy="210" r="180" fill="none" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="16" />
            <circle cx="210" cy="210" r="180" fill="none" stroke={theme.accent} strokeWidth="16" strokeLinecap="round" className="circle-progress"
              style={{ strokeDasharray: circumference, strokeDashoffset: currentPeriod ? strokeDashoffset : 0, filter: `drop-shadow(0 0 10px ${theme.accent}80)` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="timer-font text-[9rem] md:text-[12rem] leading-none">
              {currentPeriod ? (() => {
                const diff = getSeconds(currentPeriod.end) - nowTotalSec;
                const min = Math.floor(diff / 60);
                const sec = diff % 60;
                return `${min}:${sec.toString().padStart(2, '0')}`;
              })() : "--:--"}
            </div>
            <div className={`text-2xl ${theme.textSub} font-bold mt-4 tracking-[0.3em]`}>
              {now.toLocaleTimeString('ko-KR', { hour12: false })}
            </div>
          </div>
        </div>

        <div className={`w-full max-w-md ${theme.card} rounded-[40px] p-8 border ${isDarkMode ? 'border-slate-800/40' : 'border-slate-200'} shadow-2xl transition-all duration-500`}>
          <ul className="space-y-4">
            {SCHEDULE.map((p, i) => {
              const start = getSeconds(p.start);
              const end = getSeconds(p.end);
              const isPast = nowTotalSec >= end;
              const isCurrent = nowTotalSec >= start && nowTotalSec < end;
              return (
                <li key={i} className={`flex justify-between text-xl px-2 transition-all duration-500 
                  ${isCurrent ? (isStudyTime ? 'text-blue-500 font-black scale-105' : 'text-amber-500 font-black scale-105') 
                  : isPast ? 'text-slate-400 line-through opacity-30' : theme.textMain}`}>
                  <span>{p.label}</span>
                  <span className="font-mono tracking-tighter opacity-80">{p.start} - {p.end}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <audio id="studyBell" src="/study.mp3" />
        <audio id="breakBell" src="/break.mp3" />
        <audio id="endBell" src="/end.mp3" />
      </main>
    </>
  );
}
