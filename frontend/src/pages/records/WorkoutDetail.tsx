import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Clock3, Dumbbell, LoaderCircle, RotateCcw, StickyNote } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { getWorkoutSessionDetail } from "../../api/workout";
import "./WorkoutDetail.css";

const BODY_PARTS: Record<number, string> = {
  1: "가슴", 2: "등", 3: "어깨", 4: "이두", 5: "삼두", 6: "전완", 7: "하체", 8: "코어",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function WorkoutDetail() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const id = Number(sessionId);
  const detail = useQuery({
    queryKey: ["workout-session-detail", id],
    queryFn: () => getWorkoutSessionDetail(id),
    enabled: Number.isInteger(id) && id > 0,
  });

  return (
    <div className="workout-detail-page">
      <button type="button" className="workout-detail-back" onClick={() => navigate("/records/workouts")}>
        <ArrowLeft size={19} /> 운동 기록
      </button>

      {!Number.isInteger(id) || id <= 0 || detail.isError ? (
        <div className="workout-detail-state">
          <p>운동 상세 기록을 불러오지 못했습니다.</p>
          <button type="button" onClick={() => detail.refetch()}>다시 시도</button>
        </div>
      ) : detail.isPending || !detail.data ? (
        <div className="workout-detail-state"><LoaderCircle className="workout-detail-spin" />상세 기록을 불러오는 중...</div>
      ) : (
        <>
          <header className="workout-detail-header">
            <p>{formatDate(detail.data.performed_at)}</p>
            <h1>{detail.data.name}</h1>
            <span>{formatTime(detail.data.performed_at)} – {formatTime(detail.data.ended_at)}</span>
          </header>

          <section className="workout-detail-summary">
            <div><Clock3 size={17} /><strong>{detail.data.duration}</strong><span>분</span></div>
            <div><Dumbbell size={17} /><strong>{(detail.data.volume / 1000).toFixed(1)}</strong><span>톤</span></div>
            <div><Check size={17} /><strong>{detail.data.completed_sets}</strong><span>세트</span></div>
          </section>

          <div className="workout-detail-heading">
            <span>운동 상세</span><small>{detail.data.exercises.length}개 운동</small>
          </div>

          {detail.data.exercises.length === 0 ? (
            <div className="workout-detail-empty">저장된 운동이 없습니다.</div>
          ) : (
            <div className="workout-detail-exercises">
              {detail.data.exercises.map((exercise) => (
                <article className="workout-detail-exercise" key={exercise.exercise_id}>
                  <header>
                    <div><span>{BODY_PARTS[exercise.body_part] ?? "운동"}</span><h2>{exercise.name_kr}</h2></div>
                    <p>{(exercise.volume / 1000).toFixed(1)}T</p>
                  </header>
                  <div className="workout-detail-set-head"><span>세트</span><span>무게</span><span>횟수</span><span>볼륨</span></div>
                  {exercise.sets.map((set) => (
                    <div className={`workout-detail-set${set.completed ? " completed" : ""}`} key={set.set_number}>
                      <span>{set.is_warmup ? "W" : set.set_number}</span>
                      <strong>{set.weight?.toLocaleString() ?? "–"}<small>kg</small></strong>
                      <strong>{set.reps?.toLocaleString() ?? "–"}<small>회</small></strong>
                      <strong>{set.completed ? set.volume.toLocaleString() : "–"}<small>{set.completed ? "kg" : ""}</small></strong>
                    </div>
                  ))}
                  <footer><RotateCcw size={13} /> 휴식 {exercise.rest_seconds}초 · 완료 {exercise.completed_sets}세트</footer>
                </article>
              ))}
            </div>
          )}

          {detail.data.memo && (
            <section className="workout-detail-memo"><div><StickyNote size={16} /> 메모</div><p>{detail.data.memo}</p></section>
          )}
        </>
      )}
    </div>
  );
}
