import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Check, KeyRound, LoaderCircle, LogOut, Moon, Pencil, Sun, Trash2, User, X } from "lucide-react";
import * as authApi from "../../api/authApi";
import { tokenStorage } from "../../auth/token";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/apiError";
import { applyAppearance, getStoredAppearance, type AppearanceMode } from "../../utils/appearance";
import PasswordChangeModal from "./PasswordChangeModal";
import "./Menuhome.css";

function formatMembershipDuration(createdAt: string) {
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return "";
  const days = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / 86_400_000) + 1);
  return `GymRats와 함께한 지 ${days.toLocaleString()}일`;
}

export default function MenuHome() {
  const navigate = useNavigate();
  const { user, isLoading, logout, refreshUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [height, setHeight] = useState(user?.height?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [appearance, setAppearance] = useState<AppearanceMode>(getStoredAppearance);

  function changeAppearance(mode: AppearanceMode) {
    setAppearance(mode);
    applyAppearance(mode);
  }

  function openProfile() {
    setProfileOpen(true);
    setError("");
    setMessage("");
    setNickname(user?.nickname ?? "");
    setHeight(user?.height?.toString() ?? "");
  }

  function closeProfile() {
    setProfileOpen(false);
    setError("");
    setMessage("");
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    const trimmedNickname = nickname.trim();
    const parsedHeight = Number(height);
    if (!trimmedNickname || !height || !Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      setError("닉네임과 올바른 키를 입력해 주세요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await authApi.updateMe({ nickname: trimmedNickname, height: parsedHeight });
      await refreshUser();
      setMessage("프로필을 저장했습니다.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (isLoading) return;
    await logout();
    navigate("/login", { replace: true });
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm("계정을 삭제하면 모든 데이터가 사라지며 복구할 수 없습니다. 삭제할까요?");
    if (!confirmed) return;
    setSaving(true);
    setError("");
    try {
      await authApi.deleteMe();
      tokenStorage.clear();
      navigate("/signup", { replace: true });
      window.location.reload();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setSaving(false);
    }
  }

  return (
    <div className="menu-page">
      <header className="menu-header">
        <p>MY ACCOUNT</p>
        <h1>내 정보</h1>
      </header>

      <section className="profile-card">
        <div className="profile-avatar"><User size={28} /></div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.nickname}</h2>
          <p className="profile-email">{user?.email}</p>
          {user?.created_at && <p className="profile-since">{formatMembershipDuration(user.created_at)}</p>}
        </div>
        <button type="button" className="profile-edit" onClick={openProfile}>
          <Pencil size={14} /> 편집
        </button>
      </section>

      {profileOpen && (
        <form className="account-panel" onSubmit={saveProfile}>
          <div className="account-panel-head"><h2>프로필 편집</h2><button type="button" onClick={closeProfile} aria-label="닫기"><X size={18} /></button></div>
          <label>닉네임<input value={nickname} maxLength={20} onChange={(event) => setNickname(event.target.value)} /></label>
          <label>키 (cm)<input type="number" min="1" step="0.1" value={height} onChange={(event) => setHeight(event.target.value)} /></label>
          <button className="account-save" disabled={saving}>{saving ? <LoaderCircle className="menu-spin" size={16} /> : <Check size={16} />} 저장</button>
        </form>
      )}

      {(error || message) && <p className={`account-feedback${error ? " error" : ""}`}>{error || message}</p>}

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

      <section className="menu-section">
        <p className="menu-section-title">계정</p>
        <div className="menu-items">
          <button type="button" className="menu-item" onClick={() => setPasswordOpen(true)}>
            <span className="menu-item-icon"><KeyRound size={18} /></span>
            <span className="menu-item-label">비밀번호 변경</span>
          </button>
          <button type="button" className="menu-item destructive" onClick={handleDeleteAccount} disabled={saving}>
            <span className="menu-item-icon"><Trash2 size={18} /></span>
            <span className="menu-item-label">계정 삭제</span>
          </button>
        </div>
      </section>

      <button type="button" className="logout-btn" onClick={handleLogout} disabled={isLoading}>
        <LogOut size={16} /> 로그아웃
      </button>
      {passwordOpen && <PasswordChangeModal onClose={() => setPasswordOpen(false)} />}
    </div>
  );
}
