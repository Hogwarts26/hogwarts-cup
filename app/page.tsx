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
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. 세션 기반 로그인 유지
  useEffect(() => {
    const savedLogin = sessionStorage.getItem('hogwarts_session');
    if (savedLogin) {
      const { name, admin } = JSON.parse(savedLogin);
      setSelectedName(name);
      setIsAdmin(admin);
      setIsLoggedIn(true);
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase.from('study_records').select('*');
    if (data) setRecords(data);
  };

  useEffect(() => { if (isLoggedIn) fetchRecords(); }, [isLoggedIn]);

  const handleLogin = async () => {
    let adminStatus = false;
    if (password === "8888") {
      adminStatus = true;
    } else {
      if (!selectedName) { alert("이름을 선택해주세요."); return; }
      const { data } = await supabase.from('study_records').select('password').eq('student_name', selectedName);
      const customPw = data?.find(r => r.password && r.password !== "0000")?.password || "0000";
      if (password !== customPw) { alert("비밀번호가 일치하지 않습니다."); return; }
    }
    setIsAdmin(adminStatus);
    setIsLoggedIn(true);
    sessionStorage.setItem('hogwarts_session', JSON.stringify({ name: selectedName, admin: adminStatus }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hogwarts_session');
    window.location.reload();
  };

  // 2. 통합 데이터 핸들러 (UI 즉시 반영 + DB Upsert)
  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin) return;
    
    // 로컬 상태 즉시 업데이트
    setRecords(prev => {
      const exists = prev.find(r => r.student_name === name && r.day_of_week === day);
      if (exists) {
        return prev.map(r => (r.student_name === name && r.day_of_week === day) ? { ...r, [field]: value } : r);
      }
      return [...prev, { student_name: name, day_of_week: day, [field]: value }];
    });

    setIsSaving(true);
    try {
      const existing = records.find(r => r.student_name === name && r.day_of_week === day);
      const { error } = await supabase.from('study_records').upsert({
        student_name: name,
        day_of_week: day,
        password: existing?.password || "0000",
        is_late: field === 'is_late' ? value : (existing?.is_late ?? false),
        am_3h: field === 'am_3h' ? value : (existing?.am_3h ?? false),
        study_time: field === 'study_time' ? value : (existing?.study_time ?? '0:00'),
        off_type: field === 'off_type' ? value : (existing?.off_type ?? '-'),
        monthly_off_count: field === 'monthly_off_count' ? value : (existing?.monthly_off_count ?? 4)
      }, { onConflict: 'student_name,day_of_week' });
      
      if (error) throw error;
    } catch (err) {
      console.error("저장 실패:", err);
      fetchRecords(); // 오류 시 롤백
    } finally {
      setIsSaving(false);
    }
  };

  const calc = (r: any) => {
    if (!r || (!r.study_time && !r.off_type) || (r.study_time === '0:00' && (r.off_type === '-' || !r.off_type))) return { penalty: 0, bonus: 0, total: 0, studyH: 0 };
    if (r.off_type === '결석') return { penalty: -5, bonus: 0, total: -5, studyH: 0 };
    const [h, m] = (r.study_time || "0:00").split(':').map(Number);
    const studyH = (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
    let penalty = 0, bonus = 0;
    const isHalfOff = ['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(r.off_type);
    const isFullOff = ['주휴', '월휴', '자율', '늦휴', '늦월휴'].includes(r.off_type);
    if (['늦반휴', '늦휴', '늦월반휴', '늦월휴'].includes(r.off_type)) penalty -= 1;
    if (r.is_late === true && !isFullOff) penalty -= 1;
    if (!isFullOff && !isHalfOff && r.off_type !== '자율' && r.off_type !== '-' && r.am_3h === false) { if (studyH > 0) penalty -= 1; }
    if (!isFullOff && r.off_type !== '자율' && r.off_type !== '-') {
      const target = isHalfOff ? 4 : 9;
      if (studyH < target && studyH > 0) penalty -= Math.ceil((target - studyH) - 0.001);
      else if (studyH >= target && !isHalfOff) bonus += Math.floor(studyH - target);
    }
    return { penalty: Math.max(penalty, -5), bonus, total: Math.max(penalty, -5) + bonus, studyH };
  };

  const houseRankings = useMemo(() => {
    return HOUSE_ORDER.map(house => {
      const students = Object.keys(studentData).filter(n => studentData[n].house === house);
      let totalScore = 0, totalStudyH = 0;
      students.forEach(name => {
        DAYS.forEach(day => {
          const res = calc(records.find(r => r.student_name === name && r.day_of_week === day));
          totalScore += res.total; totalStudyH += res.studyH;
        });
      });
      const count = students.length || 1;
      return { house, finalPoint: (totalScore / count) + Math.floor(totalStudyH / count) };
    }).sort((a, b) => b.finalPoint - a.finalPoint);
  }, [records]);

  const sortedNames = useMemo(() => {
    const all = Object.keys(studentData).sort((a,b) => a.localeCompare(b, 'ko'));
    if (!isAdmin) return [selectedName];
    return [...all].sort((a, b) => {
      const hA = studentData[a].house, hB = studentData[b].house;
      if (hA !== hB) return HOUSE_ORDER.indexOf(hA) - HOUSE_ORDER.indexOf(hB);
      return a.localeCompare(b, 'ko');
    });
  }, [isAdmin, selectedName]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>
          <h1 className="text-4xl font-serif font-black text-center mb-10 text-slate-800 italic">Hogwarts</h1>
          <div className="space-y-6">
            <select className="w-full p-5 border-2 rounded-2xl font-bold bg-slate-50 outline-none text-slate-800" value={selectedName} onChange={(e)=>setSelectedName(e.target.value)}>
              <option value="">이름을 선택하세요.</option>
              {Object.keys(studentData).sort((a,b)=>a.localeCompare(b,'ko')).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input type="password" placeholder="비밀번호" className="w-full p-5 border-2 rounded-2xl font-bold bg-slate-50 text-slate-800 outline-none" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full bg-slate-900 text-yellow-500 py-5 rounded-2xl font-black text-xl">ENTER</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-2 md:p-4 pb-16">
      <div className="max-w-[1100px] mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-black text-slate-800 italic">Hogwarts House Cup</h2>
          <button onClick={handleLogout} className="text-[10px] font-black text-slate-400 bg-white border-2 px-4 py-2 rounded-full">LOGOUT</button>
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {houseRankings.map((item, index) => {
            const config = (HOUSE_CONFIG as any)[item.house];
            return (
              <div key={item.house} className={`${config.bg} ${config.border} border-b-4 md:border-b-8 p-3 md:p-5 rounded-2xl text-white shadow-xl`}>
                <div className="text-[8px] md:text-xs font-black uppercase mb-1">{index+1}ST {item.house}</div>
                <div className="text-sm md:text-3xl font-black">{item.finalPoint.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-4 px-6 flex justify-between items-center">
          <span className="text-[10px] md:text-xs font-black text-yellow-500 uppercase tracking-widest">
            {isAdmin ? "Headmaster Console" : `${selectedName} Wizard Info`}
          </span>
          {isSaving && <div className="text-[9px] text-yellow-500 font-bold animate-pulse">SAVING...</div>}
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="min-w-[800px] w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-black text-[11px] border-b-2">
                <th className="w-28 p-2 sticky left-0 bg-slate-50 z-20 border-r">Wizard</th>
                <th className="w-16 p-2 border-r">Field</th>
                {DAYS.map(d => <th key={d} className="w-14 p-2 text-slate-900">{d}</th>)}
                <th className="w-20 p-2 bg-slate-50 border-l text-[10px]">총시간</th>
                <th className="w-20 p-2 bg-slate-50 border-l text-[10px]">월휴</th>
              </tr>
            </thead>
            <tbody>
              {sortedNames.map(name => {
                const info = studentData[name];
                const monRec = records.find(r => r.student_name === name && r.day_of_week === '월') || {};
                const offCount = (monRec.monthly_off_count === undefined || monRec.monthly_off_count === null) ? 4 : monRec.monthly_off_count;
                const rows = [{l:'휴무',f:'off_type'},{l:'지각',f:'is_late'},{l:'오전3H',f:'am_3h'},{l:'공부시간',f:'study_time'},{l:'벌점',f:'penalty'},{l:'상점',f:'bonus'},{l:'총점',f:'total'}];
                
                return (
                  <React.Fragment key={name}>
                    {rows.map((row, rIdx) => (
                      <tr key={row.l} className={`${rIdx === 6 ? "border-b-[6px] border-slate-100" : "border-b border-slate-50"}`}>
                        {rIdx === 0 && (
                          <td rowSpan={7} className={`p-4 text-center sticky left-0 z-20 font-bold border-r-[3px] shadow-lg ${info.color} ${info.text}`}>
                            <div className="text-2xl">{info.emoji}</div>
                            <div className="text-xs font-black">{name}</div>
                          </td>
                        )}
                        <td className="p-2 text-center font-black border-r bg-white text-slate-800 text-[10px]">{row.l}</td>
                        {DAYS.map(day => {
                          const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
                          const res = calc(rec);
                          return (
                            <td key={day} className="p-1 border-r border-slate-50 text-center">
                              {row.f === 'off_type' ? (
                                <select className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-[10px]" value={rec.off_type || '-'} onChange={(e) => handleChange(name, day, 'off_type', e.target.value)} disabled={!isAdmin}>
                                  {OFF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              ) : (row.f === 'is_late' || row.f === 'am_3h') ? (
                                <input type="checkbox" className="w-4 h-4 mx-auto block cursor-pointer" checked={!!rec[row.f]} onChange={(e) => handleChange(name, day, row.f, e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'study_time' ? (
                                <input type="text" className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-xs" 
                                  value={rec.study_time || ''} 
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setRecords(prev => prev.map(r => (r.student_name === name && r.day_of_week === day) ? { ...r, study_time: v } : r));
                                  }} 
                                  onBlur={(e) => handleChange(name, day, 'study_time', e.target.value || '0:00')}
                                  disabled={!isAdmin} 
                                />
                              ) : <span className="text-[11px] font-black">{res[row.f as keyof typeof res]}</span>}
                            </td>
                          );
                        })}
                        <td className="bg-slate-50 text-center font-black text-[11px] border-l">
                          {row.f === 'study_time' ? (()=>{
                            let tm = 0; records.filter(r=>r.student_name===name).forEach(r=>{const[h,m]=(r.study_time||"0:00").split(':').map(Number);tm+=(isNaN(h)?0:h*60)+(isNaN(m)?0:m);});
                            return `${Math.floor(tm/60)}:${(tm%60).toString().padStart(2,'0')}`;
                          })() : ""}
                        </td>
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-2 bg-white border-l text-center">
                            <div className={`flex flex-col gap-1 items-center ${isAdmin ? 'cursor-pointer' : ''}`} onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', offCount > 0 ? offCount - 1 : 0)}>
                              {[1, 2, 3, 4].map((n) => (
                                <div key={n} className={`w-6 h-3 rounded-sm border ${offCount >= (5-n) ? info.accent : 'bg-slate-50 border-slate-200'}`} />
                              ))}
                            </div>
                            {isAdmin && <button onClick={(e) => { e.stopPropagation(); handleChange(name, '월', 'monthly_off_count', 4); }} className="mt-2 text-[8px] bg-slate-100 p-1 px-2 rounded-full">RESET</button>}
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
