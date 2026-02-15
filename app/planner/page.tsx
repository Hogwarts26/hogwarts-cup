"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function PlannerPage() {
  const [selectedName, setSelectedName] = useState("");
  const [plannerData, setPlannerData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  
  // 🌓 모드 상태 (기본값: dark)
  const [isDarkMode, setIsDarkMode] = useState(true);

  const timeSlots = [];
  for (let h = 6; h < 24; h++) {
    const hour = String(h).padStart(2, '0');
    timeSlots.push(`${hour}:00`, `${hour}:30`);
  }
  timeSlots.push("00:00", "00:30", "01:00");

  const getPlannerDate = () => {
    const now = new Date();
    if (now.getHours() < 4) {
      now.setDate(now.getDate() - 1);
    }
    return now.toLocaleDateString('en-CA');
  };

  useEffect(() => {
    // 테마 설정 불러오기
    const savedTheme = localStorage.getItem('planner_theme');
    if (savedTheme === 'light') setIsDarkMode(false);

    const authData = localStorage.getItem('hg_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.name) {
          setSelectedName(parsed.name);
          fetchPlannerData(parsed.name);
          return;
        }
      } catch (e) {
        console.error("인증 데이터 파싱 에러:", e);
      }
    }
    setLoading(false);
  }, []);

  const fetchPlannerData = async (name: string) => {
    try {
      const planDate = getPlannerDate(); 
      const { data } = await supabase
        .from('daily_planner')
        .select('content_json')
        .eq('student_name', name)
        .eq('plan_date', planDate)
        .maybeSingle();

      if (data && data.content_json) {
        setPlannerData(data.content_json);
      }
    } catch (err) {
      console.error("플래너 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (time: string, text: string) => {
    const updatedData = { ...plannerData, [time]: text };
    setPlannerData(updatedData);
    if (!selectedName) return;
    const planDate = getPlannerDate();
    await supabase.from('daily_planner').upsert({
      student_name: selectedName,
      plan_date: planDate,
      content_json: updatedData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_name,plan_date' });
  };

  // 🌓 테마 토글 함수
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('planner_theme', newMode ? 'dark' : 'light');
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-[#f4f1ea]'}`}>
      <div className={`${isDarkMode ? 'text-white' : 'text-slate-800'} font-serif animate-pulse uppercase tracking-[0.3em]`}>
        Opening Your Scroll...
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${
      isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-[#f8f6f0] text-slate-900'
    }`}>
      <div className="max-w-3xl mx-auto">
        
        {/* 헤더 및 테마 토글 */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <Link href="/" className={`text-[10px] font-black transition-colors uppercase tracking-widest ${
              isDarkMode ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-slate-900'
            }`}>
              ← Back to Lobby
            </Link>
            <h1 className="text-3xl font-black italic mt-2 uppercase" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.1em' }}>
              Daily Study Planner
            </h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            {/* 테마 전환 버튼 */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all shadow-sm border ${
                isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-white border-slate-200 text-indigo-600'
              }`}
            >
              {isDarkMode ? '🌝' : '🌞'}
            </button>
            <div className="text-right">
              <p className={`text-[11px] font-bold uppercase tracking-tighter ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Wizard: {selectedName || "Unknown"}
              </p>
              <p className="text-[10px] font-medium opacity-40 uppercase">
                {new Date(getPlannerDate()).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </p>
            </div>
          </div>
        </div>

        {/* 플래너 본문 - 양피지 스타일 적용 */}
        <div className={`border transition-all duration-500 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl ${
          isDarkMode 
            ? 'bg-white/5 border-white/10 shadow-black' 
            : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          <div className={`grid grid-cols-1 divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
            {timeSlots.map((time) => (
              <div key={time} className={`flex items-center group transition-colors ${
                isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
              }`}>
                {/* 시간 라벨 */}
                <div className={`w-20 md:w-24 py-4 px-6 text-[11px] font-black border-r text-center ${
                  isDarkMode 
                    ? `border-white/5 ${time.endsWith(':00') ? 'text-white/60' : 'text-white/20'}` 
                    : `border-slate-100 ${time.endsWith(':00') ? 'text-slate-500' : 'text-slate-300'}`
                }`}>
                  {time}
                </div>
                
                {/* 입력창 */}
                <div className="flex-1">
                  <input 
                    type="text"
                    defaultValue={plannerData[time] || ""}
                    onBlur={(e) => saveEntry(time, e.target.value)}
                    placeholder="무엇을 학습했나요?"
                    className={`w-full bg-transparent px-6 py-4 text-sm font-medium outline-none transition-all ${
                      isDarkMode 
                        ? 'text-white/80 placeholder:text-white/5 focus:bg-white/[0.05]' 
                        : 'text-slate-700 placeholder:text-slate-200 focus:bg-slate-50/50'
                    }`}
                  />
                </div>

                {/* 상태 인디케이터 */}
                <div className="px-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isDarkMode 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                      : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            새벽 4시에 학습내역이 초기화됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
