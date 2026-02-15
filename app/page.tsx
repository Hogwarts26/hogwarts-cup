"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; // Supabase 불러오기 확인!

// 1. 컴포넌트들
import Login from './login';
import Study from './study';
import Game from './game';
import Dragon from './dragon';
import HeaderSection from './headersection';

export default function HogwartsPage() {
  // [상태 관리]
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('lobby');
  const [selectedName, setSelectedName] = useState(""); // 로그인한 학생 이름
  const [studentMasterData, setStudentMasterData] = useState<any>({}); // 드래곤용 마스터 데이터

  // [데이터 불러오기] 드래곤 성장에 필요한 마스터 데이터를 가져옵니다.
  const fetchMasterData = async () => {
    const { data, error } = await supabase.from('student_master').select('*');
    if (data) {
      // 배열을 객체 형태로 변환하여 저장
      const formatted = data.reduce((acc: any, cur: any) => {
        acc[cur.student_name] = cur;
        return acc;
      }, {});
      setStudentMasterData(formatted);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchMasterData();
  }, [isLoggedIn]);

  // 로그인 성공 시 처리
  const handleLoginSuccess = (name: string) => {
    setSelectedName(name);
    setIsLoggedIn(true);
  };

  // 로그인 안 된 경우
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* 2. 공통 헤더 */}
      <HeaderSection setView={setView} currentView={view} />

      <main className="max-w-[1100px] mx-auto py-6 px-4">
        {/* 3. 로비(GIF 메뉴) */}
        {view === 'lobby' && (
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center min-h-[70vh]">
            <div onClick={() => setView('study')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/study.gif" alt="Study" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg uppercase">Study Room</p>
            </div>

            <div onClick={() => setView('game')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/game.gif" alt="Game" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg uppercase">House Cup</p>
            </div>

            <div onClick={() => setView('dragon')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/dragoncave.gif" alt="Dragon" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg uppercase">Dragon Cave</p>
            </div>
          </div>
        )}

        {/* 4. 각 페이지 렌더링 (데이터 전달 필수!) */}
        {view === 'study' && <Study />}
        {view === 'game' && <Game />}
        {view === 'dragon' && (
          <Dragon 
            studentMasterData={studentMasterData}
            selectedName={selectedName}
            setStudentMasterData={setStudentMasterData}
            supabase={supabase}
            currentUser={{ name: selectedName }}
          />
        )}
      </main>
    </div>
  );
}
