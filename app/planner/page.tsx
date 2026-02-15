"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function PlannerPage() {
  const [selectedName, setSelectedName] = useState("");
  const [plannerData, setPlannerData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // 1. 시간 슬롯 생성: 06:00 ~ 익일 01:00 (30분 단위)
  const timeSlots = [];
  for (let h = 6; h < 24; h++) {
    const hour = String(h).padStart(2, '0');
    timeSlots.push(`${hour}:00`, `${hour}:30`);
  }
  // 00:00 ~ 01:00 (익일)
  timeSlots.push("00:00", "00:30", "01:00");

  useEffect(() => {
    const saved = localStorage.getItem('selectedName') || "";
    setSelectedName(saved);
    if (saved) fetchPlannerData(saved);
  }, []);

  // 2. 오늘 날짜의 플래너 데이터 가져오기
  const fetchPlannerData = async (name: string) => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const { data, error } = await supabase
      .from('daily_planner')
      .select('content_json')
      .eq('student_name', name)
      .eq('plan_date', today)
      .single();

    if (data && data.content_json) {
      setPlannerData(data.content_json);
    }
    setLoading(false);
  };

  // 3. 입력 시 실시간 DB 저장 (Upsert)
  const saveEntry = async (time: string, text: string) => {
    // 로컬 상태 먼저 업데이트
    const updatedData = { ...plannerData, [time]: text };
    setPlannerData(updatedData);

    const today = new Date().toLocaleDateString('en-CA');
    
    const { error } = await supabase
      .from('daily_planner')
      .upsert({
        student_name: selectedName,
        plan_date: today,
        content_json: updatedData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_name, plan_date' });

    if (error) console.error("플래너 저장 실패:", error);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <div className="text-white font-serif animate-pulse uppercase tracking-[0.3em]">Opening Your Scroll...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* 헤더 부분 */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <Link href="/" className="text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-widest">
              ← Back to Lobby
            </Link>
            <h1 className="text-3xl font-black italic mt-2 uppercase" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.1em' }}>
              Daily Study Planner
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-tighter">Wizard: {selectedName}</p>
            <p className="text-[10px] font-medium text-white/20 uppercase">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
          </div>
        </div>

        {/* 플래너 본문 */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
          <div className="grid grid-cols-1 divide-y divide-white/5">
            {timeSlots.map((time) => (
              <div key={time} className="flex items-center group hover:bg-white/[0.02] transition-colors">
                {/* 시간 라벨 */}
                <div className={`w-20 md:w-24 py-4 px-6 text-[11px] font-black border-r border-white/5 text-center
                  ${time.endsWith(':00') ? 'text-white/60' : 'text-white/20'}`}>
                  {time}
                </div>
                
                {/* 입력창 */}
                <div className="flex-1">
                  <input 
                    type="text"
                    defaultValue={plannerData[time] || ""}
                    onBlur={(e) => saveEntry(time, e.target.value)}
                    placeholder="무엇을 학습했나요?"
                    className="w-full bg-transparent px-6 py-4 text-sm font-medium text-white/80 placeholder:text-white/5 outline-none focus:bg-white/[0.05] transition-all"
                  />
                </div>

                {/* 상태 인디케이터 */}
                <div className="px-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 팁 */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            입력 후 창을 벗어나면 마법처럼 자동 저장됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
