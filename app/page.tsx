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
  "슬리데린": { bg: "bg-emerald-600", icon: "🐍" },
  "래번클로": { bg: "bg-blue-700", icon: "🦅" },
  "그리핀도르": { bg: "bg-red-700", icon: "🦁" },
  "후플푸프": { bg: "bg-amber-500", icon: "🦡" }
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

  useEffect(() => {
    const saved = sessionStorage.getItem('hg_session_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedName(parsed.name); setIsAdmin(parsed.admin); setIsLoggedIn(true);
    }
  }, []);

  const fetchRecords = async () => {
    const { data } = await supabase.from('study_records').select('*');
    if (data) setRecords(data);
  };

  useEffect(() => { if (isLoggedIn) fetchRecords(); }, [isLoggedIn]);

  const calc = (r: any) => {
    if (!r) return { penalty: 0, bonus: 0, total: 0, studyH: 0 };
    const timeVal = r.study_time || "";
    const [h, m] = timeVal.split(':').map(Number);
    const studyH = (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
    let penalty = 0, bonus = 0;

    const isHalfOff = ['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(r.off_type);
    const isFullOff = ['주휴', '월휴', '자율', '늦휴', '늦월휴'].includes(r.off_type);

    if (r.off_type === '결석') return { penalty: -5, bonus: 0, total: -5, studyH: 0 };
    if (['늦반휴', '늦휴', '늦월반휴', '늦월휴'].includes(r.off_type)) penalty -= 1;
    if (r.is_late && !isFullOff) penalty -= 1;
    
    // 오전 3시간 미체크 벌점 (일반 상황에서만)
    if (r.off_type === '-' && r.am_3h === false && studyH > 0) penalty -= 1;

    if (!isFullOff && r.off_type !== '자율') {
      const target = isHalfOff ? 4 : 9;
      if (studyH < target && studyH > 0) penalty -= Math.ceil(target - studyH);
      else if (studyH >= target + 1 && !isHalfOff) bonus += Math.floor(studyH - target);
    }
    return { penalty: Math.max(penalty, -5), bonus, total: Math.max(penalty, -5) + bonus, studyH };
  };

  const houseRankings = useMemo(() => {
    return HOUSE_ORDER.map(house => {
      const students = Object.keys(studentData).filter(n => studentData[n].house === house);
      let tScore = 0, tH = 0;
      students.forEach(name => {
        DAYS.forEach(day => {
          const res = calc(records.find(r => r.student_name === name && r.day_of_week === day));
          tScore += res.total; tH += res.studyH;
        });
      });
      return { house, finalPoint: (tScore / (students.length || 1)) + Math.floor(tH / (students.length || 1)) };
    }).sort((a, b) => b.finalPoint - a.finalPoint);
  }, [records]);

  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin) return;
    setRecords(prev => {
      const existing = prev.find(r => r.student_name === name && r.day_of_week === day);
      if (existing) return prev.map(r => (r.student_name === name && r.day_of_week === day) ? { ...r, [field]: value } : r);
      return [...prev, { student_name: name, day_of_week: day, [field]: value, password: '0000' }];
    });
    setIsSaving(true);
    try {
      const current = records.find(r => r.student_name === name && r.day_of_week === day) || {};
      await supabase.from('study_records').upsert({
        student_name: name, day_of_week: day,
        password: current.password || '0000',
        is_late: field === 'is_late' ? value : (current.is_late ?? false),
        am_3h: field === 'am_3h' ? value : (current.am_3h ?? false),
        study_time: field === 'study_time' ? value : (current.study_time ?? ''),
        off_type: field === 'off_type' ? value : (current.off_type ?? '-'),
        monthly_off_count: field === 'monthly_off_count' ? value : (current.monthly_off_count ?? 4)
      }, { onConflict: 'student_name,day_of_week' });
    } catch (e) { fetchRecords(); } finally { setIsSaving(false); }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
          <h1 className="text-3xl font-black text-center mb-8 text-slate-800 italic uppercase">Hogwarts</h1>
          <select className="w-full p-4 border-2 rounded-xl mb-4 font-bold" value={selectedName} onChange={e => setSelectedName(e.target.value)}>
            <option value="">이름 선택</option>
            {Object.keys(studentData).sort().map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <input type="password" placeholder="PASSWORD" className="w-full p-4 border-2 rounded-xl mb-6 font-bold" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && (async () => {
             let admin = password === "8888";
             if(!admin) {
               const { data } = await supabase.from('study_records').select('password').eq('student_name', selectedName);
               if(password !== (data?.find(r=>r.password && r.password !== "0000")?.password || "0000")) { alert("비밀번호 오류"); return; }
             }
             setIsAdmin(admin); setIsLoggedIn(true); sessionStorage.setItem('hg_session_v4', JSON.stringify({ name: selectedName, admin }));
          })()} />
          <button onClick={async () => {
             let admin = password === "8888";
             if(!admin) {
               const { data } = await supabase.from('study_records').select('password').eq('student_name', selectedName);
               if(password !== (data?.find(r=>r.password && r.password !== "0000")?.password || "0000")) { alert("비밀번호 오류"); return; }
             }
             setIsAdmin(admin); setIsLoggedIn(true); sessionStorage.setItem('hg_session_v4', JSON.stringify({ name: selectedName, admin }));
          }} className="w-full bg-slate-900 text-yellow-500 py-4 rounded-xl font-black uppercase">Enter Castle</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-2 md:p-4 pb-16">
      <div className="max-w-[1100px] mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 italic">House Cup</h2>
          <button onClick={() => { sessionStorage.clear(); window.location.reload(); }} className="text-[10px] font-black text-slate-400 bg-white border px-3 py-1.5 rounded-full">LOGOUT</button>
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {houseRankings.map((h) => (
            <div key={h.house} className={`${(HOUSE_CONFIG as any)[h.house].bg} p-3 md:p-5 rounded-2xl text-white shadow-lg border-b-4 border-black/20 relative overflow-hidden`}>
              <div className="absolute right-[-10px] bottom-[-10px] text-5xl opacity-20">{(HOUSE_CONFIG as any)[h.house].icon}</div>
              <div className="text-[9px] font-black uppercase mb-1 opacity-80">{h.house} {(HOUSE_CONFIG as any)[h.house].icon}</div>
              <div className="text-lg md:text-3xl font-black">{h.finalPoint.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-slate-300">
        <div className="bg-slate-900 p-4 px-6 flex justify-between items-center text-white">
          <span className="text-xs font-black uppercase tracking-widest">{isAdmin ? "Headmaster Console" : `${selectedName} Info`}</span>
          {isSaving && <span className="text-[10px] text-yellow-500 font-bold animate-pulse uppercase">Recording...</span>}
        </div>

        <div className="w-full overflow-x-auto">
          <table className="min-w-[850px] w-full table-fixed border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-black text-slate-600 uppercase">
                <th className="w-24 p-3 sticky left-0 bg-slate-100 z-20 border border-slate-300">Wizard</th>
                <th className="w-16 border border-slate-300">Field</th>
                {DAYS.map(d => <th key={d} className="w-14 text-slate-900 border border-slate-300">{d}</th>)}
                <th className="w-20 bg-slate-200 border border-slate-300">Total</th>
                <th className="w-20 bg-slate-200 border border-slate-300">잔여월휴</th>
              </tr>
            </thead>
            <tbody>
              {(isAdmin ? Object.keys(studentData).sort((a, b) => HOUSE_ORDER.indexOf(studentData[a].house) - HOUSE_ORDER.indexOf(studentData[b].house)) : [selectedName]).map(name => {
                const info = studentData[name];
                const monRec = records.find(r => r.student_name === name && r.day_of_week === '월') || {};
                const offCount = monRec.monthly_off_count ?? 4;
                const rows = [{ l: '휴무', f: 'off_type' }, { l: '지각', f: 'is_late' }, { l: '오전3H', f: 'am_3h' }, { l: '공부시간', f: 'study_time' }, { l: '벌점', f: 'penalty' }, { l: '상점', f: 'bonus' }, { l: '총점', f: 'total' }];

                return (
                  <React.Fragment key={name}>
                    {rows.map((row, rIdx) => (
                      <tr key={row.l} className="border-b border-slate-300">
                        {rIdx === 0 && (
                          <td rowSpan={7} className={`p-4 text-center sticky left-0 z-20 font-bold border-r border-slate-300 ${info.color} ${info.text}`}>
                            <div className="text-2xl mb-1">{info.emoji}</div>
                            <div className="text-[11px] font-black">{name}</div>
                          </td>
                        )}
                        <td className="text-center font-black bg-slate-50 border border-slate-300 text-[10px] text-slate-500">{row.l}</td>
                        {DAYS.map(day => {
                          const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
                          const res = calc(rec);
                          const getOffColor = (val: string) => {
                            if (['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(val)) return 'bg-orange-100 text-orange-700';
                            if (['주휴', '월휴', '자율', '늦휴', '늦월휴'].includes(val)) return 'bg-blue-100 text-blue-700';
                            if (val === '결석') return 'bg-red-100 text-red-700';
                            return '';
                          };
                          return (
                            <td key={day} className={`p-1 border border-slate-300 text-center ${row.f === 'off_type' ? getOffColor(rec.off_type || '-') : ''}`}>
                              {row.f === 'off_type' ? (
                                <select className="w-full text-center bg-transparent font-black text-[10px] outline-none" value={rec.off_type || '-'} onChange={e => handleChange(name, day, 'off_type', e.target.value)} disabled={!isAdmin}>
                                  {OFF_OPTIONS.map(v => <option key={v} value={v} className="bg-white text-slate-800">{v}</option>)}
                                </select>
                              ) : (row.f === 'is_late' || row.f === 'am_3h') ? (
                                <input type="checkbox" className="w-4 h-4 mx-auto block cursor-pointer accent-slate-800" checked={!!rec[row.f]} onChange={e => handleChange(name, day, row.f, e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'study_time' ? (
                                <input type="text" className="w-full text-center bg-transparent font-black text-xs outline-none" value={rec.study_time || ''} onChange={e => setRecords(prev => prev.map(r => (r.student_name === name && r.day_of_week === day) ? { ...r, study_time: e.target.value } : r))} onBlur={e => handleChange(name, day, 'study_time', e.target.value)} disabled={!isAdmin} />
                              ) : (
                                <span className={`text-[11px] font-black ${row.f === 'penalty' && res.penalty < 0 ? 'text-red-500' : row.f === 'bonus' && res.bonus > 0 ? 'text-blue-600' : 'text-slate-800'}`}>
                                  {res[row.f as keyof typeof res] === 0 ? (row.f === 'total' ? 0 : '') : res[row.f as keyof typeof res]}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="bg-slate-50 text-center font-black text-[11px] border border-slate-300">
                          {row.f === 'study_time' ? (()=>{
                            let tm = 0; records.filter(r=>r.student_name===name).forEach(r=>{const[h,m]=(r.study_time||"").split(':').map(Number);tm+=(isNaN(h)?0:h*60)+(isNaN(m)?0:m);});
                            return tm > 0 ? `${Math.floor(tm/60)}:${(tm%60).toString().padStart(2,'0')}` : "";
                          })() : ""}
                        </td>
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-2 bg-white border border-slate-300 text-center">
                            <div className={`flex flex-col gap-1 items-center ${isAdmin ? 'cursor-pointer' : ''}`} onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', offCount > 0 ? offCount - 1 : 0)}>
                              {[1, 2, 3, 4].map((n) => (
                                <div key={n} className={`w-6 h-3 rounded-sm border ${offCount >= (5-n) ? info.accent : 'bg-slate-50 border-slate-200'}`} />
                              ))}
                            </div>
                            {isAdmin && <button onClick={(e) => { e.stopPropagation(); handleChange(name, '월', 'monthly_off_count', 4); }} className="mt-2 text-[8px] bg-slate-100 p-1 px-2 rounded-full font-black border">RESET</button>}
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
