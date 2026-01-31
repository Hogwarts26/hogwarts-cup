
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';

// ==========================================
// [1] 글로벌 스타일 및 애니메이션 설정
// ==========================================
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

// ==========================================
// [2] 학생 명단 데이터 (이름, 기숙사, 이모지, 색상)
// ==========================================
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

// ==========================================
// [3] 기숙사 설정 및 공지사항 데이터
// ==========================================
const HOUSE_ORDER = ["슬리데린", "래번클로", "그리핀도르", "후플푸프"];
const HOUSE_CONFIG = {
  "슬리데린": { bg: "bg-emerald-600", border: "border-emerald-700", icon: "🐍", accent: "bg-emerald-400" },
  "래번클로": { bg: "bg-blue-700", border: "border-blue-800", icon: "🦅", accent: "bg-blue-400" },
  "그리핀도르": { bg: "bg-red-700", border: "border-red-800", icon: "🦁", accent: "bg-red-400" },
  "후플푸프": { bg: "bg-amber-500", border: "border-amber-600", icon: "🦡", accent: "bg-amber-300" }
};

const HOUSE_NOTICES: { [key: string]: { title: string, content: string } } = {
  "래번클로": {
    title: "지식의 확장과 <이러쿵저러쿵> 1월호 최종 결산",
    content: `래번클로 학생 여러분, 이번 주 우리 기숙사는 4위를 기록했습니다. 하지만 점수판의 숫자보다 우리가 이번 주 도서관에서 찾아낸 '고대 마법의 기하학적 해석'에 대한 열띤 토론이 훨씬 가치 있었다고 생각합니다. 플리트윅 교수님께서도 여러분의 지적인 호기심에 찬사를 보내셨습니다.

게시판에 <이러쿵저러쿵> 1월 최종호가 게시되었습니다. 이번 호의 핵심 기사는 '2월의 안개 속에 숨어 사는 투명 요정들을 부르는 노래'입니다. 혹시 밤마다 복도에서 들리는 정체불명의 휘파람 소리가 이들과 관련이 있는지 분석해볼 학생들은 천문탑 모임에 참석해 주세요.

또한, 최근 독수리 문고리가 "어둠과 빛 중 무엇이 더 무거운가?"라는 난해한 질문을 던지기 시작했습니다. 입구에서 명상에 잠기는 학생들 때문에 통행이 지연되고 있으니, 개인적인 사색은 휴게실 안쪽 서재를 이용해 주시길 바랍니다. 

지혜는 공유할 때 더 빛나는 법입니다.`
  },
  "그리핀도르": {
    title: "망가진 마법 물품 수리 센터 운영",
    content: `그리핀도르 학우 여러분, 이번 주에 2등을 한 것은 조금 아쉽지만, 여러분이 보여준 용기 있는 도전들은 결코 헛되지 않았습니다. 특히 어둠의 마법 방어술 실습에서 두려움에 떨던 동료를 대신해 앞장섰던 학생들의 모습은 교수님을 감동시키기에 충분했습니다.

한 가지 공지사항이 있습니다. 최근 휴게실 내에서 무분별한 주문 연습으로 인해 귀에서 연기가 나는 부작용을 겪는 학생들이 늘고 있습니다. 장난감 폭죽은 물론이고 검증되지 않은 주문 연습은 자제해 주세요. 사감실의 기억력 향상 선인장이 지난 소동 이후로 여전히 민감한 상태이니, 실내에서는 가급적 정숙을 유지해 주시기 바랍니다.

대신, 이번 주말에는 반장들이 주도하여 고장 난 지팡이 및 마법 물품 점검 시간을 가질 예정입니다. 사소한 고장이 큰 사고로 이어지기 전에 미리미리 점검받으세요. 

그리핀도르의 용기는 철저한 준비에서 시작된다는 것을 잊지 마십시오!`
  },
  "슬리데린": {
    title: "슬러그 클럽 초대권, 그리고 격조 높은 승리를 위하여!",
    content: `슬리데린 학우 여러분, 후플푸프의 예상을 뛰어넘는 활약에 잠시 자리를 내주었지만, 우리 기숙사의 실력은 여전히 독보적입니다. 슬러그혼 교수님께서는 특히 변신술 수업에서 보여준 고학년들의 정교한 마법 운용을 높이 평가하셨습니다.

교수님께서는 이번 주말, 특별히 선발된 몇몇 학생을 대상으로 설탕 절임 파인애플 시식회를 겸한 작은 소모임을 가질 예정이십니다. 초대장을 받은 학생들은 슬리데린의 품격에 맞는 복장을 갖추고 참석하십시오. 이번 기회를 통해 자신의 가치를 증명해 보이길 바랍니다.

그리고 최근 지하 감옥 복도 벽면에 타 기스크를 비방하는 낙서를 하는 이들이 있습니다. 슬리데린은 그런 유치한 수단이 아닌, 오직 결과와 실력으로 상대를 압도하는 곳입니다. 자부심을 가지되 불필요한 마찰은 피하십시오.

1월 마지막 주 암호는 '순수한 승리'입니다.`
  },
  "후플푸프": {
    title: "주간 우승! 그리고 온실 파티 안내",
    content: `친애하는 후플푸프 학우 여러분! 우리가 해냈습니다! 1월의 마지막 주에 당당히 1위를 차지했습니다. 이번 주 마법약 수업에서 슬러그혼 교수님의 까다로운 질문에 차분히 대답해 가산점을 따낸 4학년 학생들과, 폭설 속에서도 올빼미장의 부엉이들을 함께 돌본 모든 학생의 따뜻한 마음이 모인 결과입니다. 스프라우트 교수님께서 여러분이 정말 자랑스럽다며 기뻐하고 계십니다.

우승을 기념하여 오늘 저녁 휴게실에서는 특별한 벌꿀 차와 호박 파이가 제공됩니다. 또한, 스프라우트 교수님께서 우승 선물로 주신 노래하는 수선화를 휴게실 곳곳에 배치했습니다. 이 꽃들은 기분이 좋을 때 부드러운 콧노래를 부르니, 공부하다 지칠 때 곁에서 휴식을 취해보세요.

주의할 점은, 최근 누군가 휴게실 입구 근처에 끈적이는 발판 마법을 걸어두어 몇몇 학우가 넘어질 뻔했습니다. 장난도 좋지만 서로를 배려하는 후플푸프의 정신을 잊지 마세요. 

2월에도 이 결속력을 이어가도록 합시다!`
  }
};

// ==========================================
// [4] 공통 상수 및 정렬 함수
// ==========================================
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const OFF_OPTIONS = ['-', '출석', '반휴', '주휴', '월휴', '월반휴', '자율', '결석', '늦반휴', '늦휴', '늦월반휴', '늦월휴'];

const sortKorean = (a: string, b: string) => {
  const cleanA = a.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
  const cleanB = b.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
  return cleanA.localeCompare(cleanB, 'ko');
};

// ==========================================
// [5] 메인 App 컴포넌트 및 상태(State) 관리
// ==========================================
export default function HogwartsApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedHouseNotice, setSelectedHouseNotice] = useState<string | null>(null);
  
  // 요약 확인 팝업 상태 추가
  const [showSummary, setShowSummary] = useState(false); 
  
  const [dailyGoal, setDailyGoal] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // ==========================================
  // [6] 초기 실행 (인증 확인 및 시계)
  // ==========================================
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const saved = localStorage.getItem('hg_auth');
    if (saved) {
      const { name, admin } = JSON.parse(saved);
      setSelectedName(name); setIsAdmin(admin); setIsLoggedIn(true);
    }
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // [7] 데이터 불러오기 (Supabase 연결)
  // ==========================================
  const fetchRecords = async () => {
    const { data } = await supabase.from('study_records').select('*');
    if (data) {
      setRecords(data);
      const myRecords = data.filter(r => r.student_name === selectedName);
      const savedGoal = myRecords.find(r => r.goal && r.goal !== "")?.goal || "";
      setDailyGoal(savedGoal);
    }
  };

  useEffect(() => { if (isLoggedIn) fetchRecords(); }, [isLoggedIn, selectedName]);

  // ==========================================
  // [8] 로그인 로직
  // ==========================================
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

  // ==========================================
  // [9] 데이터 초기화 (Weekly Reset)
  // ==========================================
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
          student_name: name, 
          day_of_week: day, 
          off_type: '-', 
          is_late: false, 
          am_3h: false, 
          study_time: '',
          password: existing.password || '0000', 
          monthly_off_count: existing.monthly_off_count ?? 4,
          goal: existing.goal || '' 
        });
      }
    }
    const { error } = await supabase.from('study_records').upsert(resetData, { onConflict: 'student_name,day_of_week' });
    if (!error) { setRecords(resetData); alert("✅ 기록이 초기화되었습니다. (목표 유지)"); }
    setIsSaving(false);
  };

  // ==========================================
  // [10] 점수 계산 로직 (Penalty & Bonus)
  // ==========================================
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

  // ==========================================
  // [11] 기숙사 랭킹 계산
  // ==========================================
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

// ==========================================
  // [12] 데이터 변경 및 저장 로직 (비밀번호, 목표, 학습 기록)
  // ==========================================
  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin && field !== 'password' && field !== 'goal') return;
    setIsSaving(true);

    if (field === 'password') {
      // --- 비밀번호 변경 구역 ---
      const { error } = await supabase.from('study_records').upsert(
        DAYS.map(d => ({ student_name: name, day_of_week: d, password: value })),
        { onConflict: 'student_name,day_of_week' }
      );
      if (!error) { setRecords(prev => prev.map(r => r.student_name === name ? { ...r, password: value } : r)); alert("비밀번호가 성공적으로 변경되었습니다"); }
    } 
    else if (field === 'goal') {
      // --- 오늘의 다짐(목표) 저장 구역 ---
      const updatePayload = DAYS.map(d => {
        const existing = records.find(r => r.student_name === name && r.day_of_week === d) || {};
        return { 
          ...existing, 
          student_name: name, 
          day_of_week: d, 
          goal: value,
          password: existing.password || '0000',
          monthly_off_count: existing.monthly_off_count ?? 4
        };
      });
      const { error } = await supabase.from('study_records').upsert(updatePayload, { onConflict: 'student_name,day_of_week' });
      if (!error) {
        setRecords(prev => prev.map(r => r.student_name === name ? { ...r, goal: value } : r));
        setDailyGoal(value);
      }
    }
    else {
      // --- 일반 학습 기록 수정 구역 (휴무, 지각, 시간 등) ---
      const newRecords = [...records];
      const idx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === day);
      const current = newRecords[idx] || {};
      const updatedData = { 
        ...current,
        student_name: name, day_of_week: day, [field]: value, 
        password: current.password || '0000', 
        monthly_off_count: field === 'monthly_off_count' ? value : (current.monthly_off_count ?? 4)
      };
      
      if (idx > -1) {
        newRecords[idx] = updatedData;
      } else {
        newRecords.push(updatedData);
      }
      setRecords(newRecords);
      await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });
    }
    setIsSaving(false);
  };

  // ==========================================
  // [13] 로그인 화면 (Render Login)
  // ==========================================
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

  // ==========================================
  // [14] 메인 화면 데이터 준비 (학생 필터링 등)
  // ==========================================
  const displayList = isAdmin 
    ? Object.keys(studentData).sort((a, b) => {
        const houseDiff = HOUSE_ORDER.indexOf(studentData[a].house) - HOUSE_ORDER.indexOf(studentData[b].house);
        return houseDiff !== 0 ? houseDiff : sortKorean(a, b);
      })
    : [selectedName];

// ==========================================
  // [15] 메인 화면 렌더링 (UI)
  // ==========================================
  return (
    <div className="min-h-screen bg-stone-100 p-2 md:p-4 pb-16 font-sans relative">
      <style>{`
        ${GLOVAL_STYLE}
        /* 동그란 지각 체크박스 스타일 */
        .late-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid #cbd5e1;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          position: relative;
          background: white;
          outline: none;
          margin: 0 auto;
          display: block;
        }
        .late-checkbox:checked {
          background: #f59e0b;
          border-color: #f59e0b;
        }
        .late-checkbox:disabled {
          cursor: default;
        }
        .winner-sparkle {
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.4);
        }
      `}</style>
      
      {/* --- 마법 공지사항 팝업 구역 --- */}
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

      {/* --- 요약 확인 팝업 --- */}
      {showSummary && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowSummary(false)}>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowSummary(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors text-2xl font-black">✕</button>
            <h3 className="text-2xl font-serif font-black text-slate-800 mb-8 italic tracking-tighter border-b-2 border-slate-100 pb-4 text-center">House Weekly Summary</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-slate-300">
              {HOUSE_ORDER.map(house => {
                const studentsInHouse = Object.keys(studentData).filter(name => studentData[name].house === house);
                const config = (HOUSE_CONFIG as any)[house];
                
                return (
                  <div key={house} className="flex flex-col border-r border-b border-slate-300">
                    <div className={`${config.bg} p-2 text-white font-black text-center text-[11px] tracking-widest`}>
                      {config.icon} {house}
                    </div>
                    <div className="flex flex-col flex-1 divide-y divide-slate-200">
                      {studentsInHouse.sort(sortKorean).map(name => {
                        const emoji = studentData[name].emoji || "👤";
                        let totalMins = 0;
                        records.filter(r => r.student_name === name).forEach(r => {
                          const [h, m] = (r.study_time || "").split(':').map(Number);
                          totalMins += (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
                        });
                        const timeStr = `${Math.floor(totalMins/60)}:${(totalMins%60).toString().padStart(2,'0')}`;
                        const isUnderGoal = totalMins < 1200;

                        return (
                          <div key={name} className="flex h-10">
                            <div className={`w-12 flex items-center justify-center text-xl border-r border-slate-200 ${config.bg.replace('bg-', 'bg-opacity-10 bg-')}`}>
                              {emoji}
                            </div>
                            <div className="flex-1 flex items-center justify-end pr-4 font-black text-sm text-slate-700 bg-white">
                              <span className={isUnderGoal ? "text-red-500" : "text-slate-800"}>
                                {totalMins > 0 ? timeStr : "-"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- 상단 기스크 점수판(대시보드) 구역 --- */}
      <div className="max-w-[1100px] mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-black text-slate-800 italic tracking-tight">Hogwarts House Cup</h2>
          <div className="flex gap-2">
            {isAdmin && (
              <button 
                onClick={() => setShowSummary(true)} 
                className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              >
                요약 확인
              </button>
            )}
            {isAdmin && <button onClick={resetWeeklyData} className="text-[10px] font-black text-white bg-red-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-red-700 transition-colors">Weekly Reset</button>}
            <button onClick={() => { localStorage.removeItem('hg_auth'); window.location.reload(); }} className="text-[10px] font-black text-slate-400 bg-white border-2 px-3 py-1.5 rounded-full shadow-sm">Logout</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 md:gap-4">
          {houseRankings.map((item, idx) => {
            const config = (HOUSE_CONFIG as any)[item.house];
            const rankLabel = ["1st", "2nd", "3rd", "4th"][idx];
            const isWinner = idx === 0;
            return (
              <div key={item.house} onClick={() => setSelectedHouseNotice(item.house as any)} className={`${config.bg} ${config.border} ${isWinner ? 'winner-sparkle ring-4 ring-yellow-400 ring-offset-2' : ''} border-b-4 p-1.5 md:p-5 rounded-xl md:rounded-[2rem] text-white shadow-xl relative overflow-hidden cursor-pointer active:scale-95 transition-all hover:brightness-110`}>
                <div className="absolute right-[-10px] bottom-[-10px] text-5xl md:text-7xl opacity-20 pointer-events-none">{config.icon}</div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[7px] md:text-xs font-black opacity-90 tracking-widest">{item.house}</div>
                    <div className={`text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-full ${config.accent} text-slate-900 shadow-sm`}>{rankLabel}</div>
                  </div>
                  {/* 소수점 1자리까지 표시 (반올림) */}
                  <div className="text-lg md:text-4xl font-black italic">
                    {(Math.round(item.finalPoint * 10) / 10).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- 학습 기록 메인 테이블 구역 --- */}
      <div className="max-w-[1100px] mx-auto bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-4 px-6 md:px-8 flex flex-col gap-2 text-white min-h-[60px]">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] md:text-xs font-black text-yellow-500 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {isAdmin ? "Headmaster Console" : currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
              {!isAdmin && <span className="text-white ml-2">{currentTime.toLocaleTimeString('ko-KR', { hour12: false })}</span>}
            </span>
            {isSaving && <div className="text-[9px] text-yellow-500 font-bold animate-bounce">Magic occurring...</div>}
          </div>

          {!isAdmin && (
            <div className="flex items-center gap-3 pt-1 border-t border-white/10 mt-1">
              <span className="text-[9px] font-black text-white/40 shrink-0">Goal</span>
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
                      handleChange(selectedName, '월', 'goal', dailyGoal);
                      setIsEditingGoal(false);
                    }}
                    className="text-[10px] font-black text-yellow-500 shrink-0 px-2"
                  >저장</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <span className="text-xs font-medium text-white/90 italic truncate flex-1">
                    {dailyGoal || "수정버튼을 클릭하여 목표나 다짐을 입력하세요."}
                  </span>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => setIsEditingGoal(true)} className="text-[9px] font-bold text-white/40 hover:text-white transition-colors">수정</button>
                    {dailyGoal && (
                      <button 
                        onClick={() => {
                          if (confirm("삭제하시겠습니까?")) {
                            handleChange(selectedName, '월', 'goal', '');
                            setDailyGoal("");
                            alert("삭제되었습니다.");
                          }
                        }}
                        className="text-[9px] font-bold text-red-400/60 hover:text-red-400 transition-colors"
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
              <tr className="bg-slate-50 text-slate-500 font-black text-[11px] border-b-2">
                <th className="w-28 p-2 sticky left-0 bg-slate-50 z-20 border-r">학생명</th>
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
                const rows = [{f:'off_type'},{f:'is_late'},{f:'am_3h'},{f:'study_time'},{f:'penalty'},{f:'bonus'},{f:'total'}];
                
                let totalTimeMinutes = 0;
                let totalPointsSum = 0;
                records.filter(r => r.student_name === name).forEach(r => {
                  const res = calc(r);
                  const [h, m] = (r.study_time || "").split(':').map(Number);
                  totalTimeMinutes += (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
                  totalPointsSum += res.total;
                });

                const emoji = info.emoji || "";

                return (
                  <React.Fragment key={name}>
                    {isAdmin && (
                      <tr className="bg-slate-100/50 border-t-2 border-slate-200">
                        <td className="sticky left-0 bg-slate-100/50 z-20 border-r"></td>
                        {DAYS.map(d => <td key={d} className="p-1 text-[10px] font-black text-slate-500 text-center">{d}</td>)}
                        <td colSpan={2} className="border-l"></td>
                      </tr>
                    )}
                    {rows.map((row, rIdx) => (
                      <tr key={row.f} className={`${rIdx === 6 ? "border-b-[6px] border-slate-100" : "border-b border-slate-50"}`}>
                        {rIdx === 0 && (
                          <td rowSpan={7} className={`p-4 text-center sticky left-0 z-20 font-bold border-r-[3px] ${info.color} ${info.text}`}>
                            <div className="text-3xl mb-1">{emoji}</div>
                            <div className="leading-tight text-sm font-black mb-1 break-keep">{name}</div>
                            <div className="text-[9px] font-black opacity-70 mb-2">{info.house}</div>
                            <button onClick={async () => {
                              const newPw = prompt("새 비밀번호를 입력하세요 (4자리숫자)");
                              if(newPw && newPw.length >= 4) await handleChange(name, '월', 'password', newPw);
                            }} className="text-[8px] underline opacity-40 hover:opacity-100 block mx-auto">PW 변경</button>
                          </td>
                        )}
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
                              ) : row.f === 'is_late' ? (
                                <input type="checkbox" className="late-checkbox" checked={!!rec.is_late} onChange={(e) => handleChange(name, day, 'is_late', e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'am_3h' ? (
                                <input type="checkbox" className="w-3.5 h-3.5 accent-slate-800 cursor-pointer mx-auto block" checked={!!rec.am_3h} onChange={(e) => handleChange(name, day, 'am_3h', e.target.checked)} disabled={!isAdmin} />
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
                              합계: {(Math.round(totalPointsSum * 10) / 10).toFixed(1).replace('.0', '')}
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
                              {isAdmin && <button onClick={() => confirm("월휴 리셋?") && handleChange(name, '월', 'monthly_off_count', 4)} className="mt-2 px-1 py-0.5 bg-slate-800 text-[8px] text-white rounded font-bold">Reset</button>}
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
