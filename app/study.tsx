"use client";
import React, { useState, useEffect } from 'react';

// [1] 학생 스타일 데이터 (이미지에 맞춰 텍스트 컬러 및 스타일 조정)
export const studentStyleMap: { [key: string]: { house: string; emoji: string; color: string; accent: string, text: string } } = {
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
  "🐱냥이": { house: "그리핀도르", emoji: "🐱", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🪶깃털": { house: "래번클로", emoji: "🪶", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐺늑대": { house: "그리핀도르", emoji: "🐺", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦉올뺌": { house: "그리핀도르", emoji: "🦉", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦦수달": { house: "그리핀도르", emoji: "🦦", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦄유니콘": { house: "그리핀도르", emoji: "🦄", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦋나비": { house: "그리핀도르", emoji: "🦋", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🔥불꽃": { house: "그리핀도르", emoji: "🔥", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🍋레몬": { house: "그리핀도르", emoji: "🍋", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
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

// [수정 포인트] 인터페이스에 studentMasterData 추가 (에러 해결)
interface StudyProps {
  supabase: any;
  selectedName: string;
  isAdmin: boolean;
  studentMasterData?: any; 
}

export default function Study({ supabase, selectedName, isAdmin, studentMasterData }: StudyProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStudentReport, setSelectedStudentReport] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState("");

  // props로 전달된 데이터가 있으면 그것을 사용하고, 없으면 내부 styleMap 사용
  const studentData = studentMasterData || studentStyleMap;

  useEffect(() => {
    fetchRecords();
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, [selectedName]);

  const fetchRecords = async () => {
    const { data } = await supabase.from('study_records').select('*');
    if (data) {
      setRecords(data);
      const myGoal = data.find((r: any) => r.student_name === selectedName && r.goal)?.goal || "";
      setDailyGoal(myGoal);
    }
  };

  const calc = (r: any) => {
    if (!r || !r.off_type || r.off_type === '-' || r.off_type === '') return { penalty: 0, bonus: 0, total: 0 };
    if (r.off_type === '결석') return { penalty: -5, bonus: 0, total: -5 };
    const [h, m] = (r.study_time || "0:0").split(':').map(Number);
    const studyH = (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
    let penalty = 0, bonus = 0;
    const isHalfOff = ['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(r.off_type);
    const isFullOff = ['주휴', '월휴', '자율', '늦휴', '늦월휴'].includes(r.off_type);
    if (['늦반휴', '늦휴', '늦월반휴', '늦월휴'].includes(r.off_type)) penalty -= 1;
    if (r.is_late && !isFullOff && r.off_type !== '자율') penalty -= 1;
    if (!isFullOff && r.off_type !== '자율') {
      if (!isHalfOff && r.am_3h === false && studyH > 0) penalty -= 1;
      const target = isHalfOff ? 4 : 9;
      if (studyH < target) penalty -= Math.ceil(target - studyH);
      else if (!isHalfOff && studyH >= target + 1) bonus += Math.floor(studyH - target);
    }
    return { penalty: Math.max(penalty, -5), bonus, total: Math.max(penalty, -5) + bonus };
  };

  const calculatePoints = (name: string) => {
    let bonus = 0; let penalty = 0; let usedWeeklyOff = 0; 
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
      bonus, 
      penalty,
      remainingWeeklyOff: (1.5 - usedWeeklyOff).toFixed(1).replace('.0', ''),
      remainingMonthlyOff: (offCount * 0.5).toFixed(1).replace('.0', '')
    };
  };

  const calculateWeeklyTotal = (name: string) => {
    let totalMinutes = 0;
    records.filter(r => r.student_name === name).forEach(r => {
      const [h, m] = (r.study_time || "0:00").split(':').map(Number);
      totalMinutes += (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
    });
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}`;
  };

  const getWeeklyDateRange = () => {
    const today = currentTime; 
    const day = today.getDay();
    const diff = today.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(new Date(today).setDate(diff));
    const sunday = new Date(new Date(today).setDate(diff + 6));
    return `${monday.getMonth() + 1}월 ${monday.getDate()}일 ~ ${sunday.getMonth() + 1}월 ${sunday.getDate()}일`;
  };

  const getDayDate = (targetDay: string) => {
    const dayIdx = DAYS.indexOf(targetDay);
    const today = currentTime; 
    const currentDay = today.getDay();
    const diff = today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + dayIdx;
    const target = new Date(new Date(today).setDate(diff));
    return `${target.getMonth() + 1}.${target.getDate()}`;
  };

  const formatDisplayName = (name: string) => name.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');

  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin && name !== selectedName) return;
    setIsSaving(true);
    const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
    let payload: any = { ...existing, student_name: name, day_of_week: day, [field]: value };

    if (field === 'goal') {
      const goalPayload = DAYS.map(d => ({ student_name: name, day_of_week: d, goal: value }));
      await supabase.from('study_records').upsert(goalPayload, { onConflict: 'student_name,day_of_week' });
    } else {
      await supabase.from('study_records').upsert(payload, { onConflict: 'student_name,day_of_week' });
    }
    fetchRecords();
    setIsSaving(false);
  };

  const displayList = isAdmin 
    ? Object.keys(studentData).sort((a, b) => {
        const houseDiff = HOUSE_ORDER.indexOf(studentData[a].house) - HOUSE_ORDER.indexOf(studentData[b].house);
        return houseDiff !== 0 ? houseDiff : a.localeCompare(b, 'ko');
      }) 
    : [selectedName];

  return (
    <div className="min-h-screen bg-stone-100 p-2 md:p-4 pb-16 relative">
      <div className="max-w-[1100px] mx-auto bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-4 px-6 text-white">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-yellow-500 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {isAdmin ? "Headmaster Console" : `${selectedName} 학생의 기록부`}
            </span>
            {isSaving && <div className="text-[10px] text-yellow-500 animate-bounce">Saving...</div>}
          </div>
          {!isAdmin && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-3">
              <span className="text-[9px] font-black opacity-40 uppercase">Goal</span>
              <input type="text" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} onBlur={() => handleChange(selectedName, '월', 'goal', dailyGoal)} className="bg-transparent italic text-xs w-full outline-none" placeholder="목표 입력" />
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <table className="min-w-[850px] w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-black text-[11px] border-b-2">
                <th className="w-28 p-2 sticky left-0 bg-slate-50 z-20 border-r">학생명</th>
                {DAYS.map(d => <th key={d} className="w-16 p-2 text-slate-900">{d}</th>)}
                <th className="w-24 p-2 bg-slate-100">공부시간</th>
                <th className="w-16 p-2 bg-slate-100 border-l">월휴</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map(name => {
                const info = studentData[name];
                if (!info) return null;
                const studentRecords = records.filter(r => r.student_name === name);
                const monRec = studentRecords.find(r => r.day_of_week === '월') || {};
                const offCount = monRec.monthly_off_count ?? 4;
                const rows = ['off_type', 'is_late', 'am_3h', 'study_time', 'penalty', 'bonus', 'total'];

                return (
                  <React.Fragment key={name}>
                    {rows.map((rowField, rIdx) => (
                      <tr key={rowField} className={rIdx === 6 ? "border-b-[6px] border-slate-100" : "border-b border-slate-50"}>
                        {rIdx === 0 && (
                          <td rowSpan={7} className={`p-4 text-center sticky left-0 z-20 font-bold border-r-[3px] ${info.color} ${info.text} cursor-pointer`} onClick={() => setSelectedStudentReport(name)}>
                            <div className="text-3xl mb-1">{info.emoji}</div>
                            <div className="text-[11px] font-black leading-tight">{name}</div>
                            <div className="text-[8px] opacity-50">{info.house}</div>
                          </td>
                        )}
                        {DAYS.map(day => {
                          const rec = studentRecords.find(r => r.student_name === name && r.day_of_week === day) || {};
                          const res = calc(rec);
                          return (
                            <td key={day} className="p-1.5 text-center border-r border-slate-50">
                              {rowField === 'off_type' ? (
                                <select className="w-full text-center bg-transparent text-[10px] font-black outline-none" value={rec.off_type || '-'} onChange={(e) => handleChange(name, day, 'off_type', e.target.value)}>
                                  {OFF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              ) : rowField === 'is_late' || rowField === 'am_3h' ? (
                                <input type="checkbox" checked={!!rec[rowField]} onChange={(e) => handleChange(name, day, rowField, e.target.checked)} className="w-3.5 h-3.5 accent-slate-800" />
                              ) : rowField === 'study_time' ? (
                                <input type="text" className="w-full text-center text-xs font-black outline-none" value={rec.study_time || ''} onBlur={(e) => handleChange(name, day, 'study_time', e.target.value)} onChange={(e) => setRecords(prev => prev.map(r => (r.student_name === name && r.day_of_week === day) ? {...r, study_time: e.target.value} : r))} />
                              ) : (
                                <span className={`font-black text-xs ${rowField === 'penalty' && res.penalty < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                                  {rowField === 'total' ? res.total : (res[rowField as keyof typeof res] || '')}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="bg-slate-50 text-center border-l">
                          {rIdx === 6 && <div className="text-[10px] font-black text-blue-700">P: {calculatePoints(name).bonus + calculatePoints(name).penalty}</div>}
                        </td>
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-1 bg-white border-l text-center">
                            <div className="flex flex-col items-center gap-1">
                              {[1, 2, 3, 4].map(n => <div key={n} className={`w-5 h-3 rounded-sm border ${offCount >= (5-n) ? info.accent : 'bg-slate-50 border-slate-200'}`} onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', 5-n)} />)}
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

      {/* [27] 학생 개인 요약 팝업 */}
      {selectedStudentReport && studentData[selectedStudentReport] && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedStudentReport(null)}>
          <div className="bg-white p-5 md:px-10 md:py-8 w-full max-w-lg shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3)] relative rounded-[3rem] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-end justify-center mb-6 w-full">
              <div className="w-[45%] flex justify-end">
                <img 
                  src={HOUSE_LOGOS[studentData[selectedStudentReport].house]} 
                  alt="Logo" 
                  className="w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-md" 
                />
              </div>
              <div className="w-[55%] flex flex-col justify-end items-start pl-4">
                <div className="flex items-baseline gap-1.5 mb-0">
                  <span className="text-5xl md:text-6xl">{studentData[selectedStudentReport].emoji}</span>
                  <span className="font-bold text-xs md:text-sm text-slate-400 tracking-tight leading-none">{formatDisplayName(selectedStudentReport)}</span>
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight italic">
                    {calculateWeeklyTotal(selectedStudentReport)}
                  </div>
                  <div className="text-sm md:text-base font-bold text-slate-500 tracking-tight mt-1">
                    {records.find(r => r.student_name === selectedStudentReport && r.goal)?.goal || ""}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xl md:text-2xl font-black text-black mb-4 text-center tracking-tight">
              {getWeeklyDateRange()}
            </div>
            
            <div className="grid grid-cols-4 gap-2.5 mb-2">
              {DAYS.map(day => {
                const rec = records.find(r => r.student_name === selectedStudentReport && r.day_of_week === day) || {};
                const isGreen = ['반휴','월반휴','늦반휴','늦월반휴'].includes(rec.off_type);
                const isBlue = ['주휴','월휴','늦휴','늦월휴'].includes(rec.off_type);
                const isRed = rec.off_type === '결석';
                const cellClass = isGreen ? 'bg-green-100/60 border-green-200' 
                                : isBlue ? 'bg-blue-100/60 border-blue-200'
                                : isRed ? 'bg-red-100/60 border-red-200'
                                : 'bg-slate-50 border-slate-100';
                const textClass = isGreen ? 'text-green-700'
                                : isBlue ? 'text-blue-700'
                                : isRed ? 'text-red-700'
                                : 'text-slate-400';
                return (
                  <div key={day} className={`p-2.5 flex flex-col items-center justify-between h-24 rounded-2xl border shadow-sm transition-all ${cellClass}`}>
                    <div className={`text-[10px] font-bold ${textClass}`}>{getDayDate(day)} {day}</div>
                    <div className="text-[18px] font-black text-slate-800">{rec.study_time || "0:00"}</div>
                    <div className={`text-[9px] font-black h-3 leading-none uppercase ${textClass}`}>
                      {['반휴','월반휴','주휴','결석'].includes(rec.off_type) ? rec.off_type : ""}
                    </div>
                  </div>
                );
              })}
              
              <div className="p-3 text-[10px] font-black leading-relaxed flex flex-col justify-center gap-1 bg-slate-900 text-white rounded-2xl shadow-lg">
                <div className="flex justify-between"><span>상점</span><span className="text-blue-400">+{calculatePoints(selectedStudentReport).bonus}</span></div>
                <div className="flex justify-between"><span>벌점</span><span className="text-red-400">{calculatePoints(selectedStudentReport).penalty}</span></div>
                <div className="flex justify-between text-yellow-400 mt-0.5"><span>휴무</span><span>{calculatePoints(selectedStudentReport).remainingWeeklyOff}</span></div>
                <div className="flex justify-between text-cyan-400"><span>월휴</span><span>{calculatePoints(selectedStudentReport).remainingMonthlyOff}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
