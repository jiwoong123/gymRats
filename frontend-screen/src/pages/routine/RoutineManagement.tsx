import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronRight, Dumbbell, LoaderCircle, Plus } from "lucide-react";
import { getRoutines, updateRoutineIcon, type Routine } from "../../api/routine";
import RoutineIcon, { ROUTINE_ICONS, type RoutineIconName } from "../../components/RoutineIcon";
import { getErrorMessage } from "../../utils/apiError";
import "./RoutineManagement.css";

export default function RoutineManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [iconPickerId, setIconPickerId] = useState<number | null>(null);
  const [savingIconId, setSavingIconId] = useState<number | null>(null);

  async function changeRoutineIcon(routineId: number, icon: RoutineIconName) {
    setSavingIconId(routineId);
    setError("");
    try {
      const updated = await updateRoutineIcon(routineId, icon);
      setRoutines((current) => current.map((routine) => routine.id === routineId ? updated : routine));
      await queryClient.invalidateQueries({ queryKey: ["home"], exact: true });
      setIconPickerId(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingIconId(null);
    }
  }

  async function loadRoutines() {
    setLoading(true);
    setError("");
    try {
      setRoutines(await getRoutines());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getRoutines()
      .then(setRoutines)
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="routine-manage-page">
      <header className="routine-manage-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기"><ArrowLeft size={21} /></button>
        <div><p>MY ROUTINES</p><h1>루틴 관리</h1></div>
        <button type="button" className="routine-manage-add" onClick={() => navigate("/routine/new")}><Plus size={17} /> 추가</button>
      </header>

      {loading ? (
        <div className="routine-manage-state"><LoaderCircle className="routine-spin" size={26} />루틴을 불러오는 중...</div>
      ) : error && routines.length === 0 ? (
        <div className="routine-manage-state"><p>{error}</p><button type="button" onClick={loadRoutines}>다시 시도</button></div>
      ) : routines.length === 0 ? (
        <div className="routine-manage-empty">
          <Dumbbell size={30} />
          <h2>아직 만든 루틴이 없어요</h2>
          <p>자주 하는 운동을 루틴으로 만들어 보세요.</p>
          <button type="button" onClick={() => navigate("/routine/new")}><Plus size={17} /> 새 루틴 만들기</button>
        </div>
      ) : (
        <main className="routine-manage-list">
          <p className="routine-manage-count">전체 {routines.length}개</p>
          {error && <p className="routine-manage-error">{error}</p>}
          {routines.map((routine) => (
            <article className="routine-manage-card" key={routine.id}>
              <button
                className="routine-manage-icon"
                type="button"
                aria-label={`${routine.name} 아이콘 변경`}
                aria-expanded={iconPickerId === routine.id}
                onClick={() => setIconPickerId((current) => current === routine.id ? null : routine.id)}
              >
                {savingIconId === routine.id ? <LoaderCircle className="routine-spin" size={20} /> : <RoutineIcon name={routine.icon} size={20} />}
              </button>
              <button className="routine-manage-main" type="button" onClick={() => navigate(`/routine/${routine.id}/edit`)}>
                <span className="routine-manage-info">
                  <strong>{routine.name}</strong>
                  <small>{routine.exercises.length}개 운동 · {routine.exercises.reduce((count, exercise) => count + exercise.sets.length, 0)}세트</small>
                  <span>{routine.exercises.map((exercise) => exercise.name_kr).join(" · ")}</span>
                </span>
                <ChevronRight size={18} />
              </button>
              {iconPickerId === routine.id && (
                <div className="routine-icon-picker" aria-label="루틴 아이콘 선택">
                  {ROUTINE_ICONS.map((icon) => (
                    <button
                      type="button"
                      className={routine.icon === icon ? "selected" : ""}
                      key={icon}
                      disabled={savingIconId === routine.id}
                      onClick={() => void changeRoutineIcon(routine.id, icon)}
                      aria-label={`${icon} 아이콘`}
                    >
                      <RoutineIcon name={icon} size={19} />
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </main>
      )}
    </div>
  );
}
