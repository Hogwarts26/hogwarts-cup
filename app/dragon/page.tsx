"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export default function DragonPage() {
  const [selectedName, setSelectedName] = useState("");
  const [studentMasterData, setStudentMasterData] = useState<any>({});
  const [currentImageFile, setCurrentImageFile] = useState("main.webp");
  const [isFading, setIsFading] = useState(false);
  const [selectedEgg, setSelectedEgg] = useState<string | null>(null);
  const [tempEgg, setTempEgg] = useState<string | null>(null);
  const [eggStep, setEggStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempName, setTempName] = useState("");
  const [dragonName, setDragonName] = useState("이름 없는 용");

  useEffect(() => {
    const saved = localStorage.getItem('selectedName') || "";
    setSelectedName(saved);
    if (saved) fetchStudentData(saved);
  }, []);

  const fetchStudentData = async (name: string) => {
    const { data } = await supabase.from('student_master').select('*');
    if (data) {
      const dataMap = data.reduce((acc: any, cur: any) => {
        acc[cur.student_name] = cur;
        return acc;
      }, {});
      setStudentMasterData(dataMap);
      if (dataMap[name]) {
        setDragonName(dataMap[name].dragon_name || "이름 없는 용");
        setSelectedEgg(dataMap[name].selected_egg || null);
      }
    }
  };

  const handleRegionClick = (region: string) => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentImageFile(`${region}.webp`);
      setIsFading(false);
    }, 300);
  };

  const handleResetImage = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentImageFile("main.webp");
      setIsFading(false);
    }, 300);
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    const { error } = await supabase
      .from('student_master')
      .update({ dragon_name: tempName })
      .eq('student_name', selectedName);

    if (!error) {
      setDragonName(tempName);
      setIsModalOpen(false);
      fetchStudentData(selectedName);
    }
  };

  // ------------------------------------------
  // 데이터 계산 로직 (원본 파일 참조)
  // ------------------------------------------
  const userData = studentMasterData[selectedName];
  const score = userData?.total_study_time || 0;
  let eggStr = selectedEgg || userData?.selected_egg;

  if (eggStr && typeof eggStr === 'string' && eggStr.includes('/')) {
    eggStr = eggStr.split('/').pop()?.split('.')[0] || eggStr;
  }

  const prefix = eggStr ? String(eggStr).substring(0, 2) : "";
  const eggNumOnly = eggStr ? String(eggStr).substring(2) : "";

  let stage = 1;
  if (score >= 18000) stage = 4;
  else if (score >= 12000) stage = 3;
  else if (score >= 6000) stage = 2;

  let progress = 0;
  if (score < 6000) progress = (score / 6000) * 100;
  else if (score < 12000) progress = ((score - 6000) / 6000) * 100;
  else if (score < 18000) progress = ((score - 12000) / 6000) * 100;
  else progress = 100;

  const fileName = `${prefix}${String(eggNumOnly).repeat(stage)}`;
  const baseUrl = "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public";
  const finalUrl = `${baseUrl}/${fileName}.webp`;

  // [26] 원본 메시지 배열 (전체 복구)
  const messages: any = {
    1: ['…….', '…….', '…….', '…….', '…….', '…….', '…….', '…….', '…….', '알이 조금 움직인 것 같다...', '알 껍데기 너머로 아주 작은 고동소리가 들린다.', '따스한 온기가 느껴지는 알이다.', '알 표면에 미세한 금이 간 것 같기도...?', '알 주변의 공기가 기분 좋게 따스하다.', '알 속에 아주 강력한 마력이 응축되어 있는 것이 느껴진다.', '알이 당신의 목소리에 반응해 미세하게 떨린다.', '알을 가만히 안아보니 마음이 평온해지는 기분이다.', '알이 꿈을 꾸고 있는것 같다.', '당신이 집중할 때마다 알의 광채가 더 선명해진다.', '이름을 불러주니 알이 조금 움직였다!'],
    2: ['…….', '…….', '…….', '…….', '…….', '…….', '…….', '…….', '…….', '…….', '배가 고픈지 손가락을 깨문다!', '주변을 호기심 어린 눈으로 본다.', '작은 불꽃을 내뿜으려 노력 중이다.', '공부하는 당신의 옆에 찰싹 붙어 졸고 있다.', '머리를 긁어주자 고양이처럼 골골대는 것 같다...', '당신이 펜을 움직일 때마다 고개가 좌우로 바쁘게 움직인다.', '당신이 자리를 비우려 하자 옷자락을 물고 놓아주지 않는다.', '서툰 울음소리로 당신의 이름을 부르려 노력한다.', '아기용이 당신의 펜을 죄다 물어뜯어놓았다...', '공부하는 당신 곁에서 낮잠을 자고 있다.', '당신을 부모라고 생각하는 것 같다.'],
    3: ['…….', '…….', '…….', '…….', '…….', '…….', '…….', '…….', '…….', '날갯짓이 제법 힘차졌다.', '처음으로 날개를 펴고 당신의 머리 위를 짧게 활공했다!', '이제는 제법 드래곤다운 울음소리를 낸다.', '공부하는 당신의 어깨 너머로 책 내용을 같이 읽는 듯하다.', '날개를 파닥거리며 주변의 먼지를 다 날려버리고는 뿌듯해한다.', '자신의 발톱을 유심히 살피고 있다.', '당신이 펜을 놓으면 얼른 다시 공부하라는 듯 코를 킁킁거린다.', '꽤 높이 날아올라 천장에 닿을뻔한 기록을 세웠다!', '이제는 간단한 명령을 알아듣는다.', '공부하는 당신을 지켜보고 있다.'],
    4: ['…….', '…….', '…….', '…….', '…….', '…….', '…….', '…….', '…….', '이제는 당신을 등에 태우고 구름 위를 날 수 있을 만큼 자랐다.', '비늘 사이로 뿜어져 나오는 마력이 당신을 더욱 지혜롭게 한다.', '누구도 당신을 방해하지 못하도록 문 앞을 엄숙하게 지키고 있다.', '보고 있으면 모든 잡념이 정화되는 기분이다.', '당신을 태우고 하늘을 날고 싶어한다.', '강력한 마력의 기운이 뿜어져 나오고 있다.', '영원히 당신의 곁을 지킬 것이다.', '당신의 행복을 영원히 바라고 있다.', '피곤한 당신을 위해 당신에게 마력을 불어넣어 주고 있다.', '언제나 당신을 응원하고 있다.']
  };

  const randomMsg = useMemo(() => {
    const win = typeof window !== 'undefined' ? (window as any) : {};
    const storageKey = `dragon_msg_idx`;
    const stageMsgs = messages[stage] || messages[1];
    if (win[storageKey] === undefined) {
      win[storageKey] = Math.floor(Math.random() * stageMsgs.length);
    }
    return stageMsgs[win[storageKey]] || stageMsgs[0];
  }, [stage]);

  const positionClass = stage === 4 ? "translate-y-10 md:translate-y-16" : "translate-y-16 md:translate-y-24";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <style>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>

      {/* [26] 드래곤 키우기 영역 */}
      <div className="mt-16 px-4 pb-24 text-left max-w-6xl mx-auto">
        <hr className="border-slate-200 mb-10" />

        <h2 className="text-2xl font-black italic mb-8 uppercase" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', color: '#1b1e21', transform: 'skewX(-5deg)' }}>
          Dragon Cave
        </h2>

        {/* 지역명 버튼 영역 */}
        <div className="grid grid-cols-3 gap-2 mb-8 max-w-sm">
          {['volcano', 'jungle', 'forest', 'desert', 'coast', 'alpine'].map((region) => {
            const hasEgg = !!(selectedEgg || studentMasterData[selectedName]?.selected_egg);
            return (
              <button
                key={region}
                onClick={() => {
                  if (hasEgg) { alert("이미 데려온 알이 있습니다."); return; }
                  handleRegionClick(region);
                }}
                className={`py-2 text-[11px] font-black tracking-tighter transition-all rounded-md border uppercase
                  ${currentImageFile === `${region}.webp` 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : hasEgg ? 'bg-slate-50 text-slate-200 border-slate-50 cursor-not-allowed'
                    : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                {region}
              </button>
            );
          })}
        </div>

        {/* 리셋 버튼 & 이미지 영역 */}
        <div className="relative">
          <div className="flex justify-end mb-2">
            <button onClick={handleResetImage} className="text-[9px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors">
              [ Reset Habitat ]
            </button>
          </div>

          <div className="w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 relative aspect-video">
            <img 
              src={`https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${currentImageFile}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-80'}`}
              alt="Dragon Habitat"
            />

            {/* 드래곤 성장 및 메시지 */}
            {(currentImageFile === 'main.webp' || currentImageFile === 'x.jpg') && eggStr && (
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <div className="absolute top-2 left-2 md:top-4 md:left-4 flex items-center gap-2 pointer-events-auto">
                  <div className="w-20 md:w-24 h-2.5 md:h-3 bg-white/40 backdrop-blur-md rounded-full overflow-hidden border border-white/30 shadow-sm">
                    <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%`, backgroundColor: '#65D35D' }} />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black text-white drop-shadow-md">{Math.floor(progress)}%</span>
                </div>

                <div className={`relative flex flex-col items-center ${positionClass}`}>
                  <div className="absolute -top-14 md:-top-16 flex flex-col items-center w-full">
                    <div className="relative bg-white/95 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow">
                       <p className="text-[8px] md:text-[11px] font-bold text-slate-700 whitespace-nowrap italic text-center">({randomMsg})</p>
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white/95" />
                    </div>
                    <div className="mt-1 md:mt-1 cursor-pointer pointer-events-auto hover:scale-110 active:scale-95 transition-all" onClick={() => setIsModalOpen(true)} style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                      <span className="text-white text-[10px] md:text-[13px] font-black tracking-tight whitespace-nowrap uppercase">{dragonName}</span>
                    </div>
                  </div>
                  <img src={finalUrl} alt="Dragon" className={`relative object-contain drop-shadow-2xl animate-bounce-slow pointer-events-auto transition-all duration-500 ${stage === 4 ? 'w-24 h-24 md:w-32 md:h-32 -translate-y-2' : 'w-12 h-12 md:w-16 md:h-16 -translate-y-2'}`} onError={(e) => { e.currentTarget.src = `${baseUrl}/${eggStr}.webp`; }} />
                  <div className="absolute -bottom-2 w-7 h-1.5 md:w-10 md:h-2 bg-black/25 rounded-[100%] blur-[5px]" />
                </div>
              </div>
            )}

            {/* 지역별 알 선택 */}
            {!isFading && !['main.webp', 'x.jpg'].includes(currentImageFile) && !(selectedEgg || studentMasterData[selectedName]?.selected_egg) && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 px-4 z-20">
                {[1, 2, 3].map((num) => {
                  const regionPrefix = currentImageFile.split('.')[0].substring(0, 2).toLowerCase();
                  const eggUrl = `https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${regionPrefix}${num}.webp`;
                  return (
                    <div key={num} className="relative group flex flex-col items-center">
                      <div className="absolute -bottom-1 w-6 h-1.5 md:w-8 md:h-2 bg-black/40 rounded-[100%] blur-[4px] group-hover:scale-125 transition-transform duration-300" />
                      <img
                        src={eggUrl}
                        alt="Dragon Egg"
                        onClick={() => { setTempEgg(eggUrl); setSelectedEgg(`${regionPrefix}${num}`); setEggStep(1); }}
                        className="relative w-12 h-12 md:w-16 md:h-16 object-contain hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 이중 확인 팝업 */}
        {eggStep > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center border-4 border-slate-100">
              <h3 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tighter" style={{ fontFamily: "'Cinzel', serif" }}>
                {eggStep === 1 ? "이 알을 데려갈까요?" : "정말 이 알을 데려갈까요?"}
              </h3>
              <p className="text-slate-500 mb-6 text-sm italic">{eggStep === 1 ? "따스한 온기가 느껴지는 알입니다." : "한 번 데려가면 졸업 전까지 함께 해야 합니다."}</p>
              <div className="flex flex-col gap-3">
                <button onClick={async () => {
                  if (eggStep === 1) setEggStep(2);
                  else {
                    const eggId = typeof tempEgg === 'string' ? tempEgg.split('/').pop()?.split('.')[0] : "";
                    if (selectedName && eggId) {
                      await supabase.from('student_master').update({ selected_egg: eggId }).eq('student_name', selectedName);
                      fetchStudentData(selectedName);
                    }
                    setEggStep(0); setTempEgg(null); handleResetImage();
                  }
                }} className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs">네</button>
                <button onClick={() => { setEggStep(0); setTempEgg(null); }} className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]">고민해볼게요</button>
              </div>
            </div>
          </div>
        )}

        {/* 이름 짓기 팝업 */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center border-4 border-slate-100">
              <h3 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tighter" style={{ fontFamily: "'Cinzel', serif" }}>이름을 지어줄까요?</h3>
              <p className="text-slate-500 mb-6 text-sm italic">이름은 언제든지 변경할 수 있습니다.</p>
              <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="이름을 입력하세요" className="w-full border-2 border-slate-100 rounded-xl p-3 mb-6 focus:border-[#65D35D] outline-none text-center font-bold text-slate-700 transition-colors" />
              <div className="flex flex-col gap-3">
                <button onClick={handleSaveName} className="w-full py-3 bg-[#65D35D] text-white font-black rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg shadow-green-100">이름을 지어준다</button>
                <button onClick={() => { setIsModalOpen(false); setTempName(""); }} className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]">지어주지 않는다</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
