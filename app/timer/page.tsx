"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// 1. 시간표 데이터
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
  // 상태 관리
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // 재생 관리용 (중복 재생 방지)
  const lastPlayedRef = useRef<string>("");

  // 마운트 및 인터벌 설정
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

  // 초기 로딩 가드
  if (!mounted || !now) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-white font-bold animate-pulse text-sm">호그와트 마법 시계 불러오는 중...</div>
      </div>
    );
  }

  const nowTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // --- [로직 업데이트] 현재 교시 혹은 쉬는시간 판별 ---
  let currentPeriod = SCHEDULE.find(p => {
    const start = getSeconds(p.start);
    const end = getSeconds(p.end);
    return nowTotalSec >= start && nowTotalSec < end;
  });

  // SCHEDULE에 정의되지 않은 "공백 시간" 처리
  let isGapTime = false;
  if (!currentPeriod) {
    const nextP = SCHEDULE.find(p => getSeconds(p.start) > nowTotalSec);
    if (nextP) {
      isGapTime = true;
      currentPeriod = {
        label: "쉬는시간",
        start: "00:00", // 실제 계산은 아래 diff에서 처리
        end: nextP.start,
        isStudy: false
      };
    }
  }

  const isStudyTime = currentPeriod?.isStudy ?? false;
  const labelText = currentPeriod ? currentPeriod.label : "자율학습";

  // --- [로직 업데이트] 종소리 자동 재생 실행부 ---
  useEffect(() => {
    if (isMuted || !currentPeriod) return;

    // 교시(label)가 바뀌었을 때만 재생
    if (lastPlayedRef.current !== currentPeriod.label) {
      const audioId = currentPeriod.isStudy ? "studyBell" : "breakBell";
      const audio = document.getElementById(audioId) as HTMLAudioElement;
      
      if (audio) {
        audio.muted = false; // 브라우저 정책 대응
        audio.play().catch((err) => console.log("자동재생 대기:", err));
      }
      lastPlayedRef.current = currentPeriod.label;
    }
  }, [currentPeriod?.label, isMuted]);

  // UI 테마 설정
  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60' : 'bg-white',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    accent: isStudyTime ? (isDarkMode ? '#3b82f6' : '#2563eb') : (isDarkMode ? '#f59e0b' : '#d97706'),
    accentClass: isStudyTime ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-amber-400' : 'text-amber-600'),
  };

  // 게이지 계산
  const circumference = 2 * Math.PI * 180;
  let offset = circumference;
  if (currentPeriod) {
    const start = isGapTime ? nowTotalSec : getSeconds(currentPeriod.start); 
    const end = getSeconds(currentPeriod.end);
    const total = end - (isGapTime ? nowTotalSec - 1 : start); // 공백일 땐 현재부터 끝까지
    const remaining = end - nowTotalSec;
    const ratio = Math.max(0, remaining / (total || 1));
    offset = circumference * (1 - ratio);
  }

  return (
    <main className={`${theme.bg} ${theme.textMain} min-h-screen flex flex-col items-center p-4 py-8 transition-colors duration-500`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap');
        .timer-font { font-family: 'JetBrains+Mono', monospace; }
        .circle-progress { transform: rotate(-90deg) scaleY(-1); transform-origin: center; transition: stroke-dashoffset 1s linear; }
      `}} />

      {/* 상단바 */}
      <div className="w-full max-w-lg flex justify-between items-center mb-10 z-10">
        <Link href="/" className="px-4 py-2 bg-slate-800/50 rounded-xl text-xs font-bold border border-white/10 hover:bg-slate-700 transition-all">📊 학습내역</Link>
        <div className="flex gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 bg-slate-800/50 rounded-xl border border-white/10 flex items-center justify-center text-lg">{isDarkMode ? '🌝' : '🌞'}</button>
          <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 bg-slate-800/50 rounded-xl border border-white/10 flex items-center justify-center text-lg">{isMuted ? '🔇' : '🔊'}</button>
        </div>
      </div>

      {/* 교시 표시 */}
      <div className={`text-4xl font-black mb-6 ${theme.accentClass} drop-shadow-sm`}>
        {labelText}
      </div>

      {/* 메인 타이머 */}
      <div className="relative flex items-center justify-center mb-10 scale-90 sm:scale-100">
        <svg width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="12" />
          <circle cx="200" cy="200" r="180" fill="none" stroke={theme.accent} strokeWidth="12" strokeLinecap="round" className="circle-progress"
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div className="timer-font text-8xl leading-none">
            {currentPeriod ? (() => {
              const diff = getSeconds(currentPeriod.end) - nowTotalSec;
              const mins = Math.floor(diff / 60);
              const secs = diff % 60;
              return `${mins}:${secs.toString().padStart(2, '0')}`;
            })() : "--:--"}
          </div>
          <div className="text-lg font-bold mt-4 opacity-50 tracking-widest">
            {now.toLocaleTimeString('ko-KR', { hour12: false })}
          </div>
        </div>
      </div>

      {/* 사운드 활성화 알림 (모바일 권한 획득용) */}
      {isMuted && (
        <button 
          onClick={() => setIsMuted(false)}
          className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-full font-bold text-sm animate-bounce shadow-lg flex items-center gap-2"
        >
          <span>🔊</span> 종소리 마법 활성화하기
        </button>
      )}

      {/* 시간표 카드 */}
      <div className={`w-full max-w-sm ${theme.card} rounded-[2.5rem] p-8 border border-white/5 shadow-2xl transition-all`}>
        <div className="space-y-4">
          {SCHEDULE.map((p, i) => {
            const isCurrent = currentPeriod?.label === p.label;
            const isPast = nowTotalSec >= getSeconds(p.end);
            return (
              <div key={i} className={`flex justify-between items-center transition-all ${isCurrent ? theme.accentClass + ' scale-105 origin-left' : isPast ? 'opacity-20 line-through' : 'opacity-60'}`}>
                <span className="text-base font-bold">{p.label}</span>
                <span className="text-sm font-mono tracking-tighter">{p.start} - {p.end}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 오디오 소스 (preload 필수) */}
      <audio id="studyBell" src="/study.mp3" preload="auto" />
      <audio id="breakBell" src="/break.mp3" preload="auto" />
      <audio id="endBell" src="/end.mp3" preload="auto" />
    </main>
  );
}
