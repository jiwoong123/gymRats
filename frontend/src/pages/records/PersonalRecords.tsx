import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  Dumbbell,
  LoaderCircle,
  Search,
  Trophy,
  X,
} from "lucide-react";
import {
  getPersonalRecordExercise,
  getPersonalRecordExercises,
} from "../../api/personalRecord";
import "./PersonalRecords.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="pr-history-state">
      <LoaderCircle className="pr-history-spin" />
      {label}
    </div>
  );
}

export default function PersonalRecords() {
  const [search, setSearch] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const exercises = useQuery({
    queryKey: ["personal-record-exercises"],
    queryFn: getPersonalRecordExercises,
  });
  const detail = useQuery({
    queryKey: ["personal-record-exercise", selectedExerciseId],
    queryFn: () => getPersonalRecordExercise(selectedExerciseId!),
    enabled: selectedExerciseId !== null,
  });

  const filteredExercises = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    if (!keyword) return exercises.data ?? [];
    return (exercises.data ?? []).filter((item) =>
      item.exercise.toLocaleLowerCase().includes(keyword),
    );
  }, [exercises.data, search]);

  if (selectedExerciseId !== null) {
    return (
      <div className="pr-history-page">
        <button
          type="button"
          className="pr-detail-back"
          onClick={() => setSelectedExerciseId(null)}
        >
          <ArrowLeft size={18} /> 운동별 기록
        </button>

        {detail.isPending ? (
          <LoadingState label="상세 기록을 불러오는 중..." />
        ) : detail.isError || !detail.data ? (
          <div className="pr-history-state">
            <p>상세 기록을 불러오지 못했습니다.</p>
            <button type="button" onClick={() => detail.refetch()}>다시 시도</button>
          </div>
        ) : (
          <>
            <header className="pr-detail-header">
              <div className="pr-history-mark"><Dumbbell size={22} /></div>
              <div>
                <p>EXERCISE RECORDS</p>
                <h1>{detail.data.exercise}</h1>
                <span>총 {detail.data.items.length}개의 신기록</span>
              </div>
            </header>

            <section className="pr-best-card">
              <div>
                <span>PERSONAL BEST</span>
                <p>현재 최고 기록</p>
              </div>
              <strong>{detail.data.best_weight.toLocaleString()}<small>kg 추정 1RM</small></strong>
            </section>

            <div className="pr-detail-list">
              {detail.data.items.map((record, index) => (
                <article className="pr-detail-item" key={record.id}>
                  <div className="pr-detail-rank">{detail.data.items.length - index}</div>
                  <div className="pr-history-info">
                    <h2>추정 1RM {record.weight.toLocaleString()}kg 달성</h2>
                    <time dateTime={record.achieved_at}>{formatDate(record.achieved_at)}</time>
                  </div>
                  {record.weight === detail.data.best_weight && (
                    <span className="pr-best-badge"><Trophy size={12} /> BEST</span>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pr-history-page">
      <header className="pr-history-header">
        <div>
          <p>PERSONAL BEST</p>
          <h1>운동별 신기록</h1>
        </div>
        <div className="pr-history-mark"><Trophy size={22} /></div>
      </header>

      <label className="pr-search">
        <Search size={18} />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="운동 이름 검색"
          aria-label="운동 이름 검색"
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} aria-label="검색어 지우기">
            <X size={16} />
          </button>
        )}
      </label>

      {exercises.isPending ? (
        <LoadingState label="기록을 불러오는 중..." />
      ) : exercises.isError ? (
        <div className="pr-history-state">
          <p>신기록을 불러오지 못했습니다.</p>
          <button type="button" onClick={() => exercises.refetch()}>다시 시도</button>
        </div>
      ) : exercises.data?.length === 0 ? (
        <div className="pr-history-state">
          <Trophy size={32} />
          <p>아직 달성한 신기록이 없습니다.</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="pr-history-state pr-search-empty">
          <Search size={28} />
          <p>“{search}”에 해당하는 운동이 없습니다.</p>
        </div>
      ) : (
        <div className="pr-exercise-list">
          <p className="pr-result-count">{filteredExercises.length}개 운동</p>
          {filteredExercises.map((exercise) => (
            <button
              type="button"
              className="pr-exercise-item"
              key={exercise.exercise_id}
              onClick={() => setSelectedExerciseId(exercise.exercise_id)}
            >
              <div className="pr-history-icon"><Dumbbell size={17} /></div>
              <div className="pr-history-info">
                <h2>{exercise.exercise}</h2>
                <time dateTime={exercise.latest_achieved_at}>
                  최근 기록 {formatDate(exercise.latest_achieved_at)} · {exercise.record_count}회
                </time>
              </div>
              <p className="pr-history-weight">
                {exercise.best_weight.toLocaleString()}<span>kg 1RM</span>
              </p>
              <ChevronRight size={17} className="pr-exercise-chevron" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
