import React, { useState } from 'react';

// [2] 학생 명단 데이터 (디자인 설정 포함)
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

interface LoginSectionProps {
  supabase: any;
  onLoginSuccess: (name: string, isAdmin: boolean) => void;
  globalStyle: string; // 폰트 적용을 위해 추가
}

const LoginSection = ({ supabase, onLoginSuccess, globalStyle }: LoginSectionProps) => {
  const [selectedName, setSelectedName] = useState("");
  const [password, setPassword] = useState("");

  // 한글 정렬 함수
  const sortKorean = (a: string, b: string) => {
    const cleanA = a.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
    const cleanB = b.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, "");
    return cleanA.localeCompare(cleanB, 'ko');
  };

  const handleLogin = async () => {
    if (!selectedName) { alert("학생을 선택해주세요."); return; }
    
    let admin = password === "8888";
    
    if (!admin) {
      const { data } = await supabase
        .from('study_records')
        .select('password')
        .eq('student_name', selectedName);
      
      const validPw = data?.find((r: any) => r.password)?.password || "0000";
      if (password !== validPw) { 
        alert("비밀번호가 틀렸습니다."); 
        return; 
      }
    }

    // 로컬 스토리지 저장 (새로고침 유지용)
    localStorage.setItem('hg_auth', JSON.stringify({ name: selectedName, admin }));
    onLoginSuccess(selectedName, admin);
  };

  const sortedNames = Object.keys(studentData).sort(sortKorean);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* 폰트 스타일 주입 */}
      <style>{globalStyle}</style>

      <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* 상단 노란색 바 포인트 */}
        <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>

        {/* 호그와트 로고 */}
        <div className="flex justify-center mb-10">
          <img 
            src="https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/Hogwarts.png" 
            alt="Hogwarts" 
            className="w-56 h-auto object-contain" 
          />
        </div>

        <div className="space-y-6">
          {/* 학생 선택 드롭다운 */}
          <div className="space-y-2">
            <select 
              className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg transition-all focus:border-slate-900" 
              value={selectedName} 
              onChange={(e) => setSelectedName(e.target.value)}
            >
              <option value="">이름을 선택하세요</option>
              {sortedNames.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* 비밀번호 입력창 */}
          <div className="space-y-2">
            <input 
              type="password" 
              placeholder="PASSWORD" 
              className="w-full p-5 border-2 rounded-2xl font-bold text-slate-800 bg-slate-50 outline-none text-lg transition-all focus:border-slate-900" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
            />
          </div>

          {/* 입장 버튼 */}
          <button 
            onClick={handleLogin}
            className="w-full bg-slate-900 text-yellow-500 py-5 rounded-2xl font-black shadow-lg uppercase text-xl active:scale-95 transition-transform hover:bg-slate-800"
          >
            Enter Castle
          </button>
        </div>

        <p className="text-center mt-8 text-[10px] font-medium text-slate-400 uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
          Magic awaits those who focus
        </p>
      </div>
    </div>
  );
};

export default LoginSection;
