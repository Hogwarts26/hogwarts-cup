"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; // 설정된 경로에 맞게 수정하세요

// ==========================================
// [1] 기숙사컵 스타일 및 애니메이션 설정 (원본 그대로)
// ==========================================
const STUDY_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

  .font-serif { font-family: 'Cinzel', serif; }

  /* 체크박스 커스텀 */
  .late-checkbox {
    width: 14px;
    height: 14px;
    accent-color: #1e293b;
    margin: 0 auto;
    display: block;
  }

  /* 스크롤바 커스텀 */
  .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  /* 셀렉트 박스 중앙 정렬 */
  select {
    appearance: none;
    -webkit-appearance: none;
    text-align-last: center;
  }
`;

// ==========================================
// [2] 학생 명단 데이터 (원본 그대로)
// ==========================================
export const studentStyleMap: { [key: string]: { house: string; emoji: string; color: string; accent: string, text: string } } = {
  "🐱냥이": { house: "그리핀도르", emoji: "🐱", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🐺늑대": { house: "그리핀도르", emoji: "🐺", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦉올뺌": { house: "그리핀도르", emoji: "🦉", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦦수달": { house: "그리핀도르", emoji: "🦦", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦄유니콘": { house: "그리핀도르", emoji: "🦄", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦋나비": { house: "그리핀도르", emoji: "🦋", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🔥불꽃": { house: "그리핀도르", emoji: "🔥", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🍋레몬": { house: "그리핀도르", emoji: "🍋", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🤖로봇": { house: "슬리데린", emoji: "🤖", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐾발자국": { house: "슬리데린", emoji: "🐾", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐆표범": { house: "슬리데린", emoji: "🐆", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐡복어": { house: "슬리데린", emoji: "🐡", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐶강쥐": { house: "슬리데린", emoji: "🐶", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🦔도치": { house: "슬리데린", emoji: "🦔", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🎂케이크": { house: "슬리데린", emoji: "🎂", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐻곰돌": { house: "슬리데린", emoji: "🐻", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🪙갈레온": { house: "래번클로", emoji: "🪙", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "💫별": { house: "래번클로", emoji: "💫", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🍪쿠키": { house: "래번클로", emoji: "🍪", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐯호랑": { house: "래번클로", emoji: "🐯", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🌳나무": { house: "래번클로", emoji: "🌳", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "👑왕관": { house: "래번클로", emoji: "👑", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐬돌고래": { house: "래번클로", emoji: "🐬", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🪶깃털": { house: "래번클로", emoji: "🪶", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🫧거품": { house: "후플푸프", emoji: "🫧", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐎말": { house: "후플푸프", emoji: "🐎", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐈‍⬛깜냥": { house: "후플푸프", emoji: "🐈‍⬛", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🦊여우": { house: "후플푸프", emoji: "🦊", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🦖공룡": { house: "후플푸프", emoji: "🦖", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "💚초록": { house: "후플푸프", emoji: "💚", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐧펭귄": { house: "후플푸프", emoji: "🐧", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐿️다람": { house: "후플푸프", emoji: "🐿️", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" }
};

const HOUSE_ORDER = ["그리핀도르", "슬리데린", "래번클로", "후플푸프"];
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const OFF_OPTIONS = ['-', '출석', '반휴', '주휴', '월휴', '월반휴', '자율', '결석', '늦반휴', '늦휴', '늦월반휴', '늦월휴'];

const HOUSE_LOGOS: Record<string, string> = {
  "그리핀도르": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/gry.png",
  "슬리데린": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/sly.png",
  "래번클로": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/rav.png",
  "후플푸프": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/huf.png"
};

export default function StudyPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realClock, setRealClock] = useState(new Date());
  const [selectedStudentReport, setSelectedStudentReport] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState("");
  
  // 로그인 정보 (임시 - 실제 환경에선 세션/컨텍스트에서 가져와야 함)
  const [selectedName, setSelectedName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // 초기 로드 시 로컬스토리지 등에서 세션 확인
    const savedName = localStorage.getItem('selectedName');
    const savedAdmin = localStorage.getItem('isAdmin') === 'true';
    if (savedName) setSelectedName(savedName);
    setIsAdmin(savedAdmin);

    const updateTime = () => {
      const now = new Date();
      setRealClock(now);
      const day = now.getDay();
      const hours = now.getHours();
      if ((day === 1 && hours < 18) || day === 0) {
        const adjusted = new Date(now);
        const offset = (day === 1) ? 1 : 0;
        adjusted.setDate(now.getDate() - offset);
        if (day === 1 && hours < 18) adjusted.setDate(now.getDate() - 1);
        setCurrentTime(adjusted);
      } else {
        setCurrentTime(now);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    fetchRecords();
    return () => clearInterval(timer);
  }, []);

  const fetchRecords = async () => {
    const { data } = await supabase.from('study_records').select('*');
    if (data) {
      setRecords(data);
      if (selectedName) {
        const myGoal = data.find((r: any) => r.student_name === selectedName && r.goal)?.goal || "";
        setDailyGoal(myGoal);
      }
    }
  };

  // 점수 계산 로직 (요청하신 자율 상점 적용 버전)
  const calc = (r: any) => {
    if (!r || !r.off_type || r.off_type === '-' || r.off_type === '') {
      return { penalty: 0, bonus: 0, total: 0, studyH: 0 };
    }
    if (r.off_type === '결석') return { penalty: -5, bonus: 0, total: -5, studyH: 0 };
    
    const timeVal = r.study_time || "";
    const [h, m] = timeVal.split(':').map(Number);
    const studyH = (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
    
    let penalty = 0, bonus = 0;
    const isHalfOff = ['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(r.off_type);
    const isFullOff = ['주휴', '월휴', '자율', '늦휴', '늦월휴'].includes(r.off_type);
    const isAutonomous = r.off_type === '자율';

    if (['늦반휴', '늦휴', '늦월반휴', '늦월휴'].includes(r.off_type)) penalty -= 1;
    if (r.is_late && !isFullOff && !isAutonomous) penalty -= 1;

    if (!isFullOff) {
      if (!isAutonomous) {
        if (!isHalfOff && r.am_3h === false && studyH > 0) penalty -= 1;
        const target = isHalfOff ? 4 : 9;
        if (studyH < target) penalty -= Math.ceil(target - studyH);
      }
      if (!isHalfOff && studyH >= 10) { 
        bonus += Math.floor(studyH - 9);
      }
    }
    const finalPenalty = Math.max(penalty, -5);
    return { penalty: finalPenalty, bonus, total: finalPenalty + bonus, studyH };
  };

  const calculatePoints = (name: string) => {
    let bonus = 0, penalty = 0, usedWeeklyOff = 0;
    const studentRecords = records.filter(r => r.student_name === name);
    studentRecords.forEach(r => {
      const res = calc(r);
      bonus += res.bonus;
      penalty += res.penalty;
      if (['반휴', '늦반휴'].includes(r.off_type)) usedWeeklyOff += 0.5;
      if (['주휴', '늦휴'].includes(r.off_type)) usedWeeklyOff += 1.0;
    });
    const monRec = studentRecords.find(r => r.day_of_week === '월');
    const offCount = monRec?.monthly_off_count ?? 4;
    return { 
      bonus, penalty, total: bonus + penalty, 
      remainingWeeklyOff: (1.5 - usedWeeklyOff).toFixed(1).replace('.0', ''),
      remainingMonthlyOff: (offCount * 0.5).toFixed(1).replace('.0', '') 
    };
  };

  const calculateWeeklyTotal = (name: string) => {
    let totalMinutes = 0;
    records.filter(r => r.student_name === name).forEach(r => {
      const [h, m] = (r.study_time || \"0:00\").split(':').map(Number);
      totalMinutes += (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
    });
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}`;
  };

  const getWeeklyDateRange = () => {
    const baseDate = new Date(currentTime);
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(new Date(baseDate).setDate(diff));
    const sunday = new Date(new Date(baseDate).setDate(diff + 6));
    return `${monday.getMonth() + 1}월 ${monday.getDate()}일 ~ ${sunday.getMonth() + 1}월 ${sunday.getDate()}일`;
  };

  const getDayDate = (targetDay: string) => {
    const dayIdx = DAYS.indexOf(targetDay);
    const baseDate = new Date(currentTime);
    const diff = baseDate.getDate() - (baseDate.getDay() === 0 ? 6 : baseDate.getDay() - 1) + dayIdx;
    const target = new Date(new Date(baseDate).setDate(diff));
    return `${target.getMonth() + 1}.${target.getDate()}`;
  };

  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin && field !== 'password' && field !== 'goal' && name !== selectedName) return;
    setIsSaving(true);
    if (field === 'password') {
      await supabase.from('study_records').upsert(DAYS.map(d => ({ student_name: name, day_of_week: d, password: value })), { onConflict: 'student_name,day_of_week' });
      alert("비밀번호 변경 완료");
    } else if (field === 'goal') {
      await supabase.from('study_records').upsert(DAYS.map(d => ({ student_name: name, day_of_week: d, goal: value })), { onConflict: 'student_name,day_of_week' });
      setDailyGoal(value);
    } else {
      const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
      await supabase.from('study_records').upsert({ ...existing, student_name: name, day_of_week: day, [field]: value }, { onConflict: 'student_name,day_of_week' });
    }
    fetchRecords();
    setIsSaving(false);
  };

  const sortedStudents = useMemo(() => {
    return Object.keys(studentStyleMap).sort((a, b) => {
      const hA = HOUSE_ORDER.indexOf(studentStyleMap[a].house);
      const hB = HOUSE_ORDER.indexOf(studentStyleMap[b].house);
      return hA !== hB ? hA - hB : a.localeCompare(b, 'ko');
    });
  }, []);

  const displayList = isAdmin ? sortedStudents : (selectedName ? [selectedName] : []);

  return (
    <div className="w-full pb-20">
      <style>{STUDY_STYLE}</style>
      
      <div className="max-w-[1100px] mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-5 px-10 flex flex-col gap-3 text-white">
          <div className="flex justify-between items-center w-full">
            <span className="text-xs font-black text-yellow-500 tracking-[0.2em] flex items-center gap-2 uppercase font-serif">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {isAdmin ? "Headmaster Console" : realClock.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
              {!isAdmin && <span className="text-white ml-2">{realClock.toLocaleTimeString('ko-KR', { hour12: false })}</span>}
            </span>
            {isSaving && <div className="text-[10px] text-yellow-500 font-bold animate-pulse font-serif">Casting Spells...</div>}
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-4 pt-2 border-t border-white/10 mt-1">
              <span className="text-[10px] font-black text-white/30 shrink-0 uppercase tracking-widest font-serif">Weekly Goal</span>
              <div className="flex items-center gap-3 flex-1 group">
                <input 
                  type="text" 
                  value={dailyGoal || ""} 
                  onChange={(e) => setDailyGoal(e.target.value)}
                  placeholder="목표를 입력하세요." 
                  className="bg-transparent italic text-sm w-full focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5 transition-all text-white/90 font-serif"
                />
                <button onClick={() => handleChange(selectedName, '월', 'goal', dailyGoal)} className="text-[10px] font-bold text-yellow-500 opacity-0 group-hover:opacity-100">[SAVE]</button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 font-black text-[10px] border-b uppercase">
                <th className="w-32 p-4 sticky left-0 bg-slate-50 z-20 border-r">Student</th>
                {DAYS.map(d => <th key={d} className="p-3 border-r text-slate-800 font-serif">{d}</th>)}
                <th className="w-24 p-3 bg-slate-100/50 border-r font-serif">Weekly</th>
                <th className="w-20 p-3 bg-slate-100/50 font-serif">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map(name => {
                const info = studentStyleMap[name];
                const studentRecords = records.filter(r => r.student_name === name);
                const monRec = studentRecords.find(r => r.day_of_week === '월') || {};
                const offCount = monRec.monthly_off_count ?? 4;
                const rows = ['off_type', 'is_late', 'am_3h', 'study_time', 'penalty', 'bonus', 'total'];

                return (
                  <React.Fragment key={name}>
                    {rows.map((field, rIdx) => (
                      <tr key={field} className={rIdx === 6 ? "border-b-[8px] border-slate-100/50" : "border-b border-slate-50"}>
                        {rIdx === 0 && (
                          <td rowSpan={7} className={`p-5 text-center sticky left-0 z-20 font-bold border-r-[4px] ${info.color} ${info.text} cursor-pointer transition-all hover:brightness-95`} onClick={() => setSelectedStudentReport(name)}>
                            <div className="text-4xl mb-2 drop-shadow-md">{info.emoji}</div>
                            <div className="leading-tight text-sm font-black mb-1">{name.replace(/[^\uAC00-\uD7A3]/g, '')}</div>
                            <div className="text-[8px] font-black opacity-40 uppercase tracking-widest font-serif mb-3">{info.house}</div>
                          </td>
                        )}
                        {DAYS.map(day => {
                          const rec = studentRecords.find(r => r.day_of_week === day) || {};
                          const res = calc(rec);
                          const cellColor = ['반휴','월반휴','늦반휴','늦월반휴'].includes(rec.off_type) ? 'bg-green-100/40' : ['주휴','월휴','늦휴','늦월휴','자율'].includes(rec.off_type) ? 'bg-blue-100/40' : rec.off_type === '결석' ? 'bg-red-100/40' : '';
                          return (
                            <td key={day} className={`p-1.5 text-center border-r border-slate-50/50 ${field === 'off_type' ? cellColor : ''}`}>
                              {field === 'off_type' ? (
                                <select className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-[10px]" value={rec.off_type || '-'} onChange={(e) => handleChange(name, day, 'off_type', e.target.value)} disabled={!isAdmin && name !== selectedName}>
                                  {OFF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              ) : field === 'is_late' || field === 'am_3h' ? (
                                <input type="checkbox" className={field === 'is_late' ? "late-checkbox" : "w-3.5 h-3.5 accent-slate-800 mx-auto block"} checked={!!rec[field]} onChange={(e) => handleChange(name, day, field, e.target.checked)} disabled={!isAdmin && name !== selectedName} />
                              ) : field === 'study_time' ? (
                                <input type="text" className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-xs font-serif" placeholder="-" value={rec.study_time || ''} onBlur={(e) => handleChange(name, day, 'study_time', e.target.value)} disabled={!isAdmin && name !== selectedName} />
                              ) : (
                                <span className={`font-black text-xs font-serif ${field === 'penalty' && res.penalty < 0 ? 'text-red-500' : field === 'bonus' && res.bonus > 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                                  {field === 'total' ? res.total : (res[field as keyof typeof res] || '0')}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="bg-slate-50/30 text-center border-r border-slate-100">
                          {field === 'study_time' && <div className="text-[11px] font-black text-slate-800 font-serif">{calculateWeeklyTotal(name)}</div>}
                          {field === 'total' && <div className="text-[11px] font-black text-blue-700 font-serif">{calculatePoints(name).total}</div>}
                        </td>
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-2 bg-white text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {[1, 2, 3, 4].map((n) => (
                                <div key={n} onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', 5-n)} 
                                     className={`w-7 h-5 rounded-md border-2 transition-all ${isAdmin ? 'cursor-pointer' : ''} ${offCount >= (5-n) ? info.accent : 'bg-slate-50 border-slate-200'}`} />
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 학생 개인 요약 팝업 (원본 디자인) */}
      {selectedStudentReport && studentStyleMap[selectedStudentReport] && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedStudentReport(null)}>
          <div className="bg-white p-8 w-full max-w-lg shadow-2xl relative rounded-[3rem] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-end justify-center mb-6">
               <img src={HOUSE_LOGOS[studentStyleMap[selectedStudentReport].house]} alt="Logo" className="w-32 h-32 object-contain mr-4" />
               <div className="flex flex-col">
                 <span className="text-5xl">{studentStyleMap[selectedStudentReport].emoji}</span>
                 <div className="text-4xl font-black font-serif italic">{calculateWeeklyTotal(selectedStudentReport)}</div>
               </div>
            </div>
            <div className="text-xl font-black text-center mb-4 font-serif">{getWeeklyDateRange()}</div>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map(day => {
                const rec = records.find(r => r.student_name === selectedStudentReport && r.day_of_week === day) || {};
                return (
                  <div key={day} className="p-2 flex flex-col items-center bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400">{day}</span>
                    <span className="font-black font-serif">{rec.study_time || \"0:00\"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
