import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Dumbbell, LoaderCircle, Plus, Search, Trash2, X } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { createRoutine, deleteRoutine, getRoutine, getRoutineExercises, updateRoutine, type RoutineExercise, type RoutineSet, type SelectedRoutineExercise } from "../../api/routine";
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
  const queryClient = useQueryClient();
  const { routineId } = useParams();
  const parsedRoutineId = Number(routineId);
  const isEditing = Number.isInteger(parsedRoutineId) && parsedRoutineId > 0;
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [selected, setSelected] = useState<SelectedRoutineExercise[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showExerciseCatalog, setShowExerciseCatalog] = useState(false);
  const initialForm = useRef(serializeForm("", []));

  useEffect(() => {
    Promise.all([
      getRoutineExercises(),
      isEditing ? getRoutine(parsedRoutineId) : Promise.resolve(null),
    ])
      .then(([availableExercises, routine]) => {
        setExercises(availableExercises);
        if (routine) {
          setName(routine.name);
          setSelected(routine.exercises);
          initialForm.current = serializeForm(routine.name, routine.exercises);
        } else {
          initialForm.current = serializeForm("", []);
        }
      })
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, [isEditing, parsedRoutineId]);

  const selectedIds = useMemo(() => new Set(selected.map((exercise) => exercise.id)), [selected]);
  const hasUnsavedChanges = initialForm.current !== serializeForm(name, selected);
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
      : [...current, {
          ...exercise,
          rest_seconds: 90,
          sets: [createDefaultSet(1, exercise.default_weight)],
        }]);
  }

  function selectExercise(exercise: RoutineExercise) {
    if (!selectedIds.has(exercise.id)) {
      setSelected((current) => [...current, {
        ...exercise,
        rest_seconds: 90,
        sets: [createDefaultSet(1, exercise.default_weight)],
      }]);
    }
    setShowExerciseCatalog(false);
    setSearch("");
  }

  function updateExerciseRest(exerciseId: number, value: string) {
    setSelected((current) => current.map((exercise) => exercise.id === exerciseId
      ? { ...exercise, rest_seconds: value === "" ? null : Number(value) }
      : exercise));
  }

  function addSet(exerciseId: number) {
    setSelected((current) => current.map((exercise) => exercise.id === exerciseId
      ? {
          ...exercise,
          sets: [
            ...exercise.sets,
            createDefaultSet(exercise.sets.length + 1, exercise.sets[0]?.target_weight ?? exercise.default_weight),
          ],
        }
      : exercise));
  }

  function removeLastSet(exerciseId: number) {
    setSelected((current) => current.map((exercise) => exercise.id === exerciseId
      ? {
          ...exercise,
          sets: exercise.sets
            .slice(0, -1)
            .map((routineSet, index) => ({ ...routineSet, set_number: index + 1 })),
        }
      : exercise));
  }

  function updateSet(
    exerciseId: number,
    setIndex: number,
    field: keyof Omit<RoutineSet, "id" | "set_number">,
    value: string | boolean,
  ) {
    setSelected((current) => current.map((exercise) => exercise.id === exerciseId
      ? {
          ...exercise,
          sets: exercise.sets.map((routineSet, index) => index === setIndex
            ? { ...routineSet, [field]: typeof value === "boolean" ? value : value === "" ? null : Number(value) }
            : routineSet),
        }
      : exercise));
  }

  async function handleDeleteRoutine() {
    if (!isEditing || !window.confirm(`“${name}” 루틴을 삭제할까요?`)) return;
    setSaving(true);
    setError("");
    try {
      await deleteRoutine(parsedRoutineId);
      await queryClient.invalidateQueries({ queryKey: ["home"], exact: true });
      navigate("/routine", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setSaving(false);
    }
  }

  async function saveRoutine() {
    const trimmedName = name.trim();
    if (!trimmedName || selected.length === 0) return;

    setSaving(true);
    setError("");
    try {
      if (isEditing) {
        await updateRoutine(parsedRoutineId, trimmedName, selected);
      } else {
        await createRoutine(trimmedName, selected);
      }
      await queryClient.invalidateQueries({ queryKey: ["home"], exact: true });
      navigate("/routine", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  function closeRoutineEditor() {
    if (showExerciseCatalog) {
      setShowExerciseCatalog(false);
      return;
    }
    if (hasUnsavedChanges && !window.confirm("저장하지 않은 변경사항을 삭제할까요?")) {
      return;
    }
    navigate(-1);
  }

  return (
    <div className="routine-page">
      <header className="routine-header">
        <button className="routine-back" type="button" onClick={closeRoutineEditor} aria-label={showExerciseCatalog ? "운동 선택 닫기" : "루틴 편집 닫기"}>
          <X size={21} />
        </button>
        <h1>{showExerciseCatalog ? "운동 선택" : isEditing ? "루틴 수정" : "새 루틴"}</h1>
        {!showExerciseCatalog ? <button
          className="routine-save"
          disabled={!name.trim() || selected.length === 0 || saving}
          onClick={saveRoutine}
        >
          {saving ? <LoaderCircle className="routine-spin" size={16} /> : <Check size={16} />}
          저장
        </button> : <span className="routine-header-spacer" />}
      </header>

      <main className="routine-content">
        {!showExerciseCatalog && <><label className="routine-name-label" htmlFor="routine-name">루틴 이름</label>
        <input
          id="routine-name"
          className="routine-name-input"
          maxLength={100}
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(event) => setName(event.target.value)}
        /></>}

        {!showExerciseCatalog && (
          <section className="routine-edit-selected">
            <div className="routine-section-title">
              <span>선택한 운동</span><strong>{selected.length}</strong>
              <small>세트별 목표를 설정하세요</small>
            </div>
            {loading ? (
              <div className="routine-state"><LoaderCircle className="routine-spin" size={25} />루틴을 불러오는 중...</div>
            ) : selected.length === 0 ? (
              <div className="routine-empty-exercises">
                <Dumbbell size={28} />
                <strong>이 루틴에 운동을 추가하세요</strong>
                <p>운동을 선택하면 세트별 목표를 설정할 수 있습니다.</p>
                <button type="button" onClick={() => setShowExerciseCatalog(true)}><Plus size={17} /> 운동 추가</button>
              </div>
            ) : (
              <div className="routine-edit-selected-list">
                {selected.map((exercise, index) => (
                  <article className="routine-target-card" key={exercise.id}>
                    <header>
                      <span className="routine-order">{index + 1}</span>
                      <div><strong>{exercise.name_kr}</strong><small>{BODY_PARTS[exercise.body_part] ?? "기타"}</small></div>
                      <button type="button" onClick={() => toggleExercise(exercise)} aria-label={`${exercise.name_kr} 삭제`}><Trash2 size={16} /></button>
                    </header>
                    <label className="routine-exercise-rest">
                      운동 기본 휴식 (초)
                      <input type="number" min="0" placeholder="–" value={exercise.rest_seconds ?? ""} onChange={(event) => updateExerciseRest(exercise.id, event.target.value)} />
                    </label>
                    <div className="routine-set-list">
                      {exercise.sets.map((routineSet, setIndex) => (
                        <div className="routine-set-card" key={routineSet.id ?? setIndex}>
                          <div className="routine-set-heading">
                            <strong>{setIndex + 1}세트</strong>
                          </div>
                          <div className="routine-set-grid">
                            <label>무게 (kg)<input type="number" min="0" step="0.5" placeholder="–" value={routineSet.target_weight ?? ""} onChange={(event) => updateSet(exercise.id, setIndex, "target_weight", event.target.value)} /></label>
                            <label>횟수<input type="number" min="1" placeholder="–" value={routineSet.target_reps ?? ""} onChange={(event) => updateSet(exercise.id, setIndex, "target_reps", event.target.value)} /></label>
                            <label>시간 (초)<input type="number" min="0" placeholder="–" value={routineSet.target_duration ?? ""} onChange={(event) => updateSet(exercise.id, setIndex, "target_duration", event.target.value)} /></label>
                            <label>거리 (km)<input type="number" min="0" step="0.01" placeholder="–" value={routineSet.target_distance ?? ""} onChange={(event) => updateSet(exercise.id, setIndex, "target_distance", event.target.value)} /></label>
                            <label>세트 후 휴식 (초)<input type="number" min="0" placeholder="–" value={routineSet.rest_seconds ?? ""} onChange={(event) => updateSet(exercise.id, setIndex, "rest_seconds", event.target.value)} /></label>
                          </div>
                          <div className="routine-set-flags">
                            <label><input type="checkbox" checked={routineSet.is_warmup} onChange={(event) => updateSet(exercise.id, setIndex, "is_warmup", event.target.checked)} />워밍업</label>
                            <label><input type="checkbox" checked={routineSet.is_failure} onChange={(event) => updateSet(exercise.id, setIndex, "is_failure", event.target.checked)} />실패 지점</label>
                            <label><input type="checkbox" checked={routineSet.is_drop_set} onChange={(event) => updateSet(exercise.id, setIndex, "is_drop_set", event.target.checked)} />드롭 세트</label>
                            <label><input type="checkbox" checked={routineSet.is_super_set} onChange={(event) => updateSet(exercise.id, setIndex, "is_super_set", event.target.checked)} />슈퍼 세트</label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="routine-set-actions">
                      <button type="button" className="routine-add-set" onClick={() => addSet(exercise.id)}><Plus size={15} /> 세트 추가</button>
                      <button type="button" className="routine-remove-set" disabled={exercise.sets.length === 1} onClick={() => removeLastSet(exercise.id)}><Trash2 size={15} /> 세트 삭제</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {selected.length > 0 && <button type="button" className="routine-show-exercises" onClick={() => setShowExerciseCatalog(true)}>
              <Plus size={17} /> 운동 추가
            </button>}
          </section>
        )}

        {showExerciseCatalog && <section className="routine-exercises">
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
                    onClick={() => selectExercise(exercise)}
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
        </section>}
        {error && <p className="routine-error">{error}</p>}
        {isEditing && !showExerciseCatalog && (
          <button type="button" className="routine-delete" disabled={saving} onClick={handleDeleteRoutine}>
            <Trash2 size={16} /> 루틴 삭제
          </button>
        )}
      </main>

    </div>
  );
}

function createDefaultSet(setNumber: number, defaultWeight: number | null = null): RoutineSet {
  return {
    set_number: setNumber,
    target_weight: defaultWeight,
    target_reps: null,
    target_duration: null,
    target_distance: null,
    rest_seconds: 90,
    is_warmup: false,
    is_failure: false,
    is_drop_set: false,
    is_super_set: false,
  };
}

function serializeForm(name: string, selected: SelectedRoutineExercise[]) {
  return JSON.stringify({ name, selected });
}
