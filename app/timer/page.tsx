"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
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

  // 1. 초기화 및 테스트 시간 설정
  useEffect(() => {
    setMounted(true);
    
    // 🕒 테스트용 시간: 2교시 종료(10:40:00) 5초 전으로 설정
    const testTime = new Date();
    testTime.setHours(10, 39, 55); 
    setNow(testTime);

    const interval = setInterval(() => {
      setNow(prev => prev ? new Date(prev.getTime() + 1000) : new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 2. 음소거 시 즉시 모든 소리 정지
  useEffect(() => {
    if (isMuted) {
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }, [isMuted]);

  const getSeconds = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  const timerData = useMemo(() => {
    if (!now) return null;
    const nowTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    
    let current = SCHEDULE.find(p => {
      const s = getSeconds(p.start);
      const e = getSeconds(p.end);
      return nowTotalSec >= s && nowTotalSec < e;
    });

    let isGap = false;
    let isAllDone = false;
    let gapStart = 0;

    if (!current) {
      const nextIdx = SCHEDULE.findIndex(p => getSeconds(p.start) > nowTotalSec);
      if (nextIdx !== -1) {
        isGap = true;
        const nextP = SCHEDULE[nextIdx];
        gapStart = nextIdx > 0 ? getSeconds(SCHEDULE[nextIdx - 1].end) : 0;
        current = { label: "쉬는시간", start: "", end: nextP.start, isStudy: false };
      } else {
        isAllDone = true;
      }
    }

    return { current, isGap, isAllDone, nowTotalSec, gapStart };
  }, [now]);

  // 3. 종소리 재생 로직
  useEffect(() => {
    if (!mounted || !timerData) return;
    const { current, isAllDone } = timerData;
    const currentLabel = isAllDone ? "DONE" : (current?.label || "");

    // 첫 진입 시 소리 방지
    if (lastPlayedRef.current === "") {
      lastPlayedRef.current = currentLabel;
      return;
    }

    // 상태 변화가 없거나 음소거면 무시
    if (lastPlayedRef.current === currentLabel || isMuted) return;

    const playAudio = (id: string) => {
      const audio = document.getElementById(id) as HTMLAudioElement;
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.4; // 40% 볼륨
        audio.play().catch(err => console.error("재생 에러:", err));
      }
    };

    if (isAllDone) {
      playAudio("end");
    } else if (current) {
      const isStudyStart = current.isStudy === true && current.label !== "쉬는시간";
      playAudio(isStudyStart ? "study" : "break");
    }

    lastPlayedRef.current = currentLabel;
  }, [timerData, isMuted, mounted]);

  if (!mounted || !now || !timerData) return <div className="min-h-screen bg-[#020617]" />;

  const { current, isGap, isAllDone, nowTotalSec, gapStart } = timerData;
  const circumference = 2 * Math.PI * 180;
  let offset = circumference;

  if (current) {
    const endSec = getSeconds(current.end);
    const startSec = isGap ? gapStart : getSeconds(current.start);
    const total = endSec - startSec;
    const remaining = Math.max(0, endSec - nowTotalSec);
    const ratio = total > 0 ? Math.min(1, remaining / total) : 0;
    offset = circumference * (1 - ratio);
  }

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60' : 'bg-white shadow-xl',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm',
    accent: isAllDone ? '#94a3b8' : (current?.isStudy ? '#3b82f6' : '#f59e0b'),
    accentClass: isAllDone ? 'text-slate-400' : (current?.isStudy ? 'text-blue-500' : 'text-amber-500'),
  };

  return (
    <main className={`${theme.bg} ${theme.textMain} min-h-screen flex flex-col items-center p-4 py-8 transition-colors duration-500`}>
      <div className="w-full max-w-lg flex justify-between items-center mb-10 z-10">
        <Link href="/" className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${theme.btn}`}>학습내역</Link>
        <div className="flex gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg transition-all ${theme.btn}`}>
            {isDarkMode ? '🌝' : '🌞'}
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg transition-all ${theme.btn}`}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className={`text-4xl font-black mb-6 ${theme.accentClass} tracking-tight`}>
        {isAllDone ? "일과 종료" : (current ? current.label : "자율학습")}
      </div>

      <div className="relative flex items-center justify-center mb-8 scale-90 sm:scale-100">
        <svg width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="12" />
          <circle cx="200" cy="200" r="180" fill="none" stroke={theme.accent} strokeWidth="12" strokeLinecap="round" 
            style={{ 
              transform: 'rotate(-90deg) scaleY(-1)', transformOrigin: 'center',
              transition: 'stroke-dashoffset 1s linear', strokeDasharray: circumference, strokeDashoffset: isAllDone ? 0 : offset 
            }} 
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div className="text-8xl leading-none font-black tracking-tighter" style={{ fontVariantNumeric: "tabular-nums" }}>
            {!isAllDone && current ? (() => {
              const diff = Math.max(0, getSeconds(current.end) - nowTotalSec);
              return `${Math.floor(diff / 60)}:${(diff % 60).toString().padStart(2, '0')}`;
            })() : "DONE"}
          </div>
          <div className="text-lg font-bold mt-4 opacity-50 tracking-widest" style={{ fontVariantNumeric: "tabular-nums" }}>
            {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}:{now.getSeconds().toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {isMuted && (
        <button onClick={() => setIsMuted(false)} className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg animate-pulse">
          🔊 종소리 마법 활성화
        </button>
      )}

      {/* 오디오 파일들 */}
      <audio id="study" src="/study.mp3" preload="auto" />
      <audio id="break" src="/break.mp3" preload="auto" />
      <audio id="end" src="/end.mp3" preload="auto" />
    </main>
  );
}
