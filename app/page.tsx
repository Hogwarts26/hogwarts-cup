"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';

const studentData: { [key: string]: { house: string; emoji: string; color: string; accent: string, text: string } } = {
  "🧃피크닉": { house: "슬리데린", emoji: "🧃", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🤖로봇": { house: "슬리데린", emoji: "🤖", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐾발자국": { house: "슬리데린", emoji: "🐾", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐆표범": { house: "슬리데린", emoji: "🐆", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐡복어": { house: "슬리데린", emoji: "🐡", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🎂케이크": { house: "슬리데린", emoji: "🎂", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐻곰돌": { house: "슬리데린", emoji: "🐻", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🍮푸딩": { house: "래번클로", emoji: "🍮", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "💫별": { house: "래번클로", emoji: "💫", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🍪쿠키": { house: "래번클로", emoji: "🍪", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐯호랑": { house: "래번클로", emoji: "🐯", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🌳나무": { house: "래번클로", emoji: "🌳", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "👑왕관": { house: "래번클로", emoji: "👑", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐬돌고래": { house: "래번클로", emoji: "🐬", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐱냥이": { house: "그리핀도르", emoji: "🐱", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🐺늑대": { house: "그리핀도르", emoji: "🐺", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦉올뺌": { house: "그리핀도르", emoji: "🦉", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦄유니콘": { house: "그리핀도르", emoji: "🦄", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦋나비": { house: "그리핀도르", emoji: "🦋", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🔥불꽃": { house: "그리핀도르", emoji: "🔥", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🍋레몬": { house: "그리핀도르", emoji: "🍋", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🫧거품": { house: "후플푸프", emoji: "🫧", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐎말": { house: "후플푸프", emoji: "🐎", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐈‍⬛깜냥": { house: "후플푸프", emoji: "🐈‍⬛", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🦊여우": { house: "후플푸프", emoji: "🦊", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🧄마늘": { house: "후플푸프", emoji: "🧄", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🦖공룡": { house: "후플푸프", emoji: "🦖", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐿️다람": { house: "후플푸프", emoji: "🐿️", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" }
};

const HOUSE_ORDER = ["슬리데린", "래번클로", "그리핀도르", "후플푸프"];

const HOUSE_CONFIG = {
  "슬리데린": { bg: "bg-emerald-600", border: "border-emerald-700", icon: "🐍" },
  "래번클로": { bg: "bg-blue-700", border: "border-blue-800", icon: "🦅" },
  "그리핀도르": { bg: "bg-red-700", border: "border-red-800", icon: "🦁" },
  "후플푸프": { bg: "bg-amber-500", border: "border-amber-600", icon: "🦡" }
};

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const OFF_OPTIONS = ['-', '반휴', '주휴', '월휴', '월반휴', '자율', '결석', '늦반휴', '늦휴', '늦월반휴', '늦월휴'];

export default function HogwartsApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRecords = async () => {
    const { data } = await supabase.from('study_records').select('*');
    if (data) setRecords(data);
  };

  useEffect(() => { if (isLoggedIn) fetchRecords(); }, [isLoggedIn]);

  const calc = (r: any) => {
    if (!r) return { penalty: -5, bonus: 0, total: -5, studyH: 0 };
    if (r.off_type === '결석') return { penalty: -5, bonus: 0, total: -5, studyH: 0 };
    const [h, m] = (r.study_time || "0:00").split(':').map(Number);
    const studyH = (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
    let penalty = 0, bonus = 0;
    const isHalfOff = ['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(r.off_type);
    const isFullOff = ['주휴', '월휴', '자율', '늦휴', '늦월휴'].includes(r.off_type);
    if (['늦반휴', '늦휴', '늦월반휴', '늦월휴'].includes(r.off_type)) penalty -= 1;
    if (r.is_late && !isFullOff) penalty -= 1;
    if (!isFullOff && !isHalfOff && r.off_type !== '자율' && !r.am_3h) penalty -= 1;
    if (!isFullOff && r.off_type !== '자율') {
      const target = isHalfOff ? 4 : 9;
      if (studyH < target) penalty -= Math.ceil((target - studyH) - 0.001);
      else if (!isHalfOff) bonus += Math.floor(studyH - target);
    }
    const finalPenalty = Math.max(penalty, -5);
    return { penalty: finalPenalty, bonus, total: finalPenalty + bonus, studyH };
  };

  const houseRankings = useMemo(() => {
    return HOUSE_ORDER.map(house => {
      const students = Object.keys(studentData).filter(n => studentData[n].house === house);
      const count = students.length;
      let totalScore = 0;
      let totalStudyH = 0;

      students.forEach(name => {
        DAYS.forEach(day => {
          const rec = records.find(r => r.student_name === name && r.day_of_week === day);
          const res = calc(rec);
          totalScore += res.total;
          totalStudyH += res.studyH;
        });
      });

      const avgScore = count > 0 ? totalScore / count : 0;
      const avgStudyH = count > 0 ? Math.floor(totalStudyH / count) : 0;
      const finalPoint = avgScore + avgStudyH;

      return { house, finalPoint, count };
    }).sort((a, b) => b.finalPoint - a.finalPoint);
  }, [records]);

  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin) return;
    setIsSaving(true);
    const newRecords = [...records];
    const idx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === day);
    
    // 공부시간 저장 시 빈칸이면 0:00으로 보정하여 저장
    const finalValue = (field === 'study_time' && !value) ? '0:00' : value;
    
    const updatedData = idx > -1 ? { ...newRecords[idx], [field]: finalValue } : { student_name: name, day_of_week: day, [field]: finalValue };
    if (idx > -1) newRecords[idx] = updatedData; else newRecords.push(updatedData);
    setRecords(newRecords);
    await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });
    setIsSaving(false);
  };

  const resetMonthlyOff = async (name: string) => {
    if (!isAdmin || !confirm(`${name} 학생의 월휴를 리셋하시겠습니까?`)) return;
    await handleChange(name, '월', 'monthly_off_count', 4);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>
          <h1 className="text-4xl font-serif font-black text-center mb-10 text-slate-800 tracking-tighter italic">Hogwarts</h1>
          <div className="space-y-6">
            <select className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg cursor-pointer" value={selectedName} onChange={(e)=>setSelectedName(e.target.value)}>
              <option value="">이름을 선택하세요.</option>
              {Object.keys(studentData).sort().map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input type="password" placeholder="비밀번호 입력" className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && (password === "8888" ? (setIsAdmin(true), setIsLoggedIn(true)) : (password === "0000" && selectedName ? (setIsAdmin(false), setIsLoggedIn(true)) : alert("정보 확인")))} />
            <button onClick={() => password === "8888" ? (setIsAdmin(true), setIsLoggedIn(true)) : (password === "0000" && selectedName ? (setIsAdmin(false), setIsLoggedIn(true)) : alert("정보 확인"))} className="w-full bg-slate-900 text-yellow-500 py-5 rounded-2xl font-black shadow-lg uppercase text-xl active:scale-95 transition-transform">Enter Castle</button>
          </div>
        </div>
      </div>
    );
  }

  const displayList = isAdmin 
    ? Object.keys(studentData).sort((a, b) => {
        const houseA = studentData[a].house;
        const houseB = studentData[b].house;
        if (houseA !== houseB) return HOUSE_ORDER.indexOf(houseA) - HOUSE_ORDER.indexOf(houseB);
        return a.localeCompare(b);
      }) 
    : [selectedName];

  return (
    <div className="min-h-screen bg-stone-100 p-4 font-sans pb-16">
      <div className="max-w-[1100px] mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-serif font-black text-slate-800 italic tracking-tight">Hogwarts House Cup</h2>
          <button onClick={() => window.location.reload()} className="text-xs font-black text-slate-400 bg-white border-2 px-4 py-2 rounded-full shadow-sm hover:bg-slate-50 transition-colors">LOGOUT</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {houseRankings.map((item, index) => {
            const config = (HOUSE_CONFIG as any)[item.house];
            return (
              <div key={item.house} className={`${config.bg} ${config.border} border-b-8 p-5 rounded-[2rem] text-white shadow-xl transition-all duration-500 transform ${index === 0 ? 'scale-105 ring-4 ring-yellow-400/50' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black opacity-90 uppercase tracking-widest">{index + 1}st {item.house}</span>
                  <span className="text-2xl">{index === 0 ? '🏆' : config.icon}</span>
                </div>
                <div className="text-4xl font-black">{item.finalPoint.toFixed(1)}<span className="text-sm ml-1 opacity-80 uppercase">pts</span></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-4 px-8 flex justify-between items-center">
          <span className="text-xs font-black text-yellow-500 uppercase tracking-[0.2em]">{isAdmin ? "Headmaster Console" : `Student: ${selectedName}`}</span>
          {isSaving && <div className="flex items-center gap-2 text-[10px] text-yellow-500 font-bold uppercase"><div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>Recording Magic...</div>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-black text-[11px] border-b-2">
                <th className="w-24 p-2 sticky left-0 bg-slate-50 z-10 border-r">Witch/Wizard</th>
                <th className="w-14 p-2 border-r">Field</th>
                {DAYS.map(d => <th key={d} className="w-12 p-2 text-slate-900">{d}</th>)}
                <th className="w-14 p-2 bg-slate-100 text-slate-900 text-center text-[10px]">총 공부시간</th>
                <th className="w-14 p-2 bg-slate-100 border-l text-[10px]">잔여월휴</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map(name => {
                const info = studentData[name];
                const monRec = records.find(r => r.student_name === name && r.day_of_week === '월') || {};
                const offCount = monRec.monthly_off_count === undefined ? 4 : monRec.monthly_off_count;
                const rows = [
                  {l:'휴무',f:'off_type'}, 
                  {l:'지각',f:'is_late'}, 
                  {l:'오전3H',f:'am_3h'}, 
                  {l:'공부시간',f:'study_time'}, 
                  {l:'벌점',f:'penalty'},
                  {l:'상점',f:'bonus'},
                  {l:'총점',f:'total'}
                ];
                
                return (
                  <React.Fragment key={name}>
                    {rows.map((row, rIdx) => (
                      <tr key={row.l} className={`${rIdx === 6 ? "border-b-[6px] border-slate-100" : "border-b border-slate-50"}`}>
                        {rIdx === 0 && (
                          <td rowSpan={7} className={`p-4 text-center sticky left-0 z-10 font-bold border-r-[3px] ${info.color} ${info.text}`}>
                            <div className="text-3xl mb-1">{info.emoji}</div>
                            <div className="leading-tight text-sm font-black mb-1">{name}</div>
                            <div className="text-[9px] font-black opacity-70 uppercase tracking-tighter">{info.house}</div>
                          </td>
                        )}
                        <td className="p-2 text-center font-black border-r bg-white text-slate-800 text-[11px] leading-tight">{row.l}</td>
                        {DAYS.map(day => {
                          const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
                          const res = calc(rec);
                          let cellBg = row.f === 'off_type' ? (['반휴','월반휴'].includes(rec.off_type)?'bg-green-100':['주휴','월휴'].includes(rec.off_type)?'bg-blue-100':rec.off_type==='결석'?'bg-red-100':['늦휴','늦반휴','늦월반휴','늦월휴'].includes(rec.off_type)?'bg-yellow-100':'') : '';
                          
                          return (
                            <td key={day} className={`p-1.5 text-center border-r border-slate-50 ${cellBg}`}>
                              {row.f === 'off_type' ? (
                                <select className="w-full text-center bg-transparent font-black text-slate-900 disabled:opacity-100 outline-none cursor-pointer text-[10px]" value={rec.off_type || '-'} onChange={(e) => handleChange(name, day, 'off_type', e.target.value)} disabled={!isAdmin}>
                                  {OFF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              ) : (row.f === 'is_late' || row.f === 'am_3h') ? (
                                <input type="checkbox" className="w-5 h-5 accent-slate-800 disabled:opacity-100 cursor-pointer mx-auto block" checked={!!rec[row.f]} onChange={(e) => handleChange(name, day, row.f, e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'study_time' ? (
                                <input 
                                  type="text" 
                                  className="w-full text-center bg-transparent font-black text-slate-900 disabled:opacity-100 outline-none text-sm" 
                                  value={rec.study_time === undefined ? '0:00' : rec.study_time} 
                                  onChange={(e) => {
                                    const newRecords = [...records];
                                    const idx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === day);
                                    if (idx > -1) newRecords[idx] = { ...newRecords[idx], study_time: e.target.value };
                                    else newRecords.push({ student_name: name, day_of_week: day, study_time: e.target.value });
                                    setRecords(newRecords);
                                  }} 
                                  onBlur={(e) => handleChange(name, day, 'study_time', e.target.value)}
                                  disabled={!isAdmin} 
                                />
                              ) : (
                                <span className={`font-black text-sm ${row.f === 'penalty' ? 'text-red-500' : row.f === 'bonus' ? 'text-blue-600' : 'text-slate-900'}`}>
                                  {res[row.f as keyof typeof res]}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="bg-slate-50 text-center font-black text-slate-900 border-l text-sm">{row.f === 'study_time' ? (()=>{
                          let tm = 0; records.filter(r=>r.student_name===name).forEach(r=>{const[h,m]=(r.study_time||"0:00").split(':').map(Number);tm+=(isNaN(h)?0:h*60)+(isNaN(m)?0:m);});
                          return `${Math.floor(tm/60)}:${(tm%60).toString().padStart(2,'0')}`;
                        })() : ""}</td>
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-2 bg-white border-l">
                            <div className="flex flex-col items-center gap-1.5">
                              {[1, 2, 3, 4].map((n) => (
                                <div key={n} onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', offCount >= (5-n) ? (5-n)-1 : offCount)} className={`w-7 h-5 rounded-md border-2 ${isAdmin ? 'cursor-pointer hover:brightness-90' : ''} ${offCount >= (5-n) ? info.accent : 'bg-slate-50 border-slate-200'}`} />
                              ))}
                              {isAdmin && (
                                <button onClick={() => resetMonthlyOff(name)} className="mt-2 px-1 py-0.5 bg-slate-800 text-[8px] text-white rounded font-bold hover:bg-black transition-colors">RESET</button>
                              )}
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
    </div>
  );
}
