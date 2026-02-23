"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../supabase";

const COLORS = ['#2d5be3','#e35b2d','#1a9e5c','#9b59b6','#e3a52d','#e32d7a','#17a2b8','#6c757d'];

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
  body { font-family: 'Noto Sans KR', sans-serif; background: #f0ede8; }
`;

export default function ReviewPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [todayInput, setTodayInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studentName, setStudentName] = useState<string>("");

  // 로그인 정보 가져오기
  useEffect(() => {
    const saved = localStorage.getItem('hg_auth');
    if (saved) {
      const { name } = JSON.parse(saved);
      setStudentName(name);
    }
  }, []);

  // 시계
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Supabase에서 데이터 불러오기
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
      if (data.length > 0 && !currentId) setCurrentId(data[0].id);
    }
  };

  const getCurrentSubject = () => subjects.find(s => s.id === currentId);

  const calcStats = (subj: any) => {
    if (!subj) return { dday: 0, remaining: 0, pct: 0, todayDone: 0, safePace: 0, possiblePace: 0, relaxedPace: 0, totalDone: 0 };
    const now = new Date();
    const deadline = new Date(subj.deadline + 'T23:59:59');
    const dday = Math.ceil((deadline.getTime() - now.getTime()) / (1000*60*60*24));
    const workDays = Math.max(dday - (subj.holidays || 0), 1);
    const logs = subj.logs || [];
    const totalDone = logs.reduce((a: number, l: any) => a + l.pages, 0);
    const remaining = Math.max(subj.total_pages - totalDone, 0);
    const pct = Math.min(Math.round(totalDone / subj.total_pages * 100), 100);
    const todayStr = now.toISOString().slice(0, 10);
    const todayDone = logs.filter((l: any) => l.date === todayStr).reduce((a: number, l: any) => a + l.pages, 0);
    return {
      dday, workDays, totalDone, remaining, pct, todayDone,
      safePace: Math.ceil(remaining / workDays),
      possiblePace: Math.ceil(subj.total_pages / workDays),
      relaxedPace: Math.ceil(remaining / Math.max(workDays + 1, 1)),
    };
  };

  const addSubject = async () => {
    if (!newName.trim()) { alert('과목명을 입력해주세요.'); return; }
    if (subjects.length >= 8) { alert('최대 8개까지 가능합니다.'); return; }
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    const { data, error } = await supabase.from('review_subjects').insert({
      student_name: studentName,
      name: newName.trim(),
      color: selectedColor,
      deadline: deadline.toISOString().slice(0, 10),
      holidays: 0,
      total_pages: 100,
      logs: []
    }).select().single();
    if (!error && data) {
      setSubjects(prev => [...prev, data]);
      setCurrentId(data.id);
      setShowModal(false);
      setNewName("");
    }
  };

  const updateSubject = async (field: string, value: any) => {
    if (!currentId) return;
    const { error } = await supabase.from('review_subjects').update({ [field]: value }).eq('id', currentId);
    if (!error) setSubjects(prev => prev.map(s => s.id === currentId ? { ...s, [field]: value } : s));
  };

  const logPages = async () => {
    const pages = parseInt(todayInput);
    if (!pages || pages <= 0) { alert('올바른 페이지 수를 입력해주세요.'); return; }
    const subj = getCurrentSubject();
    if (!subj) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const datetime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
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

  const subj = getCurrentSubject();
  const s = calcStats(subj);

  const pad = (n: number) => String(n).padStart(2, '0');
  const clockStr = `${currentTime.getFullYear()}-${pad(currentTime.getMonth()+1)}-${pad(currentTime.getDate())} (${['일','월','화','수','목','금','토'][currentTime.getDay()]}) ${pad(currentTime.getHours())}:${pad(currentTime.getMinutes())}:${pad(currentTime.getSeconds())}`;

  let statusClass = 'safe';
  if (subj) {
    if (s.remaining === 0) statusClass = 'done';
    else if (s.dday <= 0) statusClass = 'danger';
    else if (s.safePace > subj.total_pages * 0.5) statusClass = 'danger';
    else if (s.safePace > subj.total_pages * 0.2) statusClass = 'warn';
  }

  const statusColors: any = {
    safe: { bg: '#e8f7f0', border: '#b7e8d2', text: '#1a9e5c', icon: '✅' },
    warn: { bg: '#fdf6e3', border: '#f5d98a', text: '#e3a52d', icon: '⚠️' },
    danger: { bg: '#fde8e8', border: '#f5aaaa', text: '#e32d2d', icon: '🔴' },
    done: { bg: '#eef2ff', border: '#c7d2fe', text: '#2d5be3', icon: '🎉' },
  };
  const sc = statusColors[statusClass];

  return (
    <div style={{ background: '#f0ede8', minHeight: '100vh', padding: '20px 16px 60px', fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{STYLE}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6b7280', textDecoration: 'none', background: '#fff', border: '1.5px solid #e0dcd6', borderRadius: 999, padding: '6px 12px' }}>← 돌아가기</Link>
          <span style={{ fontSize: '1.5rem' }}>📚</span>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: -0.5 }}>기출회독 시뮬레이터</h1>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#6b7280', background: '#fff', padding: '6px 12px', borderRadius: 999, border: '1px solid #e0dcd6' }}>{clockStr}</div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setCurrentId(s.id)} style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 999,
            border: s.id === currentId ? `1.5px solid ${s.color}` : '1.5px solid #e0dcd6',
            background: s.id === currentId ? s.color : '#fff',
            color: s.id === currentId ? '#fff' : '#6b7280',
            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.id === currentId ? '#fff' : s.color, marginRight: 5, verticalAlign: 'middle' }} />
            {s.name}
          </button>
        ))}
        {subjects.length < 8 && (
          <button onClick={() => setShowModal(true)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 999, border: '1.5px dashed #e0dcd6', background: 'transparent', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', color: '#6b7280' }}>
            + 과목 추가
          </button>
        )}
      </div>

      {!subj ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📖</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>과목을 추가해 주세요</div>
          <div style={{ fontSize: '0.85rem' }}>최대 8개 과목을 등록할 수 있어요</div>
        </div>
      ) : (
        <>
          {/* SETTINGS */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 14, border: '1px solid #e0dcd6' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>⚙️ 과목 설정 — {subj.name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: '마감 날짜', type: 'date', field: 'deadline', value: subj.deadline },
                { label: '휴일 수', type: 'number', field: 'holidays', value: subj.holidays },
                { label: '총 페이지', type: 'number', field: 'total_pages', value: subj.total_pages },
              ].map(({ label, type, field, value }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: 5 }}>{label}</label>
                  <input type={type} defaultValue={value}
                    onBlur={(e) => updateSubject(field, type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0dcd6', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', background: '#f0ede8', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={deleteSubject} style={{ padding: '6px 12px', borderRadius: 10, border: 'none', background: '#fee2e2', color: '#e32d2d', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>과목 삭제</button>
            </div>
          </div>

          {/* RESULT */}
          <div style={{ background: sc.bg, border: `2px solid ${sc.border}`, borderRadius: 16, padding: '22px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{sc.icon}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>
              {s.remaining === 0 ? '목표 달성 완료!' : s.dday <= 0 ? '마감이 지났습니다!' : '마감 안심 구간 진입하려면'}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: sc.text, letterSpacing: -1, lineHeight: 1, marginBottom: 6 }}>
              오늘 <strong>{s.remaining === 0 ? 0 : s.safePace}</strong><span style={{ fontSize: '1rem', marginLeft: 4 }}>페이지</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 14 }}>
              {s.remaining === 0 ? '오늘 목표 달성! 🎊' : `남은 페이지: ${s.remaining}p / 전체 ${subj.total_pages}p`}
            </div>
            <div style={{ fontSize: '0.82rem', marginBottom: 3 }}>• D-Day: {s.dday <= 0 ? '마감 초과' : s.dday}</div>
            <div style={{ fontSize: '0.82rem', marginBottom: 14 }}>• 오늘 입력: {s.todayDone}p</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { label: '가능 ○', value: `${s.possiblePace}p/일`, hi: false },
                { label: '안심 ✓', value: `${s.safePace}p/일`, hi: true },
                { label: '여유 ✦', value: `${s.relaxedPace}p/일`, hi: false },
              ].map(({ label, value, hi }) => (
                <div key={label} style={{ background: hi ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: `1.5px solid ${hi ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.06)'}` }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: hi ? sc.text : '#1a1a2e' }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>
              <span>전체 완료율</span><span>{s.pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, background: sc.text, width: `${s.pct}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* TODAY INPUT */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 14, border: '1px solid #e0dcd6' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>✏️ 오늘 회독 입력</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: 5 }}>오늘 푼 페이지 수</label>
                <input type="number" min="1" placeholder="예) 20" value={todayInput}
                  onChange={e => setTodayInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && logPages()}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0dcd6', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', background: '#f0ede8', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button onClick={logPages} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: subj.color, color: '#fff', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>등록</button>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 10 }}>
              누적: <strong style={{ color: '#1a1a2e' }}>{s.totalDone}p</strong> / 남은: <strong style={{ color: '#1a1a2e' }}>{s.remaining}p</strong> ({s.pct}%)
            </div>
          </div>

          {/* LOG */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e0dcd6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>📋 회독 로그</div>
              {(subj.logs || []).length > 0 && (
                <button onClick={() => updateSubject('logs', [])} style={{ padding: '6px 12px', borderRadius: 10, border: 'none', background: '#fee2e2', color: '#e32d2d', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>전체 삭제</button>
              )}
            </div>
            {(subj.logs || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280', fontSize: '0.85rem' }}>아직 기록이 없어요</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...(subj.logs || [])].reverse().map((log: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0ede8', borderRadius: 8, padding: '9px 12px' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#6b7280', fontSize: '0.77rem' }}>{log.datetime}</span>
                    <span style={{ fontWeight: 700, color: subj.color }}>+{log.pages}p</span>
                    <span onClick={() => deleteLog((subj.logs || []).length - 1 - i)} style={{ cursor: 'pointer', color: '#ccc', fontSize: '1rem', padding: '0 4px' }}>✕</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ADD MODAL */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 380, border: '1px solid #e0dcd6' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 16 }}>📝 과목 추가</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 5 }}>과목명</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="예) 헌법, 민법, 행정법" maxLength={10}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0dcd6', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>색상</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setSelectedColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: selectedColor === c ? '2px solid #1a1a2e' : '2px solid transparent' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#f0ede8', color: '#6b7280', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>취소</button>
              <button onClick={addSubject} style={{ flex: 1, padding: '9px 18px', borderRadius: 10, border: 'none', background: selectedColor, color: '#fff', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>추가하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
