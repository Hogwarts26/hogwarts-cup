"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';

const GLOVAL_STYLE = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; }
  
  /* 디즈니 마법 가루(Pixie Dust) 효과 */
  .winner-sparkle {
    position: relative;
    overflow: hidden;
    animation: winner-glow 2s infinite alternate;
  }

  .winner-sparkle::before, .winner-sparkle::after {
    content: '';
    position: absolute;
    inset: -50px;
    background-image: 
      radial-gradient(1.5px 1.5px at 20px 30px, white, rgba(255,255,255,0)),
      radial-gradient(2px 2px at 50px 80px, white, rgba(255,255,255,0)),
      radial-gradient(1px 1px at 90px 20px, white, rgba(255,255,255,0)),
      radial-gradient(2px 2px at 130px 60px, white, rgba(255,255,255,0)),
      radial-gradient(1.5px 1.5px at 160px 110px, white, rgba(255,255,255,0)),
      radial-gradient(1px 1px at 210px 40px, white, rgba(255,255,255,0)),
      radial-gradient(2px 2px at 240px 100px, white, rgba(255,255,255,0)),
      radial-gradient(1.5px 1.5px at 280px 20px, white, rgba(255,255,255,0));
    background-size: 300px 150px;
    opacity: 0;
    pointer-events: none;
    z-index: 5;
  }

  .winner-sparkle::before {
    animation: pixie-dust 3s infinite linear;
  }

  .winner-sparkle::after {
    background-position: 150px 75px;
    animation: pixie-dust 4s infinite linear reverse;
  }

  @keyframes pixie-dust {
    0% { transform: scale(0.8) translate(0, 0); opacity: 0; }
    20% { opacity: 0.8; }
    50% { transform: scale(1.1) translate(5px, -10px); opacity: 1; filter: brightness(1.5) blur(0.5px); }
    80% { opacity: 0.8; }
    100% { transform: scale(1.2) translate(10px, -20px); opacity: 0; }
  }

  @keyframes winner-glow {
    from { box-shadow: 0 0 15px rgba(255, 215, 0, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.1); }
    to { box-shadow: 0 0 35px rgba(255, 215, 0, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.3); }
  }

  /* 테이블 내 휴무 드롭다운만 정중앙 정렬 */
  table select {
    appearance: none;
    -webkit-appearance: none;
    text-align-last: center;
    padding: 0 !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    height: 100%;
  }

  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
`;

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
  "슬리데린": { bg: "bg-emerald-600", border: "border-emerald-700", icon: "🐍", accent: "bg-emerald-400" },
  "래번클로": { bg: "bg-blue-700", border: "border-blue-800", icon: "🦅", accent: "bg-blue-400" },
  "그리핀도르": { bg: "bg-red-700", border: "border-red-800", icon: "🦁", accent: "bg-red-400" },
  "후플푸프": { bg: "bg-amber-500", border: "border-amber-600", icon: "🦡", accent: "bg-amber-300" }
};

const HOUSE_NOTICES: { [key: string]: { title: string, content: string } } = {
  "래번클로": {
    title: "지적인 도약과 <이러쿵저러쿵> 특별 부록 안내",
    content: `래번클로 학생 여러분, 이번 주 우리 기숙사는 62점으로 2위를 기록했습니다. 비록 1위는 놓쳤지만, 플리트윅 교수님께서는 우리가 마법 수업에서 보여준 창의적인 주문 운용과 완벽한 이론 해석을 매우 높게 평가하셨습니다. 점수라는 숫자가 우리의 지식의 깊이를 다 대변할 수는 없음을 잊지 마세요.\n\n게시판 한편에 잡지 <이러쿵저러쿵>의 흥미로운 단신과 함께 특별 부록인 '보이지 않는 잉크를 읽는 돋보기'가 비치되었습니다. 이번 호의 주제는 '겨울철 천문탑 주위를 맴도는 보이지 않는 존재들에 대하여'입니다.\n가끔은 딱딱한 교과서에서 벗어나 이런 기발한 상상력을 통해 새로운 마법적 영감을 얻어보는 것도 래번클로다운 공부법일 거예요.\n\n최근 독수리 문고리가 던지는 질문이 유독 철학적이라 입구에 정체가 발생하고 있습니다. 논쟁을 즐기는 것은 좋으나, 뒤에 서 있는 학우들이 추위에 떨지 않도록 배려해 주세요. 정 답을 모르겠다면 망설이지 말고 근처의 선배들에게 힌트를 요청하시길 바랍니다.`
  },
  "그리핀도르": {
    title: "잃어버린 용기를 찾아서, 그리고 안전 점검 안내",
    content: `그리핀도르 학우 여러분, 이번 주 53점이라는 성적은 분명 아쉽습니다. 하지만 네빌 롱보텀 교수님께서는 점수보다 우리가 숲 근처에서 위험에 처한 하급생을 도와준 그 용기를 더 자랑스러워하셨습니다. 점수는 다시 따면 그만이니 너무 기죽지 마십시오. 우리에게는 언제나 역전의 기회가 기다리고 있습니다.\n\n오늘 저녁, 침체된 분위기를 살리고 서로를 격려하기 위해 휴게실에서 짧은 티타임을 갖겠습니다. 주방에서 갓 구운 당근 케이크를 공수해올 예정이니 모두 모여주세요.\n\n단, 한 가지 엄격히 주의할 점이 있습니다. 최근 누군가 휴게실 벽난로 근처에서 위즐리 형제의 폭죽을 테스트하다 카페트를 태워 먹을 뻔했습니다. 사감실의 기억력 향상 선인장이 폭음 때문에 극심한 스트레스를 받아 지난밤 내내 사방으로 가시를 발사했습니다. 덕분에 롱보텀 교수님의 새 망토가 누더기가 되었으니, 실내에서의 장난감 사용은 엄격히 금지합니다. 다시 한번 적발될 경우 해당 학생은 한 달간 약초학 온실 청소를 맡게 될 것입니다.`
  },
  "슬리데린": {
    title: "영광과 슬러그 클럽 후보자 선출",
    content: `슬리데린의 자부심을 드높인 학우 여러분, 70점이라는 압도적인 점수로 주간 우승을 차지한 것을 축하합니다! 특히 마법약 수업에서 완벽한 '살아있는 죽음의 약'을 제조해 슬러그혼 교수님을 감탄시킨 6학년들의 공이 컸습니다.\n교수님께서 이번 승리를 기념해 특별히 최고급 설탕 절임 파인애플 한 상자를 휴게실에 보내주셨으니, 우승의 달콤함을 만끽하시기 바랍니다.\n\n이번 승리를 기점으로 슬러그혼 교수님께서 새로운 슬러그 클럽 후보 명단을 검토 중이십니다. 단순히 혈통뿐만 아니라 탁월한 재능과 야망을 가진 학생이라면 누구든 기회가 열려 있습니다. 교수님께 깊은 인상을 남기고 싶은 학생들은 다음 주 마법약 과제에 더 신경 쓰길 바랍니다.\n\n또한, 최근 지하 감옥 복도 초상화들 사이에서 우리 기숙사 학생들이 타 기숙사 학생들과 불필요한 마법 결투를 벌인다는 소문이 돌고 있습니다. 우리는 품격 있게 승리해야 합니다. 상대의 낮은 수준에 맞추기보다, 무시무시할 정도로 완벽한 성적으로 그들을 압도하십시오.\n\n이번주 기숙사 암호는 '에메랄드 결속'입니다.`
  },
  "후플푸프": {
    title: "성실함과 주방의 친절 릴레이!",
    content: `친애하는 후플푸프 학우 여러분! 이번 주 우리는 64점을 기록하며 2위에 올랐습니다. 우수 기숙사인 슬리데린과 아주 근소한 차이였죠! 스프라우트 교수님께서는 추운 날씨에도 온실의 겨울 장미를 정성껏 돌보고, 얼어붙은 흙을 갈아엎는 데 앞장선 우리 학생들의 성실함을 극찬하셨습니다.\n교수님께서 고마움의 표시로 한겨울에도 시들지 않는 노란 복수초 화분들을 휴게실 창가에 잔뜩 놓아두셨으니, 그 따스한 생명력을 함께 즐겨주세요.\n\n한 가지 공지할 소동이 있습니다. 최근 휴게실 소파 틈새에서 주인 없는 깃펜과 양피지가 무더기로 발견되고 있습니다. 특히 자동 철자 수정 기능이 고장 나 멋대로 춤을 추는 깃펜을 분실한 학생은 즉시 반장에게 찾으러오세요. 그 깃펜이 밤마다 휴게실 벽면에 이상한 낙서를 하고 다녀서 지우느라 애를 먹고 있습니다.\n\n그리고, 이번 주 약초학 실습에는 '신경질적인 거대 전략 식물'을 다룰 예정이니 모두 잊지 말고 용 가죽 장갑을 꼼꼼히 수선해 두세요. 구멍 난 장갑을 끼고 왔다가 손가락이 보라색으로 변하는 일은 없어야겠죠? 서로의 장갑 상태를 미리 확인해 주는 후플푸프만의 세심함을 발휘해 봅시다!`
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
  
  // 오늘의 다짐 관련 상태
  const [dailyGoal, setDailyGoal] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

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
    if (data) {
      setRecords(data);
      // 현재 날짜의 본인 다짐 가져오기
      const todayStr = DAYS[(new Date().getDay() + 6) % 7];
      const myTodayRec = data.find(r => r.student_name === selectedName && r.day_of_week === todayStr);
      // 목표가 있으면 설정, 없으면 빈칸 유지
      setDailyGoal(myTodayRec?.goal || "");
    }
  };

  useEffect(() => { if (isLoggedIn) fetchRecords(); }, [isLoggedIn, selectedName]);

  const handleLogin = async () => {
    if (!selectedName) { alert("학생을 선택해주세요."); return; }
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
    if (!confirm("정말로 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    setIsSaving(true);
    const names = Object.keys(studentData);
    const resetData = [];
    for (const name of names) {
      for (const day of DAYS) {
        const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
        resetData.push({
          student_name: name, day_of_week: day, off_type: '-', is_late: false, am_3h: false, study_time: '',
          password: existing.password || '0000', monthly_off_count: existing.monthly_off_count ?? 4,
          goal: ''
        });
      }
    }
    const { error } = await supabase.from('study_records').upsert(resetData, { onConflict: 'student_name,day_of_week' });
    if (!error) { setRecords(resetData); setDailyGoal(""); alert("✅ 초기화되었습니다."); }
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
    if (!isAdmin && field !== 'password' && field !== 'goal') return;
    setIsSaving(true);
    if (field === 'password') {
      const { error } = await supabase.from('study_records').upsert(
        DAYS.map(d => ({ student_name: name, day_of_week: d, password: value })),
        { onConflict: 'student_name,day_of_week' }
      );
      if (!error) { setRecords(prev => prev.map(r => r.student_name === name ? { ...r, password: value } : r)); alert("비밀번호가 성공적으로 변경되었습니다"); }
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
        <style>{GLOVAL_STYLE}</style>
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>
          <h1 className="text-4xl font-serif font-black text-center mb-10 text-slate-800 tracking-tighter italic uppercase">Hogwarts</h1>
          <div className="space-y-6">
            <select className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg" value={selectedName} onChange={(e)=>setSelectedName(e.target.value)}>
              <option value="">이름을 선택하세요</option>
              {Object.keys(studentData).sort(sortKorean).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input type="password" placeholder="PASSWORD" className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleLogin()} />
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
      <style>{GLOVAL_STYLE}</style>
      
      {/* 마법 공지사항 팝업 (코드 동일) */}
      {selectedHouseNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedHouseNotice(null)}>
          <div className="relative bg-[#f4e4bc] p-6 md:p-12 w-full max-w-2xl rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()} style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)' }}>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }}></div>
            <button onClick={() => setSelectedHouseNotice(null)} className="absolute top-2 right-2 md:top-4 md:right-4 text-slate-800 hover:rotate-90 transition-transform p-2 text-2xl z-20">✕</button>
            <div className="relative z-10 font-serif flex flex-col overflow-hidden">
              <div className="w-16 h-1 bg-slate-800/20 mx-auto mb-4 md:mb-6 shrink-0"></div>
              <h3 className="text-xl md:text-3xl font-black text-[#4a3728] mb-4 md:mb-6 text-center italic border-b border-[#4a3728]/20 pb-4 shrink-0 px-4">{HOUSE_NOTICES[selectedHouseNotice].title}</h3>
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-base md:text-lg leading-relaxed text-[#5d4037] whitespace-pre-wrap font-medium">
                  {HOUSE_NOTICES[selectedHouseNotice].content}
                </div>
                <div className="mt-8 mb-4 text-right italic font-bold text-[#4a3728]/60">— Hogwarts School of Witchcraft and Wizardry —</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 대시보드 (코드 동일) */}
      <div className="max-w-[1100px] mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-black text-slate-800 italic tracking-tight uppercase">Hogwarts House Cup</h2>
          <div className="flex gap-2">
            {isAdmin && <button onClick={resetWeeklyData} className="text-[10px] font-black text-white bg-red-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-red-700 transition-colors">WEEKLY RESET</button>}
            <button onClick={() => { localStorage.removeItem('hg_auth'); window.location.reload(); }} className="text-[10px] font-black text-slate-400 bg-white border-2 px-3 py-1.5 rounded-full shadow-sm">LOGOUT</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 md:gap-4">
          {houseRankings.map((item, idx) => {
            const config = (HOUSE_CONFIG as any)[item.house];
            const rankLabel = ["1st", "2nd", "3rd", "4th"][idx];
            const isWinner = idx === 0;
            return (
              <div key={item.house} onClick={() => setSelectedHouseNotice(item.house)} className={`${config.bg} ${config.border} ${isWinner ? 'winner-sparkle ring-4 ring-yellow-400 ring-offset-2' : ''} border-b-4 p-1.5 md:p-5 rounded-xl md:rounded-[2rem] text-white shadow-xl relative overflow-hidden cursor-pointer active:scale-95 transition-all hover:brightness-110`}>
                <div className="absolute right-[-10px] bottom-[-10px] text-5xl opacity-20">{config.icon}</div>
                <div className="flex justify-between items-start mb-1">
                  <div className="text-[7px] md:text-xs font-black opacity-90 uppercase">{item.house}</div>
                  <div className={`text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-full ${config.accent} text-slate-900 shadow-sm`}>{rankLabel}</div>
                </div>
                <div className="text-lg md:text-4xl font-black">{item.finalPoint.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 기록 테이블 */}
      <div className="max-w-[1100px] mx-auto bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-4 px-6 md:px-8 flex flex-col gap-2 text-white min-h-[60px]">
          {/* 첫 번째 줄: 날짜, 시간, 로딩상태 */}
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] md:text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {isAdmin ? "Headmaster Console" : currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
              {!isAdmin && <span className="text-white ml-2">{currentTime.toLocaleTimeString('ko-KR', { hour12: false })}</span>}
            </span>
            {isSaving && <div className="text-[9px] text-yellow-500 font-bold uppercase animate-bounce">Magic occurring...</div>}
          </div>

          {/* 두 번째 줄: 오늘의 다짐 (모바일을 위해 아래에 배치) */}
          {!isAdmin && (
            <div className="flex items-center gap-3 pt-1 border-t border-white/10 mt-1">
              <span className="text-[9px] font-black text-white/40 uppercase shrink-0">Today's Goal</span>
              {isEditingGoal ? (
                <div className="flex items-center gap-2 flex-1">
                  <input 
                    type="text" 
                    className="bg-transparent border-b border-white/30 text-white text-xs p-0 pb-0.5 outline-none flex-1 placeholder:text-white/20"
                    placeholder="목표를 입력하세요"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      const todayStr = DAYS[(new Date().getDay() + 6) % 7];
                      handleChange(selectedName, todayStr, 'goal', dailyGoal);
                      setIsEditingGoal(false);
                    }}
                    className="text-[10px] font-black text-yellow-500 shrink-0 px-2"
                  >저장</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <span className="text-xs font-medium text-white/90 italic truncate flex-1">
                    {dailyGoal || "클릭하여 다짐을 입력하세요."}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setIsEditingGoal(true)} className="text-[9px] text-white/40 hover:text-white transition-colors">수정</button>
                    {dailyGoal && (
                      <button 
                        onClick={() => {
                          if (confirm("정말 삭제하시겠습니까?")) {
                            const todayStr = DAYS[(new Date().getDay() + 6) % 7];
                            handleChange(selectedName, todayStr, 'goal', '');
                            setDailyGoal("");
                            alert("삭제되었습니다.");
                          }
                        }}
                        className="text-[9px] text-red-400/60 hover:text-red-400 transition-colors"
                      >삭제</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <table className="min-w-[850px] w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-black text-[11px] border-b-2">
                <th className="w-28 p-2 sticky left-0 bg-slate-50 z-20 border-r">학생명</th>
                <th className="w-20 p-2 border-r"> </th>
                {DAYS.map(d => <th key={d} className="w-16 p-2 text-slate-900">{d}</th>)}
                <th className="w-24 p-2 bg-slate-100 text-[10px]">공부시간</th>
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
                              const newPw = prompt("새 비밀번호를 입력하세요 (4자리숫자)");
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
                                <input type="checkbox" className={`w-3.5 h-3.5 ${row.f === 'is_late' ? 'accent-amber-400' : 'accent-slate-800'} cursor-pointer mx-auto block`} checked={!!rec[row.f]} onChange={(e) => handleChange(name, day, row.f, e.target.checked)} disabled={!isAdmin} />
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
                          {rIdx === 3 && (
                            <div className={`text-sm font-black ${totalTimeMinutes < 1200 ? 'text-red-600' : 'text-slate-900'}`}>
                              {totalTimeMinutes > 0 ? `${Math.floor(totalTimeMinutes/60)}:${(totalTimeMinutes%60).toString().padStart(2,'0')}` : "-"}
                            </div>
                          )}
                          {rIdx === 6 && (
                            <div className={`text-[10px] font-black py-1 rounded ${totalPointsSum <= -10 ? 'text-red-600 bg-red-50' : 'text-blue-700 bg-blue-50'}`}>
                              합계: {totalPointsSum}
                            </div>
                          )}
                        </td>
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-2 bg-white border-l text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {[1, 2, 3, 4].map((n) => (
                                <div key={n} 
                                     onClick={() => {
                                       if(isAdmin) {
                                         const nextCount = offCount >= (5-n) ? (5-n)-1 : offCount;
                                         handleChange(name, '월', 'monthly_off_count', nextCount);
                                       }
                                     }} 
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
