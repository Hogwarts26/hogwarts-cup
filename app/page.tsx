"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; // supabase 설정 파일 불러오기

// 1. 조립할 컴포넌트들 불러오기
import Login from './login';
import Study from './study';
import Game from './game';
import Dragon from './dragon';
import HeaderSection from './headersection';

export default function HogwartsPage() {
  // [상태 관리]
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('lobby'); // lobby, study, game, dragon
  const [selectedName, setSelectedName] = useState(""); // 로그인한 학생 이름
  const [studentMasterData, setStudentMasterData] = useState<any>({}); // 드래곤/전체 데이터용

  // [데이터 불러오기] 드래곤 성장에 필요한 마스터 데이터를 가져옵니다.
  const fetchMasterData = async () => {
    try {
      const { data, error } = await supabase.from('student_master').select('*');
      if (data) {
        // 배열을 { "이름": {데이터} } 형태의 객체로 변환
        const formatted = data.reduce((acc: any, cur: any) => {
          acc[cur.student_name] = cur;
          return acc;
        }, {});
        setStudentMasterData(formatted);
      }
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
    }
  };

  // 로그인 상태가 되면 데이터를 한 번 불러옵니다.
  useEffect(() => {
    if (isLoggedIn) {
      fetchMasterData();
    }
  }, [isLoggedIn]);

  // 로그인 성공 시 실행될 함수
  const handleLoginSuccess = (name: string) => {
    setSelectedName(name);
    setIsLoggedIn(true);
  };

  // 2. 로그인 전 화면 (Props 에러 해결 버전)
  if (!isLoggedIn) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        supabase={supabase} 
        globalStyle={{}} // Login 컴포넌트가 요구하는 필수 속성
      />
    );
  }

  // 3. 로그인 후 메인 화면
  return (
    <div className="min-h-screen bg-stone-100">
      {/* 모든 페이지 상단에 공통으로 보이는 헤더 */}
      <HeaderSection setView={setView} currentView={view} />

      <main className="max-w-[1100px] mx-auto py-6 px-4">
        
        {/* [A] 로비 화면: GIF 메뉴판 */}
        {view === 'lobby' && (
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center min-h-[70vh]">
            {/* 스터디 룸 이동 */}
            <div onClick={() => setView('study')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/study.gif" alt="Study" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg uppercase tracking-widest">Study Room</p>
            </div>

            {/* 기숙사 컵 이동 */}
            <div onClick={() => setView('game')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/game.gif" alt="Game" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg uppercase tracking-widest">House Cup</p>
            </div>

            {/* 드래곤 동굴 이동 */}
            <div onClick={() => setView('dragon')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/dragoncave.gif" alt="Dragon" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg uppercase tracking-widest">Dragon Cave</p>
            </div>
          </div>
        )}

        {/* [B] 각 기능 페이지 (상태값에 따라 하나만 렌더링) */}
        
        {/* 학습 페이지 */}
        {view === 'study' && <Study />}
        
        {/* 기숙사컵(게임) 페이지 */}
        {view === 'game' && <Game />}
        
        {/* 드래곤 키우기 페이지 (필요한 모든 데이터 전달) */}
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
