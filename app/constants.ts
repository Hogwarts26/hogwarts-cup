// app/constants.ts

// [1] 기숙사컵 스타일 및 애니메이션 설정
export const GLOVAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

  body { 
    font-family: 'Cinzel', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; 
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
  .winner-sparkle::after { background-position: 150px 75px; animation: pixie-dust 4s infinite linear reverse; }

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

// [2] 학생 명단
export const studentData: { [key: string]: { house: string; emoji: string; color: string; accent: string, text: string } } = {
  "🤖로봇": { house: "슬리데린", emoji: "🤖", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐾발자국": { house: "슬리데린", emoji: "🐾", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐆표범": { house: "슬리데린", emoji: "🐆", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐡복어": { house: "슬리데린", emoji: "🐡", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🐶강쥐": { house: "슬리데린", emoji: "🐶", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
  "🦔도치": { house: "슬리데린", emoji: "🦔", color: "bg-emerald-50", accent: "bg-emerald-600", text: "text-emerald-900" },
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
  "🪶깃털": { house: "래번클로", emoji: "🪶", color: "bg-blue-50", accent: "bg-blue-700", text: "text-blue-900" },
  "🐺늑대": { house: "그리핀도르", emoji: "🐺", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦉올뺌": { house: "그리핀도르", emoji: "🦉", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
  "🦦수달": { house: "그리핀도르", emoji: "🦦", color: "bg-red-50", accent: "bg-red-700", text: "text-red-900" },
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
  "🐧펭귄": { house: "후플푸프", emoji: "🐧", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" },
  "🐿️다람": { house: "후플푸프", emoji: "🐿️", color: "bg-amber-50", accent: "bg-amber-500", text: "text-amber-900" }
};

// [3] 기숙사 설정 및 공지사항 내용
export const HOUSE_ORDER = ["슬리데린", "래번클로", "그리핀도르", "후플푸프"];
export const HOUSE_CONFIG = {
  "슬리데린": { bg: "bg-emerald-600", border: "border-emerald-700", icon: "🐍", accent: "bg-emerald-400" },
  "래번클로": { bg: "bg-blue-700", border: "border-blue-800", icon: "🦅", accent: "bg-blue-400" },
  "그리핀도르": { bg: "bg-red-700", border: "border-red-800", icon: "🦁", accent: "bg-red-400" },
  "후플푸프": { bg: "bg-amber-500", border: "border-amber-600", icon: "🦡", accent: "bg-amber-300" }
};

export const HOUSE_NOTICES: { [key: string]: { title: string, content: string } } = {
  "래번클로": {
    title: "지혜의 전당에 온 것을 환영하며, 움직이는 계단 가이드",
    content: `명석한 두뇌를 가진 래번클로 신입생 여러분, 여러분의 합류로 우리 기숙사의 지적 수준이 한층 더 높아졌음을 확신합니다.
플리트윅 교수님께서는 신입생 여러분이 성안에서 길을 잃지 않도록 직접 작성하신 '호그와트 계단의 기하학적 이동 법칙' 유인물을 서재 입구에 비치해 두셨습니다. 한 번쯤 읽어두면 논리적으로 길을 찾는 데 큰 도움이 될 것입니다.

참고로, 이번 주 <이러쿵저러쿵> 잡지에는 '용의 알을 품을 때 들려주면 좋은 고대 마법의 자장가'에 대한 기사가 실렸습니다. 
해그리드 씨의 업무에 방해가 되지 않는 선에서 이론적으로 용의 부화를 연구해보고 싶은 학생들은 참고해 보세요. 

독수리 문고리가 던지는 질문에 당황하지 말고, 답을 모를 때는 언제든 옆의 선배에게 지혜를 구하세요!
`
  },

  "그리핀도르": {
    title: "1위의 자부심과 신입생을 위한 용기의 첫걸음",
    content: `새로 입학한 그리핀도르 신입생 여러분! 여러분은 호그와트에서 가장 용감한 기숙사의 일원이 되었습니다. 지난주 우리가 거둔 우승 성적은 선배들이 수업 시간마다 보여준 당당한 자신감의 결과입니다. 여러분도 이 영광을 이어갈 준비가 되었나요?
네빌 롱보텀 교수님께서 신입생 여러분의 긴장을 풀어주기 위해 휴게실 중앙 탁자에 따뜻한 버터맥주와 초콜릿 개구리를 넉넉히 준비해 두셨습니다.

덧붙여 주의사항입니다. 우리 기숙사의 뚱보 여인 초상화가 최근 '신입생 맞이 아리아' 연습에 심취해 있습니다. 노래가 끝나기 전엔 암호를 들어주지 않으니, 수업에 늦지 않으려면 평소보다 5분 일찍 움직이는 용기를 발휘하십시오... 
또한 해그리드 씨의 오두막 근처로 몰래 빠져나가려다 필치 씨에게 적발될 경우, 기숙사 점수가 크게 깎일 수 있으니 주의 바랍니다!`
  },

  "슬리데린": {
    title: "위대한 야망의 시작, 그리고 용의 알 관련",
    content: `이번 주 우리 기숙사에 합류한 신입생 여러분, 환영합니다. 여러분은 호그와트에서 가장 대담하고 실리적인 이들이 모인 슬리데린의 일원이 되었습니다.

지금 온 성안이 사냥터지기 오두막에 있는 용의 알 이야기로 떠들썩합니다. 다른 기숙사 학생들이 얄팍한 호기심에 들떠 있을 때, 우리 슬리데린은 그 이면에 숨겨진 강력한 마법적 가치와 힘에 주목해야 합니다. 용은 힘과 권위의 상징이며, 그 부화 과정을 지켜보는 것은 마법사로서 흔치 않은 기회입니다.

그리고, 최근 지하 감옥 복도의 피 묻은 바론 경이 신입생들의 소란스러운 발소리를 매우 싫어하고 있습니다. 복도에서는 품격 있게 걷도록 하십시오. 

2월 둘째 주 새로운 암호는 '차가운 지혜'입니다. 외부인에게 절대 누설하지 마십시오.`
  },

  "후플푸프": {
    title: "따뜻한 오소리 굴의 새 식구들을 위한 작은 선물",
    content: `반가워요, 신입생 여러분! 호그와트에서 가장 다정하고 성실한 후플푸프에 오게 된 것을 진심으로 축하합니다. 여러분이 낯선 생활에 잘 적응할 수 있도록 모든 선배와 반장들이 여러분의 든든한 동료가가 되어줄 거예요.

스프라우트 교수님께서는 여러분의 입학을 축하하며 온실에서 직접 키운 꿈을 지켜주는 허브 주머니를 침대 머리맡에 하나씩 놓아주셨습니다. 향긋한 라벤더 향기가 여러분의 첫날밤을 평온하게 지켜줄 거예요.

주의할 점은, 신입생 환영 만찬 준비로 주방 요정들이 매우 바쁜 상태입니다. 배 그림을 간지럽히는 것은 잠시 미뤄두고, 대신 휴게실에 비치된 과일과 비스킷을 마음껏 즐겨주세요. 우리 모두 힘을 합쳐 이번 주에는 1위를 되찾아 봅시다!
`
  }
};


// [4] 공통 상수 및 정렬 함수
export const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
export const OFF_OPTIONS = ['-', '출석', '반휴', '주휴', '월휴', '월반휴', '자율', '결석', '늦반휴', '늦휴', '늦월반휴', '늦월휴'];

export const HOUSE_LOGOS: Record<string, string> = {
  "그리핀도르": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/gry.png",
  "슬리데린": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/sly.png",
  "래번클로": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/rav.png",
  "후플푸프": "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/huf.png"
};

export const sortKorean = (a: string, b: string) => {
  const cleanA = a.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
  const cleanB = b.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
  return cleanA.localeCompare(cleanB, 'ko');
};
