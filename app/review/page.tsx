"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../supabase";

const COLORS = ['#2d5be3','#e35b2d','#1a9e5c','#9b59b6','#e3a52d','#e32d7a','#17a2b8','#6c757d'];

export default function ReviewPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [todayInput, setTodayInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studentName, setStudentName] = useState<string>("");
  const [groupMode, setGroupMode] = useState<'none' | 'same' | 'earliest'>('none');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgm, setBgm] = useState<HTMLAudioElement | null>(null);

  // 테마
  const theme = {
    page:       isDarkMode ? '#0f172a' : '#f0ede8',
    card:       isDarkMode ? '#1e293b' : '#ffffff',
    cardBorder: isDarkMode ? '#334155' : '#e0dcd6',
    text:       isDarkMode ? '#f1f5f9' : '#1a1a2e',
    muted:      isDarkMode ? '#94a3b8' : '#6b7280',
    input:      isDarkMode ? '#0f172a' : '#f0ede8',
    inputBorder:isDarkMode ? '#475569' : '#e0dcd6',
    logBg:      isDarkMode ? '#0f172a' : '#f0ede8',
    groupCard:  isDarkMode ? '#0f172a' : '#1a1a2e',
    btnBg:      isDarkMode ? '#1e293b' : '#ffffff',
    btnBorder:  isDarkMode ? '#475569' : '#e0dcd6',
    btnText:    isDarkMode ? '#94a3b8' : '#6b7280',
  };

  // 로그인 정보 + 테마 저장값 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('hg_auth');
    if (saved) {
      const { name } = JSON.parse(saved);
      setStudentName(name);
    }
    const savedTheme = localStorage.getItem('review_theme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  // BGM 초기화
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/hedwig.mp3');
      audio.loop = true;
      audio.volume = 0.4;
      setBgm(audio);
    }
    return () => { bgm?.pause(); };
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('review_theme', next ? 'dark' : 'light');
  };

  const toggleMusic = () => {
    if (!bgm) return;
    if (isPlaying) { bgm.pause(); } else { bgm.play().catch(() => {}); }
    setIsPlaying(!isPlaying);
  };

  // 시계
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Supabase 데이터 불러오기
  useEffect(() => {
    if (!studentName) return;
    fetchSubjects();
  }, [studentName]);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('review_subjects')
      .select('*')
      .eq('student_name', studentName)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setSubjects(data);
      if (data.length > 0) setCurrentId(data[0].id);
    }
  };

  const getCurrentSubject = () => subjects.find(s => s.id === currentId);

  // =============================================
  // 개별 과목 통계 계산
  // =============================================
  const calcStats = (subj: any) => {
    if (!subj) return {
      dday: 0, workDays: 1, remaining: 0, pct: 0,
      todayDone: 0, safePace: 0, possiblePace: 0,
      relaxedPace: 0, totalDone: 0
    };
    const now = new Date();
    const deadline = new Date(subj.deadline + 'T23:59:59');
    const dday = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const workDays = Math.max(dday - (subj.holidays || 0), 1);
    const logs = subj.logs || [];
    const totalDone = logs.reduce((a: number, l: any) => a + l.pages, 0);
    const remaining = Math.max(subj.total_pages - totalDone, 0);
    const pct = Math.min(Math.round(totalDone / Math.max(subj.total_pages, 1) * 100), 100);
    const todayStr = now.toISOString().slice(0, 10);
    const todayDone = logs
      .filter((l: any) => l.date === todayStr)
      .reduce((a: number, l: any) => a + l.pages, 0);
    return {
      dday, workDays, totalDone, remaining, pct, todayDone,
      safePace: Math.ceil(remaining / workDays),
      possiblePace: Math.ceil(subj.total_pages / workDays),
      relaxedPace: Math.ceil(remaining / Math.max(workDays + 1, 1)),
    };
  };

  // =============================================
  // 통합 계산
  // =============================================
  const calcGroupStats = () => {
    if (groupMode === 'none' || subjects.length === 0) return null;
    let targetSubjects: any[] = [];
    if (groupMode === 'same') {
      const currentDeadline = getCurrentSubject()?.deadline;
      if (!currentDeadline) return null;
      targetSubjects = subjects.filter(s => s.deadline === currentDeadline);
    } else if (groupMode === 'earliest') {
      const earliestDeadline = subjects.reduce(
        (min, s) => s.deadline < min ? s.deadline : min,
        subjects[0].deadline
      );
      targetSubjects = subjects.filter(s => s.deadline === earliestDeadline);
    }
    if (targetSubjects.length === 0) return null;
    const now = new Date();
    const deadline = new Date(targetSubjects[0].deadline + 'T23:59:59');
    const dday = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const workDays = Math.max(dday - (targetSubjects[0].holidays || 0), 1);
    const perSubject = targetSubjects.map(s => {
      const totalDone = (s.logs || []).reduce((a: number, l: any) => a + l.pages, 0);
      const remaining = Math.max(s.total_pages - totalDone, 0);
      return { name: s.name, color: s.color, remaining, safePace: Math.ceil(remaining / workDays) };
    });
    const totalRemaining = perSubject.reduce((a, s) => a + s.remaining, 0);
    return {
      dday, workDays, totalRemaining,
      totalSafePace: Math.ceil(totalRemaining / workDays),
      perSubject, deadline: targetSubjects[0].deadline
    };
  };

  // =============================================
  // DB 업데이트
  // =============================================
  const updateSubject = async (field: string, value: any) => {
    if (!currentId) return;
    const { error } = await supabase
      .from('review_subjects')
      .update({ [field]: value })
      .eq('id', currentId);
    if (!error) {
      setSubjects(prev =>
        prev.map(s => s.id === currentId ? { ...s, [field]: value } : s)
      );
    }
  };

  const addSubject = async () => {
    if (!newName.trim()) { alert('과목명을 입력해주세요.'); return; }
    if (subjects.length >= 8) { alert('최대 8개까지 가능합니다.'); return; }
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    const { data, error } = await supabase
      .from('review_subjects')
      .insert({
        student_name: studentName,
        name: newName.trim(),
        color: selectedColor,
        deadline: deadline.toISOString().slice(0, 10),
        holidays: 0,
        total_pages: 100,
        logs: []
      })
      .select()
      .single();
    if (!error && data) {
      setSubjects(prev => [...prev, data]);
      setCurrentId(data.id);
      setShowModal(false);
      setNewName("");
      setSelectedColor(COLORS[0]);
    }
  };

  const logPages = async () => {
    const pages = parseInt(todayInput);
    if (!pages || pages <= 0) { alert('올바른 페이지 수를 입력해주세요.'); return; }
    const subj = getCurrentSubject();
    if (!subj) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const date = now.toISOString().slice(0, 10);
    const newLogs = [...(subj.logs || []), { pages, datetime, date }];
    await updateSubject('logs', newLogs);
    setTodayInput("");
  };

  const deleteLog = async (idx: number) => {
    const subj = getCurrentSubject();
    if (!subj) return;
    const newLogs = (subj.logs || []).filter((_: any, i: number) => i !== idx);
    await updateSubject('logs', newLogs);
  };

  const deleteSubject = async () => {
    if (!currentId || !confirm('과목을 삭제하시겠습니까?')) return;
    await supabase.from('review_subjects').delete().eq('id', currentId);
    const remaining = subjects.filter(s => s.id !== currentId);
    setSubjects(remaining);
    setCurrentId(remaining.length > 0 ? remaining[0].id : null);
  };

  // =============================================
  // 시계 문자열
  // =============================================
  const pad = (n: number) => String(n).padStart(2, '0');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const clockStr = `${currentTime.getFullYear()}-${pad(currentTime.getMonth() + 1)}-${pad(currentTime.getDate())} (${days[currentTime.getDay()]}) ${pad(currentTime.getHours())}:${pad(currentTime.getMinutes())}:${pad(currentTime.getSeconds())}`;

  const subj = getCurrentSubject();
  const s = calcStats(subj);
  const groupStats = calcGroupStats();

  let statusClass = 'safe';
  if (subj) {
    if (s.remaining === 0) statusClass = 'done';
    else if (s.dday <= 0) statusClass = 'danger';
    else if (s.safePace > subj.total_pages * 0.5) statusClass = 'danger';
    else if (s.safePace > subj.total_pages * 0.2) statusClass = 'warn';
  }
  const statusColors: any = {
    safe:   { bg: '#e8f7f0', border: '#b7e8d2', text: '#1a9e5c', icon: '✅' },
    warn:   { bg: '#fdf6e3', border: '#f5d98a', text: '#e3a52d', icon: '⚠️' },
    danger: { bg: '#fde8e8', border: '#f5aaaa', text: '#e32d2d', icon: '🔴' },
    done:   { bg: '#eef2ff', border: '#c7d2fe', text: '#2d5be3', icon: '🎉' },
  };
  const sc = statusColors[statusClass];

  // 다크모드일 때 결과 카드 배경을 어둡게 보정
  const resultBg = isDarkMode
    ? statusClass === 'safe'   ? '#0d2b1e'
      : statusClass === 'warn' ? '#2b2208'
      : statusClass === 'danger' ? '#2b0d0d'
      : '#0d1433'
    : sc.bg;
  const resultBorder = isDarkMode
    ? statusClass === 'safe'   ? '#1a5c3a'
      : statusClass === 'warn' ? '#5c4a0d'
      : statusClass === 'danger' ? '#5c1a1a'
      : '#1a2a6e'
    : sc.border;

  // 공통 인풋 스타일
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10,
  fontSize: '0.9rem', fontFamily: 'inherit',
  background: theme.input, color: theme.text,
  outline: 'none', boxSizing: 'border-box',
  minWidth: 0
};
  
  // 공통 카드 스타일
  const cardStyle: React.CSSProperties = {
    background: theme.card, borderRadius: 16,
    padding: 20, marginBottom: 14,
    border: `1px solid ${theme.cardBorder}`
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 700,
    color: theme.muted, marginBottom: 5
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 700, color: theme.muted,
    marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: 0.5
  };

  // =============================================
  // 렌더링
  // =============================================
  return (
    <div style={{
      background: theme.page, minHeight: '100vh',
      padding: '20px 16px 60px',
      fontFamily: "'Noto Sans KR', sans-serif",
      transition: 'background 0.3s, color 0.3s',
      color: theme.text
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
        flexWrap: 'wrap', gap: 10
      }}>
        {/* 좌측: 돌아가기 + 타이틀 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/" style={{
            fontSize: '0.78rem', fontWeight: 700, color: theme.muted,
            textDecoration: 'none', background: theme.btnBg,
            border: `1.5px solid ${theme.btnBorder}`,
            borderRadius: 999, padding: '6px 12px',
            transition: 'all 0.2s'
          }}>
            ← BACK TO LOBBY
          </Link>
          <span style={{ fontSize: '1.4rem' }}>📚</span>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: -0.5, color: theme.text }}>
            기출회독 시뮬레이터
          </h1>
        </div>

        {/* 우측: BGM + 다크모드 + 시계 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* BGM 버튼 */}
          <button onClick={toggleMusic} style={{
            width: 36, height: 36, borderRadius: 12,
            border: `1.5px solid ${isPlaying ? '#facc15' : theme.btnBorder}`,
            background: isPlaying ? 'rgba(250,204,21,0.1)' : theme.btnBg,
            cursor: 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}>
            {isPlaying ? '🎵' : '🔇'}
          </button>

          {/* 다크모드 버튼 */}
          <button onClick={toggleTheme} style={{
            width: 36, height: 36, borderRadius: 12,
            border: `1.5px solid ${theme.btnBorder}`,
            background: theme.btnBg,
            cursor: 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}>
            {isDarkMode ? '🌝' : '🌞'}
          </button>

          {/* 시계 */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
            color: theme.muted, background: theme.btnBg, padding: '6px 12px',
            borderRadius: 999, border: `1px solid ${theme.cardBorder}`
          }}>
            {clockStr}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto',
        paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none'
      }}>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setCurrentId(s.id)} style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
            border: s.id === currentId ? `1.5px solid ${s.color}` : `1.5px solid ${theme.cardBorder}`,
            background: s.id === currentId ? s.color : theme.card,
            color: s.id === currentId ? '#fff' : theme.muted,
            fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap',
            transition: 'all 0.15s'
          }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: s.id === currentId ? '#fff' : s.color,
              marginRight: 5, verticalAlign: 'middle'
            }} />
            {s.name}
          </button>
        ))}
        {subjects.length < 8 && (
          <button onClick={() => setShowModal(true)} style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 999,
            border: `1.5px dashed ${theme.cardBorder}`, background: 'transparent',
            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            color: theme.muted, transition: 'all 0.15s'
          }}>
            + 과목 추가
          </button>
        )}
      </div>

      {/* ── 과목 없을 때 ── */}
      {!subj ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: theme.muted }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📖</div>
          <div style={{ fontWeight: 700, marginBottom: 6, color: theme.text }}>과목을 추가해 주세요</div>
          <div style={{ fontSize: '0.85rem' }}>최대 8개 과목을 등록할 수 있어요</div>
        </div>
      ) : (
        <>
          {/* ── 통합 계산 모드 선택 ── */}
          {subjects.length > 1 && (
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>🔗 전과목 통합 계산</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { key: 'none',     label: '개별 보기' },
                  { key: 'same',     label: '같은 마감일끼리' },
                  { key: 'earliest', label: '가장 빠른 마감 기준' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setGroupMode(key as any)} style={{
                    padding: '6px 14px', borderRadius: 999,
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    border: '1.5px solid',
                    background: groupMode === key ? theme.text : theme.input,
                    color: groupMode === key ? (isDarkMode ? '#0f172a' : '#fff') : theme.muted,
                    borderColor: groupMode === key ? theme.text : theme.cardBorder,
                    transition: 'all 0.15s'
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 통합 결과 카드 ── */}
          {groupMode !== 'none' && groupStats && (
            <div style={{
              background: theme.groupCard, borderRadius: 16,
              padding: '20px', marginBottom: 14
            }}>
              <div style={{
                fontSize: '0.75rem', fontWeight: 700, color: '#6b7280',
                marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5
              }}>
                📊 통합 목표 — 마감 {groupStats.deadline} (D-{groupStats.dday})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {groupStats.perSubject.map((ps: any) => (
                  <div key={ps.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: ps.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{ps.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>남은 {ps.remaining}p</span>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900, color: ps.color }}>{ps.safePace}p/일</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #2a2a3e', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6b7280' }}>오늘 총 페이지</div>
                    <div style={{ fontSize: '0.72rem', color: '#4b5563', marginTop: 2 }}>
                      남은 총 {groupStats.totalRemaining}p ÷ {groupStats.workDays}일
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{groupStats.totalSafePace}</span>
                    <span style={{ fontSize: '0.9rem', color: '#9ca3af', marginLeft: 4 }}>p/일</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 설정 카드 ── */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>⚙️ 과목 설정 — {subj.name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: '마감 날짜', type: 'date',   field: 'deadline',    value: subj.deadline },
                { label: '휴일 수',   type: 'number', field: 'holidays',    value: subj.holidays },
                { label: '총 페이지', type: 'number', field: 'total_pages', value: subj.total_pages },
              ].map(({ label, type, field, value }) => (
                <div key={field}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type}
                    defaultValue={value}
                    key={`${currentId}-${field}`}
                    onBlur={(e) =>
                      updateSubject(field, type === 'number'
                        ? parseInt(e.target.value) || 0
                        : e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={deleteSubject} style={{
                padding: '6px 12px', borderRadius: 10, border: 'none',
                background: '#fee2e2', color: '#e32d2d',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
              }}>
                과목 삭제
              </button>
            </div>
          </div>

          {/* ── 결과 카드 ── */}
          <div style={{
            background: resultBg, border: `2px solid ${resultBorder}`,
            borderRadius: 16, padding: '22px 20px', marginBottom: 14
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{sc.icon}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.text, marginBottom: 4 }}>
              {s.remaining === 0 ? '목표 달성 완료!'
                : s.dday <= 0 ? '목표 날짜가 지났습니다!'
                : '목표 안심 구간 진입하려면'}
            </div>
           <div style={{ lineHeight: 1.3, marginBottom: 6 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text }}>오늘 </span>
          <strong style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1a9e5c', letterSpacing: -1 }}>
          {s.remaining === 0 ? 0 : s.safePace}
          </strong>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, marginLeft: 6 }}>
           페이지 풀어야 합니다.
          </span>
        </div>
            <div style={{ fontSize: '0.8rem', color: theme.muted, marginBottom: 10 }}>
              {s.remaining === 0 ? '오늘 목표 달성! 🎊'
                : `남은 페이지: ${s.remaining}p / 전체 ${subj.total_pages}p`}
            </div>
            <div style={{ fontSize: '0.82rem', color: theme.text, marginBottom: 3 }}>
              • D-Day: {s.dday <= 0 ? '목표 기간 초과' : s.dday}
            </div>
            <div style={{ fontSize: '0.82rem', color: theme.text, marginBottom: 16 }}>
              • 오늘 입력: {s.todayDone}p
            </div>

            {/* 최대 / 안심 / 최소 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { label: '최대 ○', value: `${s.possiblePace}p/일`, hi: false },
                { label: '안심 ✓', value: `${s.safePace}p/일`,    hi: true  },
                { label: '최소 ✦', value: `${s.relaxedPace}p/일`, hi: false },
              ].map(({ label, value, hi }) => (
                <div key={label} style={{
                  background: isDarkMode
                    ? hi ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'
                    : hi ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
                  borderRadius: 10, padding: '10px 8px', textAlign: 'center',
                  border: `1.5px solid ${hi ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: hi ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: hi ? sc.text : theme.text }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* 완료율 바 */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.78rem', fontWeight: 700, color: theme.muted, marginBottom: 6
            }}>
              <span>전체 완료율</span><span>{s.pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: 'rgba(128,128,128,0.2)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: sc.text, width: `${s.pct}%`,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* ── 오늘 회독 입력 ── */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>✏️ 오늘 회독 입력</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>오늘 푼 페이지 수</label>
                <input
                  type="number" min="1" placeholder="예) 20"
                  value={todayInput}
                  onChange={e => setTodayInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && logPages()}
                  style={inputStyle}
                />
              </div>
              <button onClick={logPages} style={{
                padding: '9px 18px', borderRadius: 10, border: 'none',
                background: subj?.color || '#2d5be3', color: '#fff',
                fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
                등록
              </button>
            </div>
            <div style={{ fontSize: '0.82rem', color: theme.muted, marginTop: 10 }}>
              누적: <strong style={{ color: theme.text }}>{s.totalDone}p</strong>
              {' '}/ 남은: <strong style={{ color: theme.text }}>{s.remaining}p</strong>
              {' '}({s.pct}%) &nbsp;|&nbsp; 오늘 입력:{' '}
              <strong style={{ color: theme.text }}>{s.todayDone}p</strong>
            </div>
          </div>

          {/* ── 회독 로그 ── */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={sectionTitleStyle}>📋 회독 로그</div>
              {(subj.logs || []).length > 0 && (
                <button
                  onClick={() => { if (confirm('모든 로그를 삭제하시겠습니까?')) updateSubject('logs', []); }}
                  style={{
                    padding: '6px 12px', borderRadius: 10, border: 'none',
                    background: '#fee2e2', color: '#e32d2d',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
                  }}>
                  전체 삭제
                </button>
              )}
            </div>
            {(subj.logs || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: theme.muted, fontSize: '0.85rem' }}>
                아직 기록이 없어요
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...(subj.logs || [])].reverse().map((log: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: theme.logBg, borderRadius: 8, padding: '9px 12px'
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: theme.muted, fontSize: '0.77rem'
                    }}>
                      {log.datetime}
                    </span>
                    <span style={{ fontWeight: 700, color: subj.color }}>+{log.pages}p</span>
                    <span
                      onClick={() => deleteLog((subj.logs || []).length - 1 - i)}
                      style={{ cursor: 'pointer', color: theme.muted, fontSize: '1rem', padding: '0 4px' }}
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── 과목 추가 모달 ── */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 100, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: theme.card, borderRadius: 20, padding: 24,
              width: '100%', maxWidth: 380, border: `1px solid ${theme.cardBorder}`
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 16, color: theme.text }}>
              📝 과목 추가
            </h2>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>과목명</label>
              <input
                type="text" value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="예) 헌법, 민법, 행정법"
                maxLength={10}
                onKeyDown={e => e.key === 'Enter' && addSubject()}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>색상</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <div
                    key={c} onClick={() => setSelectedColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: c,
                      cursor: 'pointer',
                      border: selectedColor === c ? `3px solid ${theme.text}` : '2px solid transparent',
                      transition: 'border 0.15s'
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setShowModal(false); setNewName(""); }}
                style={{
                  flex: 1, padding: '9px 18px', borderRadius: 10,
                  border: 'none', background: theme.input, color: theme.muted,
                  fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={addSubject}
                style={{
                  flex: 1, padding: '9px 18px', borderRadius: 10,
                  border: 'none', background: selectedColor, color: '#fff',
                  fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer'
                }}
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
