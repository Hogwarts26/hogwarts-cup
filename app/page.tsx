"use client";
import React, { useState } from 'react';

// 1. 모아둔 파일들 불러오기
import Login from './login';
import Study from './study';
import Game from './game';
import Dragon from './dragon';
import HeaderSection from './headersection';

export default function HogwartsPage() {
  // [상태 1] 로그인 여부
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // [상태 2] 현재 화면 (lobby, study, game, dragon)
  const [view, setView] = useState('lobby');

  // 로그인 안 된 경우 로그인 컴포넌트만 띄움
  // (로그인 성공 시 setIsLoggedIn(true)를 호출하도록 설정되어 있어야 함)
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* 2. 공통 헤더 (모든 화면 상단에 고정) */}
      {/* setView를 전달하여 헤더에서도 메뉴 이동이 가능하게 할 수 있습니다 */}
      <HeaderSection setView={setView} currentView={view} />

      <main className="max-w-[1100px] mx-auto py-6 px-4">
        {/* 3. 로비(GIF 메뉴) 화면 */}
        {view === 'lobby' && (
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center min-h-[70vh]">
            {/* 스터디 */}
            <div onClick={() => setView('study')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/study.gif" alt="Study" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg">STUDY ROOM</p>
            </div>

            {/* 기숙사컵 */}
            <div onClick={() => setView('game')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/game.gif" alt="Game" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg">HOUSE CUP</p>
            </div>

            {/* 드래곤 */}
            <div onClick={() => setView('dragon')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/dragoncave.gif" alt="Dragon" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg">DRAGON CAVE</p>
            </div>
          </div>
        )}

        {/* 4. 각 기능 페이지 렌더링 */}
        {view === 'study' && <Study />}
        {view === 'game' && <Game />}
        {view === 'dragon' && <Dragon />}
      </main>
    </div>
  );
}
