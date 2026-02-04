"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';

// ==========================================
// [1] 기숙사컵 스타일 및 애니메이션 설정
// ==========================================
const GLOVAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

  body { 
    /* 영문/숫자는 Cinzel, 한국어는 Pretendard 순으로 적용 */
    font-family: 'Cinzel', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; 
  }

  /* 폰트 강조가 필요한 serif 클래스에 Cinzel 적용 */
  .font-serif { font-family: 'Cinzel', serif; }

  /* Pixie Dust 효과 */
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
  "🤖로봇": { house: "슬리데린", emoji: "🤖", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐾발자국": { house: "슬리데린", emoji: "🐾", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐆표범": { house: "슬리데린", emoji: "🐆", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐡복어": { house: "슬리데린", emoji: "🐡", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐶강쥐": { house: "슬리데린", emoji: "🐶", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
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
  "🦖공룡": { house: "후플푸프", emoji: "🦖", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "💚초록": { house: "후플푸프", emoji: "💚", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐿️다람": { house: "후플푸프", emoji: "🐿️", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" }
};

// ==========================================
// [3] 기숙사 설정 및 공지사항 내용
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
    title: "움직이는 계단의 규칙성 탐구",
    content: `래번클로 여러분, 이번 주 우리는 54점을 기록했습니다. 점수판의 숫자보다 제가 주목한 것은 이번 주 마법 수업에서 우리가 보여준 무언 주문의 완벽한 성공률입니다. 플리트윅 교수님께서도 우리 기숙사 학생들의 집중력에 깊은 감명을 받으셨다고 전해오셨습니다.

다음 주부터 시작될 성내 결계 보수 작업에 대비해, 몇몇 상급생들이 움직이는 계단의 새로운 패턴을 분석한 차트를 휴게실 게시판에 붙여두었습니다. 길을 잃어 시간을 낭비하고 싶지 않다면 이동 전에 반드시 숙지하십시오. 지혜로운 자는 환경의 변화를 미리 예측하는 법입니다.
 
참, 독수리 문고리가 최근 '시간의 본질'에 대해 묻기 시작했으니, 철학적인 답변을 미리 준비해두는 것이 좋을 겁니다.
`
  },

  "그리핀도르": {
    title: "아쉬운 2위, 복도 결투 금지령",
    content: `그리핀도르 학우 여러분, 이번 주 59.1점으로 아쉽게 2위를 기록했습니다. 마지막 마법 방어술 실습에서 보여준 여러분의 열정은 대단했지만, 쉬는 시간 복도에서 슬리데린 학생들과 비공식 결투를 벌이다 감점된 점수가 결과적으로 뼈아픈 실책이 되었습니다.

네빌 롱보텀 교수님께서는 여러분의 용기가 무모한 자존심 싸움으로 번지는 것을 경계하고 계십니다. 교수님께서는 이번 주말, 여러분의 넘치는 에너지를 건전하게 해소할 수 있도록 그리핀도르 기숙사 대항 마법 체스 대회를 개최하기로 하셨습니다. 우승자에게는 맥고나걸 교장 선생님께 특별히 허가받은 고급 양피지 세트가 부상으로 주어집니다.

또한, 최근 휴게실 벽난로 근처에서 위즐리 형제의 폭죽을 개조해 불꽃놀이를 시도한 2학년들은 자중하십시오. 그리핀도르의 사자 동상이 연기 때문에 재채기를 하느라 밤잠을 설쳤다고 불평이 대단합니다. 우리 기숙사의 상징을 존중해 주길 바랍니다.`
  },

  "슬리데린": {
    title: "슬러그 클럽의 만찬과 격조 높은 승리를 위하여!",
    content: `슬리데린 학우 여러분, 이번 주 우리는 50점을 기록하며 잠시 주춤했습니다. 하지만 슬러그혼 교수님께서는 "진정한 보석은 흙 속에서도 빛난다"며, 이번 주 마법약 수업에서 완벽한 기분 전환 물약을 제조해낸 학생들의 이름을 하나하나 수첩에 적으셨습니다.

이번 주말, 교수님께 특별 초대장을 받은 학생들은 설탕 절임 파인애플 시식회에 참석하십시오. 이는 단순히 간식을 먹는 자리가 아니라, 호그와트에서 가장 영향력 있는 인맥을 쌓는 '슬러그 클럽'의 입구입니다. 자신의 가치를 증명할 준비를 마친 채 품격 있는 복장으로 나타나길 기대하겠습니다.

최근 복도 벽면에 유치한 낙서를 남기는 이들이 있는데, 슬리데린은 그런 하급 장난에 휘말리지 않습니다. 오직 완벽한 결과로 상대를 압도하십시오.

이번주 기숙사 암호는 '고귀한 야심'입니다.`
  },

  "후플푸프": {
    title: "온실 속의 작은 축제",
    content: `우리 후플푸프가 1월의 마지막을 승리로 장식했습니다! 0.5점이라는 간발의 차이는 여러분이 이번 주 약초학 실습 후 도구를 깨끗이 정리하고, 도움이 필요한 저학년들의 과제를 함께 고민해준 덕분에 얻은 소중한 가산점 덕분입니다. 스프라우트 교수님께서 여러분의 이런 조용한 성실함이 결국 빛을 발했다며 매우 기뻐하고 계십니다.

승리를 축하하기 위해 오늘 저녁 휴게실에는 주방에서 갓 구운 메이플 시럽 스콘이 배달됩니다. 
그리고 특별한 소식이 있습니다. 교수님께서 우승 선물로 주신 자장가를 부르는 이끼를 휴게실 구석 소파 근처에 배치했습니다. 시험 공부로 지친 머리를 식히고 싶다면 그 근처에서 잠시 휴식을 취해보세요. 스트레스 해소에 큰 도움이 될 겁니다!
`
  }
};

// ==========================================
// [4] 공통 상수 및 정렬 함수
// ==========================================
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const OFF_OPTIONS = ['-', '출석', '반휴', '주휴', '월휴', '월반휴', '자율', '결석', '늦반휴', '늦휴', '늦월반휴', '늦월휴'];

// 깃허브 저장소(Hogwarts26/hogwarts-cup)에 올린 이미지를 직접 연결
const HOUSE_LOGOS: Record<string, string> = {
  "그리핀도르": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/gry.png",
  "슬리데린": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/sly.png",
  "래번클로": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/rav.png",
  "후플푸프": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/huf.png"
};

const sortKorean = (a: string, b: string) => {
  const cleanA = a.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
  const cleanB = b.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
  return cleanA.localeCompare(cleanB, 'ko');
};

// ==========================================
// [5] 메인 App 컴포넌트 및 상태(State) 관리
// ==========================================
export default function HogwartsApp() {
  // --- [추가] 월요일 18:00 기준 날짜 조정 함수 ---
  const getAdjustedToday = () => {
    const now = new Date();
    const day = now.getDay();    // 0(일), 1(월), 2(화)...
    const hours = now.getHours();

    if (day === 1 && hours < 18) {
      const adjusted = new Date(now);
      adjusted.setDate(now.getDate() - 1);
      return adjusted;
    }
    return now;
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // ✅ [추가] 학생들의 누적 데이터(알 정보 포함)를 저장할 상태
  const [studentMasterData, setStudentMasterData] = useState<any>({});

  const [currentTime, setCurrentTime] = useState(getAdjustedToday());
  const [selectedHouseNotice, setSelectedHouseNotice] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false); 
  const [selectedStudentReport, setSelectedStudentReport] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // ✅ [추가] 현재 로그인한 사용자를 객체 형태로 정의 (빨간 줄 방지)
  const currentUser = useMemo(() => {
    return selectedName ? { name: selectedName } : null;
  }, [selectedName]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getAdjustedToday());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // [상태 관리] Dragon Cave 이미지 및 애니메이션
  const [currentImageFile, setCurrentImageFile] = useState('x.jpg');
  const [isFading, setIsFading] = useState(false);

  const handleRegionClick = (regionName: string) => {
    if (isFading || currentImageFile === `${regionName}.webp`) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentImageFile(`${regionName}.webp`);
      setTimeout(() => { setIsFading(false); }, 50);
    }, 300);
  };

  const handleResetImage = () => {
    if (isFading || currentImageFile === 'x.jpg') return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentImageFile('x.jpg');
      setTimeout(() => { setIsFading(false); }, 50);
    }, 300);
  };

  // 알 선택시 팝업 상태
  const [eggStep, setEggStep] = useState<number>(0);
  const [tempEgg, setTempEgg] = useState<string | null>(null);
  const [selectedEgg, setSelectedEgg] = useState<string | null>(null);

  // ✅ [수정] DB에서 저장된 알 정보를 불러오는 로직
  useEffect(() => {
    if (currentUser && studentMasterData && studentMasterData[currentUser.name]) {
      const savedEgg = studentMasterData[currentUser.name].selected_egg;
      if (savedEgg) {
        setSelectedEgg(savedEgg);
      }
    }
  }, [currentUser, studentMasterData]);

  // ==========================================
  // [6] 초기 실행 (인증 확인 및 시계)
  // ==========================================
  useEffect(() => {
    // 1초마다 시간을 업데이트하되, 월요일 18:00 기준 로직을 적용합니다.
    const timer = setInterval(() => {
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours();

      // 월요일(1)이면서 오후 6시(18시) 이전인 경우 하루 전으로 조정
      if (day === 1 && hours < 18) {
        const adjusted = new Date(now);
        adjusted.setDate(now.getDate() - 1);
        setCurrentTime(adjusted);
      } else {
        setCurrentTime(now);
      }
    }, 1000);

    const saved = localStorage.getItem('hg_auth');
    if (saved) {
      const { name, admin } = JSON.parse(saved);
      setSelectedName(name); 
      setIsAdmin(admin); 
      setIsLoggedIn(true);
    }
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // [7] 데이터 불러오기 (Supabase 연결)
  // ==========================================
  const fetchRecords = async () => {
    const [resRecords, resMaster] = await Promise.all([
      supabase.from('study_records').select('*'),
      supabase.from('student_master').select('*')
    ]);

    // 1. 주간 기록 세팅
    if (resRecords.data) {
      setRecords(resRecords.data);
      const myRecords = resRecords.data.filter(r => r.student_name === selectedName);
      const savedGoal = myRecords.find(r => r.goal && r.goal !== "")?.goal || "";
      setDailyGoal(savedGoal);
    }

    // 2. 마스터 데이터 세팅 (student_name 컬럼 사용)
    if (resMaster.data) {
      const masterObj: any = {};
      resMaster.data.forEach((item: any) => {
        // 컬럼명이 student_name이므로 이를 키값으로 저장합니다.
        const key = item.student_name; 
        masterObj[key] = item;
      });
      setStudentMasterData(masterObj);
    }
  };

  useEffect(() => { 
    if (isLoggedIn) fetchRecords(); 
  }, [isLoggedIn, selectedName]);

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
  // [9] 주간 데이터 초기화 및 용 성장 데이터 누적
  // ==========================================
  const resetWeeklyData = async () => {
    if (!confirm("⚠️ 이번 주 기록을 합산하여 용을 성장시키고 표를 초기화하시겠습니까?")) return;
    if (!confirm("정말로 진행하시겠습니까? 합산된 공부 시간은 되돌릴 수 없습니다.")) return;

    setIsSaving(true);
    try {
      const names = Object.keys(studentData);
      // 화면 즉시 반영을 위해 현재 마스터 데이터를 복사합니다.
      const newMasterData = { ...studentMasterData };

      // --- [단계 1] 용 성장을 위한 공부 시간 합산 및 마스터 테이블 누적 ---
      const updatePromises = names.map(async (name) => {
        const studentRecords = records.filter(r => r.student_name === name);
        
        let weeklyMinutes = 0;
        studentRecords.forEach(r => {
          const [h, m] = (r.study_time || "0:00").split(':').map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            weeklyMinutes += (h * 60) + m;
          }
        });

        if (weeklyMinutes > 0) {
          const { data: masterData } = await supabase
            .from('student_master')
            .select('total_study_time')
            .eq('student_name', name)
            .maybeSingle();

          const newTotal = (masterData?.total_study_time || 0) + weeklyMinutes;
          
          // ✅ 로컬 상태 업데이트 (화면 즉시 반영용)
          if (newMasterData[name]) {
            newMasterData[name].total_study_time = newTotal;
          }

          return supabase
            .from('student_master')
            .update({ total_study_time: newTotal })
            .eq('student_name', name);
        }
      });

      await Promise.all(updatePromises);
      // ✅ 합산된 전체 데이터를 상태에 한 번에 저장합니다.
      setStudentMasterData(newMasterData);

      // --- [단계 2] 기존 주간 기록표(study_records) 초기화 ---
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
      
      if (!error) { 
        setRecords(resetData); 
        alert("이번 주 기록이 용의 먹이로 전환되었으며, 표가 초기화되었습니다!"); 
      } else {
        throw error;
      }
    } catch (err) {
      console.error("Reset Error:", err);
      alert("❌ 처리 중 오류가 발생했습니다. DB 연결 상태를 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // [10] 월휴 초기화 (Monthly Reset)
  // ==========================================
  const resetMonthlyOff = async () => {
    if (!confirm("⚠️ 주의: 모든 학생의 월휴 개수를 초기화하시겠습니까?")) return;
    setIsSaving(true);

    const names = Object.keys(studentData);
    const resetData = [];

    // 현재 records에 있는 기존 데이터를 바탕으로 monthly_off_count만 4로 변경
    for (const name of names) {
      for (const day of DAYS) {
        const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
        resetData.push({
          ...existing, // 기존의 다른 데이터(비번, 시간 등)는 그대로 유지
          student_name: name,
          day_of_week: day,
          monthly_off_count: 4 // 월휴만 4로 리셋
        });
      }
    }

    const { error } = await supabase.from('study_records').upsert(resetData, { onConflict: 'student_name,day_of_week' });
    
    if (!error) { 
      setRecords(resetData); 
      alert("✅ 월휴 개수가 초기화되었습니다."); 
    }
    setIsSaving(false);
  };

  // ==========================================
  // [11] 점수 계산 및 리포트 연동 로직
  // ==========================================
  const calc = (r: any) => {
    // 1. 데이터가 없거나, 버튼이 '-' 상태인 경우 점수 계산 안 함 (0점)
    if (!r || !r.off_type || r.off_type === '-' || r.off_type === '') {
      return { penalty: 0, bonus: 0, total: 0, studyH: 0 };
    }
    
    // 2. 결석은 즉시 벌점 -5점
    if (r.off_type === '결석') return { penalty: -5, bonus: 0, total: -5, studyH: 0 };
    
    const timeVal = r.study_time || "";
    const [h, m] = timeVal.split(':').map(Number);
    const studyH = (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
    
    let penalty = 0, bonus = 0;
    
    const isHalfOff = ['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(r.off_type);
    const isFullOff = ['주휴', '월휴', '자율', '늦휴', '늦월휴'].includes(r.off_type);
    
    // A. 늦은 휴무 신청 자체 벌점 (-1)
    if (['늦반휴', '늦휴', '늦월반휴', '늦월휴'].includes(r.off_type)) {
      penalty -= 1;
    }
    
    // B. 지각 벌점 (풀휴무/자율 제외)
    if (r.is_late && !isFullOff && r.off_type !== '자율') {
      penalty -= 1;
    }
    
    // C. 시간당 상벌점 로직 (풀휴무/자율 제외)
    if (!isFullOff && r.off_type !== '자율') {
      
      // [오전 3시간 체크] 반휴 계열이 아니고 공부 기록이 있을 때 미달 시 -1
      if (!isHalfOff && r.am_3h === false && studyH > 0) {
        penalty -= 1;
      }

      // [기준 시간 미달/초과 체크]
      const target = isHalfOff ? 4 : 9;
      
      if (studyH < target) {
        penalty -= Math.ceil(target - studyH);
      } else if (!isHalfOff && studyH >= target + 1) {
        bonus += Math.floor(studyH - target);
      }
    }

    // D. 벌점 한도 적용: 벌점은 하루 최대 -5점까지만
    const finalPenalty = Math.max(penalty, -5);

    return { 
      penalty: finalPenalty, 
      bonus, 
      total: finalPenalty + bonus, 
      studyH 
    };
  };

 // ==========================================
  // [12] 요약 리포트 팝업 데이터 연동 함수
  // ==========================================

  const calculatePoints = (name: string) => {
    let bonus = 0;
    let penalty = 0;
    let usedWeeklyOff = 0;   // 주간 휴무 (1.5 기준)
    // usedMonthlyOff 변수는 이제 직접적인 연동을 위해 사용하지 않거나, 초기화만 유지합니다.

    const studentRecords = records.filter(r => r.student_name === name);

    studentRecords.forEach(r => {
      const res = calc(r);
      bonus += res.bonus;
      penalty += res.penalty;

      // 주간 휴무 계산: 반휴=0.5, 주휴=1.0 (지각휴무 포함)
      if (['반휴', '늦반휴'].includes(r.off_type)) usedWeeklyOff += 0.5;
      if (['주휴', '늦휴'].includes(r.off_type)) usedWeeklyOff += 1.0;
    });

    // [수정 요청 사항 반영] 잔여 월휴 연동: 
    // 테이블 우측의 월휴 동그라미(monthly_off_count) 값을 직접 가져옵니다.
    const monRec = studentRecords.find(r => r.day_of_week === '월');
    const offCount = monRec?.monthly_off_count ?? 4;

    return { 
      bonus, 
      penalty,
      remainingWeeklyOff: (1.5 - usedWeeklyOff).toFixed(1).replace('.0', ''),
      // 체크된 동그라미 개수당 0.5일로 계산하여 표시
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
    
    // 기준일(today)로부터 계산된 월요일과 일요일 설정
    const monday = new Date(new Date(today).setDate(diff));
    const sunday = new Date(new Date(today).setDate(diff + 6));
    
   // 출력 형식: M월 D일 ~ M월 D일
    return `${monday.getMonth() + 1}월 ${monday.getDate()}일 ~ ${sunday.getMonth() + 1}월 ${sunday.getDate()}일`;
  };

  const getDayDate = (targetDay: string) => {
    const dayIdx = DAYS.indexOf(targetDay);
    // ✅ 진짜 오늘 날짜(new Date()) 대신, 조정된 시계(currentTime)를 사용합니다.
    const today = currentTime; 
    const currentDay = today.getDay();
    const diff = today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + dayIdx;
    
    // ✅ target 계산 시에도 기준이 되는 today(currentTime)를 넣어줘야 정확합니다.
    const target = new Date(new Date(today).setDate(diff));
    return `${target.getMonth() + 1}.${target.getDate()}`;
  };

  const getMonthAccumulatedTime = (name: string) => {
    // ✅ 여기도 currentTime을 기준으로 월을 판단합니다.
    const currentMonth = currentTime.getMonth() + 1; 
    let totalMinutes = 0;
    
    // records 배열에 있는 모든 study_time을 합산하여 월 누적치 생성
    records.filter(r => r.student_name === name).forEach(r => {
      const [h, m] = (r.study_time || "0:00").split(':').map(Number);
      totalMinutes += (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
    });

    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const accumulatedTime = `${hrs}:${mins.toString().padStart(2, '0')}`;

    return [{ month: currentMonth, time: accumulatedTime }];
  };

  // ==========================================
  // [13] 기숙사 랭킹 계산
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
  // [14] 배경음악(BGM) 로직
  // ==========================================
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm] = useState(() => typeof Audio !== 'undefined' ? new Audio('/hedwig.mp3') : null);

  const toggleMusic = () => {
    if (!bgm) return;
    if (isPlaying) {
      bgm.pause();
    } else {
      bgm.loop = true;
      bgm.volume = 0.4; // 볼륨 40%
      bgm.play().catch(e => console.log("음악 재생 실패:", e));
    }
    setIsPlaying(!isPlaying);
  };

  // ==========================================
  // [15] 비밀번호 변경 및 저장 로직
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

  // ==========================================
  // [16] 목표 변경 및 저장 로직
  // ==========================================
      const updatePayload = DAYS.map(d => {
        const existing = records.find(r => r.student_name === name && r.day_of_week === d) || {};
        return { 
          ...existing, 
          student_name: name, 
          day_of_week: d, 
          goal: value, // 수정된 목표값
          password: existing.password || '0000',
          monthly_off_count: existing.monthly_off_count ?? 4
        };
      });

      const { error } = await supabase.from('study_records').upsert(updatePayload, { onConflict: 'student_name,day_of_week' });
      
      if (!error) {
        // [수정/저장 반영] 전체 records에서 해당 학생의 모든 요일 목표를 value로 통일
        setRecords(prev => prev.map(r => r.student_name === name ? { ...r, goal: value } : r));
        
        // UI 상태 동기화 (저장 버튼 클릭 후 입력 모드 해제 등)
        setDailyGoal(value);
        setIsEditingGoal(false); // 수정 완료 후 버튼 상태를 다시 '수정'으로 변경하기 위함
      }
    }
    else {

  // ==========================================
  // [17] 일반 학습 기록 수정 구역 (휴무, 지각, 시간 등)
  // ==========================================
      const newRecords = [...records];
      const idx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === day);
      const current = newRecords[idx] || {};
      const updatedData = { 
        ...current,
        student_name: name, 
        day_of_week: day, 
        [field]: value, 
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
  // [18] 로그인 화면 (Render Login)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <style>{GLOVAL_STYLE}</style>
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>
          <div className="flex justify-center mb-10">
            <img 
              src="https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/Hogwarts.png" 
              alt="Hogwarts" 
              className="w-56 h-auto object-contain" 
            />
          </div>
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
  // [19] 메인 화면 데이터 준비 (학생 필터링 등)
  // ==========================================
  const displayList = isAdmin 
    ? Object.keys(studentData).sort((a, b) => {
        const houseDiff = HOUSE_ORDER.indexOf(studentData[a].house) - HOUSE_ORDER.indexOf(studentData[b].house);
        return houseDiff !== 0 ? houseDiff : sortKorean(a, b);
      })
    : [selectedName];

  // ==========================================
  // [20] 애니메이션/체크박스 충돌 없는 안전한 이름 추출 함수
  // ==========================================
  const formatDisplayName = (name: any): string => {
    if (!name || typeof name !== 'string') return "";
    try {
      // 이모지를 지우는 대신, "한글/영어/숫자" 덩어리만 찾아서 가져옵니다.
      // 복잡한 유니코드 범위를 건드리지 않아 애니메이션과 디자인이 깨지지 않습니다.
      const match = name.match(/[가-힣a-zA-Z0-9]+/);
      return match ? match[0].trim() : name;
    } catch (e) {
      return String(name);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-2 md:p-4 pb-16 font-sans relative">
      <style>{`
        ${GLOVAL_STYLE}
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
        .late-checkbox:checked { background: #f59e0b; border-color: #f59e0b; }
        .late-checkbox:disabled { cursor: default; }
        .winner-sparkle { box-shadow: 0 0 20px rgba(250, 204, 21, 0.4); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
      
      
{/*[21] 기숙사별 공지사항 팝업 */}
      {selectedHouseNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedHouseNotice(null)}>
          <div className="relative bg-[#f4e4bc] p-6 md:p-12 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()} style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)' }}>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }}></div>
            <button onClick={() => setSelectedHouseNotice(null)} className="absolute top-2 right-2 md:top-4 md:right-4 text-slate-800 hover:rotate-90 transition-transform p-2 text-2xl z-20">✕</button>
            <div className="relative z-10 font-serif flex flex-col overflow-hidden">
              <div className="w-16 h-1 bg-slate-800/20 mx-auto mb-4 md:mb-6 shrink-0"></div>
              <h3 className="text-xl md:text-3xl font-black text-[#4a3728] mb-4 md:mb-6 text-center italic border-b border-[#4a3728]/20 pb-4 shrink-0 px-4">{(HOUSE_NOTICES as any)[selectedHouseNotice]?.title}</h3>
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-base md:text-lg leading-relaxed text-[#5d4037] whitespace-pre-wrap font-medium">
                  {(HOUSE_NOTICES as any)[selectedHouseNotice]?.content}
                </div>
                <div className="mt-8 mb-4 text-right italic font-bold text-[#4a3728]/60">— Hogwarts School of Witchcraft and Wizardry —</div>
              </div>
            </div>
          </div>
        </div>
      )}

 {/*[22] 관리자 화면 요약 확인 팝업 (전체 기숙사 요약) */}
      {showSummary && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowSummary(false)}>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowSummary(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors text-2xl font-black">✕</button>
            <h3 className="text-2xl font-serif font-black text-slate-800 mb-8 italic tracking-tighter border-b-2 border-slate-100 pb-4 text-center">House Weekly Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-slate-300 overflow-hidden rounded-xl">
              {HOUSE_ORDER.map(house => {
                const studentsInHouse = Object.keys(studentData).filter(name => studentData[name].house === house);
                const config = (HOUSE_CONFIG as any)[house];
                return (
                  <div key={house} className="flex flex-col border-r border-b border-slate-300">
                    <div className={`${config.bg} p-2 text-white font-black text-center text-[11px] tracking-widest`}>{config.icon} {house}</div>
                    <div className="flex flex-col flex-1 divide-y divide-slate-200">
                      {studentsInHouse.sort(sortKorean).map(name => {
                        const emoji = studentData[name].emoji || "👤";
                        let tMins = 0;
                        records.filter(r => r.student_name === name).forEach(r => {
                          const [h, m] = (r.study_time || "").split(':').map(Number);
                          tMins += (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
                        });
                        return (
                          <div key={name} className="flex h-10">
                            <div className={`w-10 flex items-center justify-center text-lg border-r border-slate-200 ${config.bg.replace('bg-', 'bg-opacity-10 bg-')}`}>{emoji}</div>
                            <div className="flex-1 flex items-center justify-center font-black text-sm text-slate-700 bg-white">
                              <span className={tMins < 1200 ? "text-red-500" : "text-slate-800"}>{tMins > 0 ? `${Math.floor(tMins/60)}:${(tMins%60).toString().padStart(2,'0')}` : "-"}</span>
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

      {/*[23] 상단 헤더 및 기숙사 점수판 구역 */}
      <div className="max-w-[1100px] mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-black text-slate-800 italic tracking-tight">Hogwarts School</h2>
          <div className="flex gap-2">

            {/* [24] 음악 및 관리자 버튼들 */}
            <button 
              onClick={toggleMusic} 
              className={`text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm transition-all border-2 ${
                isPlaying ? 'bg-white border-yellow-400 text-yellow-500 animate-pulse' : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              {isPlaying ? '🎵' : '🔇'}
            </button>
            {isAdmin && <button onClick={() => setShowSummary(true)} className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-indigo-700">요약</button>}
            {isAdmin && <button onClick={resetWeeklyData} className="text-[10px] font-black text-white bg-red-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-red-700">W re</button>}
            {isAdmin && (
              <button onClick={resetMonthlyOff} className="text-[10px] font-black text-white bg-orange-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-orange-700">M re</button>
            )}
            <button onClick={() => { localStorage.removeItem('hg_auth'); window.location.reload(); }} className="text-[10px] font-black text-slate-400 bg-white border-2 px-3 py-1.5 rounded-full shadow-sm">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 md:gap-4">
          {houseRankings.map((item, idx) => {
            const config = (HOUSE_CONFIG as any)[item.house];
            return (
              <div key={item.house} onClick={() => setSelectedHouseNotice(item.house as any)} className={`${config.bg} ${config.border} ${idx === 0 ? 'winner-sparkle ring-4 ring-yellow-400 ring-offset-2' : ''} border-b-4 p-1.5 md:p-5 rounded-xl md:rounded-[2rem] text-white shadow-xl relative cursor-pointer active:scale-95 transition-all hover:brightness-110 overflow-hidden`}>
                <div className="absolute right-[-10px] bottom-[-10px] text-5xl md:text-7xl opacity-20 pointer-events-none">{config.icon}</div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[7px] md:text-xs font-black opacity-90 tracking-widest">{item.house}</div>
                    <div className={`text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-full ${config.accent} text-slate-900 shadow-sm`}>{["1st", "2nd", "3rd", "4th"][idx]}</div>
                  </div>
                  <div className="text-lg md:text-4xl font-black italic">{(Math.round(item.finalPoint * 10) / 10).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* [25] 학습 기록 메인 테이블 및 목표 */}
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
              <span className="text-[9px] font-black text-white/40 shrink-0 uppercase tracking-tighter">Goal</span>
              <div className="flex items-center gap-2 flex-1 overflow-hidden group">
                <input 
                  type="text"
                  value={dailyGoal || ""}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  placeholder="목표를 입력하세요."
                  className="bg-transparent italic text-xs w-full focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5 transition-all text-white/90"
                />
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => { const t = displayList[0]; if (t) handleChange(t, '월', 'goal', dailyGoal); }} className="text-[10px] font-bold text-yellow-500">[저장]</button>
                  <button onClick={() => { if(confirm("삭제하시겠습니까?")) { const t = displayList[0]; setDailyGoal(""); if (t) handleChange(t, '월', 'goal', ""); }}} className="text-[10px] font-bold text-red-400">[삭제]</button>
                </div>
              </div>
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
                let tMins = 0; let tPts = 0;
                records.filter(r => r.student_name === name).forEach(r => {
                  const res = calc(r);
                  const [h, m] = (r.study_time || "").split(':').map(Number);
                  tMins += (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
                  tPts += res.total;
                });
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
                          <td rowSpan={7} className={`p-4 text-center sticky left-0 z-20 font-bold border-r-[3px] ${info.color} ${info.text} cursor-pointer hover:brightness-95 transition-all`} onClick={() => setSelectedStudentReport(name)}>
                            <div className="text-3xl mb-1">{info.emoji}</div>
                            <div className="leading-tight text-sm font-black mb-1">{formatDisplayName(name)}</div>
                            <div className="text-[9px] font-black opacity-70 mb-2">{info.house}</div>
                            <button onClick={(e) => { e.stopPropagation(); const newPw = prompt("숫자 4자리"); if (newPw && /^\d{4}$/.test(newPw)) handleChange(name, '월', 'password', newPw); }} className="text-[8px] underline opacity-40 block mx-auto">PW 변경</button>
                          </td>
                        )}
                        {DAYS.map(day => {
                          const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
                          const res = calc(rec);
                          return (
                            <td key={day} className={`p-1.5 text-center border-r border-slate-50 ${row.f === 'off_type' ? (['반휴','월반휴','늦반휴','늦월반휴'].includes(rec.off_type) ? 'bg-green-100' : ['주휴','월휴','늦휴','늦월휴'].includes(rec.off_type) ? 'bg-blue-100' : rec.off_type === '결석' ? 'bg-red-100' : '') : ''}`}>
                              {row.f === 'off_type' ? (
                                <select className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-[10px]" value={rec.off_type || '-'} onChange={(e) => handleChange(name, day, 'off_type', e.target.value)} disabled={!isAdmin}>
                                  {OFF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              ) : row.f === 'is_late' ? (
                                <input type="checkbox" className="late-checkbox" checked={!!rec.is_late} onChange={(e) => handleChange(name, day, 'is_late', e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'am_3h' ? (
                                <input type="checkbox" className="w-3.5 h-3.5 accent-slate-800 mx-auto block" checked={!!rec.am_3h} onChange={(e) => handleChange(name, day, 'am_3h', e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'study_time' ? (
                                <input type="text" className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-sm" placeholder="-" value={rec.study_time || ''} 
                                  onChange={(e) => setRecords(prev => prev.map(r => (r.student_name === name && r.day_of_week === day) ? {...r, study_time: e.target.value} : r))}
                                  onBlur={(e) => handleChange(name, day, 'study_time', e.target.value)} disabled={!isAdmin} />
                              ) : (
                                <span className={`font-black text-sm ${row.f === 'penalty' && res.penalty < 0 ? 'text-red-500' : row.f === 'bonus' && res.bonus > 0 ? 'text-blue-600' : 'text-slate-900'}`}>{res[row.f as keyof typeof res] || (row.f === 'total' ? 0 : '')}</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="bg-slate-50 text-center font-black border-l">
                          {rIdx === 3 && <div className={`text-sm font-black ${tMins < 1200 ? 'text-red-600' : 'text-slate-900'}`}>{tMins > 0 ? `${Math.floor(tMins/60)}:${(tMins%60).toString().padStart(2,'0')}` : "-"}</div>}
                          {rIdx === 6 && <div className={`text-[10px] font-black py-1 rounded ${tPts <= -10 ? 'text-red-600 bg-red-50' : 'text-blue-700 bg-blue-50'}`}>합계: {tPts.toFixed(1).replace('.0', '')}</div>}
                        </td>
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-2 bg-white border-l text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {[1, 2, 3, 4].map((n) => (
                                <div key={n} onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', offCount >= (5-n) ? (5-n)-1 : offCount)} 
                                     className={`w-7 h-5 rounded-md border-2 ${isAdmin ? 'cursor-pointer' : ''} ${offCount >= (5-n) ? info.accent : 'bg-slate-50 border-slate-200'}`} />
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

{/* [26] 드래곤 키우기 */}
      <div className="mt-16 px-4 pb-24 text-left max-w-6xl mx-auto">
        <hr className="border-slate-200 mb-10" />

        <h2 
          className="text-2xl font-black italic mb-8 uppercase" 
          style={{ 
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.1em',
            color: '#1b1e21',
            transform: 'skewX(-5deg)'
          }}
        >
          Dragon Cave
        </h2>

        {/* 지역명 버튼 영역 */}
        <div className="grid grid-cols-3 gap-2 mb-8 max-w-sm">
          {['volcano', 'jungle', 'forest', 'desert', 'coast', 'alpine'].map((region) => (
            <button
              key={region}
              onClick={() => handleRegionClick(region)}
              className={`py-2 text-[11px] font-black tracking-tighter transition-all rounded-md border uppercase
                ${currentImageFile === `${region}.webp` 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                  : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600 hover:bg-slate-50' 
                }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* 리셋 버튼 & 이미지 영역 */}
        <div className="relative">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleResetImage}
              className="text-[9px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors"
            >
              [ Reset Habitat ]
            </button>
          </div>

          <div className="w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 relative aspect-video">
          
            {/* 배경 이미지 */}
            <img 
              src={`https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${currentImageFile}`}
              alt="Dragon Habitat"
              className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = "https://via.placeholder.com/1200x675?text=Habitat+Image+Not+Found";
              }}
            />

            {/* 드래곤 성장 표시 로직 */}
            {selectedEgg && (currentImageFile === 'main.webp' || currentImageFile === 'x.jpg') && (() => {
              const eggFileName = selectedEgg.split('/').pop() || "";
              const prefix = eggFileName.substring(0, 2); 
              const eggNum = eggFileName.replace(/[^0-9]/g, '').charAt(0);

              // ✅ 현재 로그인한 사용자의 실시간 누적 공부 시간 가져오기
              const studentName = selectedName; // 현재 선택된(로그인된) 학생 이름
              const masterData = studentMasterData[studentName];
              const totalMinutes = Number(masterData?.total_study_time || 0);

              // 📈 성장 단계 계산 (12000분 = 200시간)
              let levelCount = 1;
              if (totalMinutes >= 12000) levelCount = 4;
              else if (totalMinutes >= 9000) levelCount = 3;
              else if (totalMinutes >= 6000) levelCount = 2;

              const baseUrl = "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/";
              const repeatNum = eggNum.repeat(levelCount); 
              const evolutionImage = `${baseUrl}${prefix}${repeatNum}.webp`;

              return (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <div className="relative flex flex-col items-center translate-y-12 md:translate-y-16">
                    <div className="absolute -bottom-1 w-6 h-1.5 md:w-12 md:h-3 bg-black/30 rounded-[100%] blur-[6px]" />
                    <img 
                      src={evolutionImage} 
                      alt="Dragon"
                      className="relative w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-2xl animate-bounce-slow"
                      onError={(e) => { e.currentTarget.src = selectedEgg; }} 
                    />
                  </div>
                </div>
              );
            })()}

            {/* 지역별 알 선택 레이어 */}
            {!isFading && !['main.webp', 'x.jpg'].includes(currentImageFile) && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 px-4 z-20">
                {[1, 2, 3].map((num) => {
                  const prefix = currentImageFile.split('.')[0].substring(0, 2).toLowerCase();
                  const eggUrl = `https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${prefix}${num}.webp`;
                  
                  return (
                    <div key={num} className="relative group flex flex-col items-center">
                      <div className="absolute -bottom-1 w-6 h-1.5 md:w-8 md:h-2 bg-black/40 rounded-[100%] blur-[4px] group-hover:scale-125 transition-transform duration-300" />
                      <img
                        src={eggUrl}
                        alt="Dragon Egg"
                        onClick={() => { setTempEgg(eggUrl); setEggStep(1); }}
                        className="relative w-12 h-12 md:w-16 md:h-16 object-contain hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                        onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 이중 확인 팝업 */}
        {eggStep > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center border-4 border-slate-100">
              <h3 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tighter" style={{ fontFamily: "'Cinzel', serif" }}>
                {eggStep === 1 ? "이 알을 데려갈까요?" : "정말 이 알을 데려갈까요?"}
              </h3>
              <p className="text-slate-500 mb-6 text-sm italic">
                {eggStep === 1 ? "따스한 온기가 느껴지는 알입니다." : "한 번 데려가면 졸업 전까지 함께 해야 합니다."}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    if (eggStep === 1) setEggStep(2);
                    else {
                      // ✅ DB 업데이트 (컬럼명 student_name으로 수정 완료)
                      if (selectedName && tempEgg) {
                        try {
                          await supabase
                            .from('student_master')
                            .update({ selected_egg: tempEgg })
                            .eq('student_name', selectedName);
                        } catch (error) {
                          console.error("Egg Save Error:", error);
                        }
                      }
                      setSelectedEgg(tempEgg);
                      setEggStep(0);
                      handleResetImage();
                    }
                  }}
                  className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs"
                >
                  네
                </button>
                <button
                  onClick={() => { setEggStep(0); setTempEgg(null); }}
                  className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                >
                  고민해볼게요
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* [27] 학생 개인 리포트 팝업 */}
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
    </div>
  );
};
