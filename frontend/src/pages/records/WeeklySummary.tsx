import { useQuery } from "@tanstack/react-query";
import { BarChart3, ChevronLeft, ChevronRight, Clock3, Dumbbell, Layers3, LoaderCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { getWeeklySummary } from "../../api/weeklySummary";
import "./WeeklySummary.css";

const BODY_PART_LABELS: Record<number, string> = {
  1: "가슴",
  2: "등",
  3: "어깨",
  4: "이두",
  5: "삼두",
  6: "전완",
  7: "하체",
  8: "코어",
};

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftWeek(value: string, amount: number) {
  const date = parseDate(value);
  date.setDate(date.getDate() + amount * 7);
  return toDateValue(date);
}

function formatRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" });
  return `${formatter.format(parseDate(start))} – ${formatter.format(parseDate(end))}`;
}

function formatVolume(volume: number) {
  return `${(volume / 1000).toFixed(1)}T`;
}

export default function WeeklySummary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedWeek = searchParams.get("week_start") ?? undefined;
  const summary = useQuery({
    queryKey: ["weekly-summary", requestedWeek],
    queryFn: () => getWeeklySummary(requestedWeek),
  });

  function changeWeek(amount: number) {
    if (!summary.data) return;
    setSearchParams({ week_start: shiftWeek(summary.data.week_start, amount) });
  }

  if (summary.isPending) {
    return <div className="weekly-summary-state"><LoaderCircle className="weekly-summary-spin" />주간 요약을 불러오는 중...</div>;
  }

  if (summary.isError || !summary.data) {
    return (
      <div className="weekly-summary-state">
        <p>주간 요약을 불러오지 못했습니다.</p>
        <button type="button" onClick={() => summary.refetch()}>다시 시도</button>
      </div>
    );
  }

  const data = summary.data;
  const maxDailyVolume = Math.max(...data.daily_activity.map((item) => item.volume), 1);
  const maxBodyPartVolume = Math.max(...data.body_parts.map((item) => item.volume), 1);

  return (
    <div className="weekly-summary-page">
      <div className="weekly-summary-heading">
        <p>WEEKLY REPORT</p>
        <h1>주간 운동 요약</h1>
      </div>

      <div className="week-picker">
        <button type="button" onClick={() => changeWeek(-1)} aria-label="이전 주"><ChevronLeft size={18} /></button>
        <strong>{formatRange(data.week_start, data.week_end)}</strong>
        <button type="button" onClick={() => changeWeek(1)} aria-label="다음 주"><ChevronRight size={18} /></button>
      </div>

      <section className="summary-stat-grid">
        <div><Dumbbell size={16} /><strong>{data.totals.workout_days}</strong><span>운동 일수</span></div>
        <div><BarChart3 size={16} /><strong>{formatVolume(data.totals.volume)}</strong><span>총 볼륨</span></div>
        <div><Layers3 size={16} /><strong>{data.totals.sets}</strong><span>완료 세트</span></div>
        <div><Clock3 size={16} /><strong>{data.totals.duration_minutes}</strong><span>운동 시간(분)</span></div>
      </section>

      <section className="weekly-report-card">
        <h2>요일별 볼륨</h2>
        <div className="summary-bars">
          {data.daily_activity.map((activity, index) => (
            <div className="summary-bar-column" key={activity.date}>
              <div className="summary-bar-track" title={`${activity.volume.toLocaleString()} kg`}>
                <div
                  className="summary-bar-value"
                  style={{ height: `${(activity.volume / maxDailyVolume) * 100}%` }}
                />
              </div>
              <span>{DAY_LABELS[index]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="weekly-report-card">
        <h2>부위별 비중</h2>
        {data.body_parts.length === 0 ? <p className="weekly-summary-empty">완료한 세트가 없습니다.</p> : (
          <div className="body-part-list">
            {data.body_parts.map((item) => (
              <div className="body-part-row" key={item.body_part}>
                <div><strong>{BODY_PART_LABELS[item.body_part] ?? "기타"}</strong><span>{item.sets}세트</span></div>
                <div className="body-part-track"><div style={{ width: `${(item.volume / maxBodyPartVolume) * 100}%` }} /></div>
                <span>{formatVolume(item.volume)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="weekly-report-card">
        <h2>운동별 요약</h2>
        {data.exercises.length === 0 ? <p className="weekly-summary-empty">이번 주 운동 기록이 없습니다.</p> : (
          <div className="exercise-summary-list">
            {data.exercises.map((exercise) => (
              <article key={exercise.exercise_id}>
                <div>
                  <h3>{exercise.name}</h3>
                  <p>{exercise.sets}세트 · {exercise.reps}회</p>
                </div>
                <div>
                  <strong>{formatVolume(exercise.volume)}</strong>
                  <span>최고 {exercise.max_weight.toLocaleString()}kg</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
