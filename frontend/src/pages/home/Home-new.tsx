import { useNavigate } from "react-router";
import { Flame, Dumbbell, ChevronRight, Plus, Zap, Trophy } from "lucide-react";
import "./Home.css";
import { useDashboard } from "../../hooks/useDashboard";
import { useAuth } from "../../hooks/useAuth";

export default function Home() {
  const navigate = useNavigate();
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? "좋은 아침이에요" : hour < 18 ? "안녕하세요" : "오늘도 수고했어요";
  const {user} = useAuth();

  return (
    <div className="home-page">
      {/* Header */}
      <div className="home-header">
        <div>
          <p className="home-greeting">{greeting} 👋</p>
          <h1 className="home-name">{user?.nickname}<span>님</span></h1>
        </div>
        <div className="streak-badge">
          <Flame size={16} className="streak-fire" />
          <span className="streak-count">12</span>
          <span className="streak-label">연속</span>
        </div>
      </div>

      {/* Weekly summary */}
      
      {/* Quick start */}
      <div className="section">
        <div className="section-header">
          <span className="section-label">빠른 시작</span>
          <Zap size={14} style={{ color: "#c8ff00" }} />
        </div>
        <div className="quick-grid">
          {QUICK_WORKOUTS.map((w) => (
            <button
              key={w.label}
              className="quick-btn"
              onClick={() => navigate("/records/workouts")}
            >
              <span className="quick-emoji">{w.emoji}</span>
              <span className="quick-label">{w.label}</span>
            </button>
          ))}
        </div>
        <button
          className="start-btn"
          onClick={() => navigate("/records/workouts")}
        >
          <Plus size={20} />
          빈 운동 시작하기
        </button>
      </div>

      {/* Recent workouts */}
      <div className="section">
        <div className="section-header">
          <span className="section-label">최근 운동</span>
          <button
            className="see-all-btn"
            onClick={() => navigate("/records/workouts")}
          >
            전체보기 <ChevronRight size={13} />
          </button>
        </div>
        <div className="recent-list">
          {RECENT_WORKOUTS.map((w) => (
            <div key={w.date} className="recent-item">
              <div className="recent-icon">
                <Dumbbell size={18} />
              </div>
              <div className="recent-info">
                <p className="recent-name">{w.name}</p>
                <p className="recent-meta">{w.date} · {w.duration}분</p>
              </div>
              <div className="recent-volume">
                <span className="recent-vol-num">{(w.volume / 1000).toFixed(1)}</span>
                <span className="recent-vol-unit">T</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PR highlight */}
      <div className="pr-banner">
        <Trophy size={18} style={{ color: "#c8ff00" }} />
        <div>
          <p className="pr-label">이번 주 신기록</p>
          <p className="pr-value">데드리프트 <strong>202.5kg</strong></p>
        </div>
        <ChevronRight size={16} style={{ color: "#7070a0" }} />
      </div>
    </div>
  );
}
