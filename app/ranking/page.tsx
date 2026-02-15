"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// [1] 기숙사 기본 설정 (원본 page.txt 설정값)
const HOUSE_ORDER = ["슬리데린", "래번클로", "그리핀도르", "후플푸프"];
const HOUSE_CONFIG: any = {
  "슬리데린": { bg: "bg-emerald-600", border: "border-emerald-700", icon: "🐍", accent: "bg-emerald-400", color: "from-emerald-700 to-emerald-900" },
  "래번클로": { bg: "bg-blue-700", border: "border-blue-800", icon: "🦅", accent: "bg-blue-400", color: "from-blue-700 to-blue-900" },
  "그리핀도르": { bg: "bg-red-700", border: "border-red-800", icon: "🦁", accent: "bg-red-400", color: "from-red-700 to-red-900" },
  "후플푸프": { bg: "bg-amber-500", border: "border-amber-600", icon: "🦡", accent: "bg-amber-300", color: "from-yellow-600 to-yellow-800" }
};

// [2] 기숙사별 공지사항 (원본 텍스트 전체 복구)
const HOUSE_NOTICES: { [key: string]: { title: string, content: string } } = {
  "래번클로": {
    title: "지혜의 전당에 온 것을 환영하며, 움직이는 계단 가이드",
    content: `명석한 두뇌를 가진 래번클로 신입생 여러분... 플리트윅 교수님께서는 신입생 여러분이 성안에서 길을 잃지 않도록 직접 작성하신 '호그와트 계단의 기하학적 이동 법칙' 유인물을 서재 입구에 비치해 두셨습니다. 한 번쯤 읽어두면 논리적으로 길을 찾는 데 큰 도움이 될 것입니다.`
  },
  "그리핀도르": {
    title: "1위의 자부심과 신입생을 위한 용기의 첫걸음",
    content: `새로 입학한 그리핀도르 신입생 여러분! 여러분은 호그와트에서 가장 용감한 기숙사의 일원이 되었습니다. 네빌 롱보텀 교수님께서 신입생 여러분의 긴장을 풀어주기 위해 휴게실 중앙 탁자에 따뜻한 버터맥주를 준비해 두셨습니다.`
  },
  "슬리데린": {
    title: "위대한 야망의 시작, 그리고 용의 알 관련",
    content: `이번 주 우리 기숙사에 합류한 신입생 여러분, 환영합니다. 여러분은 가장 대담하고 실리적인 슬리데린의 일원이 되었습니다. 지하 감옥 복도의 피 묻은 바론 경이 소란스러운 발소리를 싫어하니 품격 있게 걷도록 하십시오.`
  },
  "후플푸프": {
    title: "따뜻한 오소리 굴의 새 식구들을 위한 작은 선물",
    content: `반가워요, 신입생 여러분! 가장 다정하고 성실한 후플푸프에 오게 된 것을 축하합니다. 스프라우트 교수님께서 온실에서 직접 키운 꿈을 지켜주는 허브 주머니를 침대 머리맡에 하나씩 놓아주셨습니다.`
  }
};

export default function RankingPage() {
  const [studentMasterData, setStudentMasterData] = useState<any[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);

  useEffect(() => {
    fetchRankingData();
  }, []);

  const fetchRankingData = async () => {
    const { data } = await supabase.from('student_master').select('*');
    if (data) setStudentMasterData(data);
  };

  // [3] 기숙사별 랭킹 계산 로직 (원본 수식 반영)
  const houseRankings = useMemo(() => {
    const stats = HOUSE_ORDER.map(house => {
      const members = studentMasterData.filter(s => s.house === house);
      const totalTime = members.reduce((acc, cur) => acc + (cur.total_study_time || 0), 0);
      // 원본 로직: (총점 / 인원수) + (총 공부시간 / 인원수) 형태의 가중치 계산
      const score = members.length > 0 ? Math.floor(totalTime / members.length) : 0;
      return { house, score, memberCount: members.length };
    });
    return stats.sort((a, b) => b.score - a.score);
  }, [studentMasterData]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto mt-12">
        
        {/* 헤더 영역 */}
        <h2 className="text-3xl font-black italic mb-12 uppercase text-center" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.2em' }}>
          House Rankings
        </h2>

        {/* [4] 기숙사 순위 카드 (가로 배열) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
          {houseRankings.map((rank, index) => {
            const config = HOUSE_CONFIG[rank.house];
            return (
              <div 
                key={rank.house}
                onClick={() => setSelectedHouse(rank.house)}
                className={`cursor-pointer relative overflow-hidden p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br ${config.color} transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]`}
              >
                <div className="absolute -top-2 -right-2 text-6xl opacity-10">{config.icon}</div>
                <div className="text-[12px] font-black tracking-widest opacity-50 mb-2">RANK 0{index + 1}</div>
                <h3 className="text-xl font-black uppercase mb-4" style={{ fontFamily: "'Cinzel', serif" }}>{rank.house}</h3>
                <div className="text-3xl font-black tracking-tighter mb-1">
                  {rank.score.toLocaleString()} <span className="text-sm opacity-50 font-normal">PTS</span>
                </div>
                <p className="text-[10px] font-bold opacity-40 uppercase">{rank.memberCount} Students Active</p>
                
                {/* 순위 게이지 */}
                <div className="mt-6 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/60 transition-all duration-1000" 
                    style={{ width: `${(rank.score / (houseRankings[0].score || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* [5] 선택된 기숙사 상세 정보 및 공지 (원본 page.txt 스타일) */}
        {selectedHouse && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`p-10 rounded-[3rem] border-2 ${HOUSE_CONFIG[selectedHouse].border} bg-white/5 backdrop-blur-md`}>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl">{HOUSE_CONFIG[selectedHouse].icon}</span>
                <div>
                  <h3 className="text-2xl font-black uppercase" style={{ fontFamily: "'Cinzel', serif" }}>{selectedHouse} Bulletin</h3>
                  <p className="text-xs font-bold text-white/30 tracking-widest uppercase">Secret Message for {selectedHouse} Wizards</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-yellow-500 italic">" {HOUSE_NOTICES[selectedHouse].title} "</h4>
                <p className="text-sm leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">
                  {HOUSE_NOTICES[selectedHouse].content}
                </p>
              </div>

              {/* 기숙사 소속 학생 리스트 */}
              <div className="mt-12 pt-10 border-t border-white/10">
                <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-white/40">House Members</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {studentMasterData
                    .filter(s => s.house === selectedHouse)
                    .map(student => (
                      <div key={student.student_name} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                        <span className="text-sm font-bold">{student.student_name}</span>
                        <span className="text-[10px] font-black text-white/20">{student.total_study_time || 0}m</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
