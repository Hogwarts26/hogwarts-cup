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
  "🐆표범":  { house: "슬리데린", emoji: "🐆", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
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
    title: `오차를 바로잡을 지혜가 필요합니다!`,
    content: `래번클로 학우 여러분, 지난주 우승의 기쁨도 잠시, 4위라는 당혹스러운 성적표를 받게 되었습니다. 플리트윅 교수님께서는 "실패는 더 정교한 가설을 세우기 위한 과정"이라며 우리를 다독여 주셨습니다. 우리가 잠시 방심한 틈을 타 타 기숙사들이 전략적으로 움직인 결과입니다.

이번 주 우리는 계단 이동 패턴에 대한 수학적 분석을 공유하여, 보수 작업 중에도 단 1초의 낭비 없이 이동할 수 있는 최적의 경로를 확보할 것입니다. 

이번주에는 독수리 문고리가  "움직이는 것 중 결코 변하지 않는 것은 무엇인가?"라는 질문을 던지고 있습니다. 다시 한번 지혜를 모아 래번클로의 명예를 회복합시다. 4위는 다시 도약하기 위한 가장 낮은 지점일 뿐입니다.

`,
  },
  "그리핀도르": {
    title: `1위가 눈앞입니다,
멈추지 말고 돌격합시다!`,
    content: `그리핀도르 학우 여러분! 지난주 우리는 2위를 기록하며 정상을 향한 발판을 마련했습니다. 수업 시간마다 보여준 여러분의 과감한 질문과 답변이 큰 힘이 되었습니다. 네빌 롱보텀 교수님께서는 "용기는 단판 승부가 아니라 매일 반복되는 도전"이라며 여러분을 독려하고 계십니다.

최근 슬리데린 학생들이 복도에서 우리를 자극하려는 움직임이 있지만, 진정한 사자는 사소한 도발에 흔들리지 않습니다. 오직 실력과 당당한 태도로 이번 주 1위를 탈환합시다. 이번 주말에는 퀴디치 팀의 야간 전술 훈련이 예정되어 있습니다. 승리를 향한 뜨거운 열정으로 3월의 밤을 밝혀봅시다!

`,
  },
  "슬리데린": {
    title: `폭풍 전의 고요, 
우리의 시간은 반드시 옵니다`,
    content: `슬리데린 학우 여러분, 3위라는 성적은 우리의 자존심에 어울리지 않습니다. 하지만 슬러그혼 교수님께서는 "진정한 승자는 상대가 방심할 때 가장 치명적인 한 방을 날리는 법"이라며 차분하게 다음 기회를 노리라고 말씀하셨습니다.

이번 주 변덕쟁이 계단의 보수 작업을 역이용하십시오. 다른 기숙사 학생들이 계단 때문에 우왕좌왕하며 지각할 때, 우리는 가장 빠른 지름길을 파악해 누구보다 먼저 교실에 도착할 것입니다. 치밀함과 주도면밀함으로 잃어버린 점수를 되찾아옵시다. 

3월 셋째 주 새로운 암호는 '철저한 복수' 입니다. 그림자 속에서 완벽한 반전을 준비하십시오.

`,
  },
  "후플푸프": {
    title: `다시 찾은 정상! 
우리의 끈기가 증명되었습니다!`,
    content: `사랑하는 후플푸프 학우 여러분, 우리가 다시 우승 깃발을 가져왔습니다! 지난주 4위라는 성적에 낙담하지 않고, 묵묵히 온실을 가꾸고 신입생들을 도운 여러분의 선한 마음이 상점으로 돌아왔습니다. 스프라우트 교수님께서도 여러분이 너무나 자랑스럽다며 휴게실에 직접 구운 허니 글레이즈드 도넛을 넉넉히 보내주셨습니다.

이번 주 변덕쟁이 계단 보수 작업으로 이동이 불편하겠지만, 길을 헤매는 신입생이나 타 기숙사 친구가 있다면 먼저 손을 내밀어 도와주세요. 그런 다정함이야말로 후플푸프를 1위로 만드는 가장 강력한 마법입니다. 오늘 저녁엔 휴게실에서 작은 축하 파티가 있을 예정이니 모두 모여주세요!

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
// - 첫 번째 용(dragonIndex === 0): 6000/12000/18000 기준
// - 두 번째 용 이후: 3000/6000/9000 기준 (50시간씩)
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

  // 배경 이미지: 성룡(4단계) 달성한 용만 해당 지역 배경, 나머지는 x.jpg
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
      {/* 배경 이미지 */}
      <img
        src={`https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${bgFile}`}
        alt="Dragon Habitat"
        className="w-full h-full object-cover opacity-80"
        onError={e => { e.currentTarget.src = "https://via.placeholder.com/1200x675?text=Habitat"; }}
      />

      <div className="absolute inset-0 flex items-center justify-center z-30">
        {/* 게이지바 */}
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

        {/* 드래곤 + 말풍선 + 이름 */}
        <div className={`relative flex flex-col items-center ${positionClass}`}>
          <div className="absolute -top-14 md:-top-16 flex flex-col items-center w-full">
            {/* 말풍선 */}
            <div className="relative bg-white/95 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 rounded-2xl shadow-xl border border-slate-100">
              <p className="text-[8px] md:text-[11px] font-bold text-slate-700 whitespace-nowrap italic text-center">
                ({randomMsg})
              </p>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white/95" />
            </div>
            {/* 이름 */}
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

          {/* 드래곤 이미지 */}
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

  // Dragon Cave (지역 선택용 - 새 알 데려올 때만 사용)
  const [currentImageFile, setCurrentImageFile] = useState('x.jpg');
  const [isFading,   setIsFading]   = useState(false);
  const [eggStep,    setEggStep]    = useState(0);
  const [tempEgg,    setTempEgg]    = useState<string | null>(null);

  // 다중 용 상태
  const [dragons, setDragons] = useState<DragonEntry[]>([]);

  // 이름 짓기 팝업 (어떤 용 인덱스인지)
  const [namingDragonIdx, setNamingDragonIdx] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");

  // 학생 입력 팝업
  const [studentInputPopup, setStudentInputPopup] = useState<{ name: string; day: string } | null>(null);
  const [popupOffType,   setPopupOffType]   = useState('-');
  const [popupStudyTime, setPopupStudyTime] = useState('');
  const [popupIsLate,    setPopupIsLate]    = useState(false);
  const [popupAm3h,      setPopupAm3h]      = useState(false);

  // UI
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

  const totalStudyTime = studentMasterData[selectedName]?.total_study_time || 0;

  // 첫 번째 용이 4단계인지 (새 알 데려오기 가능 조건)
  const firstDragonMaxed = dragons.length > 0
    && calcStage(Math.max(0, totalStudyTime - dragons[0].acquired_time), 0) === 4;

  // 현재 마지막 용이 진행 중인지 (마지막 용이 4단계면 또 추가 가능)
  const lastDragonMaxed = dragons.length > 0 && (() => {
    const last = dragons[dragons.length - 1];
    const idx  = dragons.length - 1;
    return calcStage(Math.max(0, totalStudyTime - last.acquired_time), idx) === 4;
  })();

  // 새 알 데려오기 버튼 활성 조건:
  // - 아직 알이 없거나
  // - 마지막 용이 4단계 달성
  const canAddNewEgg = dragons.length === 0 || lastDragonMaxed;

  // ── 기숙사 랭킹 ──
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
    }
  }, []);

  useEffect(() => { return () => { bgm?.pause(); setIsPlaying(false); }; }, [bgm]);

  useEffect(() => {
    supabase.from('student_master').select('*').then(({ data, error }) => {
      if (!error && data) {
        const map = data.reduce((acc: any, cur: any) => { acc[cur.student_name] = cur; return acc; }, {});
        setStudentMasterData(map);
      }
    });
  }, []);

  useEffect(() => { if (isLoggedIn) fetchRecords(); }, [isLoggedIn, selectedName]);

  // 마스터 데이터 → dragons 상태 동기화
  useEffect(() => {
    const master = studentMasterData[selectedName];
    if (!master) return;

    // dragons 컬럼이 있으면 우선 사용
    if (master.dragons && Array.isArray(master.dragons) && master.dragons.length > 0) {
      setDragons(master.dragons);
    } else if (master.selected_egg) {
      // 기존 레거시 데이터 마이그레이션: selected_egg → dragons[0]
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
    if (isAdmin) return; // 관리자는 기존 방식 사용
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

    // 월휴 자동 차감 계산
    const monRec = records.find(r => r.student_name === name && r.day_of_week === '월') || {};
    const prevRec = records.find(r => r.student_name === name && r.day_of_week === day) || {};
    const prevOff = prevRec.off_type || '-';
    const currentOffCount = monRec.monthly_off_count ?? 4;

    // 이전 월휴 차감 복원
    const prevDeduct =
      ['월휴', '늦월휴'].includes(prevOff) ? 2 :
      ['월반휴', '늦월반휴'].includes(prevOff) ? 1 : 0;

    // 새 월휴 차감
    const newDeduct =
      ['월휴', '늦월휴'].includes(popupOffType) ? 2 :
      ['월반휴', '늦월반휴'].includes(popupOffType) ? 1 : 0;

    const newOffCount = Math.max(0, Math.min(4, currentOffCount + prevDeduct - newDeduct));

    // 레코드 업데이트
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

    // 월 레코드 monthly_off_count도 업데이트
    const monIdx = newRecords.findIndex(r => r.student_name === name && r.day_of_week === '월');
    if (monIdx > -1) newRecords[monIdx] = { ...newRecords[monIdx], monthly_off_count: newOffCount };

    setRecords(newRecords);

    await supabase.from('study_records').upsert(updatedData, { onConflict: 'student_name,day_of_week' });

    // 월 레코드도 monthly_off_count 갱신
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
                  {/* 기숙사 헤더 */}
                  <div className={`${config.bg} px-4 py-2 rounded-t-xl flex items-center gap-2`}>
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-white font-black text-sm tracking-widest">{house}</span>
                  </div>

                  {/* 테이블 */}
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
                          const totalMins = records.filter(r => r.student_name === name).reduce((sum, r) => sum + timeStrToMinutes(r.study_time), 0);
                          const totalPts  = records.filter(r => r.student_name === name).reduce((sum, r) => sum + calc(r).total, 0);
                          return (
                            <tr key={name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="p-2">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-base leading-none">{studentData[name].emoji}</span>
                                  <span className="font-black text-slate-700 text-[9px] leading-none">{formatDisplayName(name)}</span>
                                </div>
                              </td>
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
            {!isAdmin && (
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
          {!isAdmin && (
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
                const info     = studentData[name];
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

      {/* ══════════════════════════════════════
          Dragon Cave
      ══════════════════════════════════════ */}
      <div className="mt-16 px-4 pb-24 text-left max-w-6xl mx-auto">
        <hr className="border-slate-200 mb-10" />
        <h2 className="text-2xl font-black italic mb-8 uppercase"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', color: '#1b1e21', transform: 'skewX(-5deg)' }}>
          Dragon Cave
        </h2>

        {/* 기존 용들 슬롯 (세로 배열) */}
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

        {/* 새 알 데려오기 구역 (canAddNewEgg 또는 dragons가 0개일 때) */}
        {canAddNewEgg && (
          <div className="mt-2">
            {dragons.length > 0 && (
              <p className="text-[11px] font-black text-slate-400 mb-3 uppercase tracking-widest">
                ✦ 새로운 용을 데려올 수 있습니다
              </p>
            )}

            {/* 지역 버튼 */}
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

            {/* 알 선택 이미지 */}
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

                {/* 알 선택 UI */}
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

                {/* 아무 지역도 선택 안 했을 때 안내 */}
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

        {/* 첫 용도 없고 canAddNewEgg도 아닌 경우 (=용 키우는 중) 안내 없음 */}
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
            {/* 팝업 헤더 */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-yellow-500 font-black text-xs tracking-widest uppercase">{studentInputPopup.day}요일 기록</div>
                <div className="text-white/40 text-[10px] font-bold mt-0.5">{getDayDate(studentInputPopup.day)}</div>
              </div>
              <button onClick={() => setStudentInputPopup(null)} className="text-white/40 hover:text-white text-xl transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-5">

              {/* 출결 선택 */}
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">출결 유형</div>
                {(() => {
                  const monRec = records.find(r => r.student_name === studentInputPopup?.name && r.day_of_week === '월') || {};
                  const offCount = monRec.monthly_off_count ?? 4;
                  // 현재 선택한 날의 기존 월휴 차감 복원 고려
                  const prevRec = records.find(r => r.student_name === studentInputPopup?.name && r.day_of_week === studentInputPopup?.day) || {};
                  const prevDeduct = ['월휴','늦월휴'].includes(prevRec.off_type) ? 2 : ['월반휴','늦월반휴'].includes(prevRec.off_type) ? 1 : 0;
                  const availableCount = Math.min(4, offCount + prevDeduct); // 이미 차감된 만큼 복원해서 계산
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
                {/* 월휴 차감 안내 */}
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

              {/* 공부 시간 */}
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

              {/* 체크박스 옵션 */}
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

              {/* 저장 버튼 */}
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
                    // 새 용 추가
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
                    // 이름 짓기 팝업 바로 열기
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
          </div>
        </div>
      )}
    </div>
  );
}
