import React, { useState, useMemo } from 'react';

// [1] 기숙사 기본 설정
const HOUSE_ORDER = ["슬리데린", "래번클로", "그리핀도르", "후플푸프"];
const HOUSE_CONFIG: any = {
  "슬리데린": { bg: "bg-emerald-600", border: "border-emerald-700", icon: "🐍", accent: "bg-emerald-400" },
  "래번클로": { bg: "bg-blue-700", border: "border-blue-800", icon: "🦅", accent: "bg-blue-400" },
  "그리핀도르": { bg: "bg-red-700", border: "border-red-800", icon: "🦁", accent: "bg-red-400" },
  "후플푸프": { bg: "bg-amber-500", border: "border-amber-600", icon: "🦡", accent: "bg-amber-300" }
};

// [2] 기숙사 공지사항
const HOUSE_NOTICES: { [key: string]: { title: string, content: string } } = {
  "래번클로": {
    title: "지혜의 전당에 온 것을 환영하며, 움직이는 계단 가이드",
    content: `명석한 두뇌를 가진 래번클로 신입생 여러분, 여러분의 합류로 우리 기숙사의 지적 수준이 한층 더 높아졌음을 확신합니다.
플리트윅 교수님께서는 신입생 여러분이 성안에서 길을 잃지 않도록 직접 작성하신 '호그와트 계단의 기하학적 이동 법칙' 유인물을 서재 입구에 비치해 두셨습니다.

참고로, 이번 주 <이러쿵저러쿵> 잡지에는 '용의 알을 품을 때 들려주면 좋은 고대 마법의 자장가'에 대한 기사가 실렸습니다. 해그리드 씨의 업무에 방해가 되지 않는 선에서 이론적으로 용의 부화를 연구해보고 싶은 학생들은 참고해 보세요. 

독수리 문고리가 던지는 질문에 당황하지 말고, 답을 모를 때는 언제든 옆의 선배에게 지혜를 구하세요!`
  },
  "그리핀도르": {
    title: "1위의 자부심과 신입생을 위한 용기의 첫걸음",
    content: `새로 입학한 그리핀도르 신입생 여러분! 여러분은 호그와트에서 가장 용감한 기숙사의 일원이 되었습니다. 지난주 우리가 거둔 우승 성적은 선배들이 수업 시간마다 보여준 당당한 자신감의 결과입니다. 

네빌 롱보텀 교수님께서 신입생 여러분의 긴장을 풀어주기 위해 휴게실 중앙 탁자에 따뜻한 버터맥주와 초콜릿 개구리를 넉넉히 준비해 두셨습니다.

덧붙여 주의사항입니다. 우리 기숙사의 뚱보 여인 초상화가 최근 '신입생 맞이 아리아' 연습에 심취해 있습니다. 노래가 끝나기 전엔 암호를 들어주지 않으니 주의하십시오... 또한 해그리드 씨의 오두막 근처로 몰래 빠져나가려다 필치 씨에게 적발될 경우, 기숙사 점수가 크게 깎일 수 있습니다!`
  },
  "슬리데린": {
    title: "위대한 야망의 시작, 그리고 용의 알 관련",
    content: `이번 주 우리 기숙사에 합류한 신입생 여러분, 환영합니다. 여러분은 호그와트에서 가장 대담하고 실리적인 이들이 모인 슬리데린의 일원이 되었습니다.

지금 온 성안이 사냥터지기 오두막에 있는 용의 알 이야기로 떠들썩합니다. 다른 기숙사 학생들이 얄팍한 호기심에 들떠 있을 때, 우리 슬리데린은 그 이면에 숨겨진 강력한 마법적 가치와 힘에 주목해야 합니다. 

또한 최근 지하 감옥 복도의 피 묻은 바론 경이 신입생들의 소란스러운 발소리를 매우 싫어하고 있습니다. 복도에서는 품격 있게 걷도록 하십시오. 2월 둘째 주 새로운 암호는 '차가운 지혜'입니다. 외부인에게 절대 누설하지 마십시오.`
  },
  "후플푸프": {
    title: "따뜻한 오소리 굴의 새 식구들을 위한 작은 선물",
    content: `반가워요, 신입생 여러분! 호그와트에서 가장 다정하고 성실한 후플푸프에 오게 된 것을 진심으로 축하합니다. 여러분이 낯선 생활에 잘 적응할 수 있도록 모든 선배와 반장들이 여러분의 든든한 동료가가 되어줄 거예요.

스프라우트 교수님께서는 여러분의 입학을 축하하며 온실에서 직접 키운 허브 주머니를 침대 머리맡에 하나씩 놓아주셨습니다. 

주의할 점은, 신입생 환영 만찬 준비로 주방 요정들이 매우 바쁜 상태입니다. 배 그림을 간지럽히는 것은 잠시 미뤄두고, 대신 휴게실에 비치된 과일과 비스킷을 마음껏 즐겨주세요. 우리 모두 힘을 합쳐 이번 주에는 1위를 되찾아 봅시다!`
  }
};

interface HouseCupProps {
  records: any[];
  studentData: any;
  DAYS: string[];
}

const HouseCup = ({ records, studentData, DAYS }: HouseCupProps) => {
  const [selectedHouseNotice, setSelectedHouseNotice] = useState<string | null>(null);

  const houseRankings = useMemo(() => {
    return HOUSE_ORDER.map(house => {
      const students = Object.keys(studentData).filter(n => studentData[n].house === house);
      let tScore = 0, tH = 0;
      students.forEach(name => {
        DAYS.forEach(day => {
          const r = records.find(rec => rec.student_name === name && rec.day_of_week === day);
          if (r) {
            tScore += (r.score || 0);
            tH += Math.floor((r.study_time || 0) / 60);
          }
        });
      });
      const avg = students.length > 0 ? (tScore / students.length) + Math.floor(tH / students.length) : 0;
      return { house, finalPoint: avg };
    }).sort((a, b) => b.finalPoint - a.finalPoint);
  }, [records, studentData, DAYS]);

  return (
    <div className="mt-10 px-4 max-w-6xl mx-auto pb-20">
      <style>{`
        .winner-sparkle { 
          position: relative; 
          overflow: hidden; 
          animation: winner-glow 2s infinite alternate; 
          box-shadow: 0 0 25px rgba(250, 204, 21, 0.5) !important;
        }
        @keyframes winner-glow {
          from { transform: scale(1.05); }
          to { transform: scale(1.07); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(74, 55, 40, 0.2); border-radius: 10px; }
      `}</style>

      <h2 className="text-3xl font-black italic mb-10 uppercase tracking-[0.2em] text-slate-800 text-center font-serif">
        The House Cup
      </h2>

      {/* 기숙사 카드 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {houseRankings.map((rank, idx) => {
          const conf = HOUSE_CONFIG[rank.house];
          const isWinner = idx === 0;
          return (
            <div 
              key={rank.house}
              onClick={() => setSelectedHouseNotice(rank.house)}
              className={`cursor-pointer transition-all duration-300 transform hover:-translate-y-2 rounded-3xl p-6 border-b-8 ${conf.bg} ${conf.border} text-white shadow-2xl relative overflow-hidden ${isWinner ? 'winner-sparkle z-10 ring-4 ring-yellow-400' : 'hover:brightness-110'}`}
            >
              <div className="absolute right-[-10px] bottom-[-10px] text-8xl opacity-10 pointer-events-none">{conf.icon}</div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-4xl">{conf.icon}</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {isWinner ? "🏆 Winner" : `Rank #${idx + 1}`}
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-1">{rank.house}</h3>
                <p className="text-4xl font-black tracking-tighter">
                  {(Math.round(rank.finalPoint * 10) / 10).toLocaleString()}
                  <span className="text-sm ml-1 opacity-70 font-medium">pts</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 양피지 스타일 팝업 */}
      {selectedHouseNotice && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" 
          onClick={() => setSelectedHouseNotice(null)}
        >
          <div 
            className="relative bg-[#f4e4bc] p-8 md:p-12 w-full max-w-2xl rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]" 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.04) 100%)' }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }}></div>
            <button onClick={() => setSelectedHouseNotice(null)} className="absolute top-4 right-4 text-slate-800 hover:rotate-90 transition-all p-2 text-2xl z-20">✕</button>
            <div className="relative z-10 flex flex-col overflow-hidden">
              <div className="w-20 h-1 bg-[#4a3728]/20 mx-auto mb-6"></div>
              <h3 className="text-xl md:text-2xl font-black text-[#4a3728] mb-6 text-center italic border-b-2 border-[#4a3728]/10 pb-6 px-4 leading-tight font-serif">
                {HOUSE_NOTICES[selectedHouseNotice].title}
              </h3>
              <div className="overflow-y-auto pr-4 custom-scrollbar">
                <div className="text-base md:text-lg leading-relaxed text-[#5d4037] whitespace-pre-wrap font-serif font-medium">
                  {HOUSE_NOTICES[selectedHouseNotice].content}
                </div>
                <div className="mt-12 mb-4 text-right italic font-bold text-[#4a3728]/50 font-serif">
                  — Hogwarts School of Witchcraft and Wizardry —
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseCup;
