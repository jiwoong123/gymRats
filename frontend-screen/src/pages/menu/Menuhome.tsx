import { useState } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronRight, Gauge, ListChecks, LoaderCircle, LogOut, Moon, Pencil, Sun, User, X } from "lucide-react";
import * as authApi from "../../api/authApi";
import type { TrainingLevel } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import { applyAppearance, getStoredAppearance, type AppearanceMode } from "../../utils/appearance";
import "./Menuhome.css";

const TRAINING_LEVELS: { value: TrainingLevel; label: string; description: string }[] = [
  { value: "untrained", label: "입문 전", description: "웨이트 트레이닝 경험이 거의 없어요." },
  { value: "novice", label: "초급", description: "기본 동작과 운동 습관을 익히는 단계예요." },
  { value: "intermediate", label: "중급", description: "꾸준한 훈련 경험과 안정적인 자세가 있어요." },
  { value: "advanced", label: "고급", description: "장기간 체계적으로 훈련하고 있어요." },
  { value: "elite", label: "엘리트", description: "경기 수준의 전문적인 훈련 경험이 있어요." },
];

function formatMembershipDuration(createdAt: string) {
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return "";
  const days = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / 86_400_000) + 1);
  return `GymRats와 함께한 지 ${days.toLocaleString()}일`;
}

export default function MenuHome() {
  const navigate = useNavigate();
  const { user, isLoading, logout, refreshUser } = useAuth();
  const [appearance, setAppearance] = useState<AppearanceMode>(getStoredAppearance);
  const [trainingLevelOpen, setTrainingLevelOpen] = useState(false);
  const [trainingLevel, setTrainingLevel] = useState<TrainingLevel>(user?.training_level ?? "untrained");
  const [savingLevel, setSavingLevel] = useState(false);
  const [levelError, setLevelError] = useState("");

  function changeAppearance(mode: AppearanceMode) {
    setAppearance(mode);
    applyAppearance(mode);
  }

  async function handleLogout() {
    if (isLoading) return;
    await logout();
    navigate("/login", { replace: true });
  }

  async function saveTrainingLevel() {
    setSavingLevel(true);
    setLevelError("");
    try {
      await authApi.updateMe({ training_level: trainingLevel });
      await refreshUser();
      setTrainingLevelOpen(false);
    } catch {
      setLevelError("운동 수준을 저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setSavingLevel(false);
    }
  }

  return (
    <div className="menu-page">
      <header className="menu-header">
        <div><p>MY ACCOUNT</p><h1>내 정보</h1></div>
        <div className="menu-header-mark" aria-hidden="true"><User size={22} /></div>
      </header>

      <section className="profile-account-card">
        <div className="profile-card">
          <div className="profile-avatar"><User size={28} /></div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.nickname}</h2>
            <p className="profile-email">{user?.email}</p>
            {user?.created_at && <p className="profile-since">{formatMembershipDuration(user.created_at)}</p>}
          </div>
          <button type="button" className="profile-edit" onClick={() => navigate("/menu/account")}>
            <Pencil size={14} /> 계정 관리
          </button>
        </div>
      </section>

      <section className="menu-section">
        <p className="menu-section-title">운동 설정</p>
        <div className="menu-items">
          <button type="button" className="menu-item" onClick={() => navigate("/routine")}>
            <span className="menu-item-icon"><ListChecks size={18} /></span>
            <span className="menu-item-label">루틴 관리</span>
            <ChevronRight size={17} className="menu-item-chevron" />
          </button>
          <button type="button" className="menu-item" onClick={() => {
            setTrainingLevel(user?.training_level ?? "untrained");
            setLevelError("");
            setTrainingLevelOpen(true);
          }}>
            <span className="menu-item-icon"><Gauge size={18} /></span>
            <span className="menu-item-label">
              운동 수준 변경
              <small>{TRAINING_LEVELS.find((level) => level.value === user?.training_level)?.label ?? "입문 전"}</small>
            </span>
            <ChevronRight size={17} className="menu-item-chevron" />
          </button>
        </div>
      </section>

      <section className="menu-section">
        <p className="menu-section-title">화면 설정</p>
        <div className="theme-panel">
          <div className="theme-panel-heading">
            <span className="menu-item-icon">{appearance === "dark" ? <Moon size={18} /> : <Sun size={18} />}</span>
            <div><strong>화면 모드</strong><small>어두운 화면과 밝은 화면을 전환합니다.</small></div>
          </div>
          <div className="theme-options" role="radiogroup" aria-label="화면 모드">
            <button type="button" role="radio" aria-checked={appearance === "dark"} className={appearance === "dark" ? "selected" : ""} onClick={() => changeAppearance("dark")}>
              <Moon size={15} /><span>다크 모드</span>{appearance === "dark" && <Check className="mode-check" size={14} />}
            </button>
            <button type="button" role="radio" aria-checked={appearance === "light"} className={appearance === "light" ? "selected" : ""} onClick={() => changeAppearance("light")}>
              <Sun size={15} /><span>라이트 모드</span>{appearance === "light" && <Check className="mode-check" size={14} />}
            </button>
          </div>
        </div>
      </section>

      <button type="button" className="logout-btn" onClick={handleLogout} disabled={isLoading}>
        <LogOut size={16} /> 로그아웃
      </button>

      {trainingLevelOpen && (
        <div className="training-level-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !savingLevel) setTrainingLevelOpen(false);
        }}>
          <section className="training-level-dialog" role="dialog" aria-modal="true" aria-labelledby="training-level-title">
            <header>
              <div><p>WORKOUT LEVEL</p><h2 id="training-level-title">운동 수준 변경</h2></div>
              <button type="button" aria-label="닫기" disabled={savingLevel} onClick={() => setTrainingLevelOpen(false)}><X size={18} /></button>
            </header>
            <div className="training-level-options" role="radiogroup" aria-label="운동 수준">
              {TRAINING_LEVELS.map((level) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={trainingLevel === level.value}
                  className={trainingLevel === level.value ? "selected" : ""}
                  key={level.value}
                  onClick={() => setTrainingLevel(level.value)}
                >
                  <span><strong>{level.label}</strong><small>{level.description}</small></span>
                  {trainingLevel === level.value && <Check size={16} />}
                </button>
              ))}
            </div>
            {levelError && <p className="training-level-error" role="alert">{levelError}</p>}
            <button type="button" className="training-level-save" disabled={savingLevel} onClick={saveTrainingLevel}>
              {savingLevel ? <LoaderCircle className="menu-spin" size={16} /> : <Check size={16} />} 저장
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
