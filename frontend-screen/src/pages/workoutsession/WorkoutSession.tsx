import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Dumbbell, LoaderCircle, Plus, Search, Timer, Trash2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { getRoutineExercises, type RoutineExercise } from "../../api/routine";
import { finishWorkoutSession, startWorkoutSession, type SessionExercise, type WorkoutSession } from "../../api/workout";
import { getErrorMessage } from "../../utils/apiError";
import "./WorkoutSession.css";

const DRAFT_KEY = "active_workout_draft";
const BODY_PARTS: Record<number, string> = { 1: "가슴", 2: "등", 3: "어깨", 4: "이두", 5: "삼두", 6: "전완", 7: "하체", 8: "코어" };

type StoredDraft = { sessionId: number; exercises: SessionExercise[] };

function getStartedAtTime(startedAt: string) {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(startedAt);
  return new Date(hasTimezone ? startedAt : `${startedAt}Z`).getTime();
}

function getDefaultSessionName(session: WorkoutSession) {
  const startedAt = new Date(getStartedAtTime(session.started_at));
  const routineName = session.routine_name || "자유운동";
  return `${startedAt.getMonth() + 1}월 ${startedAt.getDate()}일 ${routineName}`.slice(0, 50);
}

export default function WorkoutSessionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const sessionStartedAt = useRef(0);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [catalog, setCatalog] = useState<RoutineExercise[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");

  const value = searchParams.get("routine_id");
  const routineId = value ? Number(value) : null;
  const defaultSessionName = session ? getDefaultSessionName(session) : "";
  
  useEffect(() => {
    Promise.all([startWorkoutSession(routineId), getRoutineExercises()])
      .then(([activeSession, exerciseCatalog]) => {
        sessionStartedAt.current = getStartedAtTime(activeSession.started_at);
        setElapsed(Math.max(0, Math.floor((Date.now() - sessionStartedAt.current) / 1000)));
        setSession(activeSession);
        setCatalog(exerciseCatalog);
        const stored = localStorage.getItem(DRAFT_KEY);
        if (stored) {
          try {
            const draft = JSON.parse(stored) as StoredDraft;
            if (draft.sessionId === activeSession.id) {
              setExercises(draft.exercises);
              return;
            }
          } catch {
            localStorage.removeItem(DRAFT_KEY);
          }
        }
        setExercises(activeSession.exercises);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, [routineId]);

  useEffect(() => {
    if (!session || finishDialogOpen) return;
    const updateElapsed = () => setElapsed(Math.floor((Date.now() - sessionStartedAt.current) / 1000));
    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [session, finishDialogOpen]);

  useEffect(() => {
    if (session) localStorage.setItem(DRAFT_KEY, JSON.stringify({ sessionId: session.id, exercises } satisfies StoredDraft));
  }, [session, exercises]);

  const selectedIds = useMemo(() => new Set(exercises.map((exercise) => exercise.exercise_id)), [exercises]);
  const filteredCatalog = catalog.filter((exercise) => {
    const query = search.trim().toLowerCase();
    return !selectedIds.has(exercise.id) && (!query || exercise.name_kr.includes(query) || exercise.name_eng.toLowerCase().includes(query));
  });
  const completedSets = exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0);
  const volume = exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).reduce((sum, set) => sum + (set.weight ?? 0) * (set.reps ?? 0), 0), 0);

  function formatTime(value: number) {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  }

  function updateExercise(index: number, update: (exercise: SessionExercise) => SessionExercise) {
    setExercises((current) => current.map((exercise, itemIndex) => itemIndex === index ? update(exercise) : exercise));
  }

  function addExercise(exercise: RoutineExercise) {
    setExercises((current) => [...current, {
      exercise_id: exercise.id,
      name_kr: exercise.name_kr,
      body_part: exercise.body_part,
      rest_seconds: 90,
      sets: [{ weight: null, reps: 10, completed: false }],
    }]);
    setSearch("");
    setPickerOpen(false);
  }

  function moveExercise(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= exercises.length) return;
    setExercises((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function openFinishDialog() {
    if (!session) return;
    setElapsed(Math.floor((Date.now() - sessionStartedAt.current) / 1000));
    setError("");
    setFinishDialogOpen(true);
  }

  function closeFinishDialog() {
    if (finishing) return;
    setFinishDialogOpen(false);
    setError("");
  }

  async function finish(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const name = sessionName.trim();
    setFinishing(true);
    setError("");
    try {
      await finishWorkoutSession(session.id, exercises, name || null, memo.trim() || null, elapsed);
      localStorage.removeItem(DRAFT_KEY);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["home"], exact: true, type: "all" }),
        queryClient.refetchQueries({ queryKey: ["workout-history"], exact: true, type: "all" }),
        queryClient.refetchQueries({ queryKey: ["workout-calendar"], type: "all" }),
        queryClient.refetchQueries({ queryKey: ["personal-record-exercises"], type: "all" }),
        queryClient.refetchQueries({ queryKey: ["personal-record-exercise"], type: "all" }),
      ]);
      navigate("/records/workouts", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setFinishing(false);
    }
  }

  if (loading) return <div className="session-state"><LoaderCircle className="session-spin" />운동을 준비하고 있어요</div>;
  if (!session) return <div className="session-state"><Dumbbell />{error || "운동을 시작하지 못했습니다."}</div>;

  return (
    <div className="session-page">
      <header className="session-header">
        <button className="session-back" onClick={() => navigate(-1)} aria-label="뒤로 가기"><ArrowLeft size={21} /></button>
        <div>
          <p className="session-source">{session.routine_name ? `${session.routine_name} 루틴` : "자유 운동 · 루틴 없음"}</p>
          <div className="session-time"><Timer size={16} />{formatTime(elapsed)}</div>
        </div>
        <button className="session-finish" onClick={openFinishDialog}>
          <Check size={16} /> 운동 종료
        </button>
      </header>

      <div className="session-summary">
        <span><strong>{exercises.length}</strong> 운동</span>
        <span><strong>{completedSets}</strong> 완료 세트</span>
        <span><strong>{volume.toLocaleString()}</strong> kg</span>
      </div>

      <main className="session-content">
        {exercises.length === 0 && <div className="session-empty"><Dumbbell size={30} /><p>아직 추가한 운동이 없습니다.</p></div>}
        {exercises.map((exercise, exerciseIndex) => (
          <article className="session-exercise" key={`${exercise.exercise_id}-${exerciseIndex}`}>
            <div className="session-exercise-header">
              <span className="session-part">{BODY_PARTS[exercise.body_part] ?? "기타"}</span>
              <strong>{exercise.name_kr}</strong>
              <div className="session-order-buttons">
                <button disabled={exerciseIndex === 0} onClick={() => moveExercise(exerciseIndex, -1)} aria-label="위로 이동"><ChevronUp size={15} /></button>
                <button disabled={exerciseIndex === exercises.length - 1} onClick={() => moveExercise(exerciseIndex, 1)} aria-label="아래로 이동"><ChevronDown size={15} /></button>
                <button className="session-delete" onClick={() => setExercises((current) => current.filter((_, index) => index !== exerciseIndex))} aria-label="운동 삭제"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="session-set-head"><span>세트</span><span>무게 kg</span><span>횟수</span><span>완료</span><span /></div>
            {exercise.sets.map((set, setIndex) => (
              <div className={`session-set${set.completed ? " completed" : ""}`} key={setIndex}>
                <span>{setIndex + 1}</span>
                <input type="number" min="0" step="0.5" value={set.weight ?? ""} placeholder="0" onChange={(event) => updateExercise(exerciseIndex, (item) => ({ ...item, sets: item.sets.map((value, index) => index === setIndex ? { ...value, weight: event.target.value === "" ? null : Number(event.target.value) } : value) }))} />
                <input type="number" min="0" value={set.reps ?? ""} placeholder="0" onChange={(event) => updateExercise(exerciseIndex, (item) => ({ ...item, sets: item.sets.map((value, index) => index === setIndex ? { ...value, reps: event.target.value === "" ? null : Number(event.target.value) } : value) }))} />
                <button onClick={() => updateExercise(exerciseIndex, (item) => ({ ...item, sets: item.sets.map((value, index) => index === setIndex ? { ...value, completed: !value.completed } : value) }))}><Check size={14} /></button>
                <button className="session-set-delete" onClick={() => updateExercise(exerciseIndex, (item) => ({ ...item, sets: item.sets.filter((_, index) => index !== setIndex) }))} aria-label={`${setIndex + 1}세트 삭제`}><X size={13} /></button>
              </div>
            ))}
            <button className="session-add-set" onClick={() => updateExercise(exerciseIndex, (item) => ({ ...item, sets: [...item.sets, { weight: item.sets.at(-1)?.weight ?? null, reps: item.sets.at(-1)?.reps ?? 10, completed: false }] }))}>+ 세트 추가</button>
          </article>
        ))}
        {error && <p className="session-error">{error}</p>}
      </main>

      <button className="session-add-exercise" onClick={() => setPickerOpen(true)}><Plus size={18} /> 운동 추가</button>

      {pickerOpen && <div className="session-picker-overlay" onMouseDown={() => setPickerOpen(false)}>
        <div className="session-picker" onMouseDown={(event) => event.stopPropagation()}>
          <div className="session-picker-header"><h2>운동 추가</h2><button onClick={() => setPickerOpen(false)}><X size={20} /></button></div>
          <div className="session-search"><Search size={17} /><input autoFocus placeholder="운동 검색" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <div className="session-picker-list">
            {filteredCatalog.map((exercise) => <button key={exercise.id} onClick={() => addExercise(exercise)}><span>{BODY_PARTS[exercise.body_part] ?? "기타"}</span><div><strong>{exercise.name_kr}</strong><small>{exercise.name_eng}</small></div><Plus size={17} /></button>)}
            {filteredCatalog.length === 0 && <p>추가할 운동이 없습니다.</p>}
          </div>
        </div>
      </div>}

      {finishDialogOpen && (
        <div className="session-finish-overlay" onMouseDown={closeFinishDialog}>
          <form
            className="session-finish-dialog"
            onSubmit={finish}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="finish-dialog-title"
          >
            <div className="session-finish-dialog-header">
              <div>
                <h2 id="finish-dialog-title">운동을 종료할까요?</h2>
                <span><Timer size={14} /> {formatTime(elapsed)}</span>
              </div>
              <button type="button" onClick={closeFinishDialog} disabled={finishing} aria-label="닫기">
                <X size={20} />
              </button>
            </div>

            <label className="session-finish-field">
              <span>운동 이름 <em>선택</em></span>
              <input
                autoFocus
                maxLength={50}
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                placeholder={defaultSessionName}
                disabled={finishing}
              />
              <small>{sessionName.length}/50</small>
            </label>

            <label className="session-finish-field">
              <span>메모 <em>선택</em></span>
              <textarea
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="오늘 운동은 어땠나요?"
                rows={4}
                disabled={finishing}
              />
            </label>

            {error && <p className="session-error" role="alert">{error}</p>}

            <div className="session-finish-actions">
              <button type="button" onClick={closeFinishDialog} disabled={finishing}>취소</button>
              <button type="submit" disabled={finishing}>
                {finishing ? <LoaderCircle className="session-spin" size={16} /> : <Check size={16} />}
                저장하고 종료
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
