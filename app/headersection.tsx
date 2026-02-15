import React from 'react';
import Link from 'next/link';

interface GlobalHeaderProps {
  isAdmin: boolean;
  isPlaying: boolean;
  toggleMusic: () => void;
  setShowSummary?: (show: boolean) => void;
  resetWeeklyData?: () => void;
  resetMonthlyOff?: () => void;
}

const GlobalHeader = ({ 
  isAdmin, isPlaying, toggleMusic, setShowSummary, resetWeeklyData, resetMonthlyOff 
}: GlobalHeaderProps) => {
  return (
    <div className="max-w-[1100px] mx-auto px-4 py-4">
      <div className="flex gap-2 flex-wrap justify-end items-center">
        {/* 음악 버튼 */}
        <button 
          onClick={toggleMusic} 
          className={`text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm transition-all border-2 ${
            isPlaying ? 'bg-white border-yellow-400 text-yellow-500 animate-pulse' : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          {isPlaying ? '🎵' : '🔇'}
        </button>

        {!isAdmin && (
          <Link href="/timer" className="text-[10px] font-black text-white bg-blue-500 px-3 py-1.5 rounded-full shadow-md hover:bg-blue-600 transition-all flex items-center gap-1">
            교시제
          </Link>
        )}

        {/* 관리자 전용 버튼들 */}
        {isAdmin && (
          <>
            <button onClick={() => setShowSummary?.(true)} className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-indigo-700">요약</button>
            <button onClick={resetWeeklyData} className="text-[10px] font-black text-white bg-red-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-red-700">주간 리셋</button>
            <button onClick={resetMonthlyOff} className="text-[10px] font-black text-white bg-orange-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-orange-700">월휴 리셋</button>
          </>
        )}
        
        {/* 공통 로그아웃 */}
        <button 
          onClick={() => { localStorage.removeItem('hg_auth'); window.location.reload(); }} 
          className="text-[10px] font-black text-slate-400 bg-white border-2 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default GlobalHeader;
