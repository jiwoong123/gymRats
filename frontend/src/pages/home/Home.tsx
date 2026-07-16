import { useNavigate } from "react-router";
import { Flame, Dumbbell, ChevronRight, Plus, Zap, Trophy } from "lucide-react";
import "./Home.css";
import { useDashboard } from "../../hooks/useDashboard";

const DAY_LABELS: Record<string, string> = {
  Mon: "월",
  Tue: "화",
  Wed: "수",
  Thu: "목",
  Fri: "금",
  Sat: "토",
  Sun: "일",
};

const QUICK_EMOJIS = ["💪", "🏋️", "🦵", "🔥"];

function formatVolume(volume: number) {
  return (volume / 1000).toFixed(1);
}

function formatWorkoutDate(value: string) {
  const workoutDate = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysAgo = Math.round((today.getTime() - workoutDate.getTime()) / 86_400_000);

  if (daysAgo === 0) return "오늘";
  if (daysAgo === 1) return "어제";
  if (daysAgo > 1 && daysAgo < 7) return `${daysAgo}일 전`;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(workoutDate);
}

export default function Home() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useDashboard();
  const hour = new Date().getHours();
  const greeting = hour < 12
    ? "좋은 아침이에요"
    : hour < 18
      ? "안녕하세요"
      : "오늘도 수고했어요";

  if (isPending) {
    return <div className="home-status">홈 정보를 불러오는 중...</div>;
  }

  if (isError || !data) {
    return (
      <div className="home-status">
        <p>홈 정보를 불러오지 못했어요.</p>
        <button type="button" onClick={() => refetch()}>다시 시도</button>
      </div>
    );
  }

  const maxDailyVolume = Math.max(
    ...data.weekly_activity.map((activity) => activity.volume),
    1,
  );
  const weeklyStats = [
    { label: "운동", value: String(data.weekly_summary.workout_days), unit: "일" },
    { label: "볼륨", value: formatVolume(data.weekly_summary.volume), unit: "T" },
    { label: "세트", value: String(data.weekly_summary.sets), unit: "세트" },
  ];

  return (
    <div className="home-page">
      <div className="home-header">
        <div>
          <p className="home-greeting">{greeting} 👋</p>
          <h1 className="home-name">{data.user.nickname}<span>님</span></h1>
        </div>
        <div className="streak-badge">
          <Flame size={16} className="streak-fire" />
          <span className="streak-count">{data.streak}</span>
          <span className="streak-label">연속</span>
        </div>
      </div>

      <div className="weekly-card">
        <div className="weekly-top">
          <span className="section-label">이번 주</span>
          <ChevronRight size={14} style={{ color: "#7070a0" }} />
        </div>
        <div className="weekly-stats">
          {weeklyStats.map((stat) => (
            <div key={stat.label} className="weekly-stat">
              <span className="weekly-stat-value">
                {stat.value}<span className="weekly-stat-unit">{stat.unit}</span>
              </span>
              <span className="weekly-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="weekly-bars">
          {data.weekly_activity.map((activity) => {
            const height = (activity.volume / maxDailyVolume) * 100;
            return (
              <div key={activity.day} className="weekly-bar-wrap">
                <div className="weekly-bar-bg" title={`${activity.volume.toLocaleString()} kg`}>
                  <div
                    className="weekly-bar-fill"
                    style={{ height: `${height}%`, opacity: activity.volume === 0 ? 0.15 : 1 }}
                  />
                </div>
                <span className="weekly-bar-day">{DAY_LABELS[activity.day] ?? activity.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <span className="section-label">빠른 시작</span>
          <Zap size={14} style={{ color: "#c8ff00" }} />
        </div>
        {data.quick_workouts.length > 0 ? (
          <div className="quick-grid">
            {data.quick_workouts.map((workout, index) => (
              <button
                key={workout.routine_id}
                className="quick-btn"
                onClick={() => navigate(`/records/workouts?routine_id=${workout.routine_id}`)}
              >
                <span className="quick-emoji">{QUICK_EMOJIS[index % QUICK_EMOJIS.length]}</span>
                <span className="quick-label">{workout.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="home-empty">저장된 루틴이 없어요.</p>
        )}
        <button className="start-btn" onClick={() => navigate("/records/workouts")}>
          <Plus size={20} />
          빈 운동 시작하기
        </button>
      </div>

      <div className="section">
        <div className="section-header">
          <span className="section-label">최근 운동</span>
          <button className="see-all-btn" onClick={() => navigate("/records/workouts")}>
            전체보기 <ChevronRight size={13} />
          </button>
        </div>
        {data.recent_workouts.length > 0 ? (
          <div className="recent-list">
            {data.recent_workouts.map((workout) => (
              <div key={workout.id} className="recent-item">
                <div className="recent-icon"><Dumbbell size={18} /></div>
                <div className="recent-info">
                  <p className="recent-name">{workout.name}</p>
                  <p className="recent-meta">
                    {formatWorkoutDate(workout.performed_at)} · {workout.duration}분
                  </p>
                </div>
                <div className="recent-volume">
                  <span className="recent-vol-num">{formatVolume(workout.volume)}</span>
                  <span className="recent-vol-unit">T</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="home-empty">아직 완료한 운동이 없어요.</p>
        )}
      </div>

      {data.latest_pr && (
        <div className="pr-banner">
          <Trophy size={18} style={{ color: "#c8ff00" }} />
          <div>
            <p className="pr-label">최근 신기록</p>
            <p className="pr-value">
              {data.latest_pr.exercise} <strong>{data.latest_pr.weight.toLocaleString()}kg</strong>
            </p>
          </div>
          <ChevronRight size={16} style={{ color: "#7070a0" }} />
        </div>
      )}
    </div>
  );
}
