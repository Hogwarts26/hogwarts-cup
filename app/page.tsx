"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; 

// 컴포넌트 불러오기
import Login from './login';
import Study from './study';
import Game from './game';
import Dragon from './dragon';
import HeaderSection from './headersection';

export default function HogwartsPage() {
  // [상태 관리]
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('lobby'); 
  const [selectedName, setSelectedName] = useState(""); 
  const [studentMasterData, setStudentMasterData] = useState<any>({});
  
  // [헤더용 상태 관리] 필수 속성들 추가
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 음악 토글 함수
  const toggleMusic = () => setIsPlaying(!isPlaying);

  // 마스터 데이터 로딩
  const fetchMasterData = async () => {
    try {
      const { data } = await supabase.from('student_master').select('*');
      if (data) {
        const formatted = data.reduce((acc: any, cur: any) => {
          acc[cur.student_name] = cur;
          return acc;
        }, {});
        setStudentMasterData(formatted);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (isLoggedIn) fetchMasterData();
  }, [isLoggedIn]);

  // 로그인 성공 시 (관리자 여부도 판단)
  const handleLoginSuccess = (name: string) => {
    setSelectedName(name);
    setIsAdmin(name === "관리자"); // 이름이 '관리자'일 경우 관리자 권한 부여 (수정 가능)
    setIsLoggedIn(true);
  };

  // 로그인 화면
  if (!isLoggedIn) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        supabase={supabase} 
        globalStyle="" 
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* 2. 헤더 섹션 (에러 원인 해결: 모든 필수 Props 전달) */}
      <HeaderSection 
        isAdmin={isAdmin} 
        isPlaying={isPlaying} 
        toggleMusic={toggleMusic}
        // 홈 버튼 기능이 헤더에 없으니, 로비로 돌아가고 싶다면 
        // 나중에 헤더 버튼에 setView 연결이 필요할 수 있습니다.
      />

      <main className="max-w-[1100px] mx-auto py-6 px-4">
        
        {/* [A] 로비 화면 (GIF 메뉴) */}
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

        {/* 로비로 돌아가는 버튼 (현재 헤더에 홈 버튼이 없으므로 추가) */}
        {view !== 'lobby' && (
          <button 
            onClick={() => setView('lobby')}
            className="mb-8 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-all shadow-lg"
          >
            🏰 MAIN LOBBY
          </button>
        )}

        {/* [B] 페이지 전환 */}
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
