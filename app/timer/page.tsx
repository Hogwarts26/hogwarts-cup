"use client";

import { useState, useEffect, useRef } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const lastPlayedRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeconds = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  // Hydration 에러 방지: 마운트 전까지 아무것도 렌더링하지 않음
  if (!mounted || !now) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-white font-bold animate-pulse text-sm font-mono">LOADING HOGWARTS CLOCK...</div>
      </div>
    );
  }

  const nowTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // 현재 교시/쉬는시간 판별 로직
  let currentPeriod = SCHEDULE.find(p => {
    const start = getSeconds(p.start);
    const end = getSeconds(p.end);
    return nowTotalSec >= start && nowTotalSec < end;
  });

  let isGapTime = false;
  if (!currentPeriod) {
    const nextP = SCHEDULE.find(p => getSeconds(p.start) > nowTotalSec);
    if (nextP) {
      isGapTime = true;
      currentPeriod = { label: "쉬는시간", start: "00:00", end: nextP.start, isStudy: false };
    }
  }

  const isStudyTime = currentPeriod?.isStudy ?? false;

  // 종소리 자동 재생 실행
  useEffect(() => {
    if (isMuted || !currentPeriod) return;
    if (lastPlayedRef.current !== currentPeriod.label) {
      const audioId = currentPeriod.isStudy ? "studyBell" : "breakBell";
      const audio = document.getElementById(audioId) as HTMLAudioElement;
      if (audio) {
        audio.play().catch(() => {});
      }
      lastPlayedRef.current = currentPeriod.label;
    }
  }, [currentPeriod?.label, isMuted]);

  // 게이지 계산 (에러 방지를 위해 0으로 나누기 및 유효성 검사 강화)
  const circumference = 2 * Math.PI * 180;
  let offset = circumference;
  if (currentPeriod) {
    const endSec = getSeconds(currentPeriod.end);
    const startSec = isGapTime ? nowTotalSec - 1 : getSeconds(currentPeriod.start);
    const total = endSec - startSec;
    const remaining = endSec - nowTotalSec;
    const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
    offset = circumference * (1 - ratio);
  }

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60' : 'bg-white',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    accent: isStudyTime ? '#3b82f6' : '#f59e0b',
    accentClass: isStudyTime ? 'text-blue-400' : 'text-amber-400',
  };

  return (
    <main className={`${theme.bg} ${theme.textMain} min-h-screen flex flex-col items-center p-4 py-8`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap');
        .timer-font { font-family: 'JetBrains+Mono', monospace; }
        .circle-progress { transform: rotate(-90deg) scaleY(-1); transform-origin: center; transition: stroke-dashoffset 1s linear; }
      `}} />

      {/* 상단바 */}
      <div className="w-full max-w-lg flex justify-between items-center mb-10">
        <Link href="/" className="px-4 py-2 bg-slate-800/50 rounded-xl text-xs font-bold border border-white/10">📊 학습내역</Link>
        <div className="flex gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center border border-white/10">{isDarkMode ? '🌝' : '🌞'}</button>
          <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center border border-white/10">{isMuted ? '🔇' : '🔊'}</button>
        </div>
      </div>

      <div className={`text-4xl font-black mb-6 ${theme.accentClass}`}>
        {currentPeriod ? currentPeriod.label : "자율학습"}
      </div>

      {/* 타이머 서클 */}
      <div className="relative flex items-center justify-center mb-10 scale-90 sm:scale-100">
        <svg width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="12" />
          <circle cx="200" cy="200" r="180" fill="none" stroke={theme.accent} strokeWidth="12" strokeLinecap="round" className="circle-progress"
            style={{ strokeDasharray: circumference, strokeDashoffset: isFinite(offset) ? offset : circumference }} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div className="timer-font text-8xl leading-none">
            {currentPeriod ? (() => {
              const diff = Math.max(0, getSeconds(currentPeriod.end) - nowTotalSec);
              return `${Math.floor(diff / 60)}:${(diff % 60).toString().padStart(2, '0')}`;
            })() : "--:--"}
          </div>
          <div className="text-lg font-bold mt-4 opacity-50">
            {now.toLocaleTimeString('ko-KR', { hour12: false })}
          </div>
        </div>
      </div>

      {/* 사운드 활성화 유도 */}
      {isMuted && (
        <button onClick={() => setIsMuted(false)} className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-full font-bold animate-bounce shadow-lg">
          🔊 종소리 마법 활성화 (클릭)
        </button>
      )}

      {/* 시간표 리스트 */}
      <div className={`w-full max-w-sm ${theme.card} rounded-[2rem] p-6 border border-white/5`}>
        <div className="space-y-4">
          {SCHEDULE.map((p, i) => {
            const isCurrent = currentPeriod?.label === p.label;
            const isPast = nowTotalSec >= getSeconds(p.end);
            return (
              <div key={i} className={`flex justify-between items-center ${isCurrent ? theme.accentClass + ' font-bold' : isPast ? 'opacity-20 line-through' : 'opacity-60'}`}>
                <span>{p.label}</span>
                <span className="font-mono">{p.start} - {p.end}</span>
              </div>
            );
          })}
        </div>
      </div>

      <audio id="studyBell" src="/study.mp3" preload="auto" />
      <audio id="breakBell" src="/break.mp3" preload="auto" />
    </main>
  );
}
