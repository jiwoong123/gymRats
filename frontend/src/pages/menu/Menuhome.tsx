import { useNavigate } from "react-router";
import {
  User,
  Trophy,
  Bell,
  ChevronRight,
  LogOut,
  Target,
  BarChart3,
  Shield,
  HelpCircle,
  Dumbbell,
} from "lucide-react";
import "./Menuhome.css";
import { useAuth } from "../../hooks/useAuth";

const MENU_SECTIONS = [
  {
    title: "나의 기록",
    items: [
      { icon: <Trophy size={18} />, label: "개인 기록 (PR)", color: "#c8ff00" },
      { icon: <BarChart3 size={18} />, label: "운동 통계", color: "#00e5ff" },
      { icon: <Target size={18} />, label: "목표 설정", color: "#a855f7" },
    ],
  },
  {
    title: "설정",
    items: [
      { icon: <Bell size={18} />, label: "알림 설정", color: "#ff6b35" },
      { icon: <Dumbbell size={18} />, label: "운동 관리", color: "#f59e0b" },
      { icon: <Shield size={18} />, label: "개인정보 보호", color: "#7070a0" },
    ],
  },
  {
    title: "지원",
    items: [
      { icon: <HelpCircle size={18} />, label: "도움말", color: "#7070a0" },
    ],
  },
];

const ACHIEVEMENTS = [
  { emoji: "🔥", label: "12일 연속", sub: "최고 기록!" },
  { emoji: "💯", label: "100회 운동", sub: "달성" },
  { emoji: "🏆", label: "3개 PR", sub: "이번 달" },
];

export default function MenuHome() {
  const navigate = useNavigate();
  const {isLoading, logout} = useAuth();

  
  async function handleLogout() {
    if (isLoading) return;
    try{
      logout();
    } finally{
    navigate("/login", { replace: true });}
  }

  return (
    <div className="menu-page">
      {/* Profile */}
      <div className="profile-card">
        <div className="profile-avatar">
          <User size={30} />
        </div>
        <div className="profile-info">
          <h2 className="profile-name">김민준</h2>
          <p className="profile-email">minjun.kim@example.com</p>
          <p className="profile-since">2025.01.15부터 시작 · 182일</p>
        </div>
        <button className="profile-edit">편집</button>
      </div>

      {/* Achievements */}
      <div className="achievements">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.label} className="achievement-item">
            <span className="ach-emoji">{a.emoji}</span>
            <span className="ach-label">{a.label}</span>
            <span className="ach-sub">{a.sub}</span>
          </div>
        ))}
      </div>

      {/* Menu sections */}
      {MENU_SECTIONS.map((section) => (
        <div key={section.title} className="menu-section">
          <p className="menu-section-title">{section.title}</p>
          <div className="menu-items">
            {section.items.map((item) => (
              <button key={item.label} className="menu-item">
                <span className="menu-item-icon" style={{ color: item.color, background: `${item.color}18` }}>
                  {item.icon}
                </span>
                <span className="menu-item-label">{item.label}</span>
                <ChevronRight size={16} className="menu-item-arrow" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={16} />
        로그아웃
      </button>

      <p className="version-text">LiftLog v1.0.0</p>
    </div>
  );
}
