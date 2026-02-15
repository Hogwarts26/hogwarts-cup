"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import Link from 'next/link';

import { 
  GLOVAL_STYLE, 
  studentData, 
  HOUSE_ORDER, 
  HOUSE_CONFIG, 
  HOUSE_NOTICES, 
  DAYS, 
  OFF_OPTIONS, 
  HOUSE_LOGOS, 
  sortKorean 
} from './constants';

// ==========================================
// [5] 메인 App 컴포넌트 및 상태 관리
// ==========================================
export default function HogwartsApp() {
  // 월요일 18:00 기준 날짜 조정 함수
  const getAdjustedToday = () => {
    const now = new Date();
    const day = now.getDay();
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
  
  // 학생들의 누적 데이터 저장
  const [studentMasterData, setStudentMasterData] = useState<any>({});

  const [currentTime, setCurrentTime] = useState(getAdjustedToday());
  const [selectedHouseNotice, setSelectedHouseNotice] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false); 
  const [selectedStudentReport, setSelectedStudentReport] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const currentUser = useMemo(() => {
    return selectedName ? { name: selectedName } : null;
  }, [selectedName]);

  // [추가] Supabase에서 student_master 데이터를 가져와서 studentMasterData 상태를 채우는 로직
  // 새로고침 시 DB에서 selected_egg 값을 가져옴
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const { data, error } = await supabase.from('student_master').select('*');
        if (!error && data) {
          const dataMap = data.reduce((acc: any, cur: any) => {
            acc[cur.student_name] = cur;
            return acc;
          }, {});
          setStudentMasterData(dataMap);
        }
      } catch (err) {
        console.error("Error fetching master data:", err);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getAdjustedToday());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Dragon Cave 이미지 및 애니메이션
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

  // DB에서 저장된 알 정보를 불러옴
  useEffect(() => {
    const targetName = selectedName || currentUser?.name;
    if (targetName && studentMasterData && studentMasterData[targetName]) {
      const savedEgg = studentMasterData[targetName].selected_egg;
      if (savedEgg) {
        setSelectedEgg(savedEgg);
      } else {
        setSelectedEgg(null);
      }
    }
  }, [selectedName, currentUser, studentMasterData]);

const [dragonName, setDragonName] = useState("이름 없는 용");
const [isModalOpen, setIsModalOpen] = useState(false);
const [tempName, setTempName] = useState("");

// DB에서 저장된 알 정보 및 '이름'을 불러오는 useEffect 수정
useEffect(() => {
  const targetName = selectedName || currentUser?.name;
  if (targetName && studentMasterData && studentMasterData[targetName]) {
    const master = studentMasterData[targetName];
    
    // 알 정보 설정
    if (master.selected_egg) {
      setSelectedEgg(master.selected_egg);
    } else {
      setSelectedEgg(null);
    }

    // [중요] 이름 정보 설정 (DB에 dragon_name 컬럼이 있다고 가정)
    if (master.dragon_name) {
      setDragonName(master.dragon_name);
    } else {
      setDragonName("이름 없는 용");
    }
  }
}, [selectedName, currentUser, studentMasterData]);

const handleSaveName = async () => {
  if (tempName.trim() === "") {
    alert("아직 이름을 지어주지 않았습니다.");
    return;
  }

  setDragonName(tempName);
  const targetName = selectedName || currentUser?.name;
  const { error } = await supabase
    .from('student_master')
    .update({ dragon_name: tempName }) // DB 테이블에 dragon_name 컬럼이 있어야 함
    .eq('student_name', targetName);

  if (error) {
    console.error("이름 저장 실패:", error);
  } else {
    setIsModalOpen(false);
  }
};

  // ==========================================================
  // 실시간으로 변하는 게이지 계산
  // ==========================================================
  const totalStudyTime = studentMasterData[selectedName]?.total_study_time || 0;

  let progress = 0;
  let nextStageGoal = 0;

  if (totalStudyTime < 6000) {
    progress = (totalStudyTime / 6000) * 100;
    nextStageGoal = 6000;
  } else if (totalStudyTime < 12000) {
    progress = ((totalStudyTime - 6000) / 6000) * 100;
    nextStageGoal = 12000;
  } else if (totalStudyTime < 18000) {
    progress = ((totalStudyTime - 12000) / 6000) * 100;
    nextStageGoal = 18000;
  } else {
    progress = 100;
    nextStageGoal = 18000;
  }

  // ==========================================
  // [6] 초기 실행 (인증 확인 및 시계)
  // ==========================================
  useEffect(() => {
    // 월요일 18:00 기준
    const timer = setInterval(() => {
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours();

      // 월요일 18시 이전인 경우 하루 전으로 조정
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
      const newMasterData = { ...studentMasterData };

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
      setStudentMasterData(newMasterData);

      // 기존 주간 기록표 초기화
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
        alert("이번 주 기록들이 용의 먹이로 전환되었습니다!"); 
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
  // [10] 월휴 초기화
  // ==========================================
  const resetMonthlyOff = async () => {
    if (!confirm("모든 학생의 월휴 개수를 초기화하시겠습니까?")) return;
    setIsSaving(true);

    const names = Object.keys(studentData);
    const resetData = [];

    for (const name of names) {
      for (const day of DAYS) {
        const existing = records.find(r => r.student_name === name && r.day_of_week === day) || {};
        resetData.push({
          ...existing,
          student_name: name,
          day_of_week: day,
          monthly_off_count: 4
        });
      }
    }

    const { error } = await supabase.from('study_records').upsert(resetData, { onConflict: 'student_name,day_of_week' });
    
    if (!error) { 
      setRecords(resetData); 
      alert("학생들의 월휴 개수가 초기화되었습니다."); 
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
    
    // 2. 결석 벌점 -5점
    if (r.off_type === '결석') return { penalty: -5, bonus: 0, total: -5, studyH: 0 };
    
    const timeVal = r.study_time || "";
    const [h, m] = timeVal.split(':').map(Number);
    const studyH = (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
    
    let penalty = 0, bonus = 0;
    
    const isHalfOff = ['반휴', '월반휴', '늦반휴', '늦월반휴'].includes(r.off_type);
    const isFullOff = ['주휴', '월휴', '자율', '늦휴', '늦월휴'].includes(r.off_type);
    
    // A. 늦휴무 벌점 (-1)
    if (['늦반휴', '늦휴', '늦월반휴', '늦월휴'].includes(r.off_type)) {
      penalty -= 1;
    }
    
    // B. 지각 벌점
    if (r.is_late && !isFullOff && r.off_type !== '자율') {
      penalty -= 1;
    }
    
    // C. 시간당 상벌점
    if (!isFullOff && r.off_type !== '자율') {
      
      // 오전 3시간 체크
      if (!isHalfOff && r.am_3h === false && studyH > 0) {
        penalty -= 1;
      }

      // 기준 시간 미달/초과 체크
      const target = isHalfOff ? 4 : 9;
      
      if (studyH < target) {
        penalty -= Math.ceil(target - studyH);
      } else if (!isHalfOff && studyH >= target + 1) {
        bonus += Math.floor(studyH - target);
      }
    }

    // 벌점은 하루 최대 -5점까지
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
    let usedWeeklyOff = 0; 
    const studentRecords = records.filter(r => r.student_name === name);

    studentRecords.forEach(r => {
      const res = calc(r);
      bonus += res.bonus;
      penalty += res.penalty;

      // 주간 휴무 계산
      if (['반휴', '늦반휴'].includes(r.off_type)) usedWeeklyOff += 0.5;
      if (['주휴', '늦휴'].includes(r.off_type)) usedWeeklyOff += 1.0;
    });

    // 잔여 월휴 연동
    const monRec = studentRecords.find(r => r.day_of_week === '월');
    const offCount = monRec?.monthly_off_count ?? 4;

    return { 
      bonus, 
      penalty,
      remainingWeeklyOff: (1.5 - usedWeeklyOff).toFixed(1).replace('.0', ''),
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
    // 조정된 시간 사용
    const today = currentTime; 
    const currentDay = today.getDay();
    const diff = today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + dayIdx;
    
    const target = new Date(new Date(today).setDate(diff));
    return `${target.getMonth() + 1}.${target.getDate()}`;
  };

  const getMonthAccumulatedTime = (name: string) => {
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
     bgm.volume = 0.4;
     bgm.play().catch(e => console.log("음악 재생 실패:", e));
   }
   setIsPlaying(!isPlaying);
 };

 // ✨ [추가할 부분]: 페이지를 떠날 때 음악을 강제로 끄는 로직
 useEffect(() => {
   // 이 함수는 '학습내역' 페이지가 화면에서 사라질 때 실행됩니다.
   return () => {
     if (bgm) {
       bgm.pause();
       // 다시 돌아왔을 때 재생 버튼 상태가 '재생 중'으로 보이지 않게 초기화
       setIsPlaying(false); 
     }
   };
 }, [bgm]);

  // ==========================================
  // [15] 비밀번호 변경 및 저장
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
  // [16] 목표 변경 및 저장
  // ==========================================
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
        setIsEditingGoal(false);
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
  // [18] 로그인 화면
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
  // [19] 메인 화면 데이터 준비
  // ==========================================
  const displayList = isAdmin 
    ? Object.keys(studentData).sort((a, b) => {
        const houseDiff = HOUSE_ORDER.indexOf(studentData[a].house) - HOUSE_ORDER.indexOf(studentData[b].house);
        return houseDiff !== 0 ? houseDiff : sortKorean(a, b);
      })
    : [selectedName];

  // ==========================================
  // [20] 이름 추출 함수
  // ==========================================
  const formatDisplayName = (name: any): string => {
    if (!name || typeof name !== 'string') return "";
    try {
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

 {/*[22] 관리자 화면 전체 기숙사 요약 */}
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

     {/* [23] 상단 헤더 및 기숙사 점수판 구역 */}
      <div className="max-w-[1100px] mx-auto mb-8 px-4"> 
        <div className="flex flex-col gap-y-4 mb-6">
          
          {/* 1열: 버튼 그룹 (우측 정렬) */}
          <div className="flex gap-2 flex-wrap justify-end items-center">
            {/* [24] 음악 및 관리자 버튼들 */}
            <button 
              onClick={toggleMusic} 
              className={`text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm transition-all border-2 whitespace-nowrap ${
                isPlaying ? 'bg-white border-yellow-400 text-yellow-500 animate-pulse' : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              {isPlaying ? '🎵' : '🔇'}
            </button>

            {!isAdmin && (
              <Link 
                href="/timer" 
                className="text-[10px] font-black text-white bg-blue-500 px-3 py-1.5 rounded-full shadow-md hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap"
              >
                교시제
              </Link>
            )}

            {isAdmin && <button onClick={() => setShowSummary(true)} className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-indigo-700 whitespace-nowrap">요약</button>}
            {isAdmin && <button onClick={resetWeeklyData} className="text-[10px] font-black text-white bg-red-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-red-700 whitespace-nowrap">주간 리셋</button>}
            {isAdmin && (
              <button onClick={resetMonthlyOff} className="text-[10px] font-black text-white bg-orange-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-orange-700 whitespace-nowrap">월휴 리셋</button>
            )}
            
            <button 
              onClick={() => { localStorage.removeItem('hg_auth'); window.location.reload(); }} 
              className="text-[10px] font-black text-slate-400 bg-white border-2 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap"
            >
              Logout
            </button>
          </div>

          {/* 2열: 로고 (가운데 정렬) */}
          <div className="flex justify-center">
            <h2 className="text-3xl font-serif font-black text-slate-800 italic tracking-tight whitespace-nowrap">
              Hogwarts School
            </h2>
          </div>
        </div> {/* <- flex-col 닫기 */}
      </div> {/* <- max-w-[1100px] 닫기 */}

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
          {['volcano', 'jungle', 'forest', 'desert', 'coast', 'alpine'].map((region) => {
            // 알 보유 여부 확인
            const hasEgg = !!(selectedEgg || studentMasterData[selectedName]?.selected_egg);

            return (
              <button
                key={region}
                onClick={() => {
                  // 알이 있다면 다른 지역으로 이동 차단
                  if (hasEgg) {
                    alert("이미 데려온 알이 있습니다.");
                    return;
                  }
                  handleRegionClick(region);
                }}
                className={`py-2 text-[11px] font-black tracking-tighter transition-all rounded-md border uppercase
                  ${currentImageFile === `${region}.webp` 
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
          
            {/* 지역별 배경 이미지 */}
            <img 
              src={`https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public/${currentImageFile}`}
              alt="Dragon Habitat"
              className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-80'}`}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = "https://via.placeholder.com/1200x675?text=Habitat+Image+Not+Found";
              }}
            />

            {/* 드래곤 성장 및 메시지 */}
            {(currentImageFile === 'main.webp' || currentImageFile === 'x.jpg') && (() => {
              const userData = studentMasterData[selectedName];
              let eggStr = selectedEgg || userData?.selected_egg; 
              const score = userData?.total_study_time || 0;
              
              if (!eggStr) return null;

              if (eggStr.includes('/')) {
                eggStr = eggStr.split('/').pop().split('.')[0];
              }

              const prefix = String(eggStr).substring(0, 2); 
              const eggNumOnly = String(eggStr).substring(2);

              //성장 단계 계산
              let stage = 1;
              if (score >= 18000) stage = 4;
              else if (score >= 12000) stage = 3;
              else if (score >= 6000) stage = 2;

              const fileName = `${prefix}${String(eggNumOnly).repeat(stage)}`;
              const baseUrl = "https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/public";
              const finalUrl = `${baseUrl}/${fileName}.webp`;

              // 성장 단계별 랜덤 메시지 설정
              const messages = {
                1: [ // 알 상태
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
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
                  '이름을 불러주니 알이 조금 움직였다!'
                ],
                2: [ // 해치 상태
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
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
                  '당신을 부모라고 생각하는 것 같다.'
                ],
                3: [ // 성장기
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '날갯짓이 제법 힘차졌다.',
                  '처음으로 날개를 펴고 당신의 머리 위를 짧게 활공했다!',
                  '이제는 제법 드래곤다운 울음소리를 낸다.',
                  '공부하는 당신의 어깨 너머로 책 내용을 같이 읽는 듯하다.',
                  '날개를 파닥거리며 주변의 먼지를 다 날려버리고는 뿌듯해한다.',
                  '자신의 발톱을 유심히 살피고 있다.',
                  '당신이 펜을 놓으면 얼른 다시 공부하라는 듯 코를 킁킁거린다.',
                  '꽤 높이 날아올라 천장에 닿을뻔한 기록을 세웠다!',
                  '이제는 간단한 명령을 알아듣는다.',
                  '공부하는 당신을 지켜보고 있다.'
                ],
                4: [ // 성체
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '…….',
                  '이제는 당신을 등에 태우고 구름 위를 날 수 있을 만큼 자랐다.',
                  '비늘 사이로 뿜어져 나오는 마력이 당신을 더욱 지혜롭게 한다.',
                  '누구도 당신을 방해하지 못하도록 문 앞을 엄숙하게 지키고 있다.',
                  '보고 있으면 모든 잡념이 정화되는 기분이다.',
                  '당신을 태우고 하늘을 날고 싶어한다.',
                  '강력한 마력의 기운이 뿜어져 나오고 있다.',
                  '영원히 당신의 곁을 지킬 것이다.',
                  '당신의 행복을 영원히 바라고 있다.',
                  '피곤한 당신을 위해 당신에게 마력을 불어넣어 주고 있다.',
                  '언제나 당신을 응원하고 있다.'
                ]
             };

              // 1. 현재 단계에 맞는 메시지 배열 가져오기
              const stageMsgs = (messages as any)[stage] || messages[1];

              // 2. 새로고침 시에만 메시지를 무작위로 바꾸는 로직
              // 윈도우 객체(window)에 임시로 번호를 고정해서 새로고침 전까지 유지합니다.
              const randomMsg = (() => {
                const win = window as any;
                const storageKey = `dragon_msg_idx`;
  
                // 만약 윈도우 객체에 저장된 번호가 없다면 새로 뽑음 (새로고침 시 초기화됨)
                if (win[storageKey] === undefined) {
                  win[storageKey] = Math.floor(Math.random() * stageMsgs.length);
                }
  
                const idx = win[storageKey];
                return stageMsgs[idx] || stageMsgs[0];
              })();

              // 3. 위치 설정
              const positionClass = stage === 4 
                ? "translate-y-10 md:translate-y-16" 
                : "translate-y-16 md:translate-y-24";

            return (
  <div className="absolute inset-0 flex items-center justify-center z-30">
    {/* 1. 게이지바: 모바일에서 너무 구석에 가지 않도록 top-2 left-2로 살짝 조정 */}
    <div className="absolute top-2 left-2 md:top-4 md:left-4 flex items-center gap-2 pointer-events-auto">
      <div className="w-20 md:w-24 h-2.5 md:h-3 bg-white/40 backdrop-blur-md rounded-full overflow-hidden border border-white/30 shadow-sm">
        <div 
          className="h-full transition-all duration-1000 ease-out" 
          style={{ width: `${progress}%`, backgroundColor: '#65D35D' }}
        />
      </div>
      <span className="text-[9px] md:text-[10px] font-black text-white drop-shadow-md">{Math.floor(progress)}%</span>
    </div>

    {/* 전체 컨테이너: flex-col-reverse를 쓰지 않고 간격을 띄웁니다 */}
    <div className={`relative flex flex-col items-center ${positionClass}`}>
      
      {/* 2. 말풍선 & 이름 영역 (하나의 묶음으로 관리) */}
      <div className="absolute -top-14 md:-top-16 flex flex-col items-center w-full">
        
        {/* 말풍선 메시지 */}
        <div className="relative bg-white/95 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow">
           <p className="text-[8px] md:text-[11px] font-bold text-slate-700 whitespace-nowrap italic text-center">
             ({randomMsg})
           </p>
           {/* 말풍선 꼬리 */}
           <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white/95" />
        </div>

        {/* 3. 이름표: 배경 삭제 + 흰색 글자 + 검정 외곽선 적용 */}
          <div 
            className="mt-1 md:mt-1 cursor-pointer pointer-events-auto hover:scale-110 active:scale-95 transition-all"
            onClick={() => setIsModalOpen(true)}
            style={{
              // 글자에 검정색 테두리
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}
          >
          <span className="text-white text-[10px] md:text-[13px] font-black tracking-tight whitespace-nowrap uppercase">
      {dragonName}
    </span>
  </div>
</div>

      {/* 4. 드래곤 이미지: mb-2 정도의 여백을 주어 바닥 그림자와 겹치지 않게 함 */}
      <img 
        key={fileName} 
        src={finalUrl}
        alt="Dragon"
        className={`relative object-contain drop-shadow-2xl animate-bounce-slow pointer-events-auto transition-all duration-500 ${
  stage === 4 
    ? 'w-24 h-24 md:w-32 md:h-32 -translate-y-2'
    : 'w-12 h-12 md:w-16 md:h-16 -translate-y-2'
}`}
        onError={(e) => { e.currentTarget.src = `${baseUrl}/${eggStr}.webp`; }}
      />

      {/* 그림자 */}
      <div className="absolute -bottom-2 w-7 h-1.5 md:w-10 md:h-2 bg-black/25 rounded-[100%] blur-[5px]" />
    </div>
  </div>
);
            })()}

            {/* 지역별 알 선택 */}
            {!isFading && 
             !['main.webp', 'x.jpg'].includes(currentImageFile) && 
             !(selectedEgg || studentMasterData[selectedName]?.selected_egg) && (
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
                        onClick={() => { 
                          // 1. 임시 주소 저장
                          setTempEgg(eggUrl); 
                          // 2. 실제 알 이름 저장
                          setSelectedEgg(`${prefix}${num}`); 
                          // 3. 팝업 열기
                          setEggStep(1); 
                        }}
                        className="relative w-12 h-12 md:w-16 md:h-16 object-contain hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                        onError={(e) => { 
                          (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; 
                        }}
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
                        if (eggStep === 1) {
                          setEggStep(2);
                        } else {
                          if (selectedName && tempEgg) {
                            try {
                              const fileNameWithExt = typeof tempEgg === 'string' ? tempEgg.split('/').pop() : "";
                              const eggName = fileNameWithExt ? fileNameWithExt.split('.')[0] : "";

                              if (eggName) {
                                const { error } = await supabase
                                  .from('student_master')
                                  .update({ selected_egg: eggName })
                                  .eq('student_name', selectedName);

                                if (error) throw error;
                                setStudentMasterData((prev: any) => ({
                                  ...prev,
                                  [selectedName]: {
                                    ...prev[selectedName],
                                    selected_egg: eggName
                                  }
                                }));
                                setSelectedEgg(eggName);
                              }
                  
                            } catch (error) {
                              console.error("Egg Save Error:", error);
                              alert("알을 데려오는 데 실패했습니다. 다시 시도해 주세요.");
                            }
                          }
              
                          setEggStep(0);
                          setTempEgg(null);
                          if (typeof handleResetImage === 'function') {
                            handleResetImage();
                          }
                        }
                      }}
                      className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs"
                    >
                      네
                    </button>
                    <button
                      onClick={() => { 
                        setEggStep(0); 
                        setTempEgg(null); 
                      }}
                      className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                    >
                      고민해볼게요
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 이름 짓기 팝업 */}
            {isModalOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center border-4 border-slate-100">
                  <h3 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tighter" style={{ fontFamily: "'Cinzel', serif" }}>
                    이름을 지어줄까요?
                  </h3>
                  <p className="text-slate-500 mb-6 text-sm italic">
                   이름은 언제든지 변경할 수 있습니다.
                  </p>

                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full border-2 border-slate-100 rounded-xl p-3 mb-6 focus:border-[#65D35D] outline-none text-center font-bold text-slate-700 transition-colors"
                  />

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSaveName}
                     className="w-full py-3 bg-[#65D35D] text-white font-black rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg shadow-green-100"
                    >
                      이름을 지어준다
                    </button>
                    <button
                      onClick={() => { 
                        setIsModalOpen(false); 
                        setTempName(""); 
                      }}
                      className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                    >
                      지어주지 않는다
                    </button>
                  </div>
                </div>
              </div>
            )}

                    {/* [27] 학생 개인 요약 팝업 */}
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
