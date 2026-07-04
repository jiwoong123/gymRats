import { useState } from "react";
import { Plus, Dumbbell, Timer, ChevronRight, X, Check, Trash2, Flame } from "lucide-react";
import "./Workouts.css";

type WorkoutSet = { reps: number; weight: number; done: boolean };
type Exercise = { id: string; name: string; category: string; sets: WorkoutSet[] };

const EXERCISE_OPTIONS = [
  { name: "벤치프레스", category: "가슴" },
  { name: "인클라인 벤치프레스", category: "가슴" },
  { name: "스쿼트", category: "하체" },
  { name: "레그프레스", category: "하체" },
  { name: "데드리프트", category: "등/허리" },
  { name: "바벨 로우", category: "등" },
  { name: "풀업", category: "등" },
  { name: "숄더프레스", category: "어깨" },
  { name: "덤벨 컬", category: "이두" },
  { name: "트라이셉스 익스텐션", category: "삼두" },
  { name: "플랭크", category: "복근" },
  { name: "레그 레이즈", category: "복근" },
];

const HISTORY = [
  {
    id: "h1",
    date: "2025.07.02",
    name: "가슴 · 삼두",
    exercises: ["벤치프레스", "인클라인 벤치프레스", "트라이셉스 익스텐션"],
    duration: 58,
    volume: 5400,
  },
  {
    id: "h2",
    date: "2025.06.30",
    name: "등 · 이두",
    exercises: ["바벨 로우", "풀업", "덤벨 컬"],
    duration: 72,
    volume: 6800,
  },
  {
    id: "h3",
    date: "2025.06.28",
    name: "하체",
    exercises: ["스쿼트", "레그프레스", "레그 레이즈"],
    duration: 65,
    volume: 9200,
  },
  {
    id: "h4",
    date: "2025.06.26",
    name: "어깨 · 복근",
    exercises: ["숄더프레스", "플랭크", "레그 레이즈"],
    duration: 45,
    volume: 3100,
  },
];

function uid() { return Math.random().toString(36).slice(2, 9); }

type View = "list" | "active";

export default function Workouts() {
  const [view, setView] = useState<View>("list");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [timerRef] = useState<{ iv: ReturnType<typeof setInterval> | null }>({ iv: null });

  function startWorkout() {
    setView("active");
    setElapsed(0);
    timerRef.iv = setInterval(() => setElapsed((s) => s + 1), 1000);
  }

  function finishWorkout() {
    if (timerRef.iv) clearInterval(timerRef.iv);
    setView("list");
    setExercises([]);
    setElapsed(0);
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function addExercise(name: string, category: string) {
    setExercises((p) => [...p, { id: uid(), name, category, sets: [{ reps: 10, weight: 60, done: false }] }]);
    setShowPicker(false);
    setSearch("");
  }

  function addSet(id: string) {
    setExercises((p) => p.map((ex) => {
      if (ex.id !== id) return ex;
      const last = ex.sets[ex.sets.length - 1];
      return { ...ex, sets: [...ex.sets, { reps: last.reps, weight: last.weight, done: false }] };
    }));
  }

  function updateSet(id: string, i: number, field: "reps" | "weight", val: number) {
    setExercises((p) => p.map((ex) =>
      ex.id !== id ? ex : { ...ex, sets: ex.sets.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }
    ));
  }

  function toggleSet(id: string, i: number) {
    setExercises((p) => p.map((ex) =>
      ex.id !== id ? ex : { ...ex, sets: ex.sets.map((s, idx) => idx === i ? { ...s, done: !s.done } : s) }
    ));
  }

  function removeEx(id: string) {
    setExercises((p) => p.filter((ex) => ex.id !== id));
  }

  const totalVolume = exercises.reduce(
    (a, ex) => a + ex.sets.filter((s) => s.done).reduce((b, s) => b + s.reps * s.weight, 0), 0
  );
  const doneSets = exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.done).length, 0);
  const filtered = EXERCISE_OPTIONS.filter((e) => e.name.includes(search) || e.category.includes(search));

  if (view === "active") {
    return (
      <div className="workout-active">
        {/* Active header */}
        <div className="active-header">
          <div className="active-timer">
            <Timer size={14} />
            <span className="timer-value">{fmt(elapsed)}</span>
          </div>
          <div className="active-stats">
            <span className="astat"><Dumbbell size={12} />{exercises.length}종목</span>
            <span className="astat"><Flame size={12} />{(totalVolume / 1000).toFixed(1)}T</span>
            <span className="astat"><Check size={12} />{doneSets}세트</span>
          </div>
        </div>

        {/* Exercises */}
        <div className="ex-list">
          {exercises.length === 0 && (
            <div className="empty-ex">
              <Dumbbell size={32} style={{ color: "#c8ff00", marginBottom: 8 }} />
              <p style={{ color: "#7070a0", fontSize: "0.875rem" }}>운동을 추가해주세요</p>
            </div>
          )}
          {exercises.map((ex) => (
            <div key={ex.id} className="ex-card">
              <div className="ex-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="ex-category">{ex.category}</span>
                  <span className="ex-name">{ex.name}</span>
                </div>
                <button className="ex-delete" onClick={() => removeEx(ex.id)}><Trash2 size={14} /></button>
              </div>
              <div className="set-cols">
                <span>#</span><span>무게(kg)</span><span>횟수</span><span />
              </div>
              {ex.sets.map((s, i) => (
                <div key={i} className="set-row" style={{ opacity: s.done ? 0.55 : 1 }}>
                  <span className="set-num" style={{ color: s.done ? "#c8ff00" : "#7070a0" }}>{i + 1}</span>
                  <input
                    className="set-input"
                    type="number"
                    value={s.weight}
                    disabled={s.done}
                    onChange={(e) => updateSet(ex.id, i, "weight", Number(e.target.value))}
                  />
                  <input
                    className="set-input"
                    type="number"
                    value={s.reps}
                    disabled={s.done}
                    onChange={(e) => updateSet(ex.id, i, "reps", Number(e.target.value))}
                  />
                  <button
                    className={"set-check" + (s.done ? " done" : "")}
                    onClick={() => toggleSet(ex.id, i)}
                  >
                    <Check size={13} />
                  </button>
                </div>
              ))}
              <button className="add-set-btn" onClick={() => addSet(ex.id)}>+ 세트 추가</button>
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="active-actions">
          <button className="add-ex-btn" onClick={() => setShowPicker(true)}>
            <Plus size={18} /> 운동 추가
          </button>
          <button className="finish-btn" onClick={finishWorkout}>
            완료
          </button>
        </div>

        {/* Exercise picker */}
        {showPicker && (
          <div className="picker-overlay">
            <div className="picker-sheet">
              <div className="picker-header">
                <h2 className="picker-title">운동 선택</h2>
                <button className="picker-close" onClick={() => { setShowPicker(false); setSearch(""); }}>
                  <X size={20} />
                </button>
              </div>
              <input
                className="picker-search"
                type="text"
                placeholder="검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="picker-list">
                {filtered.map((ex) => (
                  <button key={ex.name} className="picker-item" onClick={() => addExercise(ex.name, ex.category)}>
                    <span className="picker-category">{ex.category}</span>
                    <span className="picker-name">{ex.name}</span>
                    <ChevronRight size={15} style={{ color: "#7070a0", marginLeft: "auto" }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="workouts-page">
      <div className="workouts-header">
        <h1 className="workouts-title">운동 기록</h1>
        <button className="new-workout-btn" onClick={startWorkout}>
          <Plus size={18} /> 새 운동
        </button>
      </div>

      <div className="history-list">
        {HISTORY.map((w) => (
          <div key={w.id} className="history-item">
            <div className="history-top">
              <span className="history-date">{w.date}</span>
              <span className="history-duration"><Timer size={11} /> {w.duration}분</span>
            </div>
            <h3 className="history-name">{w.name}</h3>
            <p className="history-exercises">{w.exercises.join(" · ")}</p>
            <div className="history-bottom">
              <span className="history-volume">{(w.volume / 1000).toFixed(1)}<span>T</span></span>
              <ChevronRight size={16} style={{ color: "#7070a0" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
