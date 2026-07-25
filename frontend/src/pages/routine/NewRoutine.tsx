import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Dumbbell, LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { createRoutine, getRoutineExercises, type RoutineExercise } from "../../api/routine";
import { getErrorMessage } from "../../utils/apiError";
import "./NewRoutine.css";

const BODY_PARTS: Record<number, string> = {
  1: "가슴",
  2: "등",
  3: "어깨",
  4: "이두",
  5: "삼두",
  6: "전완",
  7: "하체",
  8: "코어",
};

export default function NewRoutine() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [selected, setSelected] = useState<RoutineExercise[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedOpen, setSelectedOpen] = useState(false);

  useEffect(() => {
    getRoutineExercises()
      .then(setExercises)
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const selectedIds = useMemo(() => new Set(selected.map((exercise) => exercise.id)), [selected]);
  const filtered = exercises.filter((exercise) => {
    const query = search.trim().toLowerCase();
    return !query
      || exercise.name_kr.includes(query)
      || exercise.name_eng.toLowerCase().includes(query)
      || BODY_PARTS[exercise.body_part]?.includes(query);
  });

  function toggleExercise(exercise: RoutineExercise) {
    setSelected((current) => selectedIds.has(exercise.id)
      ? current.filter((item) => item.id !== exercise.id)
      : [...current, exercise]);
  }

  async function saveRoutine() {
    const trimmedName = name.trim();
    if (!trimmedName || selected.length === 0) return;

    setSaving(true);
    setError("");
    try {
      await createRoutine(trimmedName, selected.map((exercise) => exercise.id));
      navigate("/records/workouts", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="routine-page">
      <header className="routine-header">
        <button className="routine-back" onClick={() => navigate(-1)} aria-label="뒤로 가기">
          <ArrowLeft size={21} />
        </button>
        <h1>새 루틴</h1>
        <button
          className="routine-save"
          disabled={!name.trim() || selected.length === 0 || saving}
          onClick={saveRoutine}
        >
          {saving ? <LoaderCircle className="routine-spin" size={16} /> : <Check size={16} />}
          저장
        </button>
      </header>

      <main className={`routine-content${selected.length > 0 ? " has-selection" : ""}`}>
        <label className="routine-name-label" htmlFor="routine-name">루틴 이름</label>
        <input
          id="routine-name"
          className="routine-name-input"
          maxLength={100}
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <section className="routine-exercises">
          <div className="routine-section-title">
            <span>운동 추가</span><small>원하는 운동을 모두 선택하세요</small>
          </div>
          <div className="routine-search">
            <Search size={17} />
            <input placeholder="운동명 또는 부위 검색" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>

          {loading ? (
            <div className="routine-state"><LoaderCircle className="routine-spin" size={25} />운동을 불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="routine-state"><Dumbbell size={25} />검색 결과가 없습니다.</div>
          ) : (
            <div className="routine-exercise-list">
              {filtered.map((exercise) => {
                const isSelected = selectedIds.has(exercise.id);
                return (
                  <button
                    className={`routine-exercise-item${isSelected ? " selected" : ""}`}
                    key={exercise.id}
                    onClick={() => toggleExercise(exercise)}
                  >
                    <span className="routine-part">{BODY_PARTS[exercise.body_part] ?? "기타"}</span>
                    <span className="routine-exercise-name">
                      <strong>{exercise.name_kr}</strong><small>{exercise.name_eng}</small>
                    </span>
                    <span className="routine-add-icon">{isSelected ? <Check size={16} /> : <Plus size={16} />}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
        {error && <p className="routine-error">{error}</p>}
      </main>

      {selected.length > 0 && (
        <section className={`routine-selected-drawer${selectedOpen ? " open" : ""}`}>
          <button
            className="routine-selected-toggle"
            onClick={() => setSelectedOpen((open) => !open)}
            aria-expanded={selectedOpen}
          >
            <span>선택한 운동</span>
            <strong>{selected.length}</strong>
            <small>{selectedOpen ? "접기" : "전체 보기"}</small>
            {selectedOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          <div className="routine-selected-list">
            {(selectedOpen ? selected : selected.slice(-1)).map((exercise) => {
              const index = selected.findIndex((item) => item.id === exercise.id);
              return (
                <div className="routine-selected-item" key={exercise.id}>
                  <span className="routine-order">{index + 1}</span>
                  <div>
                    <p>{exercise.name_kr}</p>
                    <span>{BODY_PARTS[exercise.body_part] ?? "기타"}</span>
                  </div>
                  <button onClick={() => toggleExercise(exercise)} aria-label={`${exercise.name_kr} 삭제`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
