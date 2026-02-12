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
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeconds = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  if (!mounted || !now) {
    return <div className="min-h-screen bg-[#020617]" />;
  }

  const nowTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  let currentPeriod = SCHEDULE.find(p => {
    const s = getSeconds(p.start);
    const e = getSeconds(p.end);
    return nowTotalSec >= s && nowTotalSec < e;
  });

  let isGapTime = false;
  let isAllOver = false;

  if (!currentPeriod) {
    const nextP = SCHEDULE.find(p => getSeconds(p.start) > nowTotalSec);
    if (nextP) {
      isGapTime = true;
      currentPeriod = { label: "쉬는시간", start: "", end: nextP.start, isStudy: false };
    } else {
      isAllOver = true;
    }
  }

  const isStudyTime = currentPeriod?.isStudy ?? false;

  // [수정] 파일명과 ID를 study.mp3 기준으로 변경
  useEffect(() => {
    if (isMuted) return;

    if (isAllOver) {
      if (lastPlayedRef.current !== "END") {
        const audio = document.getElementById("end") as HTMLAudioElement;
        if (audio) audio.play().catch(() => {});
        lastPlayedRef.current = "END";
      }
      return;
    }

    if (currentPeriod && lastPlayedRef.current !== currentPeriod.label) {
      let audioId = "";
      if (currentPeriod.label === "쉬는시간" || currentPeriod.isStudy === false) {
        audioId = "break"; 
      } else if (currentPeriod.isStudy) {
        audioId = "study"; // study.mp3를 재생할 ID
      }

      const audio = document.getElementById(audioId) as HTMLAudioElement;
      if (audio) audio.play().catch(() => {});
      lastPlayedRef.current = currentPeriod.label;
    }
  }, [currentPeriod?.label, isMuted, isAllOver]);

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
    accent: isAllOver ? '#94a3b8' : (isStudyTime ? '#3b82f6' : '#f59e0b'),
    accentClass: isAllOver ? 'text-slate-400' : (isStudyTime ? 'text-blue-400' : 'text-amber-400'),
  };

  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return (
    <main className={`${theme.bg} ${theme.textMain} min-h-screen flex flex-col items-center p-4 py-8`}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap" rel="stylesheet" />

      <div className="w-full max-w-lg flex justify-between items-center mb-10 z-10">
        <Link href="/" className="px-4 py-2 bg-slate-800/50 rounded-xl text-xs font-bold border border-white/10">📊 학습내역</Link>
        <div className="flex gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 bg-slate-800/50 rounded-xl border border-white/10 flex items-center justify-center">{isDarkMode ? '🌝' : '🌞'}</button>
          <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 bg-slate-800/50 rounded-xl border border-white/10 flex items-center justify-center">{isMuted ? '🔇' : '🔊'}</button>
        </div>
      </div>

      <div className={`text-4xl font-black mb-6 ${theme.accentClass}`}>
        {isAllOver ? "일과 종료" : (currentPeriod ? currentPeriod.label : "자율학습")}
      </div>

      <div className="relative flex items-center justify-center mb-10 scale-90 sm:scale-100">
        <svg width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="12" />
          <circle 
            cx="200" cy="200" r="180" fill="none" stroke={theme.accent} strokeWidth="12" strokeLinecap="round" 
            style={{ 
              transform: 'rotate(-90deg) scaleY(-1)', 
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 1s linear',
              strokeDasharray: circumference, 
              strokeDashoffset: isAllOver ? 0 : offset 
            }} 
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div className="text-8xl leading-none font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {!isAllOver && currentPeriod ? (() => {
              const diff = Math.max(0, getSeconds(currentPeriod.end) - nowTotalSec);
              return `${Math.floor(diff / 60)}:${(diff % 60).toString().padStart(2, '0')}`;
            })() : "DONE"}
          </div>
          <div className="text-lg font-bold mt-4 opacity-50 tracking-widest font-mono">
            {timeString}
          </div>
        </div>
      </div>

      {isMuted && (
        <button onClick={() => setIsMuted(false)} className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg animate-pulse">
          🔊 종소리 마법 활성화
        </button>
      )}

      <div className={`w-full max-w-sm ${theme.card} rounded-[2rem] p-6 border border-white/5 shadow-2xl`}>
        <div className="space-y-4">
          {SCHEDULE.map((p, i) => {
            const isCurrent = !isAllOver && currentPeriod?.label === p.label;
            const isPast = nowTotalSec >= getSeconds(p.end);
            return (
              <div key={i} className={`flex justify-between items-center ${isCurrent ? theme.accentClass + ' font-bold' : isPast ? 'opacity-20 line-through' : 'opacity-60'}`}>
                <span className="text-base">{p.label}</span>
                <span className="text-sm font-mono">{p.start} - {p.end}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* [최종] ID와 파일명 매칭 완료 */}
      <audio id="study" src="/study.mp3" preload="auto" />
      <audio id="break" src="/break.mp3" preload="auto" />
      <audio id="end" src="/end.mp3" preload="auto" />
    </main>
  );
}
