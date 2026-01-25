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
  "Rex🦖공룡": { house: "후플푸프", emoji: "🦖", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐿️다람": { house: "후플푸프", emoji: "🐿️", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" }
};

const HOUSE_ORDER = ["슬리데린", "래번클로", "그리핀도르", "후플푸프"];
const HOUSE_CONFIG = {
  "슬리데린": { bg: "bg-emerald-600", border: "border-emerald-700", icon: "🐍", accent: "bg-emerald-400" },
  "래번클로": { bg: "bg-blue-700", border: "border-blue-800", icon: "🦅", accent: "bg-blue-400" },
  "그리핀도르": { bg: "bg-red-700", border: "border-red-800", icon: "🦁", accent: "bg-red-400" },
  "후플푸프": { bg: "bg-amber-500", border: "border-amber-600", icon: "🦡", accent: "bg-amber-300" }
};

const HOUSE_NOTICES: { [key: string]: { title: string, content: string } } = {
  "래번클로": {
    title: "지적인 도약과 <이러쿵저러쿵> 특별 부록 안내",
    content: `래번클로 학생 여러분, 이번 주 우리 기숙사는 62점으로 2위를 기록했습니다. 비록 1위는 놓쳤지만, 플리트윅 교수님께서는 우리가 마법 수업에서 보여준 창의적인 주문 운용과 완벽한 이론 해석을 매우 높게 평가하셨습니다...`
  },
  "그리핀도르": {
    title: "잃어버린 용기를 찾아서, 그리고 안전 점검 안내",
    content: `그리핀도르 학우 여러분, 이번 주 53점이라는 성적은 분명 아쉽습니다. 하지만 네빌 롱보텀 교수님께서는 점수보다 우리가 숲 근처에서 위험에 처한 하급생을 도와준 그 용기를 더 자랑스러워하셨습니다...`
  },
  "슬리데린": {
    title: "영광과 슬러그 클럽 후보자 선출",
    content: `슬리데린의 자부심을 드높인 학우 여러분, 70점이라는 압도적인 점수로 주간 우승을 차지한 것을 축하합니다!...`
  },
  "후플푸프": {
    title: "성실함과 주방의 친절 릴레이",
    content: `친애하는 후플푸프 학우 여러분! 이번 주 우리는 64점을 기록하며 2위에 올랐습니다. 우수 기숙사인 슬리데린과 아주 근소한 차이였죠!...`
  }
};

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const OFF_OPTIONS = ['-', '출석', '반휴', '주휴', '월휴', '월반휴', '자율', '결석', '늦반휴', '늦휴', '늦월반휴', '늦월휴'];

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
  const [selectedHouseNotice, setSelectedHouseNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const saved = localStorage.getItem('hg_auth');
    if (saved) {
      const { name, admin } = JSON.parse(saved);
      setSelectedName(name); setIsAdmin(admin); setIsLoggedIn(true);
    }
    return () => clearInterval(timer);
  }, []);

  const fetchRecords = async () => {
    const { data } = await supabase.from('study_records').select('*');
    if (data) setRecords(data);
  };

  useEffect(() => { if (isLoggedIn) fetchRecords(); }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!selectedName) { alert("이름을 선택하세요"); return; }
    let admin = password === "8888";
    if (!admin) {
      const { data } = await supabase.from('study_records').select('password').eq('student_name', selectedName);
      const validPw = data?.find(r => r.password)?.password || "0000";
      if (password !== validPw) { alert("비밀번호가 틀렸습니다."); return; }
    }
    setIsAdmin(admin); setIsLoggedIn(true);
    localStorage.setItem('hg_auth', JSON.stringify({ name: selectedName, admin }));
  };

  const resetWeeklyData = async () => {
    if (!confirm("⚠️ 주의: 모든 학생의 이번 주 공부 기록을 초기화하시겠습니까?")) return;
    setIsSaving(true);
    const names = Object.keys(studentData);
    const resetData = [];
    for (const name of names) {
      for (const day of DAYS) {
        const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
        resetData.push({
          student_name: name, day_of_week: day, off_type: '-', is_late: false, am_3h: false, study_time: '',
          password: existing.password || '0000', monthly_off_count: existing.monthly_off_count ?? 4
        });
      }
    }
    const { error } = await supabase.from('study_records').upsert(resetData, { onConflict: 'student_name,day_of_week' });
    if (!error) { setRecords(resetData); alert("✅ 초기화되었습니다."); }
    setIsSaving(false);
  };

  const calc = (r: any) => {
    if (!r) return { penalty: 0, bonus: 0, total: 0, studyH: 0 };
    if (r.off_type === '결석') return { penalty: -5, bonus: 0, total: -5, studyH: 0 };
    const timeVal = r.study_time || "";
    const [h, m] = timeVal.split(':').map(Number);
    const studyH = (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
    let penalty = 0, bonus = 0;
    const isHalfOff = ['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(r.off_type);
    const isFullOff = ['주휴', '월휴', '자율', '늦휴', '늦월휴'].includes(r.off_type);
    if (['늦반휴', '늦휴', '늦월반휴', '늦월휴'].includes(r.off_type)) penalty -= 1;
    if (r.is_late && !isFullOff) penalty -= 1;
    if ((r.off_type === '-' || r.off_type === '출석') && r.am_3h === false && studyH > 0) penalty -= 1;
    if (!isFullOff && r.off_type !== '자율' && studyH > 0) {
      const target = isHalfOff ? 4 : 9;
      if (studyH < target) penalty -= Math.ceil(target - studyH);
      else if (!isHalfOff && studyH >= target + 1) bonus += Math.floor(studyH - target);
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
      const avg = students.length > 0 ? (tScore / students.length) + Math.floor(tH / students.length) : 0;
      return { house, finalPoint: avg };
    }).sort((a, b) => b.finalPoint - a.finalPoint);
  }, [records]);

  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin && field !== 'password') return;
    setIsSaving(true);
    if (field === 'password') {
      const { error } = await supabase.from('study_records').upsert(
        DAYS.map(d => ({ student_name: name, day_of_week: d, password: value })),
        { onConflict: 'student_name,day_of_week' }
      );
      if (!error) { setRecords(prev => prev.map(r => r.student_name === name ? { ...r, password: value } : r)); alert("비밀번호가 변경되었습니다."); }
    } else {
      const newRecords = [...records];
      const idx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === day);
      const current = newRecords[idx] || {};
      const updatedData = { 
        student_name: name, day_of_week: day, [field]: value, 
        password: current.password || '0000', 
        monthly_off_count: field === 'monthly_off_count' ? value : (current.monthly_off_count ?? 4)
      };
      if (field === 'monthly_off_count') {
        setRecords(prev => prev.map(r => r.student_name === name ? { ...r, monthly_off_count: value } : r));
        await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });
      } else if (idx > -1) {
        newRecords[idx] = { ...newRecords[idx], ...updatedData };
        setRecords(newRecords);
        await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });
      } else {
        newRecords.push(updatedData);
        setRecords(newRecords);
        await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });
      }
    }
    setIsSaving(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>
          <h1 className="text-4xl font-serif font-black text-center mb-10 text-slate-800 tracking-tighter italic uppercase">Hogwarts</h1>
          <div className="space-y-6">
            <select className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-sm" value={selectedName} onChange={(e)=>setSelectedName(e.target.value)}>
              <option value="">이름 선택</option>
              {Object.keys(studentData).sort(sortKorean).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input type="password" placeholder="PASSWORD" className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-sm" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full bg-slate-900 text-yellow-500 py-5 rounded-2xl font-black shadow-lg uppercase text-xl active:scale-95 transition-transform">Enter Castle</button>
          </div>
        </div>
      </div>
    );
  }

  const displayList = isAdmin 
    ? Object.keys(studentData).sort((a, b) => {
        const houseDiff = HOUSE_ORDER.indexOf(studentData[a].house) - HOUSE_ORDER.indexOf(studentData[b].house);
        return houseDiff !== 0 ? houseDiff : sortKorean(a, b);
      })
    : [selectedName];

  return (
    <div className="min-h-screen bg-stone-100 p-2 md:p-4 pb-16 font-sans relative">
      <style>{`
        @keyframes gold-glow { 0% { box-shadow: 0 0 5px #fbbf24; } 50% { box-shadow: 0 0 20px #fbbf24; } 100% { box-shadow: 0 0 5px #fbbf24; } }
        .rank-gold { animation: gold-glow 2s infinite; border: 3px solid #fbbf24 !important; }
        .rank-silver { border: 3px solid #e2e8f0 !important; }
      `}</style>

      {selectedHouseNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedHouseNotice(null)}>
          <div className="relative bg-[#f4e4bc] p-6 md:p-12 w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedHouseNotice(null)} className="absolute top-2 right-2 text-slate-800 p-2 text-2xl z-20">✕</button>
            <div className="relative z-10 font-serif flex flex-col overflow-hidden">
              <h3 className="text-xl md:text-3xl font-black text-[#4a3728] mb-4 text-center italic border-b border-[#4a3728]/20 pb-4">{(HOUSE_NOTICES[selectedHouseNotice] || {title:''}).title}</h3>
              <div className="overflow-y-auto pr-2">
                <div className="text-base md:text-lg leading-relaxed text-[#5d4037] whitespace-pre-wrap font-medium">{(HOUSE_NOTICES[selectedHouseNotice] || {content:''}).content}</div>
                <div className="mt-8 mb-4 text-right italic font-bold text-[#4a3728]/60">— Hogwarts School —</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-black text-slate-800 italic tracking-tight uppercase">Hogwarts House Cup</h2>
          <div className="flex gap-2">
            {isAdmin && <button onClick={resetWeeklyData} className="text-[10px] font-black text-white bg-red-600 px-3 py-1.5 rounded-full">WEEKLY RESET</button>}
            <button onClick={() => { localStorage.removeItem('hg_auth'); window.location.reload(); }} className="text-[10px] font-black text-slate-400 bg-white border-2 px-3 py-1.5 rounded-full">LOGOUT</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {houseRankings.map((item, idx) => {
            const config = (HOUSE_CONFIG as any)[item.house];
            const rankClass = idx === 0 ? "rank-gold" : idx === 1 ? "rank-silver" : "";
            return (
              <div key={item.house} onClick={() => setSelectedHouseNotice(item.house)} 
                   className={`${config.bg} ${config.border} ${rankClass} p-2 md:p-5 rounded-xl md:rounded-[2rem] text-white shadow-xl relative cursor-pointer active:scale-95 transition-all hover:brightness-110 overflow-visible`}>
                {/* 🐘 아이콘이 카드 밖으로 살짝 삐져나오게 수정 */}
                <div className="absolute -right-2 -bottom-2 text-4xl md:text-6xl opacity-30 select-none z-0 transform rotate-12">{config.icon}</div>
                <div className="relative z-10">
                  <div className="text-[8px] md:text-xs font-black uppercase mb-1 flex items-center gap-1">
                    {idx === 0 && "🏆"} {idx === 1 && "🥈"} {item.house}
                  </div>
                  <div className="text-xl md:text-4xl font-black tracking-tighter">{item.finalPoint.toFixed(1)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-4 px-6 md:px-8 flex justify-between items-center text-white">
          <span className="text-[10px] md:text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            {isAdmin ? "Headmaster Console" : currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </span>
          {isSaving && <div className="text-[9px] text-yellow-500 font-bold uppercase animate-bounce">Magic occurring...</div>}
        </div>

        <div className="w-full overflow-x-auto">
          <table className="min-w-[850px] w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-black text-[11px] border-b-2">
                <th className="w-28 p-2 sticky left-0 bg-slate-50 z-20 border-r">Witch/Wizard</th>
                <th className="w-20 p-2 border-r">Field</th>
                {DAYS.map(d => <th key={d} className="w-16 p-2 text-slate-900">{d}</th>)}
                <th className="w-24 p-2 bg-slate-100 text-[10px]">총 공부시간</th>
                <th className="w-16 p-2 bg-slate-100 border-l text-[10px]">잔여월휴</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map(name => {
                const info = studentData[name];
                const monRec = records.find(r => r.student_name === name && r.day_of_week === '월') || {};
                const offCount = monRec.monthly_off_count ?? 4;
                const rows = [{l:'휴무',f:'off_type'},{l:'지각',f:'is_late'},{l:'오전3H',f:'am_3h'},{l:'공부시간',f:'study_time'},{l:'벌점',f:'penalty'},{l:'상점',f:'bonus'},{l:'총점',f:'total'}];
                let totalTimeMinutes = 0;
                let totalPointsSum = 0;
                records.filter(r => r.student_name === name).forEach(r => {
                  const res = calc(r);
                  const [h, m] = (r.study_time || "").split(':').map(Number);
                  totalTimeMinutes += (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
                  totalPointsSum += res.total;
                });
                const emoji = name.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|[\u2000-\u3300]/g)?.[0] || "";
                const displayName = name.replace(emoji, "");

                return (
                  <React.Fragment key={name}>
                    {isAdmin && (
                      <tr className="bg-slate-100/50 border-t-2 border-slate-200">
                        <td className="sticky left-0 bg-slate-100/50 z-20 border-r"></td>
                        <td className="p-1 text-[8px] font-black text-slate-400 text-center border-r">DAYS</td>
                        {DAYS.map(d => <td key={d} className="p-1 text-[10px] font-black text-slate-500 text-center">{d}</td>)}
                        <td colSpan={2} className="border-l"></td>
                      </tr>
                    )}
                    {rows.map((row, rIdx) => (
                      <tr key={row.l} className={`${rIdx === 6 ? "border-b-[6px] border-slate-100" : "border-b border-slate-50"}`}>
                        {rIdx === 0 && (
                          <td rowSpan={7} className={`p-4 text-center sticky left-0 z-20 font-bold border-r-[3px] ${info.color} ${info.text}`}>
                            <div className="text-3xl mb-1">{emoji}</div>
                            <div className="leading-tight text-sm font-black mb-1 break-keep">{displayName}</div>
                            <div className="text-[9px] font-black opacity-70 uppercase mb-2">{info.house}</div>
                            <button onClick={async () => {
                              const newPw = prompt("새 비밀번호 입력 (4자리)");
                              if(newPw && newPw.length >= 4) await handleChange(name, '월', 'password', newPw);
                            }} className="text-[8px] underline opacity-40 hover:opacity-100 block mx-auto">PW 변경</button>
                          </td>
                        )}
                        <td className="p-2 text-center font-black border-r bg-white text-slate-800 text-[11px] leading-tight">{row.l}</td>
                        {DAYS.map(day => {
                          const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
                          const res = calc(rec);
                          const getCellBg = (val: string) => {
                            if (['반휴','월반휴','늦반휴','늦월반휴'].includes(val)) return 'bg-green-100';
                            if (['주휴','월휴','늦휴','늦월휴'].includes(val)) return 'bg-blue-100';
                            if (val === '결석') return 'bg-red-100';
                            return '';
                          };
                          return (
                            <td key={day} className={`p-1.5 text-center border-r border-slate-50 ${row.f === 'off_type' ? getCellBg(rec.off_type) : ''}`}>
                              {row.f === 'off_type' ? (
                                <select className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-[10px] cursor-pointer" value={rec.off_type || '-'} onChange={(e) => handleChange(name, day, 'off_type', e.target.value)} disabled={!isAdmin}>
                                  {OFF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              ) : (row.f === 'is_late' || row.f === 'am_3h') ? (
                                <input type="checkbox" className={`w-5 h-5 cursor-pointer mx-auto block`} checked={!!rec[row.f]} onChange={(e) => handleChange(name, day, row.f, e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'study_time' ? (
                                <input type="text" className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-sm placeholder-slate-200" placeholder="-" value={rec.study_time || ''} 
                                  onChange={(e) => setRecords(prev => prev.map(r => (r.student_name === name && r.day_of_week === day) ? {...r, study_time: e.target.value} : r))}
                                  onBlur={(e) => handleChange(name, day, 'study_time', e.target.value)} disabled={!isAdmin} />
                              ) : (
                                <span className={`font-black text-sm ${row.f === 'penalty' && res.penalty < 0 ? 'text-red-500' : row.f === 'bonus' && res.bonus > 0 ? 'text-blue-600' : 'text-slate-900'}`}>{res[row.f as keyof typeof res] || (row.f === 'total' ? 0 : '')}</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="bg-slate-50 text-center font-black border-l">
                          {rIdx === 3 && <div className={`text-sm font-black ${totalTimeMinutes < 1200 ? 'text-red-600' : 'text-slate-900'}`}>{totalTimeMinutes > 0 ? `${Math.floor(totalTimeMinutes/60)}:${(totalTimeMinutes%60).toString().padStart(2,'0')}` : "-"}</div>}
                          {rIdx === 6 && <div className={`text-[10px] font-black py-1 rounded ${totalPointsSum <= -10 ? 'text-red-600 bg-red-50' : 'text-blue-700 bg-blue-50'}`}>합계: {totalPointsSum}</div>}
                        </td>
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-2 bg-white border-l text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {[1, 2, 3, 4].map((n) => (
                                <div key={n} 
                                     onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', offCount >= (5-n) ? (5-n)-1 : offCount)} 
                                     className={`w-7 h-5 rounded-md border-2 ${isAdmin ? 'cursor-pointer' : ''} ${offCount >= (5-n) ? info.accent : 'bg-slate-50 border-slate-200'}`} />
                              ))}
                              {isAdmin && <button onClick={() => confirm("월휴 리셋?") && handleChange(name, '월', 'monthly_off_count', 4)} className="mt-2 px-1 py-0.5 bg-slate-800 text-[8px] text-white rounded font-bold uppercase">Reset</button>}
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
