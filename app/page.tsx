"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import Link from 'next/link';

// ==========================================
// 타입 정의
// ==========================================
type StudentInfo = {
  house: string;
  emoji: string;
  color: string;
  accent: string;
  text: string;
};

type Record = {
  student_name: string;
  day_of_week: string;
  off_type?: string;
  is_late?: boolean;
  am_3h?: boolean;
  study_time?: string;
  password?: string;
  monthly_off_count?: number;
  goal?: string;
};

type HistoryEntry = {
  round: number;
  totalPages: number;
  days: number;
  completedAt: string;
  startDate: string;
};

// ==========================================
// 상수
// ==========================================
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const OFF_OPTIONS = ['-', '출석', '반휴', '주휴', '월휴', '월반휴', '자율', '결석', '늦반휴', '늦휴', '늦월반휴', '늦월휴'];
const HOUSE_ORDER = ["슬리데린", "래번클로", "그리핀도르", "후플푸프"];

const HOUSE_CONFIG: Record<string, { bg: string; border: string; icon: string; accent: string }> = {
  "슬리데린":  { bg: "bg-emerald-600", border: "border-emerald-700", icon: "🐍", accent: "bg-emerald-400" },
  "래번클로":  { bg: "bg-blue-700",    border: "border-blue-800",    icon: "🦅", accent: "bg-blue-400"    },
  "그리핀도르": { bg: "bg-red-700",     border: "border-red-800",     icon: "🦁", accent: "bg-red-400"     },
  "후플푸프":  { bg: "bg-amber-500",   border: "border-amber-600",   icon: "🦡", accent: "bg-amber-300"   },
};

const HOUSE_LOGOS: Record<string, string> = {
  "그리핀도르": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/gry.png",
  "슬리데린":  "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/sly.png",
  "래번클로":  "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/rav.png",
  "후플푸프":  "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/huf.png",
};

const DRAGON_MESSAGES: Record<number, string[]> = {
  1: [
    '…….', '…….', '…….', '…….', '…….',
    '…….', '…….', '…….', '…….',
    '알이 조금 움직인 것 같다...',
    '알 껍데기 너머로 아주 작은 고동소리가 들린다.',
    '따스한 온기가 느껴지는 알이다.',
    '알 표면에 미세한 금이 간 것 같기도...?',
    '알 주변의 공기가 기분 좋게 따스하다.',
    '알 속에 아주 강력한 마력이 응축되어 있는 것이 느껴진다.',
    '알이 당신의 목소리에 반응해 미세하게 떨린다.',
    '알을 가만히 안아보니 마음이 평온해지는 기분이다.',
    '알이 꿈을 꾸고 있는것 같다.',
    '당신이 집중할 때마다 알의 광채가 더 선명해진다.',
    '이름을 불러주니 알이 조금 움직였다!',
  ],
  2: [
    '…….', '…….', '…….', '…….', '…….',
    '…….', '…….', '…….', '…….', '…….',
    '배가 고픈지 손가락을 깨문다!',
    '주변을 호기심 어린 눈으로 본다.',
    '작은 불꽃을 내뿜으려 노력 중이다.',
    '공부하는 당신의 옆에 찰싹 붙어 졸고 있다.',
    '머리를 긁어주자 고양이처럼 골골대는 것 같다...',
    '당신이 펜을 움직일 때마다 고개가 좌우로 바쁘게 움직인다.',
    '당신이 자리를 비우려 하자 옷자락을 물고 놓아주지 않는다.',
    '서툰 울음소리로 당신의 이름을 부르려 노력한다.',
    '아기용이 당신의 펜을 죄다 물어뜯어놓았다...',
    '공부하는 당신 곁에서 낮잠을 자고 있다.',
    '당신을 부모라고 생각하는 것 같다.',
  ],
  3: [
    '…….', '…….', '…….', '…….', '…….',
    '…….', '…….', '…….', '…….',
    '날갯짓이 제법 힘차졌다.',
    '처음으로 날개를 펴고 당신의 머리 위를 짧게 활공했다!',
    '이제는 제법 드래곤다운 울음소리를 낸다.',
    '공부하는 당신의 어깨 너머로 책 내용을 같이 읽는 듯하다.',
    '날개를 파닥거리며 주변의 먼지를 다 날려버리고는 뿌듯해한다.',
    '자신의 발톱을 유심히 살피고 있다.',
    '당신이 펜을 놓으면 얼른 다시 공부하라는 듯 코를 킁킁거린다.',
    '꽤 높이 날아올라 천장에 닿을뻔한 기록을 세웠다!',
    '이제는 간단한 명령을 알아듣는다.',
    '공부하는 당신을 지켜보고 있다.',
  ],
  4: [
    '…….', '…….', '…….', '…….', '…….',
    '…….', '…….', '…….', '…….',
    '이제는 당신을 등에 태우고 구름 위를 날 수 있을 만큼 자랐다.',
    '비늘 사이로 뿜어져 나오는 마력이 당신을 더욱 지혜롭게 한다.',
    '누구도 당신을 방해하지 못하도록 문 앞을 지키고 있다.',
    '보고 있으면 모든 잡념이 정화되는 기분이다.',
    '당신을 태우고 하늘을 날고 싶어한다.',
    '강력한 마력의 기운이 뿜어져 나오고 있다.',
    '영원히 당신의 곁을 지킬 것이다.',
    '영원히 당신의 행복을 바라고 있다.',
    '피곤한 당신을 위해 당신에게 마력을 불어넣어 주고 있다.',
    '언제나 당신을 응원하고 있다.',
  ],
};

// ==========================================
// 학생 명단
// ==========================================
const studentData: Record<string, StudentInfo> = {
  "🤖로봇":  { house: "슬리데린", emoji: "🤖", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐾발자국": { house: "슬리데린", emoji: "🐾", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐆표범":  { house: "슬리데린", emoji: "🐆", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐡복어":  { house: "슬리데린", emoji: "🐡", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐶강쥐":  { house: "슬리데린", emoji: "🐶", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🦔도치":  { house: "슬리데린", emoji: "🦔", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🎂케이크": { house: "슬리데린", emoji: "🎂", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐻곰돌":  { house: "슬리데린", emoji: "🐻", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🪙갈레온": { house: "래번클로", emoji: "🪙", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "💫별":    { house: "래번클로", emoji: "💫", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🍪쿠키":  { house: "래번클로", emoji: "🍪", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐯호랑":  { house: "래번클로", emoji: "🐯", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🌳나무":  { house: "래번클로", emoji: "🌳", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "👑왕관":  { house: "래번클로", emoji: "👑", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐬돌고래": { house: "래번클로", emoji: "🐬", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🪶깃털":  { house: "래번클로", emoji: "🪶", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐱냥이":  { house: "그리핀도르", emoji: "🐱", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🐺늑대":  { house: "그리핀도르", emoji: "🐺", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦉올뺌":  { house: "그리핀도르", emoji: "🦉", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦦수달":  { house: "그리핀도르", emoji: "🦦", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦄유니콘": { house: "그리핀도르", emoji: "🦄", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦋나비":  { house: "그리핀도르", emoji: "🦋", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🔥불꽃":  { house: "그리핀도르", emoji: "🔥", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🍋레몬":  { house: "그리핀도르", emoji: "🍋", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🫧거품":  { house: "후플푸프", emoji: "🫧", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐎말":    { house: "후플푸프", emoji: "🐎", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐈‍⬛깜냥": { house: "후플푸프", emoji: "🐈‍⬛", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🦊여우":  { house: "후플푸프", emoji: "🦊", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🦖공룡":  { house: "후플푸프", emoji: "🦖", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "💚초록":  { house: "후플푸프", emoji: "💚", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐧펭귄":  { house: "후플푸프", emoji: "🐧", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐿️다람":  { house: "후플푸프", emoji: "🐿️", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
};

// ==========================================
// 기숙사 공지사항
// ==========================================
const HOUSE_NOTICES: Record<string, { title: string; content: string }> = {
  "래번클로": {
    title: `푸른 지성, 1위의 자리를 되찾다!`,
    content: `자랑스러운 래번클로 학우 여러분! 우리가 드디어 1위의 자리에 올랐습니다. 
설 연휴 3일간의 자율학습 기간에 보여준 여러분의 몰입도는 경이로웠습니다. 남들이 명절 음식을 즐길 때 여러분이 페이지를 넘기며 쌓아 올린 시간이 모여 이 푸른 깃발을 연회장에 세웠습니다. 플리트윅 교수님께서도 여러분의 지적 절제력에 크게 감탄하셨습니다.

하지만 승리에 취해 방심하지 마십시오. 연휴 후유증으로 인해 독수리 문고리의 질문에 대답하는 속도가 느려졌다는 보고가 있습니다. 오늘 저녁 휴게실에서 집중력 향상을 위한 명상 시간을 가질 예정이니, 맑은 정신으로 다음 주 점수도 사수합시다. 
지혜는 멈추지 않는 자의 것입니다!

`,
  },
  "그리핀도르": {
    title: `연휴 후유증을 날려버릴 사자의 포효!`,
    content: `그리핀도르 학우 여러분! 지난주 래번클로와 정말 근소한 차이로 2위를 기록했습니다. 연휴 동안 달콤한 휴식을 뒤로했던 많은 사자의 용기에 박수를 보냅니다. 
비록 1위는 놓쳤지만, 우리의 기세는 그 어느 때보다 뜨겁습니다. 네빌 롱보텀 교수님께서는 "연휴 뒤에 찾아오는 나태함이야말로 우리가 싸워야 할 가장 큰 괴물"이라고 말씀하셨습니다.

연휴 동안 늦잠 자던 습관 때문에 아침 수업에 지각하는 이들이 속출하고 있습니다. 이번 주 아침마다 반장들이 직접 기상 주문으로 여러분을 깨울 예정이니 각오하십시오! 
흐트러진 복장을 정돈하고 다시 그리핀도르답게 당당하게 복도를 누빕시다. 역전은 이제 시작입니다!

`,
  },
  "슬리데린": {
    title: `4위는 추진력을 얻기 위함일 뿐, \n차가운 복수를 설계합시다!\n`,
    content: `슬리데린 학우 여러분, 현재 4위라는 성적표는 우리에게 어울리지 않는 얼룩입니다. 설 연휴의 들뜬 분위기에 취해 시간을 낭비한 이들은 반성하십시오. 하지만 슬러그혼 교수님께서는 "진정한 승부사는 마지막에 웃는 법"이라며, 연휴가 끝난 지금부터가 진짜 실력을 드러낼 타이밍이라고 강조하셨습니다.

이번 주, 우리는 타 기숙사 애들이 연휴 후유증으로 비틀거릴 때 완벽하게 일상으로 복귀해야 합니다. 이번 주 수업 시간에 쏟아질 가산점은 모두 우리의 것이 되어야 합니다. 

해그리드 오두막의 용 알 부화 소동에 정신 팔리지 말고, 그 에너지를 지팡이 끝에 모으십시오. 2월 4주차 새로운 암호는 '철저한 재기'입니다. 그림자 속에서 다시 정상을 향해 움직입시다!

`,
  },
  "후플푸프": {
    title: `다시 시작하는 오소리들의 발걸음`,
    content: `친애하는 후플푸프 학우 여러분, 지난주 3위를 기록하며 잠시 숨을 고르는 시간을 가졌습니다. 설 연휴 동안 서로 음식을 나누고 신입생들을 챙기느라 고생 많으셨습니다. 스프라우트 교수님께서는 여러분의 다정함이 상점보다 더 귀한 가치라고 다독여 주셨지만, 이제는 다시 성실함의 본때를 보여줄 때입니다.

연휴 동안 비어있던 온실에 물을 주고 식물들을 돌보며 다시 일상으로 돌아갑시다. 이번 주에는 휴게실에 함께 모여 과제를 마무리하는 스터디 메이트 시간을 운영할 예정입니다. 혼자보다는 함께일 때 더 멀리 갈 수 있는 후플푸프의 힘을 보여줍시다!

`,
  },
};

// ==========================================
// 전역 스타일
// ==========================================
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

  body {
    font-family: 'Cinzel', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto,
      'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  }
  .font-serif { font-family: 'Cinzel', serif; }

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
  .winner-sparkle::before { animation: pixie-dust 3s infinite linear; }
  .winner-sparkle::after  { background-position: 150px 75px; animation: pixie-dust 4s infinite linear reverse; }

  @keyframes pixie-dust {
    0%   { transform: scale(0.8) translate(0, 0);       opacity: 0; }
    20%  { opacity: 0.8; }
    50%  { transform: scale(1.1) translate(5px, -10px); opacity: 1; filter: brightness(1.5) blur(0.5px); }
    80%  { opacity: 0.8; }
    100% { transform: scale(1.2) translate(10px, -20px); opacity: 0; }
  }
  @keyframes winner-glow {
    from { box-shadow: 0 0 15px rgba(255,215,0,0.4), inset 0 0 8px rgba(255,255,255,0.1); }
    to   { box-shadow: 0 0 35px rgba(255,215,0,0.7), inset 0 0 20px rgba(255,255,255,0.3); }
  }

  table select {
    appearance: none;
    -webkit-appearance: none;
    text-align-last: center;
    padding: 0 !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    height: 100%;
  }
  .custom-scrollbar::-webkit-scrollbar       { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
  .late-checkbox {
    appearance: none; -webkit-appearance: none;
    width: 1.25rem; height: 1.25rem;
    border: 2px solid #cbd5e1; border-radius: 50%;
    cursor: pointer; transition: background 0.2s, border-color 0.2s;
    position: relative; background: white; outline: none;
    margin: 0 auto; display: block;
  }
  .late-checkbox:checked  { background: #f59e0b; border-color: #f59e0b; }
  .late-checkbox:disabled { cursor: default; }
`;

// ==========================================
// 유틸 함수
// ==========================================
const sortKorean = (a: string, b: string) => {
  const clean = (s: string) => s.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
  return clean(a).localeCompare(clean(b), 'ko');
};

const formatDisplayName = (name: string): string => {
  if (!name) return "";
  const match = name.match(/[가-힣a-zA-Z0-9]+/);
  return match ? match[0].trim() : name;
};

const minutesToTimeStr = (mins: number) =>
  `${Math.floor(mins / 60)}:${(mins % 60).toString().padStart(2, '0')}`;

const timeStrToMinutes = (timeStr: string) => {
  const [h, m] = (timeStr || "0:00").split(':').map(Number);
  return (isNaN(h) ? 0 : h * 60) + (isNaN(m) ? 0 : m);
};

// ==========================================
// 점수 계산
// ==========================================
const calc = (r: any) => {
  if (!r || !r.off_type || r.off_type === '-' || r.off_type === '')
    return { penalty: 0, bonus: 0, total: 0, studyH: 0 };

  if (r.off_type === '결석')
    return { penalty: -5, bonus: 0, total: -5, studyH: 0 };

  const [h, m] = (r.study_time || "").split(':').map(Number);
  const studyH = (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);

  const isHalfOff    = ['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(r.off_type);
  const isFullOff    = ['주휴', '월휴', '늦휴', '늦월휴'].includes(r.off_type);
  const isAutonomous = r.off_type === '자율';
  const isLateOff    = ['늦반휴', '늦휴', '늦월반휴', '늦월휴'].includes(r.off_type);

  let penalty = 0;
  let bonus   = 0;

  if (isLateOff) penalty -= 1;
  if (r.is_late && !isFullOff && !isAutonomous) penalty -= 1;

  if (!isFullOff) {
    if (!isAutonomous) {
      if (!isHalfOff && r.am_3h === false && studyH > 0) penalty -= 1;
      const target = isHalfOff ? 4 : 9;
      if (studyH < target) penalty -= Math.ceil(target - studyH);
    }
    if (!isHalfOff && studyH >= 10) bonus += Math.floor(studyH - 9);
  }

  const finalPenalty = Math.max(penalty, -5);
  return { penalty: finalPenalty, bonus, total: finalPenalty + bonus, studyH };
};

// ==========================================
// 메인 컴포넌트
// ==========================================
export default function HogwartsApp() {

  // ── 상태 ──────────────────────────────
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [password,     setPassword]     = useState("");
  const [records,      setRecords]      = useState<any[]>([]);
  const [isSaving,     setIsSaving]     = useState(false);
  const [studentMasterData, setStudentMasterData] = useState<any>({});

  // Dragon Cave
  const [currentImageFile, setCurrentImageFile] = useState('x.jpg');
  const [isFading,   setIsFading]   = useState(false);
  const [eggStep,    setEggStep]    = useState(0);
  const [tempEgg,    setTempEgg]    = useState<string | null>(null);
  const [selectedEgg, setSelectedEgg] = useState<string | null>(null);
  const [dragonName,  setDragonName]  = useState("이름 없는 용");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempName,    setTempName]    = useState("");

  // UI
  const [currentTime,         setCurrentTime]         = useState(getAdjustedToday());
  const [selectedHouseNotice, setSelectedHouseNotice] = useState<string | null>(null);
  const [showSummary,         setShowSummary]         = useState(false);
  const [selectedStudentReport, setSelectedStudentReport] = useState<string | null>(null);
  const [dailyGoal,     setDailyGoal]     = useState("");
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [bgm] = useState(() =>
    typeof Audio !== 'undefined' ? new Audio('/hedwig.mp3') : null
  );

  // ── 유틸 ──────────────────────────────
  function getAdjustedToday() {
    const now = new Date();
    if (now.getDay() === 1 && now.getHours() < 18) {
      const adjusted = new Date(now);
      adjusted.setDate(now.getDate() - 1);
      return adjusted;
    }
    return now;
  }

  // ── 게이지 계산 ───────────────────────
  const totalStudyTime = studentMasterData[selectedName]?.total_study_time || 0;
  const progress = (() => {
    if (totalStudyTime < 6000)  return (totalStudyTime / 6000) * 100;
    if (totalStudyTime < 12000) return ((totalStudyTime - 6000)  / 6000) * 100;
    if (totalStudyTime < 18000) return ((totalStudyTime - 12000) / 6000) * 100;
    return 100;
  })();

  // ── 기숙사 랭킹 ───────────────────────
  const houseRankings = useMemo(() => {
    return HOUSE_ORDER.map(house => {
      const students = Object.keys(studentData).filter(n => studentData[n].house === house);
      let tScore = 0, tH = 0;
      students.forEach(name => {
        DAYS.forEach(day => {
          const res = calc(records.find(r => r.student_name === name && r.day_of_week === day));
          tScore += res.total;
          tH     += res.studyH;
        });
      });
      const avg = students.length > 0
        ? (tScore / students.length) + Math.floor(tH / students.length)
        : 0;
      return { house, finalPoint: avg };
    }).sort((a, b) => b.finalPoint - a.finalPoint);
  }, [records]);

  // ── Effects ───────────────────────────
  // 시계
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getAdjustedToday()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 로컬스토리지 인증
  useEffect(() => {
    const saved = localStorage.getItem('hg_auth');
    if (saved) {
      const { name, admin } = JSON.parse(saved);
      setSelectedName(name);
      setIsAdmin(admin);
      setIsLoggedIn(true);
    }
  }, []);

  // BGM cleanup
  useEffect(() => {
    return () => { bgm?.pause(); setIsPlaying(false); };
  }, [bgm]);

  // 마스터 데이터 로드
  useEffect(() => {
    supabase.from('student_master').select('*').then(({ data, error }) => {
      if (!error && data) {
        const map = data.reduce((acc: any, cur: any) => {
          acc[cur.student_name] = cur;
          return acc;
        }, {});
        setStudentMasterData(map);
      }
    });
  }, []);

  // 로그인 후 데이터 로드
  useEffect(() => {
    if (isLoggedIn) fetchRecords();
  }, [isLoggedIn, selectedName]);

  // 알 & 드래곤 이름 동기화
  useEffect(() => {
    const master = studentMasterData[selectedName];
    if (!master) return;
    setSelectedEgg(master.selected_egg || null);
    setDragonName(master.dragon_name || "이름 없는 용");
  }, [selectedName, studentMasterData]);

  // ── 데이터 로드 ───────────────────────
  const fetchRecords = async () => {
    const [resRecords, resMaster] = await Promise.all([
      supabase.from('study_records').select('*'),
      supabase.from('student_master').select('*'),
    ]);

    if (resRecords.data) {
      setRecords(resRecords.data);
      const myRecords = resRecords.data.filter(r => r.student_name === selectedName);
      setDailyGoal(myRecords.find(r => r.goal)?.goal || "");
    }

    if (resMaster.data) {
      const masterObj = resMaster.data.reduce((acc: any, item: any) => {
        acc[item.student_name] = item;
        return acc;
      }, {});
      setStudentMasterData(masterObj);
    }
  };

  // ── 로그인 ────────────────────────────
  const handleLogin = async () => {
    if (!selectedName) { alert("학생을 선택해주세요."); return; }
    const admin = password === "8888";
    if (!admin) {
      const { data } = await supabase
        .from('study_records').select('password').eq('student_name', selectedName);
      const validPw = data?.find(r => r.password)?.password || "0000";
      if (password !== validPw) { alert("비밀번호가 틀렸습니다."); return; }
    }
    setIsAdmin(admin);
    setIsLoggedIn(true);
    localStorage.setItem('hg_auth', JSON.stringify({ name: selectedName, admin }));
  };

  // ── BGM ───────────────────────────────
  const toggleMusic = () => {
    if (!bgm) return;
    if (isPlaying) {
      bgm.pause();
    } else {
      bgm.loop = true;
      bgm.volume = 0.4;
      bgm.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  // ── 데이터 변경 ───────────────────────
  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin && field !== 'password' && field !== 'goal') return;
    setIsSaving(true);

    if (field === 'password') {
      const { error } = await supabase.from('study_records').upsert(
        DAYS.map(d => ({ student_name: name, day_of_week: d, password: value })),
        { onConflict: 'student_name,day_of_week' }
      );
      if (!error) {
        setRecords(prev => prev.map(r => r.student_name === name ? { ...r, password: value } : r));
        alert("비밀번호가 성공적으로 변경되었습니다");
      }

    } else if (field === 'goal') {
      const updatePayload = DAYS.map(d => {
        const existing = records.find(r => r.student_name === name && r.day_of_week === d) || {};
        return { ...existing, student_name: name, day_of_week: d, goal: value,
          password: existing.password || '0000', monthly_off_count: existing.monthly_off_count ?? 4 };
      });
      const { error } = await supabase.from('study_records')
        .upsert(updatePayload, { onConflict: 'student_name,day_of_week' });
      if (!error) {
        setRecords(prev => prev.map(r => r.student_name === name ? { ...r, goal: value } : r));
        setDailyGoal(value);
      }

    } else {
      const newRecords = [...records];
      const idx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === day);
      const current = newRecords[idx] || {};
      const updatedData = {
        ...current, student_name: name, day_of_week: day, [field]: value,
        password: current.password || '0000',
        monthly_off_count: field === 'monthly_off_count' ? value : (current.monthly_off_count ?? 4),
      };
      if (idx > -1) newRecords[idx] = updatedData; else newRecords.push(updatedData);
      setRecords(newRecords);
      await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });
    }

    setIsSaving(false);
  };

  // ── 주간 리셋 ─────────────────────────
  const resetWeeklyData = async () => {
    if (!confirm("⚠️ 이번 주 기록을 합산하여 용을 성장시키고 표를 초기화하시겠습니까?")) return;
    if (!confirm("정말로 진행하시겠습니까? 합산된 공부 시간은 되돌릴 수 없습니다.")) return;
    setIsSaving(true);

    try {
      const names = Object.keys(studentData);
      const newMasterData = { ...studentMasterData };

      await Promise.all(names.map(async name => {
        const weeklyMinutes = records
          .filter(r => r.student_name === name)
          .reduce((sum, r) => sum + timeStrToMinutes(r.study_time), 0);

        if (weeklyMinutes > 0) {
          const { data: masterData } = await supabase
            .from('student_master').select('total_study_time')
            .eq('student_name', name).maybeSingle();
          const newTotal = (masterData?.total_study_time || 0) + weeklyMinutes;
          if (newMasterData[name]) newMasterData[name].total_study_time = newTotal;
          return supabase.from('student_master')
            .update({ total_study_time: newTotal }).eq('student_name', name);
        }
      }));

      setStudentMasterData(newMasterData);

      const resetData = Object.keys(studentData).flatMap(name =>
        DAYS.map(day => {
          const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
          return {
            student_name: name, day_of_week: day,
            off_type: '-', is_late: false, am_3h: false, study_time: '',
            password: existing.password || '0000',
            monthly_off_count: existing.monthly_off_count ?? 4,
            goal: existing.goal || '',
          };
        })
      );

      const { error } = await supabase.from('study_records')
        .upsert(resetData, { onConflict: 'student_name,day_of_week' });
      if (!error) { setRecords(resetData); alert("이번 주 기록들이 용의 먹이로 전환되었습니다!"); }
      else throw error;

    } catch (err) {
      console.error("Reset Error:", err);
      alert("❌ 처리 중 오류가 발생했습니다. DB 연결 상태를 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── 월휴 리셋 ─────────────────────────
  const resetMonthlyOff = async () => {
    if (!confirm("모든 학생의 월휴 개수를 초기화하시겠습니까?")) return;
    setIsSaving(true);

    const resetData = Object.keys(studentData).flatMap(name =>
      DAYS.map(day => {
        const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
        return { ...existing, student_name: name, day_of_week: day, monthly_off_count: 4 };
      })
    );

    const { error } = await supabase.from('study_records')
      .upsert(resetData, { onConflict: 'student_name,day_of_week' });
    if (!error) { setRecords(resetData); alert("학생들의 월휴 개수가 초기화되었습니다."); }
    setIsSaving(false);
  };

  // ── 드래곤 이름 저장 ──────────────────
  const handleSaveName = async () => {
    if (!tempName.trim()) { alert("아직 이름을 지어주지 않았습니다."); return; }
    setDragonName(tempName);
    const { error } = await supabase.from('student_master')
      .update({ dragon_name: tempName }).eq('student_name', selectedName);
    if (error) console.error("이름 저장 실패:", error);
    else setIsModalOpen(false);
  };

  // ── Dragon Cave 이미지 전환 ───────────
  const handleRegionClick = (region: string) => {
    if (isFading || currentImageFile === `${region}.webp`) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentImageFile(`${region}.webp`);
      setTimeout(() => setIsFading(false), 50);
    }, 300);
  };

  const handleResetImage = () => {
    if (isFading || currentImageFile === 'x.jpg') return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentImageFile('x.jpg');
      setTimeout(() => setIsFading(false), 50);
    }, 300);
  };

  // ── 리포트 계산 ───────────────────────
  const calculatePoints = (name: string) => {
    let bonus = 0, penalty = 0, usedWeeklyOff = 0;
    records.filter(r => r.student_name === name).forEach(r => {
      const res = calc(r);
      bonus   += res.bonus;
      penalty += res.penalty;
      if (['반휴', '늦반휴'].includes(r.off_type))  usedWeeklyOff += 0.5;
      if (['주휴', '늦휴'].includes(r.off_type))     usedWeeklyOff += 1.0;
    });
    const monRec  = records.find(r => r.student_name === name && r.day_of_week === '월');
    const offCount = monRec?.monthly_off_count ?? 4;
    return {
      bonus, penalty,
      remainingWeeklyOff:  (1.5 - usedWeeklyOff).toFixed(1).replace('.0', ''),
      remainingMonthlyOff: (offCount * 0.5).toFixed(1).replace('.0', ''),
    };
  };

  const calculateWeeklyTotal = (name: string) => {
    const totalMins = records
      .filter(r => r.student_name === name)
      .reduce((sum, r) => sum + timeStrToMinutes(r.study_time), 0);
    return minutesToTimeStr(totalMins);
  };

  const getWeeklyDateRange = () => {
    const today = currentTime;
    const day   = today.getDay();
    const diff  = today.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(new Date(today).setDate(diff));
    const sunday = new Date(new Date(today).setDate(diff + 6));
    return `${monday.getMonth() + 1}월 ${monday.getDate()}일 ~ ${sunday.getMonth() + 1}월 ${sunday.getDate()}일`;
  };

  const getDayDate = (targetDay: string) => {
    const dayIdx    = DAYS.indexOf(targetDay);
    const today     = currentTime;
    const currentDay = today.getDay();
    const diff      = today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + dayIdx;
    const target    = new Date(new Date(today).setDate(diff));
    return `${target.getMonth() + 1}.${target.getDate()}`;
  };

  // ── 표시 목록 ─────────────────────────
  const displayList = isAdmin
    ? Object.keys(studentData).sort((a, b) => {
        const houseDiff = HOUSE_ORDER.indexOf(studentData[a].house) - HOUSE_ORDER.indexOf(studentData[b].house);
        return houseDiff !== 0 ? houseDiff : sortKorean(a, b);
      })
    : [selectedName];

  // ==========================================
  // 로그인 화면
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <style>{GLOBAL_STYLE}</style>
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500" />
          <div className="flex justify-center mb-10">
            <img
              src="https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/Hogwarts.png"
              alt="Hogwarts"
              className="w-56 h-auto object-contain"
            />
          </div>
          <div className="space-y-6">
            <select
              className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg"
              value={selectedName}
              onChange={e => setSelectedName(e.target.value)}
            >
              <option value="">이름을 선택하세요</option>
              {Object.keys(studentData).sort(sortKorean).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <input
              type="password" placeholder="PASSWORD"
              className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-slate-900 text-yellow-500 py-5 rounded-2xl font-black shadow-lg uppercase text-xl active:scale-95 transition-transform"
            >
              Enter Castle
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 메인 화면
  // ==========================================
  return (
    <div className="min-h-screen bg-stone-100 p-2 md:p-4 pb-16 font-sans relative">
      <style>{GLOBAL_STYLE}</style>

      {/* ── 기숙사 공지사항 팝업 ── */}
      {selectedHouseNotice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedHouseNotice(null)}
        >
          <div
            className="relative bg-[#f4e4bc] p-6 md:p-12 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)' }}
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
              style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />
            <button onClick={() => setSelectedHouseNotice(null)}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-slate-800 hover:rotate-90 transition-transform p-2 text-2xl z-20">✕</button>
            <div className="relative z-10 font-serif flex flex-col overflow-hidden">
              <div className="w-16 h-1 bg-slate-800/20 mx-auto mb-4 md:mb-6 shrink-0" />
              <h3 className="text-xl md:text-3xl font-black text-[#4a3728] mb-4 md:mb-6 text-center italic border-b border-[#4a3728]/20 pb-4 shrink-0 px-4">
                {HOUSE_NOTICES[selectedHouseNotice]?.title}
              </h3>
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-base md:text-lg leading-relaxed text-[#5d4037] whitespace-pre-wrap font-medium">
                  {HOUSE_NOTICES[selectedHouseNotice]?.content}
                </p>
                <div className="mt-8 mb-4 text-right italic font-bold text-[#4a3728]/60">
                  — Hogwarts School of Witchcraft and Wizardry —
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 관리자 요약 팝업 ── */}
      {showSummary && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          onClick={() => setShowSummary(false)}>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowSummary(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors text-2xl font-black">✕</button>
            <h3 className="text-2xl font-serif font-black text-slate-800 mb-8 italic tracking-tighter border-b-2 border-slate-100 pb-4 text-center">
              House Weekly Summary
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-slate-300 overflow-hidden rounded-xl">
              {HOUSE_ORDER.map(house => {
                const studentsInHouse = Object.keys(studentData).filter(n => studentData[n].house === house);
                const config = HOUSE_CONFIG[house];
                return (
                  <div key={house} className="flex flex-col border-r border-b border-slate-300">
                    <div className={`${config.bg} p-2 text-white font-black text-center text-[11px] tracking-widest`}>
                      {config.icon} {house}
                    </div>
                    <div className="flex flex-col flex-1 divide-y divide-slate-200">
                      {studentsInHouse.sort(sortKorean).map(name => {
                        const totalMins = records
                          .filter(r => r.student_name === name)
                          .reduce((sum, r) => sum + timeStrToMinutes(r.study_time), 0);
                        return (
                          <div key={name} className="flex h-10">
                            <div className={`w-10 flex items-center justify-center text-lg border-r border-slate-200 ${config.bg.replace('bg-', 'bg-opacity-10 bg-')}`}>
                              {studentData[name].emoji}
                            </div>
                            <div className="flex-1 flex items-center justify-center font-black text-sm bg-white">
                              <span className={totalMins < 1200 ? "text-red-500" : "text-slate-800"}>
                                {totalMins > 0 ? minutesToTimeStr(totalMins) : "-"}
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

      {/* ── 헤더 ── */}
      <div className="max-w-[1100px] mx-auto mb-8 px-4">
        <div className="flex flex-col gap-y-6">

          {/* 버튼 그룹 */}
          <div className="flex gap-2 flex-wrap justify-end items-center">
            <button onClick={toggleMusic} className={`text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm transition-all border-2 whitespace-nowrap ${isPlaying ? 'bg-white border-yellow-400 text-yellow-500 animate-pulse' : 'bg-slate-50 border-slate-300 text-slate-500'}`}>
              {isPlaying ? '🎵' : '🔇'}
            </button>
            {!isAdmin && (
              <>
                <Link href="/planner" className="text-[10px] font-black text-slate-700 bg-slate-100 border-slate-400 border-2 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-200 transition-all active:scale-95 whitespace-nowrap">플래너</Link>
                <Link href="/timer"   className="text-[10px] font-black text-slate-700 bg-slate-100 border-slate-400 border-2 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-200 transition-all active:scale-95 whitespace-nowrap">교시제</Link>
                <Link href="/review"  className="text-[10px] font-black text-slate-700 bg-slate-100 border-slate-400 border-2 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-200 transition-all active:scale-95 whitespace-nowrap">회독</Link>
              </>
            )}
            {isAdmin && (
              <>
                <button onClick={() => setShowSummary(true)}    className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-indigo-700 whitespace-nowrap">요약</button>
                <button onClick={resetWeeklyData}               className="text-[10px] font-black text-white bg-red-600    px-3 py-1.5 rounded-full shadow-lg hover:bg-red-700    whitespace-nowrap">주간 리셋</button>
                <button onClick={resetMonthlyOff}               className="text-[10px] font-black text-white bg-orange-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-orange-700 whitespace-nowrap">월휴 리셋</button>
              </>
            )}
            <button
              onClick={() => { localStorage.removeItem('hg_auth'); window.location.reload(); }}
              className="text-[10px] font-black text-slate-400 bg-white border-slate-100 border-2 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap"
            >
              Logout
            </button>
          </div>

          {/* 로고 */}
          <div className="flex justify-center">
            <h2 className="text-3xl font-serif font-black text-slate-800 italic tracking-tight whitespace-nowrap">
              Hogwarts School
            </h2>
          </div>

          {/* 기숙사 점수판 */}
          <div className="grid grid-cols-4 gap-1.5 md:gap-4">
            {houseRankings.map((item, idx) => {
              const config = HOUSE_CONFIG[item.house];
              return (
                <div
                  key={item.house}
                  onClick={() => setSelectedHouseNotice(item.house)}
                  className={`${config.bg} ${config.border} ${idx === 0 ? 'winner-sparkle ring-4 ring-yellow-400 ring-offset-2' : ''} border-b-4 p-1.5 md:p-5 rounded-xl md:rounded-[2rem] text-white shadow-xl relative cursor-pointer active:scale-95 transition-all hover:brightness-110 overflow-hidden`}
                >
                  <div className="absolute right-[-10px] bottom-[-10px] text-5xl md:text-7xl opacity-20 pointer-events-none">
                    {config.icon}
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-[7px] md:text-xs font-black opacity-90 tracking-widest uppercase">{item.house}</div>
                      <div className={`text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-full ${config.accent} text-slate-900 shadow-sm`}>
                        {["1st", "2nd", "3rd", "4th"][idx]}
                      </div>
                    </div>
                    <div className="text-lg md:text-4xl font-black italic">
                      {(Math.round(item.finalPoint * 10) / 10).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 학습 기록 테이블 ── */}
      <div className="max-w-[1100px] mx-auto bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        {/* 테이블 헤더 */}
        <div className="bg-slate-900 p-4 px-6 md:px-8 flex flex-col gap-2 text-white min-h-[60px]">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] md:text-xs font-black text-yellow-500 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {isAdmin
                ? "Headmaster Console"
                : currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
              {!isAdmin && (
                <span className="text-white ml-2">
                  {currentTime.toLocaleTimeString('ko-KR', { hour12: false })}
                </span>
              )}
            </span>
            {isSaving && <div className="text-[9px] text-yellow-500 font-bold animate-bounce">Magic occurring...</div>}
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-3 pt-1 border-t border-white/10 mt-1">
              <span className="text-[9px] font-black text-white/40 shrink-0 uppercase tracking-tighter">Goal</span>
              <div className="flex items-center gap-2 flex-1 overflow-hidden group">
                <input
                  type="text" value={dailyGoal || ""}
                  onChange={e => setDailyGoal(e.target.value)}
                  placeholder="목표를 입력하세요."
                  className="bg-transparent italic text-xs w-full focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5 transition-all text-white/90"
                />
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => { const t = displayList[0]; if (t) handleChange(t, '월', 'goal', dailyGoal); }}
                    className="text-[10px] font-bold text-yellow-500">[저장]</button>
                  <button onClick={() => { if (confirm("삭제하시겠습니까?")) { setDailyGoal(""); if (displayList[0]) handleChange(displayList[0], '월', 'goal', ""); }}}
                    className="text-[10px] font-bold text-red-400">[삭제]</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 테이블 본문 */}
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
                const info    = studentData[name];
                const monRec  = records.find(r => r.student_name === name && r.day_of_week === '월') || {};
                const offCount = monRec.monthly_off_count ?? 4;
                const rows    = [
                  { f: 'off_type'   },
                  { f: 'is_late'    },
                  { f: 'am_3h'      },
                  { f: 'study_time' },
                  { f: 'penalty'    },
                  { f: 'bonus'      },
                  { f: 'total'      },
                ];
                const totalMins = records
                  .filter(r => r.student_name === name)
                  .reduce((sum, r) => sum + timeStrToMinutes(r.study_time), 0);
                const totalPts = records
                  .filter(r => r.student_name === name)
                  .reduce((sum, r) => sum + calc(r).total, 0);

                return (
                  <React.Fragment key={name}>
                    {isAdmin && (
                      <tr className="bg-slate-100/50 border-t-2 border-slate-200">
                        <td className="sticky left-0 bg-slate-100/50 z-20 border-r" />
                        {DAYS.map(d => (
                          <td key={d} className="p-1 text-[10px] font-black text-slate-500 text-center">{d}</td>
                        ))}
                        <td colSpan={2} className="border-l" />
                      </tr>
                    )}
                    {rows.map((row, rIdx) => (
                      <tr key={row.f} className={rIdx === 6 ? "border-b-[6px] border-slate-100" : "border-b border-slate-50"}>

                        {/* 학생 정보 셀 */}
                        {rIdx === 0 && (
                          <td
                            rowSpan={7}
                            className={`p-4 text-center sticky left-0 z-20 font-bold border-r-[3px] ${info.color} ${info.text} cursor-pointer hover:brightness-95 transition-all`}
                            onClick={() => setSelectedStudentReport(name)}
                          >
                            <div className="text-3xl mb-1">{info.emoji}</div>
                            <div className="leading-tight text-sm font-black mb-1">{formatDisplayName(name)}</div>
                            <div className="text-[9px] font-black opacity-70 mb-2">{info.house}</div>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const newPw = prompt("숫자 4자리");
                                if (newPw && /^\d{4}$/.test(newPw)) handleChange(name, '월', 'password', newPw);
                              }}
                              className="text-[8px] underline opacity-40 block mx-auto"
                            >
                              PW 변경
                            </button>
                          </td>
                        )}

                        {/* 요일별 데이터 셀 */}
                        {DAYS.map(day => {
                          const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
                          const res = calc(rec);
                          const offBg =
                            ['반휴','월반휴','늦반휴','늦월반휴'].includes(rec.off_type) ? 'bg-green-100' :
                            ['주휴','월휴','늦휴','늦월휴'].includes(rec.off_type)       ? 'bg-blue-100'  :
                            rec.off_type === '결석'                                      ? 'bg-red-100'   : '';

                          return (
                            <td key={day} className={`p-1.5 text-center border-r border-slate-50 ${row.f === 'off_type' ? offBg : ''}`}>
                              {row.f === 'off_type' ? (
                                <select
                                  className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-[10px]"
                                  value={rec.off_type || '-'}
                                  onChange={e => handleChange(name, day, 'off_type', e.target.value)}
                                  disabled={!isAdmin}
                                >
                                  {OFF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                              ) : row.f === 'is_late' ? (
                                <input type="checkbox" className="late-checkbox"
                                  checked={!!rec.is_late}
                                  onChange={e => handleChange(name, day, 'is_late', e.target.checked)}
                                  disabled={!isAdmin} />
                              ) : row.f === 'am_3h' ? (
                                <input type="checkbox" className="w-3.5 h-3.5 accent-slate-800 mx-auto block"
                                  checked={!!rec.am_3h}
                                  onChange={e => handleChange(name, day, 'am_3h', e.target.checked)}
                                  disabled={!isAdmin} />
                              ) : row.f === 'study_time' ? (
                                <input type="text" placeholder="-"
                                  className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-sm"
                                  value={rec.study_time || ''}
                                  onChange={e => setRecords(prev => prev.map(r =>
                                    (r.student_name === name && r.day_of_week === day) ? { ...r, study_time: e.target.value } : r
                                  ))}
                                  onBlur={e => handleChange(name, day, 'study_time', e.target.value)}
                                  disabled={!isAdmin} />
                              ) : (
                                <span className={`font-black text-sm ${
                                  row.f === 'penalty' && res.penalty < 0 ? 'text-red-500' :
                                  row.f === 'bonus'   && res.bonus   > 0 ? 'text-blue-600' : 'text-slate-900'
                                }`}>
                                  {res[row.f as keyof typeof res] || (row.f === 'total' ? 0 : '')}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* 합계 셀 */}
                        <td className="bg-slate-50 text-center font-black border-l">
                          {rIdx === 3 && (
                            <div className={`text-sm font-black ${totalMins < 1200 ? 'text-red-600' : 'text-slate-900'}`}>
                              {totalMins > 0 ? minutesToTimeStr(totalMins) : "-"}
                            </div>
                          )}
                          {rIdx === 6 && (
                            <div className={`text-[10px] font-black py-1 rounded ${totalPts <= -10 ? 'text-red-600 bg-red-50' : 'text-blue-700 bg-blue-50'}`}>
                              합계: {totalPts.toFixed(1).replace('.0', '')}
                            </div>
                          )}
                        </td>

                        {/* 월휴 셀 */}
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-2 bg-white border-l text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {[1, 2, 3, 4].map(n => (
                                <div
                                  key={n}
                                  onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', offCount >= (5 - n) ? (5 - n) - 1 : offCount)}
                                  className={`w-7 h-5 rounded-md border-2 ${isAdmin ? 'cursor-pointer' : ''} ${offCount >= (5 - n) ? info.accent : 'bg-slate-50 border-slate-200'}`}
                                />
                              ))}
                              {isAdmin && (
                                <button
                                  onClick={() => handleChange(name, '월', 'monthly_off_count', 4)}
                                  className="mt-0.5 text-[8px] font-black text-slate-300 hover:text-orange-500 uppercase tracking-widest transition-colors leading-none"
                                  title="월휴 초기화"
                                >
                                  reset
                                </button>
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

      {/* ── Dragon Cave ── */}
      <div className="mt-16 px-4 pb-24 text-left max-w-6xl mx-auto">
        <hr className="border-slate-200 mb-10" />
        <h2 className="text-2xl font-black italic mb-8 uppercase"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', color: '#1b1e21', transform: 'skewX(-5deg)' }}>
          Dragon Cave
        </h2>

        {/* 지역 버튼 */}
        <div className="grid grid-cols-3 gap-2 mb-8 max-w-sm">
          {['volcano', 'jungle', 'forest', 'desert', 'coast', 'alpine'].map(region => {
            const hasEgg = !!(selectedEgg || studentMasterData[selectedName]?.selected_egg);
            return (
              <button
                key={region}
                onClick={() => {
                  if (hasEgg) { alert("이미 데려온 알이 있습니다."); return; }
                  handleRegionClick(region);
                }}
                className={`py-2 text-[11px] font-black tracking-tighter transition-all rounded-md border uppercase ${
                  currentImageFile === `${region}.webp`
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : hasEgg
                      ? 'bg-slate-50 text-slate-200 border-slate-50 cursor-not-allowed'
                      : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>

        {/* 이미지 영역 */}
        <div className="relative">
          <div className="flex justify-end mb-2">
            <button onClick={handleResetImage}
              className="text-[9px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors">
              [ Reset Habitat ]
            </button>
          </div>

          <div className="w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 relative aspect-video">
            <img
              src={`https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${currentImageFile}`}
              alt="Dragon Habitat"
              className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-80'}`}
              onError={e => { e.currentTarget.src = "https://via.placeholder.com/1200x675?text=Habitat+Image+Not+Found"; }}
            />

            {/* 드래곤 렌더링 */}
            {['main.webp', 'x.jpg'].includes(currentImageFile) && (() => {
              const userData = studentMasterData[selectedName];
              let eggStr = selectedEgg || userData?.selected_egg;
              const score = userData?.total_study_time || 0;
              if (!eggStr) return null;

              if (eggStr.includes('/')) eggStr = eggStr.split('/').pop().split('.')[0];
              const prefix     = String(eggStr).substring(0, 2);
              const eggNumOnly = String(eggStr).substring(2);

              const stage =
                score >= 18000 ? 4 :
                score >= 12000 ? 3 :
                score >= 6000  ? 2 : 1;

              const fileName = `${prefix}${String(eggNumOnly).repeat(stage)}`;
              const baseUrl  = "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public";
              const finalUrl = `${baseUrl}/${fileName}.webp`;

              const stageMsgs = DRAGON_MESSAGES[stage] || DRAGON_MESSAGES[1];
              const randomMsg = (() => {
                const win = window as any;
                if (win['dragon_msg_idx'] === undefined)
                  win['dragon_msg_idx'] = Math.floor(Math.random() * stageMsgs.length);
                return stageMsgs[win['dragon_msg_idx']] || stageMsgs[0];
              })();

              const positionClass = stage === 4
                ? "translate-y-10 md:translate-y-16"
                : "translate-y-16 md:translate-y-24";

              return (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  {/* 게이지 */}
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 flex items-center gap-2 pointer-events-auto">
                    <div className="w-20 md:w-24 h-2.5 md:h-3 bg-white/40 backdrop-blur-md rounded-full overflow-hidden border border-white/30 shadow-sm">
                      <div className="h-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%`, backgroundColor: '#65D35D' }} />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black text-white drop-shadow-md">{Math.floor(progress)}%</span>
                  </div>

                  <div className={`relative flex flex-col items-center ${positionClass}`}>
                    {/* 말풍선 + 이름 */}
                    <div className="absolute -top-14 md:-top-16 flex flex-col items-center w-full">
                      <div className="relative bg-white/95 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow">
                        <p className="text-[8px] md:text-[11px] font-bold text-slate-700 whitespace-nowrap italic text-center">
                          ({randomMsg})
                        </p>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white/95" />
                      </div>
                      <div
                        className="mt-1 cursor-pointer pointer-events-auto hover:scale-110 active:scale-95 transition-all"
                        onClick={() => setIsModalOpen(true)}
                        style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                      >
                        <span className="text-white text-[10px] md:text-[13px] font-black tracking-tight whitespace-nowrap uppercase">
                          {dragonName}
                        </span>
                      </div>
                    </div>

                    {/* 드래곤 이미지 */}
                    <img
                      key={fileName} src={finalUrl} alt="Dragon"
                      className={`relative object-contain drop-shadow-2xl animate-bounce-slow pointer-events-auto transition-all duration-500 ${stage === 4 ? 'w-24 h-24 md:w-32 md:h-32 -translate-y-2' : 'w-12 h-12 md:w-16 md:h-16 -translate-y-2'}`}
                      onError={e => { e.currentTarget.src = `${baseUrl}/${eggStr}.webp`; }}
                    />
                    <div className="absolute -bottom-2 w-7 h-1.5 md:w-10 md:h-2 bg-black/25 rounded-[100%] blur-[5px]" />
                  </div>
                </div>
              );
            })()}

            {/* 알 선택 */}
            {!isFading && !['main.webp', 'x.jpg'].includes(currentImageFile) &&
             !(selectedEgg || studentMasterData[selectedName]?.selected_egg) && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 px-4 z-20">
                {[1, 2, 3].map(num => {
                  const prefix = currentImageFile.split('.')[0].substring(0, 2).toLowerCase();
                  const eggUrl = `https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${prefix}${num}.webp`;
                  return (
                    <div key={num} className="relative group flex flex-col items-center">
                      <div className="absolute -bottom-1 w-6 h-1.5 md:w-8 md:h-2 bg-black/40 rounded-[100%] blur-[4px] group-hover:scale-125 transition-transform duration-300" />
                      <img
                        src={eggUrl} alt="Dragon Egg"
                        onClick={() => { setTempEgg(eggUrl); setSelectedEgg(`${prefix}${num}`); setEggStep(1); }}
                        className="relative w-12 h-12 md:w-16 md:h-16 object-contain hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                        onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 알 선택 확인 팝업 */}
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
                    if (eggStep === 1) {
                      setEggStep(2);
                    } else {
                      if (selectedName && tempEgg) {
                        try {
                          const eggName = tempEgg.split('/').pop()?.split('.')[0] || "";
                          if (eggName) {
                            const { error } = await supabase.from('student_master')
                              .update({ selected_egg: eggName }).eq('student_name', selectedName);
                            if (error) throw error;
                            setStudentMasterData((prev: any) => ({
                              ...prev,
                              [selectedName]: { ...prev[selectedName], selected_egg: eggName },
                            }));
                            setSelectedEgg(eggName);
                          }
                        } catch {
                          alert("알을 데려오는 데 실패했습니다. 다시 시도해 주세요.");
                        }
                      }
                      setEggStep(0);
                      setTempEgg(null);
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

        {/* 드래곤 이름 팝업 */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center border-4 border-slate-100">
              <h3 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tighter" style={{ fontFamily: "'Cinzel', serif" }}>
                이름을 지어줄까요?
              </h3>
              <p className="text-slate-500 mb-6 text-sm italic">이름은 언제든지 변경할 수 있습니다.</p>
              <input
                type="text" value={tempName}
                onChange={e => setTempName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full border-2 border-slate-100 rounded-xl p-3 mb-6 focus:border-[#65D35D] outline-none text-center font-bold text-slate-700 transition-colors"
              />
              <div className="flex flex-col gap-3">
                <button onClick={handleSaveName}
                  className="w-full py-3 bg-[#65D35D] text-white font-black rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg shadow-green-100">
                  이름을 지어준다
                </button>
                <button onClick={() => { setIsModalOpen(false); setTempName(""); }}
                  className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]">
                  지어주지 않는다
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 학생 개인 리포트 팝업 ── */}
      {selectedStudentReport && studentData[selectedStudentReport] && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          onClick={() => setSelectedStudentReport(null)}>
          <div className="bg-white p-5 md:px-10 md:py-8 w-full max-w-lg shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3)] relative rounded-[3rem] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-end justify-center mb-6 w-full">
              <div className="w-[45%] flex justify-end">
                <img src={HOUSE_LOGOS[studentData[selectedStudentReport].house]} alt="Logo"
                  className="w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-md" />
              </div>
              <div className="w-[55%] flex flex-col justify-end items-start pl-4">
                <div className="flex items-baseline gap-1.5 mb-0">
                  <span className="text-5xl md:text-6xl">{studentData[selectedStudentReport].emoji}</span>
                  <span className="font-bold text-xs md:text-sm text-slate-400 tracking-tight leading-none">
                    {formatDisplayName(selectedStudentReport)}
                  </span>
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
                const isBlue  = ['주휴','월휴','늦휴','늦월휴'].includes(rec.off_type);
                const isRed   = rec.off_type === '결석';
                const cellClass = isGreen ? 'bg-green-100/60 border-green-200' : isBlue ? 'bg-blue-100/60 border-blue-200' : isRed ? 'bg-red-100/60 border-red-200' : 'bg-slate-50 border-slate-100';
                const textClass = isGreen ? 'text-green-700' : isBlue ? 'text-blue-700' : isRed ? 'text-red-700' : 'text-slate-400';
                return (
                  <div key={day} className={`p-2.5 flex flex-col items-center justify-between h-24 rounded-2xl border shadow-sm ${cellClass}`}>
                    <div className={`text-[10px] font-bold ${textClass}`}>{getDayDate(day)} {day}</div>
                    <div className="text-[18px] font-black text-slate-800">{rec.study_time || "0:00"}</div>
                    <div className={`text-[9px] font-black h-3 leading-none uppercase ${textClass}`}>
                      {['반휴','월반휴','주휴','결석'].includes(rec.off_type) ? rec.off_type : ""}
                    </div>
                  </div>
                );
              })}

              {/* 점수 요약 */}
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
