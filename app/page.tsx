"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; 

import Login from './login';
import Study from './study';
import Game from './game'; // HouseCup 컴포넌트
import Dragon from './dragon';
import HeaderSection from './headersection';

export default function HogwartsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('lobby'); 
  const [selectedName, setSelectedName] = useState(""); 
  const [studentMasterData, setStudentMasterData] = useState<any>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // [추가] 기숙사 컵 계산을 위한 상태
  const [studyRecords, setStudyRecords] = useState<any[]>([]);
  const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

  const toggleMusic = () => setIsPlaying(!isPlaying);

  // 마스터 데이터 + 공부 기록 로딩
  const fetchData = async () => {
    try {
      // 1. 학생 마스터 데이터 가져오기
      const { data: masterData } = await supabase.from('student_master').select('*');
      if (masterData) {
        const formatted = masterData.reduce((acc: any, cur: any) => {
          acc[cur.student_name] = cur;
          return acc;
        }, {});
        setStudentMasterData(formatted);
      }

      // 2. 기숙사 점수 계산을 위한 공부 기록(records) 가져오기
      const { data: recordsData } = await supabase.from('study_records').select('*');
      if (recordsData) {
        setStudyRecords(recordsData);
      }
    } catch (err) { console.error("데이터 로딩 실패:", err); }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const handleLoginSuccess = (name: string) => {
    setSelectedName(name);
    setIsAdmin(name === "관리자");
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} supabase={supabase} globalStyle="" />;
  }

  return (
    <div className="min-h-screen bg-stone-100 font-serif">
      <HeaderSection isAdmin={isAdmin} isPlaying={isPlaying} toggleMusic={toggleMusic} />

      <main className="max-w-[1100px] mx-auto py-6 px-4">
        {view === 'lobby' && (
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center min-h-[70vh]">
            <div onClick={() => setView('study')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/study.gif" alt="Study" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg uppercase tracking-widest">Study Room</p>
            </div>

            <div onClick={() => setView('game')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/game.gif" alt="Game" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg uppercase tracking-widest">House Cup</p>
            </div>

            <div onClick={() => setView('dragon')} className="cursor-pointer group text-center">
              <div className="overflow-hidden rounded-2xl shadow-xl border-4 border-white group-hover:border-yellow-500 transition-all">
                <img src="/dragoncave.gif" alt="Dragon" className="w-64 h-64 object-cover transition-transform group-hover:scale-110" />
              </div>
              <p className="mt-4 font-black text-slate-800 text-lg uppercase tracking-widest">Dragon Cave</p>
            </div>
          </div>
        )}

        {view !== 'lobby' && (
          <button 
            onClick={() => setView('lobby')}
            className="mb-8 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-all shadow-lg flex items-center gap-2"
          >
            🏰 MAIN LOBBY
          </button>
        )}

        {/* [페이지 전환] */}
        {view === 'study' && <Study />}
        
        {/* 기숙사컵(게임) - 수파베이스 데이터 연결 */}
        {view === 'game' && (
          <Game 
            records={studyRecords} 
            studentData={studentMasterData} 
            DAYS={DAYS} 
          />
        )}
        
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
