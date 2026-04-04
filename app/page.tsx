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

type DragonEntry = {
  egg: string;          // e.g. "al3"
  name: string;
  acquired_time: number; // 데려올 때의 total_study_time
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

// 지역 코드 → 배경 이미지 매핑
const REGION_BACKGROUNDS: Record<string, string> = {
  vo: 'volcano', ju: 'jungle', fo: 'forest',
  de: 'desert',  co: 'coast',  al: 'alpine',
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
  "🐡복어":  { house: "슬리데린", emoji: "🐡", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐜개미":  { house: "슬리데린", emoji: "🐜", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🦔도치":  { house: "슬리데린", emoji: "🦔", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🎂케이크": { house: "슬리데린", emoji: "🎂", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐻곰돌":  { house: "슬리데린", emoji: "🐻", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🪙갈레온": { house: "래번클로", emoji: "🪙", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "💫별":    { house: "래번클로", emoji: "💫", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🍪쿠키":  { house: "래번클로", emoji: "🍪", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐵숭이":  { house: "래번클로", emoji: "🐵", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
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
  "🐨코알라": { house: "후플푸프", emoji: "🐨", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐎말":    { house: "후플푸프", emoji: "🐎", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐈‍⬛깜냥": { house: "후플푸프", emoji: "🐈‍⬛", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🦊여우":  { house: "후플푸프", emoji: "🦊", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🦖공룡":  { house: "후플푸프", emoji: "🦖", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🍓딸기":  { house: "후플푸프", emoji: "🍓", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐧펭귄":  { house: "후플푸프", emoji: "🐧", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐿️다람":  { house: "후플푸프", emoji: "🐿️", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
};

// ==========================================
// 기숙사 공지사항
// ==========================================
const HOUSE_NOTICES: Record<string, { title: string; content: string }> = {
  "래번클로": {
    title: `4위 탈출 성공! 이제 상승 곡선만 남았습니다.`,
    content: `래번클로 학우 여러분, 이번에도 데이터가 증명되었습니다! 최하위를 벗어나 3위로 올라선 것은 우리의 지적 효율성이 회복되고 있다는 신호입니다. 슬리데린이 순위 하락으로 당황하고 있을 때, 우리는 이 기세를 몰아 2위 후플푸프와의 격차를 줄여야 합니다.

시험을 5일 앞두고 도서관 전체에 개인용 소음 차단 마법을 걸어두는 분들이 많은데, 사서 선생님의 안내 방송은 들릴 정도로 강도를 조절해 주세요. 독수리 문고리가 오늘 아침엔 "가장 조용한 곳에서 들리는 가장 큰 소리는 무엇인가?"라는 질문을 던지더군요. 시험을 앞두고 요동치는 우리 자신의 확신이 아닐까 싶습니다. 이번주 결전을 앞둔 동료들, 본인의 논리를 믿으세요. 반등은 이미 시작되었으니까요.

`,
  },
  "그리핀도르": {
    title: `이번 주 금요일 밤,\n'승리 기원 파티'는 잠시 참아주세요!`,
    content: `우리가 1위를 지키고 있어서 다들 신난 건 알겠는데, 이번 주만큼은 좀 진정합시다! 이번주 토요일에 시험을 보러 가는 선배들이 휴게실에서 마지막으로 책을 보고 있는데, 옆에서 빗자루 손질을 하거나 폭발하는 카드 게임을 하는 건 예의가 아니잖아요?

금요일 밤에 몰래 버터맥주 파티를 계획 중인 3학년들, 제가 다 알고 있습니다. 이번 주는 파티 대신 시험장으로 향하는 동료들에게 조용히 어깨를 두드려주는 '그리핀도르다운' 의리를 보여주자고요. 시험만 끝나봐요, 토요일 저녁엔 연회장이 떠나가라 축제를 벌여도 제가 모른 척해드릴 테니까요!

`,
  },
  "슬리데린": {
    title: `4위라는 굴욕을 씻어낼 독기 어린 반격을 준비하십시오.`,
    content: `슬리데린 학우 여러분, 현재 점수판 맨 밑바닥에 우리 이름이 걸려 있다는 사실이 믿기십니까? 래번클로 애들이 우리를 제치고 분석이니 뭐니 떠드는 꼴을 더 이상 지켜볼 순 없습니다. 이번 주, 시험을 앞둔 동료들은 철저하게 개인 정비에 집중하고, 나머지 인원들은 수업 시간에 질문을 독점해서 가산점을 싹쓸이합시다.

특히 이번주 시험 이후 이 지긋지긋한 성을 떠날 야심가들은 졸업 면담 준비 철저히 하세요. 슬리데린은 떠나는 뒷모습조차 남들에게 경외감을 주어야 하니까요. 

이번 주 암호는 '독보적인 부활'입니다. 암호를 헷갈려서 입구 벽 앞에서 서성거리는 멍청한 소리는 들리지 않게 해 주십시오.

`,
  },
  "후플푸프": {
    title: `도서관 3번 테이블에 '정서 안정용 사탕' 두고 가신 분?`,
    content: `아슬아슬하게 2위라 다들 조금 예민해져 있는 것 같아요. 특히 시험 공부하다가 너무 긴장해서 그런지, 도서관이나 휴게실 곳곳에 개인 물건을 두고 가는 친구들이 많네요. 어제는 3번 테이블에서 '긴장 완화용 박하 사탕' 한 봉지가 발견됐어요. 주인은 얼른 찾아가서 당 충전하세요!

해그리드 씨가 보내온 편지 읽어봤나요? 우리에게 지금 꼭 필요한 말인 것 같아요. 4월 4일 시험 후에 졸업을 고민하며 싱숭생숭해 하는 친구들도 많을 텐데, 이번 주 내내 휴게실 벽난로 앞에 따뜻한 코코아를 상시 비치해 둘 테니 언제든 와서 마음을 달래고 가세요. 우리는 끝까지 함께니까요.

`,
  },
};

// ==========================================
// 전역 스타일
// ==========================================
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Diphylleia&display=swap');
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  body {
    font-family: 'Cinzel', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto,
      'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  }
  .font-serif { font-family: 'Cinzel', serif; }
  .winner-sparkle { position: relative; overflow: hidden; animation: winner-glow 2s infinite alternate; }
  .winner-sparkle::before, .winner-sparkle::after {
    content: ''; position: absolute; inset: -50px;
    background-image:
      radial-gradient(1.5px 1.5px at 20px 30px, white, rgba(255,255,255,0)),
      radial-gradient(2px 2px at 50px 80px, white, rgba(255,255,255,0)),
      radial-gradient(1px 1px at 90px 20px, white, rgba(255,255,255,0)),
      radial-gradient(2px 2px at 130px 60px, white, rgba(255,255,255,0)),
      radial-gradient(1.5px 1.5px at 160px 110px, white, rgba(255,255,255,0)),
      radial-gradient(1px 1px at 210px 40px, white, rgba(255,255,255,0)),
      radial-gradient(2px 2px at 240px 100px, white, rgba(255,255,255,0)),
      radial-gradient(1.5px 1.5px at 280px 20px, white, rgba(255,255,255,0));
    background-size: 300px 150px; opacity: 0; pointer-events: none; z-index: 5;
  }
  .winner-sparkle::before { animation: pixie-dust 3s infinite linear; }
  .winner-sparkle::after  { background-position: 150px 75px; animation: pixie-dust 4s infinite linear reverse; }
  @keyframes pixie-dust {
    0%   { transform: scale(0.8) translate(0, 0);        opacity: 0; }
    20%  { opacity: 0.8; }
    50%  { transform: scale(1.1) translate(5px, -10px);  opacity: 1; filter: brightness(1.5) blur(0.5px); }
    80%  { opacity: 0.8; }
    100% { transform: scale(1.2) translate(10px, -20px); opacity: 0; }
  }
  @keyframes winner-glow {
    from { box-shadow: 0 0 15px rgba(255,215,0,0.4), inset 0 0 8px rgba(255,255,255,0.1); }
    to   { box-shadow: 0 0 35px rgba(255,215,0,0.7), inset 0 0 20px rgba(255,255,255,0.3); }
  }
  table select {
    appearance: none; -webkit-appearance: none;
    text-align-last: center; padding: 0 !important; margin: 0 !important;
    line-height: 1.2 !important; height: 100%;
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
// 졸업생 명단 (졸업생 이름을 여기에 추가/제거)
// ==========================================
const GRADUATED_NAMES: string[] = [
  "🦉올뺌",
  "🦖공룡",
];
const isGraduated = (name: string) => GRADUATED_NAMES.includes(name);

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

// 알 코드(e.g. "al3") → 지역 배경 이미지 파일명(e.g. "alpine.webp")
const eggToBackground = (egg: string): string => {
  const prefix = egg.substring(0, 2).toLowerCase();
  const region = REGION_BACKGROUNDS[prefix];
  return region ? `${region}.webp` : 'x.jpg';
};

// 성장 단계 계산
const calcStage = (studyMinutesSinceAcquired: number, dragonIndex: number): number => {
  if (dragonIndex === 0) {
    if (studyMinutesSinceAcquired >= 18000) return 4;
    if (studyMinutesSinceAcquired >= 12000) return 3;
    if (studyMinutesSinceAcquired >= 6000)  return 2;
    return 1;
  } else {
    if (studyMinutesSinceAcquired >= 9000)  return 4;
    if (studyMinutesSinceAcquired >= 6000)  return 3;
    if (studyMinutesSinceAcquired >= 3000)  return 2;
    return 1;
  }
};

// 성장 게이지 (0~100%)
const calcProgress = (studyMinutesSinceAcquired: number, dragonIndex: number): number => {
  const thresholds = dragonIndex === 0
    ? [0, 6000, 12000, 18000]
    : [0, 3000, 6000,  9000];
  const stage = calcStage(studyMinutesSinceAcquired, dragonIndex);
  if (stage === 4) return 100;
  const lo = thresholds[stage - 1];
  const hi = thresholds[stage];
  return Math.min(100, ((studyMinutesSinceAcquired - lo) / (hi - lo)) * 100);
};

// ==========================================
// 재학생 해그리드 편지 본문
// ==========================================
const HAGRID_LETTER = {
  title: `사냥터지기 해그리드가 보내는 편지`,
  content: `성 주위를 걷다 보면 발밑에 깔린 클로버들을 자주 보게 되는데, 오늘 그 녀석들을 보다가 네 생각이 나서 펜을 들었어.

혹시 네잎클로버가 어떻게 만들어지는지 알아? 사람들이 길을 지나가며 클로버를 밟거나 숲속의 곤충이나 동물들 때문에 잎에 상처가 날 때가 있거든. 그때 작은 상처가 생기는데, 그 상처를 딛고 일어나 네잎클로버가 되는 거야.

말하자면 우리가 그토록 찾는 행운이라는 건, 사실 클로버가 받은 상처가 아물면서 만들어진 결과물인 셈이지.

{NAME}, 공부하다 보면 마음이 뜻대로 안 되고 누군가에게 밟힌 것처럼 아프고 힘들 때가 있을 거야. 지금 이 순간이 꼭 폐허 같아서 다 포기하고 싶어질지도 모르지. 하지만 그건 네가 못나서 그런 게 아니라 네 인생의 행운을 만들어내기 위해 잠시 성장통을 겪고 있는 거라고 생각해보면 어때?

지금 네가 받는 그 상처들이 결국엔 남들은 가지지 못한 특별한 네 잎을 틔워낼 가장 확실한 과정이 되어줄 거야. 그러니까 너무 낙담하지 마. 너는 지금 그 누구보다 멋진 행운을 네 스스로 빚어내고 있는 중이니까.
오늘 하루도 정말 고생 많았어. 네가 꿋꿋하게 버틴 이 시간들이 결국엔 아주 귀한 보물로 돌아올 거야. 기운 잃지 말고, 끝까지 해보자고! 

— 너의 영원한 친구, 루비우스 해그리드가`,
};

// ==========================================
// 졸업생 해그리드 편지 본문
// ==========================================
const HAGRID_LETTER_GRADUATED = {
  title: `사냥터지기 해그리드가 보내는 편지`,
  content: `졸업을 진심으로 축하한다!
와, 정말이지... 처음 네가 성에 들어오던 날이 엊그제 같은데 벌써 네가 졸업할 때가 다 됐다는 게 믿어지지가 않아. 그때 네 눈이 얼마나 커졌었는지, 아직도 선히 기억이 나. 촛불이 천장에 둥둥 떠다니는 걸 보고 입을 딱 벌렸었잖니. 하하! 그 모습이 너무 귀여워서 내가 혼자 실실 웃었더랬지.

보아하니 넌 이제 제대로 된 마법사 — 아니, 마녀 — 가 됐구나. 어깨도 꽤 펴졌고, 눈빛도 달라졌어. 내가 뭘 잘 모르는 것 같아도, 사람 눈빛은 볼 줄 알아. 넌 진짜배기야. 호그와트가 너를 키운 게 아니라, 네가 호그와트를 빛낸 거야.

이제 성을 떠나면 무섭고 넓은 세상이 기다릴 테지. 뭔가 이상하고 위험한 것도 잔뜩 있을거야. 히포그리프도, 용도, 가끔은 사람도 그렇고. 하하. 어쨌든, 뭐가 무서워도 눈을 피하지 마. 내가 살면서 배운 게 있다면, 제대로 눈 마주치고 인사하면 대부분의 것들은 그렇게 나쁘지만은 않더라고.

내 오두막집은 언제나 열려 있어. 진짜로. 허브차도 항상 있고, 락다운케이크는... 음, 그건 좀 다시 생각해 볼게. 아무튼, 보고 싶으면 날 찾아와. 넌 졸업 후에도 내 친구니까.`,
  closing: `늘 네 편인,\n—루비우스 해그리드`,
  ps: `추신: 팡을 쓰다듬어 줘서 고마워. 걘 네가 좋다나봐.`,
};

// 줄바꿈 텍스트 → JSX 변환
function renderLines(text: string) {
  return text.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));
}

// 이번 주 월요일 날짜 문자열 (YYYY-MM-DD)
function getThisMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return monday.toLocaleDateString('en-CA');
}

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
  let penalty = 0, bonus = 0;
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
  return { penalty: Math.max(penalty, -5), bonus, total: Math.max(penalty, -5) + bonus, studyH };
};

// ==========================================
// 재학생 해그리드 편지 팝업 컴포넌트
// ==========================================
function HagridLetterModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-[2rem] border border-amber-400/20 shadow-2xl overflow-hidden bg-[#1a1209]"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: "'Pretendard', sans-serif" }}
      >
        <div className="px-7 pt-7 pb-4 border-b border-amber-400/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📬</span>
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-amber-400/60">Hagrid's Letter</p>
              <p className="text-base font-black text-amber-300">{HAGRID_LETTER.title}</p>
            </div>
          </div>
        </div>
        <div className="px-7 py-5 overflow-y-auto" style={{ maxHeight: '62vh' }}>
          <p className="font-bold text-base text-white mb-4">안녕, {formatDisplayName(name)}!</p>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {HAGRID_LETTER.content.replace('{NAME}', formatDisplayName(name))}
          </p>
        </div>
        <div className="px-7 pb-6 pt-3 border-t border-amber-400/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-black tracking-wide transition-all bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 border border-amber-400/20"
          >
            편지 접기 ✉️
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 졸업생 해그리드 편지 팝업 컴포넌트
// ==========================================
function HagridLetterGraduatedModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-[2rem] border border-amber-400/20 shadow-2xl overflow-hidden bg-[#1a1209]"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: "'Pretendard', sans-serif" }}
      >
        <div className="px-7 pt-7 pb-4 border-b border-amber-400/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📬</span>
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-amber-400/60">Hagrid's Letter</p>
              <p className="text-base font-black text-amber-300">{HAGRID_LETTER_GRADUATED.title}</p>
            </div>
          </div>
        </div>
        <div className="px-7 py-5 overflow-y-auto" style={{ maxHeight: '62vh' }}>
          <p className="font-bold text-base text-white mb-4">안녕, {formatDisplayName(name)}!</p>
          {/* 본문 */}
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-6">
            {HAGRID_LETTER_GRADUATED.content}
          </p>
          {/* 클로징 - 본문보다 작은 폰트 */}
          <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap mb-2 italic">
            {HAGRID_LETTER_GRADUATED.closing}
          </p>
          {/* 추신 - 본문보다 작은 폰트 */}
          <p className="text-slate-500 text-xs leading-relaxed whitespace-pre-wrap italic">
            {HAGRID_LETTER_GRADUATED.ps}
          </p>
        </div>
        <div className="px-7 pb-6 pt-3 border-t border-amber-400/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-black tracking-wide transition-all bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 border border-amber-400/20"
          >
            편지 접기 ✉️
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DragonSlot 컴포넌트
// ==========================================
function DragonSlot({
  dragon,
  dragonIndex,
  totalStudyTime,
  msgKey,
  onClickName,
}: {
  dragon: DragonEntry;
  dragonIndex: number;
  totalStudyTime: number;
  msgKey: string;
  onClickName: () => void;
}) {
  const studyMinutesSince = Math.max(0, totalStudyTime - dragon.acquired_time);
  const stage    = calcStage(studyMinutesSince, dragonIndex);
  const progress = calcProgress(studyMinutesSince, dragonIndex);

  const prefix     = dragon.egg.substring(0, 2);
  const eggNumOnly = dragon.egg.substring(2);
  const fileName   = `${prefix}${String(eggNumOnly).repeat(stage)}`;
  const baseUrl    = "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public";
  const finalUrl   = `${baseUrl}/${fileName}.webp`;

  const bgFile = stage === 4 ? eggToBackground(dragon.egg) : 'x.jpg';

  const stageMsgs = DRAGON_MESSAGES[stage] || DRAGON_MESSAGES[1];
  const randomMsg = (() => {
    const win = window as any;
    const key = `dragon_msg_${msgKey}`;
    if (win[key] === undefined)
      win[key] = Math.floor(Math.random() * stageMsgs.length);
    return stageMsgs[win[key]] || stageMsgs[0];
  })();

  const positionClass = stage === 4
    ? "translate-y-10 md:translate-y-16"
    : "translate-y-16 md:translate-y-24";

  return (
    <div className="w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 relative aspect-video">
      <img
        src={`https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${bgFile}`}
        alt="Dragon Habitat"
        className="w-full h-full object-cover opacity-80"
        onError={e => { e.currentTarget.src = "https://via.placeholder.com/1200x675?text=Habitat"; }}
      />

      <div className="absolute inset-0 flex items-center justify-center z-30">
        <div className="absolute top-2 left-2 md:top-4 md:left-4 flex items-center gap-2">
          <div className="w-20 md:w-24 h-2.5 md:h-3 bg-white/40 backdrop-blur-md rounded-full overflow-hidden border border-white/30 shadow-sm">
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%`, backgroundColor: '#65D35D' }}
            />
          </div>
          <span className="text-[9px] md:text-[10px] font-black text-white drop-shadow-md">
            {Math.floor(progress)}%
          </span>
        </div>

        <div className={`relative flex flex-col items-center ${positionClass}`}>
          <div className="absolute -top-14 md:-top-16 flex flex-col items-center w-full">
            <div className="relative bg-white/95 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 rounded-2xl shadow-xl border border-slate-100">
              <p className="text-[8px] md:text-[11px] font-bold text-slate-700 whitespace-nowrap italic text-center">
                ({randomMsg})
              </p>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white/95" />
            </div>
            <div
              className="mt-1 cursor-pointer pointer-events-auto hover:scale-110 active:scale-95 transition-all"
              onClick={onClickName}
              style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            >
              <span className="text-white text-[10px] md:text-[13px] font-black tracking-tight whitespace-nowrap uppercase">
                {dragon.name}
              </span>
            </div>
          </div>

          <img
            key={fileName}
            src={finalUrl}
            alt="Dragon"
            className={`relative object-contain drop-shadow-2xl pointer-events-auto transition-all duration-500 -translate-y-2 ${
              stage === 4 ? 'w-24 h-24 md:w-32 md:h-32' : 'w-12 h-12 md:w-16 md:h-16'
            }`}
            onError={e => { e.currentTarget.src = `${baseUrl}/${dragon.egg}.webp`; }}
          />
          <div className="absolute -bottom-2 w-7 h-1.5 md:w-10 md:h-2 bg-black/25 rounded-[100%] blur-[5px]" />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 메인 컴포넌트
// ==========================================
export default function HogwartsApp() {

  // ── 상태 ──
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [password,     setPassword]     = useState("");
  const [records,      setRecords]      = useState<any[]>([]);
  const [isSaving,     setIsSaving]     = useState(false);
  const [studentMasterData, setStudentMasterData] = useState<any>({});

  const [currentImageFile, setCurrentImageFile] = useState('x.jpg');
  const [isFading,   setIsFading]   = useState(false);
  const [eggStep,    setEggStep]    = useState(0);
  const [tempEgg,    setTempEgg]    = useState<string | null>(null);

  const [dragons, setDragons] = useState<DragonEntry[]>([]);

  const [namingDragonIdx, setNamingDragonIdx] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");

  const [isLetterOpen,          setIsLetterOpen]          = useState(false);
  const [hasReadLetter,         setHasReadLetter]         = useState(false);
  const [isGraduatedLetterOpen, setIsGraduatedLetterOpen] = useState(false);

  const [studentInputPopup, setStudentInputPopup] = useState<{ name: string; day: string } | null>(null);
  const [popupOffType,   setPopupOffType]   = useState('-');
  const [popupStudyTime, setPopupStudyTime] = useState('');
  const [popupIsLate,    setPopupIsLate]    = useState(false);
  const [popupAm3h,      setPopupAm3h]      = useState(false);

  const [currentTime,           setCurrentTime]           = useState(getAdjustedToday());
  const [selectedHouseNotice,   setSelectedHouseNotice]   = useState<string | null>(null);
  const [showSummary,           setShowSummary]           = useState(false);
  const [selectedStudentReport, setSelectedStudentReport] = useState<string | null>(null);
  const [dailyGoal,  setDailyGoal]  = useState("");
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [bgm] = useState(() =>
    typeof Audio !== 'undefined' ? new Audio('/hedwig.mp3') : null
  );

  // ── 유틸 ──
  function getAdjustedToday() {
    const now = new Date();
    if (now.getDay() === 1 && now.getHours() < 18) {
      const adj = new Date(now); adj.setDate(now.getDate() - 1); return adj;
    }
    return now;
  }

  // ── 편지 체크 함수 ──
  const checkAndShowLetter = (name: string, admin: boolean) => {
    if (!name || admin) return;

    if (isGraduated(name)) {
      // 졸업생 편지: 주 1회
      const letterKey  = `hagrid_letter_graduated_week_${name}`;
      const lastMonday = localStorage.getItem(letterKey);
      const thisMonday = getThisMonday();
      if (lastMonday !== thisMonday) {
        setTimeout(() => setIsGraduatedLetterOpen(true), 900);
      }
      return;
    }

    // 재학생 편지: 주 1회
    const letterKey  = `hagrid_letter_week_${name}`;
    const lastMonday = localStorage.getItem(letterKey);
    const thisMonday = getThisMonday();
    if (lastMonday !== thisMonday) {
      setHasReadLetter(false);
      setTimeout(() => setIsLetterOpen(true), 900);
    } else {
      setHasReadLetter(true);
    }
  };

  const closeLetter = () => {
    setIsLetterOpen(false);
    if (selectedName) {
      localStorage.setItem(`hagrid_letter_week_${selectedName}`, getThisMonday());
      setHasReadLetter(true);
    }
  };

  const closeGraduatedLetter = () => {
    setIsGraduatedLetterOpen(false);
    if (selectedName) {
      localStorage.setItem(`hagrid_letter_graduated_week_${selectedName}`, getThisMonday());
    }
  };

  const totalStudyTime = studentMasterData[selectedName]?.total_study_time || 0;

  const firstDragonMaxed = dragons.length > 0
    && calcStage(Math.max(0, totalStudyTime - dragons[0].acquired_time), 0) === 4;

  const lastDragonMaxed = dragons.length > 0 && (() => {
    const last = dragons[dragons.length - 1];
    const idx  = dragons.length - 1;
    return calcStage(Math.max(0, totalStudyTime - last.acquired_time), idx) === 4;
  })();

  const canAddNewEgg = dragons.length === 0 || lastDragonMaxed;

  // ── 기숙사 랭킹 ──
  const houseRankings = useMemo(() => {
    return HOUSE_ORDER.map(house => {
      const students = Object.keys(studentData).filter(n => studentData[n].house === house && !isGraduated(n));
      let tScore = 0, tH = 0;
      students.forEach(name => {
        DAYS.forEach(day => {
          const res = calc(records.find(r => r.student_name === name && r.day_of_week === day));
          tScore += res.total; tH += res.studyH;
        });
      });
      const avg = students.length > 0
        ? (tScore / students.length) + Math.floor(tH / students.length) : 0;
      return { house, finalPoint: avg };
    }).sort((a, b) => b.finalPoint - a.finalPoint);
  }, [records]);

  // ── Effects ──
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getAdjustedToday()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('hg_auth');
    if (saved) {
      const { name, admin } = JSON.parse(saved);
      setSelectedName(name); setIsAdmin(admin); setIsLoggedIn(true);
      checkAndShowLetter(name, admin);
    }
  }, []);

  useEffect(() => {
    return () => {
      bgm?.pause();
      if (bgm) bgm.src = '';
      setIsPlaying(false);
    };
  }, [bgm]);

  useEffect(() => {
    supabase.from('student_master').select('*').then(({ data, error }) => {
      if (!error && data) {
        const map = data.reduce((acc: any, cur: any) => { acc[cur.student_name] = cur; return acc; }, {});
        setStudentMasterData(map);
      }
    });
  }, []);

  useEffect(() => { if (isLoggedIn) fetchRecords(); }, [isLoggedIn, selectedName]);

  useEffect(() => {
    const master = studentMasterData[selectedName];
    if (!master) return;

    if (master.dragons && Array.isArray(master.dragons) && master.dragons.length > 0) {
      setDragons(master.dragons);
    } else if (master.selected_egg) {
      setDragons([{
        egg: master.selected_egg,
        name: master.dragon_name || "이름 없는 용",
        acquired_time: 0,
      }]);
    } else {
      setDragons([]);
    }
  }, [selectedName, studentMasterData]);

  // ── 데이터 로드 ──
  const fetchRecords = async () => {
    const [resRecords, resMaster] = await Promise.all([
      supabase.from('study_records').select('*'),
      supabase.from('student_master').select('*'),
    ]);
    if (resRecords.data) {
      setRecords(resRecords.data);
      const myRecs = resRecords.data.filter(r => r.student_name === selectedName);
      setDailyGoal(myRecs.find(r => r.goal)?.goal || "");
    }
    if (resMaster.data) {
      const masterObj = resMaster.data.reduce((acc: any, item: any) => {
        acc[item.student_name] = item; return acc;
      }, {});
      setStudentMasterData(masterObj);
    }
  };

  // ── dragons 저장 헬퍼 ──
  const saveDragons = async (newDragons: DragonEntry[]) => {
    setDragons(newDragons);
    setStudentMasterData((prev: any) => ({
      ...prev,
      [selectedName]: { ...prev[selectedName], dragons: newDragons },
    }));
    await supabase.from('student_master')
      .update({ dragons: newDragons })
      .eq('student_name', selectedName);
  };

  // ── 드래곤 이름 저장 ──
  const handleSaveName = async () => {
    if (!tempName.trim() || namingDragonIdx === null) {
      alert("이름을 입력해주세요."); return;
    }
    const newDragons = dragons.map((d, i) =>
      i === namingDragonIdx ? { ...d, name: tempName } : d
    );
    await saveDragons(newDragons);
    setNamingDragonIdx(null);
    setTempName("");
  };

  // ── 로그인 ──
  const handleLogin = async () => {
    if (!selectedName) { alert("학생을 선택해주세요."); return; }
    const admin = password === "8888";
    if (!admin) {
      const { data } = await supabase.from('study_records').select('password').eq('student_name', selectedName);
      const validPw = data?.find(r => r.password)?.password || "0000";
      if (password !== validPw) { alert("비밀번호가 틀렸습니다."); return; }
    }
    setIsAdmin(admin); setIsLoggedIn(true);
    localStorage.setItem('hg_auth', JSON.stringify({ name: selectedName, admin }));
    checkAndShowLetter(selectedName, admin);
  };

  const toggleMusic = () => {
    if (!bgm) return;
    if (isPlaying) { bgm.pause(); } else { bgm.loop = true; bgm.volume = 0.4; bgm.play().catch(() => {}); }
    setIsPlaying(!isPlaying);
  };

  // ── 데이터 변경 ──
  const handleChange = async (name: string, day: string, field: string, value: any) => {
    if (!isAdmin && field !== 'password' && field !== 'goal') return;
    setIsSaving(true);
    if (field === 'password') {
      const { error } = await supabase.from('study_records').upsert(
        DAYS.map(d => ({ student_name: name, day_of_week: d, password: value })),
        { onConflict: 'student_name,day_of_week' }
      );
      if (!error) { setRecords(prev => prev.map(r => r.student_name === name ? { ...r, password: value } : r)); alert("비밀번호가 성공적으로 변경되었습니다"); }
    } else if (field === 'goal') {
      const updatePayload = DAYS.map(d => {
        const existing = records.find(r => r.student_name === name && r.day_of_week === d) || {};
        return { ...existing, student_name: name, day_of_week: d, goal: value, password: existing.password || '0000', monthly_off_count: existing.monthly_off_count ?? 4 };
      });
      const { error } = await supabase.from('study_records').upsert(updatePayload, { onConflict: 'student_name,day_of_week' });
      if (!error) { setRecords(prev => prev.map(r => r.student_name === name ? { ...r, goal: value } : r)); setDailyGoal(value); }
    } else {
      const newRecords = [...records];
      const idx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === day);
      const current = newRecords[idx] || {};
      const updatedData = { ...current, student_name: name, day_of_week: day, [field]: value, password: current.password || '0000', monthly_off_count: field === 'monthly_off_count' ? value : (current.monthly_off_count ?? 4) };
      if (idx > -1) newRecords[idx] = updatedData; else newRecords.push(updatedData);
      setRecords(newRecords);
      await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });
    }
    setIsSaving(false);
  };

  // ── 주간 리셋 ──
  const resetWeeklyData = async () => {
    if (!confirm("⚠️ 이번 주 기록을 합산하여 용을 성장시키고 표를 초기화하시겠습니까?")) return;
    if (!confirm("정말로 진행하시겠습니까?")) return;
    setIsSaving(true);
    try {
      const names = Object.keys(studentData);
      const newMasterData = { ...studentMasterData };
      await Promise.all(names.map(async name => {
        const weeklyMinutes = records.filter(r => r.student_name === name).reduce((sum, r) => sum + timeStrToMinutes(r.study_time), 0);
        if (weeklyMinutes > 0) {
          const { data: masterData } = await supabase.from('student_master').select('total_study_time').eq('student_name', name).maybeSingle();
          const newTotal = (masterData?.total_study_time || 0) + weeklyMinutes;
          if (newMasterData[name]) newMasterData[name].total_study_time = newTotal;
          return supabase.from('student_master').update({ total_study_time: newTotal }).eq('student_name', name);
        }
      }));
      setStudentMasterData(newMasterData);
      const resetData = Object.keys(studentData).flatMap(name =>
        DAYS.map(day => {
          const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
          return { student_name: name, day_of_week: day, off_type: '-', is_late: false, am_3h: false, study_time: '', password: existing.password || '0000', monthly_off_count: existing.monthly_off_count ?? 4, goal: existing.goal || '' };
        })
      );
      const { error } = await supabase.from('study_records').upsert(resetData, { onConflict: 'student_name,day_of_week' });
      if (!error) { setRecords(resetData); alert("이번 주 기록들이 용의 먹이로 전환되었습니다!"); }
      else throw error;
    } catch (err) {
      alert("❌ 처리 중 오류가 발생했습니다.");
    } finally { setIsSaving(false); }
  };

  // ── 월휴 리셋 ──
  const resetMonthlyOff = async () => {
    if (!confirm("모든 학생의 월휴 개수를 초기화하시겠습니까?")) return;
    setIsSaving(true);
    const resetData = Object.keys(studentData).flatMap(name =>
      DAYS.map(day => {
        const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
        return { ...existing, student_name: name, day_of_week: day, monthly_off_count: 4 };
      })
    );
    const { error } = await supabase.from('study_records').upsert(resetData, { onConflict: 'student_name,day_of_week' });
    if (!error) { setRecords(resetData); alert("월휴 개수가 초기화되었습니다."); }
    setIsSaving(false);
  };

  // ── 학생 입력 팝업 열기 ──
  const openStudentInput = (name: string, day: string) => {
    if (isAdmin) return;
    const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
    setPopupOffType(rec.off_type || '-');
    setPopupStudyTime(rec.study_time || '');
    setPopupIsLate(!!rec.is_late);
    setPopupAm3h(!!rec.am_3h);
    setStudentInputPopup({ name, day });
  };

  // ── 학생 입력 팝업 저장 ──
  const saveStudentInput = async () => {
    if (!studentInputPopup) return;
    const { name, day } = studentInputPopup;
    setIsSaving(true);

    const monRec = records.find(r => r.student_name === name && r.day_of_week === '월') || {};
    const prevRec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
    const prevOff = prevRec.off_type || '-';
    const currentOffCount = monRec.monthly_off_count ?? 4;

    const prevDeduct =
      ['월휴', '늦월휴'].includes(prevOff) ? 2 :
      ['월반휴', '늦월반휴'].includes(prevOff) ? 1 : 0;

    const newDeduct =
      ['월휴', '늦월휴'].includes(popupOffType) ? 2 :
      ['월반휴', '늦월반휴'].includes(popupOffType) ? 1 : 0;

    const newOffCount = Math.max(0, Math.min(4, currentOffCount + prevDeduct - newDeduct));

    const newRecords = [...records];
    const recIdx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === day);
    const updatedData = {
      ...(recIdx > -1 ? newRecords[recIdx] : {}),
      student_name: name, day_of_week: day,
      off_type: popupOffType,
      study_time: popupStudyTime,
      is_late: popupIsLate,
      am_3h: popupAm3h,
      password: (recIdx > -1 ? newRecords[recIdx].password : null) || '0000',
      monthly_off_count: newOffCount,
    };
    if (recIdx > -1) newRecords[recIdx] = updatedData; else newRecords.push(updatedData);

    const monIdx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === '월');
    if (monIdx > -1) newRecords[monIdx] = { ...newRecords[monIdx], monthly_off_count: newOffCount };

    setRecords(newRecords);

    await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });

    if (newDeduct !== prevDeduct) {
      await supabase.from('study_records').upsert(
        { ...newRecords[monIdx], monthly_off_count: newOffCount },
        { onConflict: 'student_name,day_of_week' }
      );
    }

    setIsSaving(false);
    setStudentInputPopup(null);
  };

  // ── Dragon Cave 이미지 전환 ──
  const handleRegionClick = (region: string) => {
    if (isFading || currentImageFile === `${region}.webp`) return;
    setIsFading(true);
    setTimeout(() => { setCurrentImageFile(`${region}.webp`); setTimeout(() => setIsFading(false), 50); }, 300);
  };
  const handleResetImage = () => {
    if (isFading || currentImageFile === 'x.jpg') return;
    setIsFading(true);
    setTimeout(() => { setCurrentImageFile('x.jpg'); setTimeout(() => setIsFading(false), 50); }, 300);
  };

  // ── 리포트 계산 ──
  const calculatePoints = (name: string) => {
    let bonus = 0, penalty = 0, usedWeeklyOff = 0;
    records.filter(r => r.student_name === name).forEach(r => {
      const res = calc(r); bonus += res.bonus; penalty += res.penalty;
      if (['반휴', '늦반휴'].includes(r.off_type)) usedWeeklyOff += 0.5;
      if (['주휴', '늦휴'].includes(r.off_type))   usedWeeklyOff += 1.0;
    });
    const monRec   = records.find(r => r.student_name === name && r.day_of_week === '월');
    const offCount = monRec?.monthly_off_count ?? 4;
    return { bonus, penalty, remainingWeeklyOff: (1.5 - usedWeeklyOff).toFixed(1).replace('.0', ''), remainingMonthlyOff: (offCount * 0.5).toFixed(1).replace('.0', '') };
  };
  const calculateWeeklyTotal = (name: string) => {
    const totalMins = records.filter(r => r.student_name === name).reduce((sum, r) => sum + timeStrToMinutes(r.study_time), 0);
    return minutesToTimeStr(totalMins);
  };
  const getWeeklyDateRange = () => {
    const today = currentTime; const day = today.getDay(); const diff = today.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(new Date(today).setDate(diff)); const sunday = new Date(new Date(today).setDate(diff + 6));
    return `${monday.getMonth() + 1}월 ${monday.getDate()}일 ~ ${sunday.getMonth() + 1}월 ${sunday.getDate()}일`;
  };
  const getDayDate = (targetDay: string) => {
    const dayIdx = DAYS.indexOf(targetDay); const today = currentTime; const currentDay = today.getDay();
    const diff = today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + dayIdx;
    const target = new Date(new Date(today).setDate(diff));
    return `${target.getMonth() + 1}.${target.getDate()}`;
  };

  const currentUserGraduated = !isAdmin && isGraduated(selectedName);

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
            <img src="https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/Hogwarts.png" alt="Hogwarts" className="w-56 h-auto object-contain" />
          </div>
          <div className="space-y-6">
            <select className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg" value={selectedName} onChange={e => setSelectedName(e.target.value)}>
              <option value="">이름을 선택하세요</option>
              {Object.keys(studentData).sort(sortKorean).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input type="password" placeholder="PASSWORD" className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full bg-slate-900 text-yellow-500 py-5 rounded-2xl font-black shadow-lg uppercase text-xl active:scale-95 transition-transform">Enter Castle</button>
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

      {/* ── 재학생 해그리드 편지 팝업 ── */}
      {isLetterOpen && (
        <HagridLetterModal name={selectedName} onClose={closeLetter} />
      )}

      {/* ── 졸업생 해그리드 편지 팝업 ── */}
      {isGraduatedLetterOpen && (
        <HagridLetterGraduatedModal name={selectedName} onClose={closeGraduatedLetter} />
      )}

      {/* 기숙사 공지사항 팝업 */}
      {selectedHouseNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedHouseNotice(null)}>
          <div className="relative bg-[#f4e4bc] p-6 md:p-12 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()} style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)' }}>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />
            <button onClick={() => setSelectedHouseNotice(null)} className="absolute top-2 right-2 md:top-4 md:right-4 text-slate-800 hover:rotate-90 transition-transform p-2 text-2xl z-20">✕</button>
            <div className="relative z-10 font-serif flex flex-col overflow-hidden">
              <div className="w-16 h-1 bg-slate-800/20 mx-auto mb-4 md:mb-6 shrink-0" />
              <h3 className="text-xl md:text-3xl font-black text-[#4a3728] mb-4 md:mb-6 text-center italic border-b border-[#4a3728]/20 pb-4 shrink-0 px-4 whitespace-pre-wrap">{HOUSE_NOTICES[selectedHouseNotice]?.title}</h3>
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-base md:text-lg leading-relaxed text-[#5d4037] whitespace-pre-wrap font-medium">{HOUSE_NOTICES[selectedHouseNotice]?.content}</p>
                <div className="mt-8 mb-4 text-right italic font-bold text-[#4a3728]/60">— Hogwarts School of Witchcraft and Wizardry —</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 요약 팝업 */}
      {showSummary && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowSummary(false)}>
          <div className="bg-white rounded-[2rem] p-4 md:p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowSummary(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors text-2xl font-black z-10">✕</button>
            <h3 className="text-xl font-serif font-black text-slate-800 mb-4 italic tracking-tighter border-b-2 border-slate-100 pb-3 text-center">House Weekly Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HOUSE_ORDER.map(house => {
              const studentsInHouse = Object.keys(studentData).filter(n => studentData[n].house === house).sort(sortKorean);
              const config = HOUSE_CONFIG[house];
              return (
                <div key={house} className="mb-0">
                  <div className={`${config.bg} px-4 py-2 rounded-t-xl flex items-center gap-2`}>
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-white font-black text-sm tracking-widest">{house}</span>
                  </div>

                  <div className="overflow-x-auto border border-t-0 border-slate-200 rounded-b-xl">
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-2 text-left font-black text-slate-500 w-16">학생</th>
                          {DAYS.map(d => (
                            <th key={d} className="p-2 text-center font-black text-slate-500 w-12">{d}</th>
                          ))}
                          <th className="p-2 text-center font-black text-slate-700 bg-slate-100 w-14">총시간</th>
                          <th className="p-2 text-center font-black text-slate-700 bg-slate-100 w-12">총점</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsInHouse.map((name, idx) => {
                          const graduated = isGraduated(name);
                          const totalMins = records.filter(r => r.student_name === name).reduce((sum, r) => sum + timeStrToMinutes(r.study_time), 0);
                          const totalPts  = records.filter(r => r.student_name === name).reduce((sum, r) => sum + calc(r).total, 0);
                          return (
                            <tr key={name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="p-2">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-base leading-none">{studentData[name].emoji}</span>
                                  <span className="font-black text-slate-700 text-[9px] leading-none">{formatDisplayName(name)}</span>
                                  {graduated && <span className="text-[8px] text-amber-500 font-black">🎓</span>}
                                </div>
                              </td>
                              {graduated ? (
                                <td colSpan={DAYS.length + 2} className="p-2 text-center">
                                  <span
                                    className="text-slate-400 text-[12px]"
                                    style={{ fontFamily: "'Diphylleia', serif" }}
                                  >
                                    {formatDisplayName(name)}님의 졸업을 축하합니다 🎓
                                  </span>
                                </td>
                              ) : (
                                <>
                                  {DAYS.map(day => {
                                    const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
                                    const mins = timeStrToMinutes(rec.study_time);
                                    const offBg =
                                      ['반휴','월반휴','늦반휴','늦월반휴'].includes(rec.off_type) ? 'text-emerald-600' :
                                      ['주휴','월휴','늦휴','늦월휴'].includes(rec.off_type) ? 'text-blue-500' :
                                      rec.off_type === '결석' ? 'text-red-500' : 'text-slate-700';
                                    return (
                                      <td key={day} className="p-2 text-center">
                                        {rec.off_type && !['주휴','월휴','늦휴','늦월휴','-',''].includes(rec.off_type) ? (
                                          <span className={`font-bold ${offBg}`}>
                                            {mins > 0 ? minutesToTimeStr(mins) : rec.off_type === '결석' ? '결석' : '-'}
                                          </span>
                                        ) : rec.off_type && ['주휴','월휴','늦휴','늦월휴'].includes(rec.off_type) ? (
                                          <span className="font-bold text-blue-400 text-[9px]">{rec.off_type}</span>
                                        ) : (
                                          <span className="text-slate-300">-</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="p-2 text-center bg-slate-50">
                                    <span className={`font-black ${totalMins < 1200 ? 'text-red-500' : 'text-slate-800'}`}>
                                      {totalMins > 0 ? minutesToTimeStr(totalMins) : '-'}
                                    </span>
                                  </td>
                                  <td className="p-2 text-center bg-slate-50">
                                    <span className={`font-black ${totalPts < 0 ? 'text-red-500' : totalPts > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                      {totalPts > 0 ? `+${totalPts}` : totalPts}
                                    </span>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="max-w-[1100px] mx-auto mb-8 px-4">
        <div className="flex flex-col gap-y-6">
          <div className="flex gap-2 flex-wrap justify-end items-center">
            <button onClick={toggleMusic} className={`text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm transition-all border-2 whitespace-nowrap ${isPlaying ? 'bg-white border-yellow-400 text-yellow-500 animate-pulse' : 'bg-slate-50 border-slate-300 text-slate-500'}`}>
              {isPlaying ? '🎵' : '🔇'}
            </button>
            {!isAdmin && !currentUserGraduated && (
              <button
                onClick={() => setIsLetterOpen(true)}
                className={`relative text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm transition-all border-2 whitespace-nowrap
                  ${!hasReadLetter ? 'bg-amber-50 border-amber-400 text-amber-600 animate-pulse' : 'bg-slate-50 border-slate-300 text-slate-500'}`}
                title="해그리드의 편지"
              >
                📬
                {!hasReadLetter && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-stone-100" />
                )}
              </button>
            )}
            {!isAdmin && currentUserGraduated && (
              <button
                onClick={() => setIsGraduatedLetterOpen(true)}
                className="relative text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm transition-all border-2 whitespace-nowrap bg-amber-50 border-amber-400 text-amber-600"
                title="해그리드의 편지"
              >
                📬
              </button>
            )}
            {!isAdmin && !currentUserGraduated && (
              <>
                <Link href="/planner" className="text-[10px] font-black text-slate-700 bg-slate-100 border-slate-400 border-2 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-200 transition-all active:scale-95 whitespace-nowrap">플래너</Link>
                <Link href="/timer"   className="text-[10px] font-black text-slate-700 bg-slate-100 border-slate-400 border-2 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-200 transition-all active:scale-95 whitespace-nowrap">교시제</Link>
                <Link href="/review"  className="text-[10px] font-black text-slate-700 bg-slate-100 border-slate-400 border-2 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-200 transition-all active:scale-95 whitespace-nowrap">회독</Link>
              </>
            )}
            {isAdmin && (
              <>
                <button onClick={() => setShowSummary(true)} className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-indigo-700 whitespace-nowrap">요약</button>
                <button onClick={resetWeeklyData}            className="text-[10px] font-black text-white bg-red-600    px-3 py-1.5 rounded-full shadow-lg hover:bg-red-700    whitespace-nowrap">주간 리셋</button>
                <button onClick={resetMonthlyOff}            className="text-[10px] font-black text-white bg-orange-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-orange-700 whitespace-nowrap">월휴 리셋</button>
              </>
            )}
            <button onClick={() => { localStorage.removeItem('hg_auth'); window.location.reload(); }} className="text-[10px] font-black text-slate-400 bg-white border-slate-100 border-2 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">Logout</button>
          </div>

          <div className="flex justify-center">
            <h2 className="text-3xl font-serif font-black text-slate-800 italic tracking-tight whitespace-nowrap">Hogwarts School</h2>
          </div>

          <div className="grid grid-cols-4 gap-1.5 md:gap-4">
            {houseRankings.map((item, idx) => {
              const config = HOUSE_CONFIG[item.house];
              return (
                <div key={item.house} onClick={() => setSelectedHouseNotice(item.house)}
                  className={`${config.bg} ${config.border} ${idx === 0 ? 'winner-sparkle ring-4 ring-yellow-400 ring-offset-2' : ''} border-b-4 p-1.5 md:p-5 rounded-xl md:rounded-[2rem] text-white shadow-xl relative cursor-pointer active:scale-95 transition-all hover:brightness-110 overflow-hidden`}>
                  <div className="absolute right-[-10px] bottom-[-10px] text-5xl md:text-7xl opacity-20 pointer-events-none">{config.icon}</div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-[7px] md:text-xs font-black opacity-90 tracking-widest uppercase">{item.house}</div>
                      <div className={`text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-full ${config.accent} text-slate-900 shadow-sm`}>{["1st", "2nd", "3rd", "4th"][idx]}</div>
                    </div>
                    <div className="text-lg md:text-4xl font-black italic">{(Math.round(item.finalPoint * 10) / 10).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 학습 기록 테이블 */}
      <div className="max-w-[1100px] mx-auto bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-4 px-6 md:px-8 flex flex-col gap-2 text-white min-h-[60px]">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] md:text-xs font-black text-yellow-500 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {isAdmin ? "Headmaster Console" : currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
              {!isAdmin && <span className="text-white ml-2">{currentTime.toLocaleTimeString('ko-KR', { hour12: false })}</span>}
            </span>
            {isSaving && <div className="text-[9px] text-yellow-500 font-bold animate-bounce">Magic occurring...</div>}
          </div>
          {!isAdmin && !currentUserGraduated && (
            <div className="flex items-center gap-3 pt-1 border-t border-white/10 mt-1">
              <span className="text-[9px] font-black text-white/40 shrink-0 uppercase tracking-tighter">Goal</span>
              <div className="flex items-center gap-2 flex-1 overflow-hidden group">
                <input type="text" value={dailyGoal || ""} onChange={e => setDailyGoal(e.target.value)} placeholder="목표를 입력하세요." className="bg-transparent italic text-xs w-full focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5 transition-all text-white/90" />
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => { const t = displayList[0]; if (t) handleChange(t, '월', 'goal', dailyGoal); }} className="text-[10px] font-bold text-yellow-500">[저장]</button>
                  <button onClick={() => { if (confirm("삭제하시겠습니까?")) { setDailyGoal(""); if (displayList[0]) handleChange(displayList[0], '월', 'goal', ""); }}} className="text-[10px] font-bold text-red-400">[삭제]</button>
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

                // ── 졸업생 행 ──
                if (isGraduated(name)) {
                  return (
                    <React.Fragment key={name}>
                      {isAdmin && (
                        <tr className="bg-slate-100/50 border-t-2 border-slate-200">
                          <td className="sticky left-0 bg-slate-100/50 z-20 border-r" />
                          {DAYS.map(d => <td key={d} className="p-1 text-[10px] font-black text-slate-500 text-center">{d}</td>)}
                          <td colSpan={2} className="border-l" />
                        </tr>
                      )}
                      <tr className="border-b-[6px] border-slate-100">
                        <td
                          className={`p-4 text-center sticky left-0 z-20 font-bold border-r-[3px] ${info.color} ${info.text} cursor-pointer hover:brightness-95 transition-all`}
                          onClick={() => setSelectedStudentReport(name)}
                        >
                          <div className="text-3xl mb-1">{info.emoji}</div>
                          <div className="leading-tight text-sm font-black mb-1">{formatDisplayName(name)}</div>
                          <div className="text-[9px] font-black opacity-70">{info.house}</div>
                          <div className="text-[9px] font-black text-amber-500 mt-1">🎓 졸업</div>
                        </td>
                        <td colSpan={DAYS.length + 2} className="text-center bg-white py-10 px-6">
                          <p className="text-slate-400 text-2xl md:text-3xl" style={{ fontFamily: "'Diphylleia', serif" }}>
                            호그와트 졸업생 {formatDisplayName(name)}님의 앞날이 행복으로 가득하길 바랍니다. 🎓
                          </p>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                }

                // ── 일반 학생 행 ──
                const monRec   = records.find(r => r.student_name === name && r.day_of_week === '월') || {};
                const offCount = monRec.monthly_off_count ?? 4;
                const rows     = [{ f: 'off_type' }, { f: 'is_late' }, { f: 'am_3h' }, { f: 'study_time' }, { f: 'penalty' }, { f: 'bonus' }, { f: 'total' }];
                const totalMins = records.filter(r => r.student_name === name).reduce((sum, r) => sum + timeStrToMinutes(r.study_time), 0);
                const totalPts  = records.filter(r => r.student_name === name).reduce((sum, r) => sum + calc(r).total, 0);

                return (
                  <React.Fragment key={name}>
                    {isAdmin && (
                      <tr className="bg-slate-100/50 border-t-2 border-slate-200">
                        <td className="sticky left-0 bg-slate-100/50 z-20 border-r" />
                        {DAYS.map(d => <td key={d} className="p-1 text-[10px] font-black text-slate-500 text-center">{d}</td>)}
                        <td colSpan={2} className="border-l" />
                      </tr>
                    )}
                    {rows.map((row, rIdx) => (
                      <tr key={row.f} className={rIdx === 6 ? "border-b-[6px] border-slate-100" : "border-b border-slate-50"}>
                        {rIdx === 0 && (
                          <td rowSpan={7} className={`p-4 text-center sticky left-0 z-20 font-bold border-r-[3px] ${info.color} ${info.text} cursor-pointer hover:brightness-95 transition-all`} onClick={() => setSelectedStudentReport(name)}>
                            <div className="text-3xl mb-1">{info.emoji}</div>
                            <div className="leading-tight text-sm font-black mb-1">{formatDisplayName(name)}</div>
                            <div className="text-[9px] font-black opacity-70 mb-2">{info.house}</div>
                            <button onClick={e => { e.stopPropagation(); const newPw = prompt("숫자 4자리"); if (newPw && /^\d{4}$/.test(newPw)) handleChange(name, '월', 'password', newPw); }} className="text-[8px] underline opacity-40 block mx-auto">PW 변경</button>
                          </td>
                        )}
                        {DAYS.map(day => {
                          const rec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
                          const res = calc(rec);
                          const offBg = ['반휴','월반휴','늦반휴','늦월반휴'].includes(rec.off_type) ? 'bg-green-100' : ['주휴','월휴','늦휴','늦월휴'].includes(rec.off_type) ? 'bg-blue-100' : rec.off_type === '결석' ? 'bg-red-100' : '';
                          return (
                            <td key={day} className={`p-1.5 text-center border-r border-slate-50 ${row.f === 'off_type' ? offBg : ''}`}>
                              {row.f === 'off_type' ? (
                                isAdmin ? (
                                  <select className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-[10px]" value={rec.off_type || '-'} onChange={e => handleChange(name, day, 'off_type', e.target.value)}>
                                    {OFF_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                                ) : (
                                  <button
                                    onClick={() => openStudentInput(name, day)}
                                    className={`w-full text-center font-black text-[10px] py-1 rounded transition-all hover:opacity-70 active:scale-95
                                      ${rec.off_type && rec.off_type !== '-' ? 'text-slate-900' : 'text-slate-300'}`}
                                  >
                                    {rec.off_type && rec.off_type !== '-' ? rec.off_type : '터치'}
                                  </button>
                                )
                              ) : row.f === 'is_late' ? (
                                <input type="checkbox" className="late-checkbox" checked={!!rec.is_late} onChange={e => handleChange(name, day, 'is_late', e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'am_3h' ? (
                                <input type="checkbox" className="w-3.5 h-3.5 accent-slate-800 mx-auto block" checked={!!rec.am_3h} onChange={e => handleChange(name, day, 'am_3h', e.target.checked)} disabled={!isAdmin} />
                              ) : row.f === 'study_time' ? (
                                isAdmin ? (
                                  <input type="text" placeholder="-" className="w-full text-center bg-transparent font-black text-slate-900 outline-none text-sm" value={rec.study_time || ''}
                                    onChange={e => setRecords(prev => prev.map(r => (r.student_name === name && r.day_of_week === day) ? { ...r, study_time: e.target.value } : r))}
                                    onBlur={e => handleChange(name, day, 'study_time', e.target.value)} />
                                ) : (
                                  <span className="font-black text-sm text-slate-900">{rec.study_time || '-'}</span>
                                )
                              ) : (
                                <span className={`font-black text-sm ${row.f === 'penalty' && res.penalty < 0 ? 'text-red-500' : row.f === 'bonus' && res.bonus > 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                                  {res[row.f as keyof typeof res] || (row.f === 'total' ? 0 : '')}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="bg-slate-50 text-center font-black border-l">
                          {rIdx === 3 && <div className={`text-sm font-black ${totalMins < 1200 ? 'text-red-600' : 'text-slate-900'}`}>{totalMins > 0 ? minutesToTimeStr(totalMins) : "-"}</div>}
                          {rIdx === 6 && <div className={`text-[10px] font-black py-1 rounded ${totalPts <= -10 ? 'text-red-600 bg-red-50' : 'text-blue-700 bg-blue-50'}`}>합계: {totalPts.toFixed(1).replace('.0', '')}</div>}
                        </td>
                        {rIdx === 0 && (
                          <td rowSpan={7} className="p-2 bg-white border-l text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {[1, 2, 3, 4].map(n => (
                                <div key={n} onClick={() => isAdmin && handleChange(name, '월', 'monthly_off_count', offCount >= (5 - n) ? (5 - n) - 1 : offCount)}
                                  className={`w-7 h-5 rounded-md border-2 ${isAdmin ? 'cursor-pointer' : ''} ${offCount >= (5 - n) ? info.accent : 'bg-slate-50 border-slate-200'}`} />
                              ))}
                              {isAdmin && (
                                <button onClick={() => handleChange(name, '월', 'monthly_off_count', 4)}
                                  className="mt-0.5 text-[8px] font-black text-slate-300 hover:text-orange-500 uppercase tracking-widest transition-colors leading-none" title="월휴 초기화">
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

      {/* Dragon Cave */}
      <div className="mt-16 px-4 pb-24 text-left max-w-6xl mx-auto">
        <hr className="border-slate-200 mb-10" />
        <h2 className="text-2xl font-black italic mb-8 uppercase"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', color: '#1b1e21', transform: 'skewX(-5deg)' }}>
          Dragon Cave
        </h2>

        {dragons.length > 0 && (
          <div className="flex flex-col gap-4 mb-6">
            {dragons.map((dragon, idx) => (
              <DragonSlot
                key={`${dragon.egg}-${idx}`}
                dragon={dragon}
                dragonIndex={idx}
                totalStudyTime={totalStudyTime}
                msgKey={`${selectedName}_${idx}`}
                onClickName={() => { setNamingDragonIdx(idx); setTempName(dragon.name); }}
              />
            ))}
          </div>
        )}

        {canAddNewEgg && (
          <div className="mt-2">
            {dragons.length > 0 && (
              <p className="text-[11px] font-black text-slate-400 mb-3 uppercase tracking-widest">
                ✦ 새로운 용을 데려올 수 있습니다
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 mb-4 max-w-sm">
              {['volcano', 'jungle', 'forest', 'desert', 'coast', 'alpine'].map(region => (
                <button
                  key={region}
                  onClick={() => handleRegionClick(region)}
                  className={`py-2 text-[11px] font-black tracking-tighter transition-all rounded-md border uppercase ${
                    currentImageFile === `${region}.webp`
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="flex justify-end mb-2">
                <button onClick={handleResetImage} className="text-[9px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors">
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

                {!isFading && currentImageFile !== 'x.jpg' && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 px-4 z-20">
                    {[1, 2, 3].map(num => {
                      const prefix = currentImageFile.split('.')[0].substring(0, 2).toLowerCase();
                      const eggCode = `${prefix}${num}`;
                      const eggUrl  = `https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${eggCode}.webp`;
                      return (
                        <div key={num} className="relative group flex flex-col items-center">
                          <div className="absolute -bottom-1 w-6 h-1.5 md:w-8 md:h-2 bg-black/40 rounded-[100%] blur-[4px] group-hover:scale-125 transition-transform duration-300" />
                          <img
                            src={eggUrl} alt="Dragon Egg"
                            onClick={() => { setTempEgg(eggCode); setEggStep(1); }}
                            className="relative w-12 h-12 md:w-16 md:h-16 object-contain hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                            onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentImageFile === 'x.jpg' && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <p className="text-white/60 text-sm font-black uppercase tracking-widest drop-shadow-md">
                      지역을 선택하여 알을 탐색하세요
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!canAddNewEgg && dragons.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm font-black uppercase tracking-widest">
            지역을 선택하여 첫 번째 알을 데려오세요
          </div>
        )}
      </div>

      {/* 학생 입력 팝업 */}
      {studentInputPopup && !isAdmin && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setStudentInputPopup(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-yellow-500 font-black text-xs tracking-widest uppercase">{studentInputPopup.day}요일 기록</div>
                <div className="text-white/40 text-[10px] font-bold mt-0.5">{getDayDate(studentInputPopup.day)}</div>
              </div>
              <button onClick={() => setStudentInputPopup(null)} className="text-white/40 hover:text-white text-xl transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">출결 유형</div>
                {(() => {
                  const monRec = records.find(r => r.student_name === studentInputPopup?.name && r.day_of_week === '월') || {};
                  const offCount = monRec.monthly_off_count ?? 4;
                  const prevRec = records.find(r => r.student_name === studentInputPopup?.name && r.day_of_week === studentInputPopup?.day) || {};
                  const prevDeduct = ['월휴','늦월휴'].includes(prevRec.off_type) ? 2 : ['월반휴','늦월반휴'].includes(prevRec.off_type) ? 1 : 0;
                  const availableCount = Math.min(4, offCount + prevDeduct);
                  return (
                    <div className="grid grid-cols-3 gap-2">
                      {['-', '출석', '반휴', '주휴', '월반휴', '월휴', '늦반휴', '늦휴', '늦월반휴', '늦월휴', '자율', '결석'].map(opt => {
                        const needsCount = ['월휴','늦월휴'].includes(opt) ? 2 : ['월반휴','늦월반휴'].includes(opt) ? 1 : 0;
                        const isDisabled = needsCount > 0 && availableCount < needsCount;
                        return (
                          <button
                            key={opt}
                            onClick={() => !isDisabled && setPopupOffType(opt)}
                            disabled={isDisabled}
                            className={`py-2 px-1 rounded-xl text-[11px] font-black border-2 transition-all active:scale-95
                              ${isDisabled
                                ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed line-through'
                                : popupOffType === opt
                                  ? opt === '결석' ? 'bg-red-500 border-red-500 text-white'
                                  : ['월휴','월반휴','늦월휴','늦월반휴'].includes(opt) ? 'bg-cyan-500 border-cyan-500 text-white'
                                  : ['반휴','늦반휴','주휴','늦휴'].includes(opt) ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-slate-900 border-slate-900 text-white'
                                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
                              }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
                {(['월휴','늦월휴'].includes(popupOffType)) && (
                  <div className="mt-2 text-[10px] font-bold text-cyan-600 bg-cyan-50 rounded-lg px-3 py-1.5">
                    ✦ 월휴 2칸이 차감됩니다
                  </div>
                )}
                {(['월반휴','늦월반휴'].includes(popupOffType)) && (
                  <div className="mt-2 text-[10px] font-bold text-cyan-600 bg-cyan-50 rounded-lg px-3 py-1.5">
                    ✦ 월휴 1칸이 차감됩니다
                  </div>
                )}
              </div>

              {popupOffType !== '-' && popupOffType !== '결석' && (
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">공부 시간</div>
                  <input
                    type="text"
                    value={popupStudyTime}
                    onChange={e => setPopupStudyTime(e.target.value)}
                    placeholder="예: 9:30"
                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-center font-black text-slate-900 text-lg focus:border-slate-400 outline-none transition-colors"
                  />
                </div>
              )}

              {popupOffType !== '-' && popupOffType !== '결석' && !['주휴','월휴','늦휴','늦월휴'].includes(popupOffType) && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 cursor-pointer hover:border-amber-200 hover:bg-amber-50 transition-all">
                    <input
                      type="checkbox"
                      checked={popupIsLate}
                      onChange={e => setPopupIsLate(e.target.checked)}
                      className="w-5 h-5 accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-black text-slate-800">지각했어요</div>
                      <div className="text-[10px] text-slate-400">마감 시간 이후 인증한 경우</div>
                    </div>
                  </label>
                  {popupOffType !== '-' && popupOffType !== '결석' && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all">
                      <input
                        type="checkbox"
                        checked={popupAm3h}
                        onChange={e => setPopupAm3h(e.target.checked)}
                        className="w-5 h-5 accent-slate-800 cursor-pointer"
                      />
                      <div>
                        <div className="text-sm font-black text-slate-800">오전 3시간 인증 완료</div>
                        <div className="text-[10px] text-slate-400">오전 시간대 3시간 이상 공부한 경우</div>
                      </div>
                    </label>
                  )}
                </div>
              )}

              <button
                onClick={saveStudentInput}
                disabled={isSaving}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : '✓ 저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 알 선택 확인 팝업 */}
      {eggStep > 0 && tempEgg && (
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
                    if (!studentMasterData[selectedName]) {
                      alert("데이터 로딩 중입니다. 잠시 후 다시 시도해주세요.");
                      return;
                    }
                    const newDragon: DragonEntry = {
                      egg: tempEgg,
                      name: "이름 없는 용",
                      acquired_time: totalStudyTime,
                    };
                    const newDragons = [...dragons, newDragon];
                    await saveDragons(newDragons);
                    setEggStep(0);
                    setTempEgg(null);
                    handleResetImage();
                    setNamingDragonIdx(newDragons.length - 1);
                    setTempName("");
                  }
                }}
                className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs"
              >
                네
              </button>
              <button onClick={() => { setEggStep(0); setTempEgg(null); }} className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]">
                고민해볼게요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 드래곤 이름 짓기 팝업 */}
      {namingDragonIdx !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center border-4 border-slate-100">
            <h3 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tighter" style={{ fontFamily: "'Cinzel', serif" }}>
              이름을 지어줄까요?
            </h3>
            <p className="text-slate-500 mb-6 text-sm italic">이름은 언제든지 변경할 수 있습니다.</p>
            <input
              type="text" value={tempName}
              onChange={e => setTempName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              placeholder="이름을 입력하세요"
              className="w-full border-2 border-slate-100 rounded-xl p-3 mb-6 focus:border-[#65D35D] outline-none text-center font-bold text-slate-700 transition-colors"
            />
            <div className="flex flex-col gap-3">
              <button onClick={handleSaveName} className="w-full py-3 bg-[#65D35D] text-white font-black rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg shadow-green-100">
                이름을 지어준다
              </button>
              <button onClick={() => { setNamingDragonIdx(null); setTempName(""); }} className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]">
                지어주지 않는다
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 학생 개인 리포트 팝업 */}
      {selectedStudentReport && studentData[selectedStudentReport] && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedStudentReport(null)}>
          <div className="bg-white p-5 md:px-10 md:py-8 w-full max-w-lg shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3)] relative rounded-[3rem] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

            {isGraduated(selectedStudentReport) ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <img src={HOUSE_LOGOS[studentData[selectedStudentReport].house]} alt="Logo" className="w-24 h-24 object-contain drop-shadow-md mb-4 opacity-60" />
                <div className="text-5xl mb-5">{studentData[selectedStudentReport].emoji}</div>
                <p
                  className="text-slate-600 text-2xl md:text-3xl leading-relaxed"
                  style={{ fontFamily: "'Diphylleia', serif" }}
                >
                  호그와트 졸업생 {formatDisplayName(selectedStudentReport)}님의<br />앞날이 행복으로 가득하길 바랍니다.
                </p>
                <div className="mt-6 text-3xl tracking-widest">🎓 ✨ 🎉</div>
              </div>
            ) : (
            <div className="flex items-end justify-center mb-6 w-full">
              <div className="w-[45%] flex justify-end">
                <img src={HOUSE_LOGOS[studentData[selectedStudentReport].house]} alt="Logo" className="w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-md" />
              </div>
              <div className="w-[55%] flex flex-col justify-end items-start pl-4">
                <div className="flex items-baseline gap-1.5 mb-0">
                  <span className="text-5xl md:text-6xl">{studentData[selectedStudentReport].emoji}</span>
                  <span className="font-bold text-xs md:text-sm text-slate-400 tracking-tight leading-none">{formatDisplayName(selectedStudentReport)}</span>
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight italic">{calculateWeeklyTotal(selectedStudentReport)}</div>
                  <div className="text-sm md:text-base font-bold text-slate-500 tracking-tight mt-1">{records.find(r => r.student_name === selectedStudentReport && r.goal)?.goal || ""}</div>
                </div>
              </div>
            </div>
            )}
            {!isGraduated(selectedStudentReport) && (
              <>
            <div className="text-xl md:text-2xl font-black text-black mb-4 text-center tracking-tight">{getWeeklyDateRange()}</div>
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
                    <div className={`text-[9px] font-black h-3 leading-none uppercase ${textClass}`}>{['반휴','월반휴','주휴','결석'].includes(rec.off_type) ? rec.off_type : ""}</div>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
