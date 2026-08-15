import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  Dumbbell,
  Info,
  LoaderCircle,
  Search,
  Trophy,
  X,
} from "lucide-react";
import {
  getPersonalRecordExercise,
  getPersonalRecordExercises,
  type PersonalRecordExerciseDetail,
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

const RECORD_LABELS = {
  1: "실제 최고 중량",
  2: "최고 세트 볼륨",
  3: "추정 1RM",
} as const;

function getBestValue(detail: PersonalRecordExerciseDetail, recordType: 1 | 2 | 3) {
  if (recordType === 1) return detail.best_weight;
  if (recordType === 2) return detail.best_volume;
  return detail.best_estimated_1rm;
}

export default function PersonalRecords() {
  const [search, setSearch] = useState("");
  const [showEstimateInfo, setShowEstimateInfo] = useState(false);
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

  useEffect(() => {
    if (!showEstimateInfo) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowEstimateInfo(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showEstimateInfo]);

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

            <section className="pr-best-grid">
              {([1, 2, 3] as const).map((recordType) => {
                const value = getBestValue(detail.data, recordType);
                return value === null ? null : (
                  <div className={`pr-best-card record-type-${recordType}`} key={recordType}>
                    <div>
                      <span>PERSONAL BEST</span>
                      <p>{RECORD_LABELS[recordType]}</p>
                    </div>
                    <strong>{value.toLocaleString()}<small>kg</small></strong>
                  </div>
                );
              })}
            </section>

            <div className="pr-detail-list">
              {detail.data.items.map((record, index) => {
                const bestValue = getBestValue(detail.data, record.record_type);
                return (
                  <article className={`pr-detail-item record-type-${record.record_type}`} key={record.id}>
                    <div className="pr-detail-rank">{detail.data.items.length - index}</div>
                    <div className="pr-history-info">
                      <h2>{RECORD_LABELS[record.record_type]} {record.value.toLocaleString()}kg 달성</h2>
                      <time dateTime={record.achieved_at}>{formatDate(record.achieved_at)}</time>
                    </div>
                    {record.value === bestValue && (
                      <span className="pr-best-badge"><Trophy size={12} /> BEST</span>
                    )}
                  </article>
                );
              })}
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
          <div className="pr-title-row">
            <h1>운동별 신기록</h1>
            <button
              type="button"
              className="pr-info-button"
              aria-label="추정 1RM 계산 및 해석 방법 보기"
              aria-haspopup="dialog"
              onClick={() => setShowEstimateInfo(true)}
            >
              <Info size={17} />
            </button>
          </div>
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
                 {formatDate(exercise.latest_achieved_at)} 갱신
                </time>
              </div>
              <div className="pr-summary-records">
                {exercise.best_weight !== null && <span className="record-type-1">중량 <strong>{exercise.best_weight.toLocaleString()}kg</strong></span>}
                {exercise.best_volume !== null && <span className="record-type-2">볼륨 <strong>{exercise.best_volume.toLocaleString()}kg</strong></span>}
                {exercise.best_estimated_1rm !== null && <span className="record-type-3">1RM <strong>{exercise.best_estimated_1rm.toLocaleString()}kg</strong></span>}
              </div>
              <ChevronRight size={17} className="pr-exercise-chevron" />
            </button>
          ))}
        </div>
      )}
      {showEstimateInfo && (
        <div
          className="pr-info-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowEstimateInfo(false);
          }}
        >
          <section
            className="pr-info-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pr-info-title"
          >
            <header>
              <div className="pr-info-heading-icon"><Info size={18} /></div>
              <div>
                <p>ESTIMATED ONE-REP MAX</p>
                <h2 id="pr-info-title">추정 1RM 안내</h2>
              </div>
              <button type="button" aria-label="안내 닫기" onClick={() => setShowEstimateInfo(false)}>
                <X size={18} />
              </button>
            </header>

            <div className="pr-info-content">
              <section>
                <h3>어떻게 계산하나요?</h3>
                <p>완료한 세트의 중량과 반복 수를 Epley 공식에 적용하고 0.1kg 단위로 반올림합니다.</p>
                <div className="pr-formula">
                  <span>추정 1RM</span>
                  <strong>중량 × (1 + 반복 수 ÷ 30)</strong>
                </div>
                <p className="pr-formula-example">예: 100kg을 5회 완료 → 100 × (1 + 5 ÷ 30) = 약 116.7kg</p>
              </section>

              <section>
                <h3>어떻게 해석하면 좋나요?</h3>
                <ul>
                  <li><strong>절대값보다 추세</strong>를 보세요. 같은 운동과 비슷한 자세·가동범위에서 이전 기록과 비교하는 것이 가장 유용합니다.</li>
                  <li>반복 수가 많아질수록 오차가 커질 수 있어, 가능하면 <strong>약 3–10회 세트</strong>를 기준으로 비교하세요.</li>
                  <li>컨디션, 자세, 장비에 따라 달라지므로 실제 1회 최대 중량이나 반드시 들어야 할 중량으로 해석하지 마세요.</li>
                </ul>
              </section>

              <section className="pr-training-guide">
                <h3>권장 활용법</h3>
                <p>안전한 훈련 계획에는 최고 추정치의 약 <strong>90%</strong>를 ‘훈련 최대치’로 잡고, 목적에 따라 그 값을 낮춰 사용하세요. 통증이나 자세 붕괴가 있으면 수치와 관계없이 중량을 낮추세요.</p>
              </section>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
