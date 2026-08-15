import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, CalendarDays, Clock3, Dumbbell, LoaderCircle } from "lucide-react";
import { getWorkoutStatistics } from "../../api/workout";
import "./Statistics.css";

const BODY_PART_LABELS: Record<number, string> = {
  1: "가슴",
  2: "등",
  3: "어깨",
  7: "하체",
  8: "코어",
  10: "팔",
  11: "유산소",
};

const BODY_PART_COLORS: Record<number, string> = {
  1: "#ff4d5e",
  2: "#ff9f43",
  3: "#ffd43b",
  7: "#57c7ff",
  8: "#3154c6",
  10: "#55c96b",
  11: "#9aa0aa",
};

function getFatigueLabel(fatigue: number) {
  if (fatigue >= 75) return "회복 필요";
  if (fatigue >= 40) return "피로 누적";
  if (fatigue > 0) return "회복 중";
  return "준비 완료";
}

function formatLastTrained(value: string | null) {
  if (!value) return "최근 기록 없음";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return "오늘 운동";
  if (days === 1) return "어제 운동";
  return `${days}일 전 운동`;
}

export default function Statistics() {
  const statistics = useQuery({
    queryKey: ["workout-statistics"],
    queryFn: getWorkoutStatistics,
  });

  if (statistics.isPending) {
    return <div className="statistics-state"><LoaderCircle className="statistics-spin" />통계를 분석하는 중...</div>;
  }

  if (statistics.isError || !statistics.data) {
    return (
      <div className="statistics-state">
        <p>운동 통계를 불러오지 못했습니다.</p>
        <button type="button" onClick={() => statistics.refetch()}>다시 시도</button>
      </div>
    );
  }

  const data = statistics.data;
  const maxWeeklySets = Math.max(...data.weekly.map((week) => week.completed_sets), 1);
  const maxBodyPartSets = Math.max(...data.body_parts.map((part) => part.completed_sets), 1);

  return (
    <div className="statistics-page">
      <header className="statistics-header">
        <div><p>WORKOUT INSIGHTS</p><h1>운동 통계</h1></div>
        <div className="statistics-mark"><BarChart3 size={23} /></div>
      </header>

      <section className="statistics-section">
        <div className="statistics-section-heading">
          <div><Activity size={17} /><h2>현재 근육 피로도</h2></div>
          <span>최근 72시간 기준</span>
        </div>
        <div className="fatigue-list">
          {data.muscle_fatigue.map((muscle) => (
            <article className="fatigue-item" key={muscle.body_part}>
              <div className="fatigue-top">
                <span className="fatigue-dot" style={{ background: BODY_PART_COLORS[muscle.body_part] }} />
                <strong>{BODY_PART_LABELS[muscle.body_part]}</strong>
                <small>{formatLastTrained(muscle.last_trained_at)}</small>
                <b>{muscle.fatigue}%</b>
              </div>
              <div className="fatigue-track">
                <span style={{ width: `${muscle.fatigue}%`, background: BODY_PART_COLORS[muscle.body_part] }} />
              </div>
              <p>{getFatigueLabel(muscle.fatigue)}</p>
            </article>
          ))}
        </div>
        <p className="fatigue-note">완료한 세트와 운동 후 경과 시간을 바탕으로 계산한 회복 참고 지표입니다.</p>
      </section>

      <section className="statistics-section">
        <div className="statistics-section-heading">
          <div><CalendarDays size={17} /><h2>최근 {data.period_days}일 요약</h2></div>
        </div>
        <div className="summary-grid">
          <article><Dumbbell size={16} /><strong>{data.sessions}</strong><span>운동 횟수</span></article>
          <article><CalendarDays size={16} /><strong>{data.active_days}</strong><span>운동한 날</span></article>
          <article><Activity size={16} /><strong>{data.completed_sets}</strong><span>완료 세트</span></article>
          <article><Clock3 size={16} /><strong>{data.average_duration}<small>분</small></strong><span>평균 시간</span></article>
        </div>
        <div className="volume-total"><span>총 운동 볼륨</span><strong>{data.total_volume.toLocaleString()}<small>kg</small></strong></div>
      </section>

      <section className="statistics-section">
        <div className="statistics-section-heading"><div><BarChart3 size={17} /><h2>주간 운동 추이</h2></div><span>완료 세트</span></div>
        <div className="weekly-chart">
          {data.weekly.map((week) => (
            <div className="weekly-column" key={week.week_start}>
              <strong>{week.completed_sets}</strong>
              <div><span style={{ height: `${week.completed_sets ? Math.max(6, week.completed_sets / maxWeeklySets * 100) : 0}%` }} /></div>
              <small>{new Date(`${week.week_start}T00:00:00`).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="statistics-section">
        <div className="statistics-section-heading"><div><Dumbbell size={17} /><h2>부위별 운동 비중</h2></div><span>최근 {data.period_days}일</span></div>
        {data.body_parts.length === 0 ? (
          <p className="statistics-empty">아직 분석할 운동 기록이 없습니다.</p>
        ) : (
          <div className="body-part-stats">
            {data.body_parts.map((part) => (
              <article key={part.body_part}>
                <div><strong>{BODY_PART_LABELS[part.body_part] ?? "기타"}</strong><span>{part.completed_sets}세트 · {part.volume.toLocaleString()}kg</span></div>
                <div className="body-part-track"><span style={{ width: `${part.completed_sets / maxBodyPartSets * 100}%`, background: BODY_PART_COLORS[part.body_part] ?? "#9aa0aa" }} /></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
