"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GLOVAL_STYLE } from '../constants'; // 아까 만든 창고에서 스타일 가져오기

export default function LobbyPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  // 로그인 안 한 사람 쫓아내기 & 이름 가져오기
  useEffect(() => {
    const auth = localStorage.getItem('hg_auth');
    if (!auth) {
      router.push('/'); // 로그인 안됐으면 로그인 페이지로
    } else {
      const { name } = JSON.parse(auth);
      setUserName(name);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('hg_auth');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      <style>{GLOVAL_STYLE}</style>

      {/* 배경 장식 (성 느낌 살리기) */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/hogwarts_hall.jpg')] bg-cover bg-center pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl">
        <header className="text-center mb-16">
          <p className="font-serif text-amber-500 text-xl mb-2">Welcome back,</p>
          <h1 className="text-5xl md:text-6xl font-serif text-amber-200 drop-shadow-[0_0_15px_rgba(252,211,77,0.5)]">
            {userName || "Student"}
          </h1>
        </header>

        {/* 3개의 문 (메뉴) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 문 1: 학습/점수판 */}
          <MenuCard 
            title="Great Hall" 
            icon="🏆" 
            desc="기숙사 점수판 & 용 키우기" 
            color="border-emerald-500/40"
            onClick={() => router.push('/study')} 
          />

          {/* 문 2: 타이머 */}
          <MenuCard 
            title="Clock Tower" 
            icon="⏳" 
            desc="교시제 집중 타이머" 
            color="border-blue-500/40"
            onClick={() => router.push('/timer')} 
          />

          {/* 문 3: 비밀의 방 */}
          <MenuCard 
            title="Secret Chamber" 
            icon="✉️" 
            desc="나를 향한 응원 메세지" 
            color="border-red-500/40"
            onClick={() => router.push('/secret')} 
          />
        </div>

        <footer className="mt-20 text-center">
          <button 
            onClick={handleLogout}
            className="text-slate-500 hover:text-amber-200 font-serif transition-colors underline underline-offset-4"
          >
            Leave the Castle (Logout)
          </button>
        </footer>
      </div>
    </div>
  );
}

function MenuCard({ title, icon, desc, color, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`group cursor-pointer p-10 bg-slate-900/60 backdrop-blur-md border-2 ${color} rounded-[2.5rem] hover:scale-105 hover:bg-slate-800/80 transition-all duration-300 flex flex-col items-center text-center gap-4 shadow-2xl`}
    >
      <span className="text-6xl mb-2 group-hover:animate-pulse">{icon}</span>
      <h2 className="text-2xl font-bold text-white font-serif tracking-widest">{title}</h2>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      <div className="mt-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity font-serif">Enter →</div>
    </div>
  );
}
