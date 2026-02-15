"use client";
import React, { useState, useEffect } from 'react';

// [1] 학생 스타일 데이터 (기존 유지)
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

// [2] Props 타입 정의
interface StudyProps {
  supabase: any;
  selectedName: string;
  isAdmin: boolean;
}

export default function Study({ supabase, selectedName, isAdmin }: StudyProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStudentReport, setSelectedStudentReport] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState("");

  useEffect(() => {
    fetchRecords();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
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
    let bonus = 0, penalty = 0, usedOff = 0;
    const studentRecords = records.filter(r => r.student_name === name);
    studentRecords.forEach(r => {
      const res = calc(r);
      bonus += res.bonus; penalty += res.penalty;
      if (['반휴', '늦반휴'].includes(r.off_type)) usedOff += 0.5;
      if (['주휴', '늦휴'].includes(r.off_type)) usedOff += 1.0;
    });
    const monRec = studentRecords.find(r => r.day_of_week === '월');
    const offCount = monRec?.monthly_off_count ?? 4;
    return { bonus, penalty, weeklyOff: (1.5 - usedOff).toFixed(1), monthlyOff: (offCount * 0.5).toFixed(1) };
  };

  const handleChange = async (name: string, day: string, field: string, value: any) => {
    // 본인이 아니면 수정 불가 (관리자는 가능)
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

  // [중요] 관리자면 전체 리스트, 학생이면 자기 이름만 리스트에 넣음
  const displayList = isAdmin 
    ? Object.keys(studentStyleMap).sort((a, b) => {
        const houseDiff = HOUSE_ORDER.indexOf(studentStyleMap[a].house) - HOUSE_ORDER.indexOf(studentStyleMap[b].house);
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
              <input type="text" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} onBlur={() => handleChange(selectedName, '월', 'goal', dailyGoal)} className="bg-transparent italic text-xs w-full outline-none" placeholder="목표를 입력하세요" />
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
                const info = studentStyleMap[name];
                if (!info) return null; // 데이터 매칭 안될 경우 방지
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
                                <input type="text" className="w-full text-center text-xs font-black outline-none" value={rec.study_time || ''} onBlur={(e) => handleChange(name, day, 'study_time', e.target.value)} onChange={(e) => setRecords(prev => prev.map(r => (r.student_name === name && r.day_of_week === day) ? {...r, study_time: e.target.value} : r))} placeholder="0:0" />
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

      {/* 리포트 팝업 (기존 유지) */}
      {selectedStudentReport && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudentReport(null)}>
          <div className="bg-white p-8 w-full max-w-md rounded-[2rem] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-6 mb-6">
              <img src={HOUSE_LOGOS[studentStyleMap[selectedStudentReport]?.house]} className="w-24 h-24 object-contain" alt="crest" />
              <div>
                <div className="text-5xl">{studentStyleMap[selectedStudentReport]?.emoji}</div>
                <div className="text-xl font-black">{selectedStudentReport}</div>
                <div className="text-sm opacity-50">{studentStyleMap[selectedStudentReport]?.house} 기숙사</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl text-center">
                <div className="text-[10px] font-bold opacity-40">상벌점 합계</div>
                <div className="text-2xl font-black">{calculatePoints(selectedStudentReport).bonus + calculatePoints(selectedStudentReport).penalty}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center">
                <div className="text-[10px] font-bold opacity-40">휴무 (주/월)</div>
                <div className="text-xl font-black">{calculatePoints(selectedStudentReport).weeklyOff} / {calculatePoints(selectedStudentReport).monthlyOff}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
