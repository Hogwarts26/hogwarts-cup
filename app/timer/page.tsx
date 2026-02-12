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
  // 1. 상태 관리
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 2. 마운트 효과 (모바일 예외 방지 핵심)
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. 헬퍼 함수
  const getSeconds = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  // ⚠️ 중요: mounted가 false이거나 now가 null이면 로딩 화면만 보여줌 (에러 차단)
  if (!mounted || !now) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-white font-bold animate-pulse text-sm">호그와트 마법 시계 불러오는 중...</div>
      </div>
    );
  }

  // 4. 시간 계산 (안전한 시점)
  const nowTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const currentPeriod = SCHEDULE.find(p => {
    const start = getSeconds(p.start);
    const end = getSeconds(p.end);
    return nowTotalSec >= start && nowTotalSec < end;
  });
  const isStudyTime = currentPeriod?.isStudy ?? false;

  // 5. 종소리 재생 로직
  const playSound = (id: string) => {
    if (isMuted) return;
    const audio = document.getElementById(id) as HTMLAudioElement;
    if (audio) {
      audio.muted = false; // iOS 대응
      audio.play().catch(() => {});
    }
  };

  // 6. UI 테마 설정
  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60' : 'bg-white',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    accent: isStudyTime ? (isDarkMode ? '#3b82f6' : '#2563eb') : (isDarkMode ? '#f59e0b' : '#d97706'),
    accentClass: isStudyTime ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-amber-400' : 'text-amber-600'),
  };

  // 7. 게이지 계산
  const circumference = 2 * Math.PI * 180;
  let offset = circumference;
  if (currentPeriod) {
    const start = getSeconds(currentPeriod.start);
    const end = getSeconds(currentPeriod.end);
    const ratio = Math.max(0, (end - nowTotalSec) / (end - start));
    offset = circumference * (1 - ratio);
  }

  return (
    <main className={`${theme.bg} ${theme.textMain} min-h-screen flex flex-col items-center p-4 py-8`}>
      {/* 폰트 및 애니메이션 스타일 직접 주입 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap');
        .timer-font { font-family: 'JetBrains+Mono', monospace; }
        .circle-progress { transform: rotate(-90deg) scaleY(-1); transform-origin: center; transition: stroke-dashoffset 1s linear; }
      `}} />

      {/* 상단바 */}
      <div className="w-full max-w-lg flex justify-between items-center mb-10 z-10">
        <Link href="/" className="px-4 py-2 bg-slate-800/50 rounded-xl text-xs font-bold border border-white/10">📊 학습내역</Link>
        <div className="flex gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 bg-slate-800/50 rounded-xl border border-white/10">{isDarkMode ? '🌝' : '🌞'}</button>
          <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 bg-slate-800/50 rounded-xl border border-white/10">{isMuted ? '🔇' : '🔊'}</button>
        </div>
      </div>

      {/* 교시 표시 */}
      <div className={`text-4xl font-black mb-6 ${theme.accentClass}`}>
        {currentPeriod ? currentPeriod.label : "자율학습"}
      </div>

      {/* 메인 타이머 (모바일 대응 scale-75) */}
      <div className="relative flex items-center justify-center mb-10 scale-75 sm:scale-100">
        <svg width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="12" />
          <circle cx="200" cy="200" r="180" fill="none" stroke={theme.accent} strokeWidth="12" strokeLinecap="round" className="circle-progress"
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div className="timer-font text-8xl leading-none">
            {currentPeriod ? (() => {
              const diff = getSeconds(currentPeriod.end) - nowTotalSec;
              return `${Math.floor(diff / 60)}:${(diff % 60).toString().padStart(2, '0')}`;
            })() : "--:--"}
          </div>
          <div className="text-lg font-bold mt-4 opacity-50 tracking-widest">
            {`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`}
          </div>
        </div>
      </div>

      {/* 시간표 카드 */}
      <div className={`w-full max-w-sm ${theme.card} rounded-[2rem] p-6 border border-white/5 shadow-2xl`}>
        <div className="space-y-4">
          {SCHEDULE.map((p, i) => {
            const isCurrent = currentPeriod?.label === p.label;
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

      <audio id="studyBell" src="/study.mp3" />
      <audio id="breakBell" src="/break.mp3" />
      <audio id="endBell" src="/end.mp3" />
    </main>
  );
}
