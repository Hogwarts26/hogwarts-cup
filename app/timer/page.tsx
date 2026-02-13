"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

const SCHEDULES = {
  '100': [
    { label: "1교시", start: "07:00", end: "08:40", isStudy: true },
    { label: "2교시", start: "09:00", end: "10:40", isStudy: true },
    { label: "3교시", start: "11:00", end: "12:40", isStudy: true },
    { label: "점심시간", start: "12:40", end: "14:00", isStudy: false },
    { label: "4교시", start: "14:00", end: "15:40", isStudy: true },
    { label: "5교시", start: "16:00", end: "17:40", isStudy: true },
    { label: "저녁시간", start: "17:40", end: "19:00", isStudy: false },
    { label: "6교시", start: "19:00", end: "20:40", isStudy: true },
    { label: "7교시", start: "20:50", end: "22:30", isStudy: true }
  ],
  '80': [
    { label: "1교시", start: "08:00", end: "09:20", isStudy: true },
    { label: "2교시", start: "09:30", end: "10:50", isStudy: true },
    { label: "3교시", start: "11:00", end: "12:20", isStudy: true },
    { label: "점심시간", start: "12:20", end: "13:40", isStudy: false },
    { label: "4교시", start: "13:40", end: "15:00", isStudy: true },
    { label: "5교시", start: "15:10", end: "16:30", isStudy: true },
    { label: "6교시", start: "16:40", end: "18:00", isStudy: true },
    { label: "저녁시간", start: "18:00", end: "19:20", isStudy: false },
    { label: "7교시", start: "19:20", end: "20:40", isStudy: true },
    { label: "8교시", start: "20:50", end: "22:10", isStudy: true }
  ]
};

export default function TimerPage() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [scheduleMode, setScheduleMode] = useState<'100' | '80' | '50'>('100');
  
  const lastPlayedRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const unlockAudio = () => {
    ["study", "break", "end"].forEach(id => {
      const audio = document.getElementById(id) as HTMLAudioElement;
      if (audio) {
        audio.muted = true; 
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false; 
        }).catch(() => { audio.muted = false; });
      }
    });
    setIsMuted(false);
  };

  useEffect(() => {
    if (isMuted) {
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(audio => { audio.pause(); audio.currentTime = 0; });
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

    if (scheduleMode === '50') {
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const isStudyTime = currentMin < 50;
      const current = isStudyTime 
        ? { label: `${currentHour}교시 Study`, start: `${currentHour.toString().padStart(2, '0')}:00`, end: `${currentHour.toString().padStart(2, '0')}:50`, isStudy: true }
        : { label: `${currentHour}교시 Break`, start: `${currentHour.toString().padStart(2, '0')}:50`, end: `${(currentHour + 1).toString().padStart(2, '0')}:00`, isStudy: false };
      return { current, isGap: false, isAllDone: false, nowTotalSec, gapStart: getSeconds(current.start), lastScheduleEndSec: 0 };
    }

    const activeList = SCHEDULES[scheduleMode as '100' | '80'];
    const firstStartSec = getSeconds(activeList[0].start);
    const lastEndSec = getSeconds(activeList[activeList.length - 1].end);

    // [중요 수정] 첫 교시 시작 전이면 무조건 자율학습 상태(FREE)로 반환
    if (nowTotalSec < firstStartSec) {
      return { current: null, isGap: false, isAllDone: true, nowTotalSec, gapStart: 0, lastScheduleEndSec: lastEndSec, isBeforeStart: true };
    }

    let current = activeList.find(p => {
      const s = getSeconds(p.start);
      const e = getSeconds(p.end);
      return nowTotalSec >= s && nowTotalSec < e;
    });

    let isGap = false;
    let isAllDone = false;
    let gapStart = 0;

    if (!current) {
      const nextIdx = activeList.findIndex(p => getSeconds(p.start) > nowTotalSec);
      if (nextIdx !== -1) {
        isGap = true;
        gapStart = nextIdx > 0 ? getSeconds(activeList[nextIdx - 1].end) : 0;
        current = { label: "Break", start: "", end: activeList[nextIdx].start, isStudy: false };
      } else {
        isAllDone = true;
      }
    }
    return { current, isGap, isAllDone, nowTotalSec, gapStart, lastScheduleEndSec: lastEndSec, isBeforeStart: false };
  }, [now, scheduleMode]);

  useEffect(() => {
    if (!mounted || !timerData || !now) return;
    const { current, isAllDone, isBeforeStart } = (timerData as any);
    
    // 첫 교시 전이면 소리 재생 상태 체크 안 함
    if (isBeforeStart) {
      lastPlayedRef.current = "BEFORE_START";
      return;
    }

    const currentState = isAllDone ? "DONE" : `${current?.label}_${current?.isStudy ? "STUDY" : "BREAK"}`;

    if (lastPlayedRef.current === "" || lastPlayedRef.current === currentState || isMuted) {
      lastPlayedRef.current = currentState;
      return; 
    }

    const playAudio = (id: string) => {
      const audio = document.getElementById(id) as HTMLAudioElement;
      if (audio) {
        audio.volume = 0.4;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    if (isAllDone) playAudio("end");
    else if (current?.isStudy) playAudio("study");
    else playAudio("break");

    lastPlayedRef.current = currentState;
  }, [timerData, isMuted, mounted, now]);

  if (!mounted || !now || !timerData) return <div className="min-h-screen bg-[#020617]" />;

  const { current, isGap, isAllDone, nowTotalSec, gapStart, lastScheduleEndSec, isBeforeStart } = (timerData as any);

  const displayLabel = (() => {
    if (scheduleMode === '50') return current?.label || "자율학습";
    if (isBeforeStart) return "자율학습"; // 8시 전(80분모드)이면 자율학습
    if (isAllDone) {
      return (nowTotalSec - lastScheduleEndSec < 300) ? "수고하셨습니다.🪄✨" : "자율학습";
    }
    return current ? current.label : "자율학습";
  })();

  const circumference = 2 * Math.PI * 180;
  let offset = circumference;
  if (current && !isBeforeStart) {
    const endSec = getSeconds(current.end);
    const startSec = isGap ? gapStart : getSeconds(current.start);
    const total = endSec - startSec;
    const remaining = Math.max(0, endSec - nowTotalSec);
    offset = circumference * (1 - (total > 0 ? Math.min(1, remaining / total) : 0));
  }

  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60' : 'bg-white shadow-xl',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    btn: isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm',
    accent: (isAllDone || isBeforeStart) ? '#3b82f6' : (current?.isStudy ? '#3b82f6' : '#f59e0b'),
    accentClass: (isAllDone || isBeforeStart) ? 'text-blue-500' : (current?.isStudy ? 'text-blue-500' : 'text-amber-500'),
  };

  return (
    <main className={`${theme.bg} ${theme.textMain} min-h-screen flex flex-col items-center p-4 py-8 transition-colors duration-500`} style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
      <div className="w-full max-w-lg flex flex-col gap-4 mb-10 z-10">
        <div className="flex justify-between items-center">
          <Link href="/" className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${theme.btn}`}>학습내역</Link>
          <div className="flex gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${theme.btn}`}>{isDarkMode ? '🌝' : '🌞'}</button>
            <button onClick={() => isMuted ? unlockAudio() : setIsMuted(true)} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${theme.btn}`}>{isMuted ? '🔇' : '🔊'}</button>
          </div>
        </div>
        <div className={`flex p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-200/50 border-slate-300'}`}>
          {(['100', '80', '50'] as const).map((m) => (
            <button key={m} onClick={() => { setScheduleMode(m); lastPlayedRef.current = ""; }} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${scheduleMode === m ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
              {m === '100' ? '100/20' : m === '80' ? '80/10' : '50/10'}
            </button>
          ))}
        </div>
      </div>

      <div className={`text-4xl font-black mb-6 ${theme.accentClass}`}>{displayLabel}</div>

      <div className="relative flex items-center justify-center mb-8 scale-90 sm:scale-100">
        <svg width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="12" />
          <circle cx="200" cy="200" r="180" fill="none" stroke={theme.accent} strokeWidth="12" strokeLinecap="round" style={{ transform: 'rotate(-90deg) scaleY(-1)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s linear', strokeDasharray: circumference, strokeDashoffset: (isAllDone || isBeforeStart) ? 0 : offset }} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div className="text-8xl leading-none font-black tracking-tighter" style={{ fontVariantNumeric: "tabular-nums" }}>
            {(!isAllDone && !isBeforeStart && current) ? (() => {
              const diff = Math.max(0, getSeconds(current.end) - nowTotalSec);
              return `${Math.floor(diff / 60)}:${(diff % 60).toString().padStart(2, '0')}`;
            })() : "FREE"}
          </div>
          <div className="text-lg font-bold mt-4 opacity-50">{now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}:{now.getSeconds().toString().padStart(2, '0')}</div>
        </div>
      </div>

      {isMuted && (
        <button onClick={unlockAudio} className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg animate-pulse">
          🔊 종소리 마법 활성화
        </button>
      )}

      <div className={`w-full max-w-[320px] ${theme.card} rounded-[2rem] p-6 border border-white/5 transition-all overflow-y-auto max-h-[350px]`}>
        <div className="flex flex-col items-center space-y-3">
          {scheduleMode === '50' ? (
            <div className="text-center opacity-60 font-bold py-4">정각부터 50분 공부, <br/> 10분 휴식이 반복됩니다.</div>
          ) : (
            SCHEDULES[scheduleMode as '100' | '80'].map((p, i) => {
              const isItemCurrent = !isAllDone && !isBeforeStart && current?.label === p.label;
              const isItemPast = nowTotalSec >= getSeconds(p.end);
              return (
                <div key={i} className={`flex items-center justify-center w-full gap-4 ${isItemCurrent ? theme.accentClass + ' font-bold' : isItemPast ? 'opacity-20 line-through' : 'opacity-60'}`}>
                  <span className="text-base font-bold min-w-[70px] text-right">{p.label}</span>
                  <span className="text-sm font-medium min-w-[100px] text-left">{p.start} - {p.end}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <audio id="study" src="/study.mp3" preload="auto" />
      <audio id="break" src="/break.mp3" preload="auto" />
      <audio id="end" src="/end.mp3" preload="auto" />
    </main>
  );
}
