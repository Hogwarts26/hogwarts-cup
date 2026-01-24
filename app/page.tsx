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

const sortKorean = (a: string, b: string) => {
  const cleanA = a.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
  const cleanB = b.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
  return cleanA.localeCompare(cleanB, 'ko');
};

export default function HogwartsApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRecords = async () => {
    const { data } = await supabase.from('study_records').select('*');
    if (data) setRecords(data);
  };

  useEffect(() => { if (isLoggedIn) fetchRecords(); }, [isLoggedIn]);

  const handleLogin = async () => {
    if (password === "8888") { setIsAdmin(true); setIsLoggedIn(true); return; }
    if (!selectedName) { alert("이름을 선택해주세요."); return; }
    
    const { data } = await supabase.from('study_records').select('password').eq('student_name', selectedName);
    
    if (!data || data.length === 0) {
      if (password === "0000") {
        setIsAdmin(false);
        setIsLoggedIn(true);
      } else {
        alert("비밀번호가 일치하지 않습니다. (초기 비번 0000)");
      }
      return;
    }

    const customPw = data.find(r => r.password && r.password !== "0000")?.password;
    const finalValidPw = customPw || "0000";

    if (password === finalValidPw) {
      setIsAdmin(false);
      setIsLoggedIn(true);
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const changePassword = async () => {
    const newPw = prompt("새로운 4자리 숫자를 입력하세요.");
    if (!newPw || newPw.length !== 4 || isNaN(Number(newPw))) { 
      alert("4자리 숫자로 입력해주세요."); 
      return; 
    }
    
    setIsSaving(true);
    try {
      const { data: existing } = await supabase
        .from('study_records')
        .select('id')
        .eq('student_name', selectedName);

      if (!existing || existing.length === 0) {
        // [수정 포인트] id를 아예 제외하고 insert하여 DB가 gen_random_uuid()를 수행하게 함
        const { error: insError } = await supabase
          .from('study_records')
          .insert([{ 
            student_name: selectedName, 
            day_of_week: '월', 
            password: newPw, 
            study_time: '0:00' 
          }]);
        if (insError) throw insError;
      } else {
        const { error: updError } = await supabase
          .from('study_records')
          .update({ password: newPw })
          .eq('student_name', selectedName);
        if (updError) throw updError;
      }

      alert(`비밀번호가 [${newPw}]로 변경되었습니다.\n다시 로그인해주세요!`);
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("변경 실패: Supabase 연결 또는 id 컬럼 설정을 확인해주세요.");
    }
    setIsSaving(false);
  };

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

  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin) return;
    setIsSaving(true);
    const existing = records.find(r => r.student_name === name && r.day_of_week === day);
    const latestPw = records.filter(r => r.student_name === name).find(r => r.password && r.password !== "0000")?.password || "0000";
    
    const updatedData = { 
      ...(existing || { student_name: name, day_of_week: day, password: latestPw }), 
      [field]: value 
    };
    await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });
    fetchRecords();
    setIsSaving(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>
          <h1 className="text-4xl font-serif font-black text-center mb-10 text-slate-800 italic">Hogwarts</h1>
          <div className="space-y-6">
            <select className="w-full p-5 border-2 rounded-2xl font-bold bg-slate-50 outline-none text-slate-800" value={selectedName} onChange={(e)=>setSelectedName(e.target.value)}>
              <option value="">이름을 선택하세요.</option>
              {Object.keys(studentData).sort(sortKorean).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input type="password" placeholder="비밀번호 입력" className="w-full p-5 border-2 rounded-2xl font-bold bg-slate-50 outline-none text-slate-800" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full bg-slate-900 text-yellow-500 py-5 rounded-2xl font-black text-xl uppercase">Enter Castle</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-2 md:p-4 pb-16">
      <div className="max-w-[1100px] mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-800 italic">Hogwarts House Cup</h2>
          <button onClick={() => window.location.reload()} className="text-[10px] md:text-xs font-black text-slate-400 bg-white border-2 px-4 py-2 rounded-full">LOGOUT</button>
        </div>
        
        <div className="grid grid-cols-4 gap-1.5 md:gap-4">
          {houseRankings.map((item, index) => {
            const config = (HOUSE_CONFIG as any)[item.house];
            return (
              <div key={item.house} className={`${config.bg} ${config.border} border-b-4 md:border-b-8 p-1.5 md:p-5 rounded-xl md:rounded-[2rem] text-white shadow-xl transform ${index === 0 ? 'scale-105 ring-4 ring-yellow-400/50' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between items-start mb-0.5 md:mb-2">
                  <span className="text-[7px] md:text-xs font-black opacity-90 uppercase">{index + 1}st {item.house}</span>
                  <span className="text-xs md:text-2xl">{index === 0 ? '🏆' : config.icon}</span>
                </div>
                <div className="text-[11px] md:text-4xl font-black">{item.finalPoint.toFixed(1)}<span className="text-[6px] md:text-sm ml-1 opacity-80 uppercase">pts</span></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-4 px-6 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-[10px] md:text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
              {isAdmin ? "Headmaster Console" : currentTime.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              {!isAdmin && <span className="ml-2 text-white">{currentTime.toLocaleTimeString('ko-KR', { hour12: false })}</span>}
            </span>
            {!isAdmin && (
              <button onClick={changePassword} className="text-[9px] font-black bg-slate-700 text-slate-300 px-2 py-1 rounded hover:text-white">비밀번호 변경</button>
            )}
          </div>
          {isSaving && <div className="text-[9px] text-yellow-500 font-bold animate-bounce uppercase">Saving...</div>}
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="min-w-[800px] w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-black text-[11px] border-b-2">
                <th className="w-28 p-2 sticky left-0 bg-slate-50 z-20 border-r">Witch/Wizard</th>
                <th className="w-16 p-2 border-r">Field</th>
                {DAYS.map(d => <th key={d} className="w-14 p-2 text-slate-900">{d}</th>)}
                <th className="w-20 p-2 bg-slate-100 text-slate-900 text-center text-[10px]">총 시간</th>
                <th className="w-16 p-2 bg-slate-100 border-l text-[10px]">잔여월휴</th>
              </tr>
            </thead>
            <tbody>
              {(isAdmin ? Object.keys(studentData).sort(sortKorean) : [selectedName]).map(name => {
                const info = studentData[name];
                const monRec = records.find(r => r.student_name === name && r.day_of_week === '월') || {};
                const offCount = monRec.monthly_off_count === undefined ? 4 : monRec.monthly_off_count;
                const rows = [{l:'휴무',f:'off_type'},{l:'지각',f:'is_late'},{l:'오전3H',f:'am_3h'},{l:'공부시간',f:'study_time'},{l:'벌점',f:'penalty'},{l:'상점',f:'bonus'},{l:'총점',f:'total'}];
                return (
                  <React.Fragment key={name}>
                    {rows.map((row, rIdx) => (
                      <tr key={row.l} className={`${rIdx === 6 ? "border-b-[6px] border-slate-100" : "border-b border-slate-50"}`}>
                        {rIdx === 0 && (
                          <td rowSpan={7} className={`p-4 text-center sticky left-0 z-20 font-bold border-r-[3px] shadow-lg ${info.color} ${info.text}`}>
                            <div className="text-3xl mb-1">{info.emoji}</div>
                            <div className="text-sm font-black mb-1">{name}</div>
                            <div className="text-[9px] font-black opacity-70 uppercase">{info.house}</div>
                          </td>
                        )}
                        <td className="p-2 text-center font-black border-r bg-white text-slate-800 text-[11px]">{row.l}</td>
                        {DAYS.map(day => {
                          const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
                          const res = calc(rec);
                          let cellBg = row.f === 'off_type' ? (['반휴','월반휴','늦반휴','늦월반휴'].includes(rec.off_type)?'bg-green-100':['주휴','월휴','자율','늦휴','늦월휴'].includes(rec.off_type)?'bg-blue-100':rec.off_type==='결석'?'bg-red-100':'') : '';
                          return (
                            <td key={day} className={`p-1.5 text-center border-r border-slate-50 ${cellBg}`}>
                              {row.f === 'off_type' ? (
                                <select className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-[10px]" value={rec.off_type || '-'} onChange={(e) => handleChange(name, day, 'off_type', e.target.value)} disabled={!isAdmin}>
                                  {OFF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              ) : (row.f === 'is_late' || row.f === 'am_3h') ? (
                                <input type="checkbox" className="w-5 h-5 accent-slate-800 mx-auto block" checked={!!rec[row.f]} onChange={(e) => handleChange(name, day, row.f, e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'study_time' ? (
                                <input type="text" className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-sm" value={rec.study_time || '0:00'} onBlur={(e) => handleChange(name, day, 'study_time', e.target.value)} disabled={!isAdmin} />
                              ) : (
                                <span className={`font-black text-sm ${row.f === 'penalty' ? 'text-red-500' : row.f === 'bonus' ? 'text-blue-600' : 'text-slate-900'}`}>{res[row.f as keyof typeof res]}</span>
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
                                <div key={n} onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', offCount >= (5-n) ? (5-n)-1 : offCount)} className={`w-7 h-5 rounded-md border-2 ${isAdmin ? 'cursor-pointer' : ''} ${offCount >= (5-n) ? info.accent : 'bg-slate-50 border-slate-200'}`} />
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
    </div>
  );
}
