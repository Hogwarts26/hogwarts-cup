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
  const [now, setNow] = useState<Date | null>(null); // 초기값을 null로 설정하여 서버/클라이언트 불일치 차단
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 헬퍼 함수
  const getSeconds = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  if (!mounted || !now) {
    return <div className="min-h-screen bg-[#020617]" />;
  }

  // 매 렌더링마다 직접 계산 (useMemo 제거)
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

  // 종소리 로직 (종소리가 나야 하는 시간에만 실행)
  const checkBell = () => {
    SCHEDULE.forEach(p => {
      const start = getSeconds(p.start);
      const end = getSeconds(p.end);
      if (nowTotalSec === start) playSound('studyBell');
      if (nowTotalSec === end - 1) {
        if (p.label === "7교시") playSound('endBell');
        else playSound('breakBell');
      }
    });
  };
  checkBell();

  // 원형 게이지 계산
  const circleRadius = 180;
  const circumference = 2 * Math.PI * circleRadius;
  let strokeDashoffset = circumference;

  if (currentPeriod) {
    const start = getSeconds(currentPeriod.start);
    const end = getSeconds(currentPeriod.end);
    const total = end - start;
    const elapsed = nowTotalSec - start;
    const ratio = Math.max(0, (total - elapsed) / total);
    strokeDashoffset = circumference * (1 - ratio);
  }

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/40' : 'bg-white',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSub: isDarkMode ? 'text-slate-500' : 'text-slate-400',
    btnBg: isDarkMode ? 'bg-slate-800/40' : 'bg-white shadow-md',
    accent: isStudyTime ? (isDarkMode ? '#3b82f6' : '#2563eb') : (isDarkMode ? '#f59e0b' : '#d97706'),
    accentClass: isStudyTime ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-amber-400' : 'text-amber-600'),
  };

  return (
    <main className={`${theme.bg} ${theme.textMain} min-h-screen flex flex-col items-center p-4 py-8 transition-colors duration-500`}>
      {/* 테일윈드 CDN 대신 로컬 클래스 사용 권장하나, 급한 경우 위해 유지 */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap');
        .timer-font { font-family: 'JetBrains+Mono', monospace !important; }
        .circle-progress { transform: rotate(-90deg) scaleY(-1); transform-origin: 50% 50%; transition: stroke-dashoffset 1s linear; }
      `}</style>

      <div className="w-full max-w-2xl flex justify-between items-center mb-6 z-10">
        <Link href="/" className={`px-4 py-2 ${theme.btnBg} rounded-xl font-bold text-sm border border-slate-700/20`}>
          📊 학습내역
        </Link>
        <div className="flex gap-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 flex items-center justify-center ${theme.btnBg} rounded-xl border border-slate-700/20`}>
            {isDarkMode ? '🌝' : '🌞'}
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className={`w-10 h-10 flex items-center justify-center ${theme.btnBg} rounded-xl border border-slate-700/20`}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className={`text-5xl font-black mb-4 ${theme.accentClass}`}>
        {currentPeriod ? currentPeriod.label : "자율학습"}
      </div>

      <div className="relative flex items-center justify-center mb-8 scale-[0.7] sm:scale-100">
        <svg width="420" height="420">
          <circle cx="210" cy="210" r="180" fill="none" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="16" />
          <circle cx="210" cy="210" r="180" fill="none" stroke={theme.accent} strokeWidth="16" strokeLinecap="round" className="circle-progress"
            style={{ strokeDasharray: circumference, strokeDashoffset: strokeDashoffset }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="timer-font text-[8rem] leading-none font-bold">
            {currentPeriod ? (() => {
              const diff = getSeconds(currentPeriod.end) - nowTotalSec;
              return `${Math.floor(diff / 60)}:${(diff % 60).toString().padStart(2, '0')}`;
            })() : "--:--"}
          </div>
          <div className={`text-xl font-bold mt-4 tracking-widest ${theme.textSub}`}>
            {`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`}
          </div>
        </div>
      </div>

      <div className={`w-full max-w-md ${theme.card} rounded-[32px] p-6 border border-slate-700/20 shadow-2xl`}>
        <ul className="space-y-4">
          {SCHEDULE.map((p, i) => {
            const start = getSeconds(p.start);
            const end = getSeconds(p.end);
            const isPast = nowTotalSec >= end;
            const isCurrent = nowTotalSec >= start && nowTotalSec < end;
            return (
              <li key={i} className={`flex justify-between text-lg ${isCurrent ? theme.accentClass + ' font-bold' : isPast ? 'opacity-30 line-through' : ''}`}>
                <span>{p.label}</span>
                <span className="font-mono">{p.start} - {p.end}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <audio id="studyBell" src="/study.mp3" preload="auto" />
      <audio id="breakBell" src="/break.mp3" preload="auto" />
      <audio id="endBell" src="/end.mp3" preload="auto" />
    </main>
  );
}
