import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, KeyRound, LoaderCircle, Trash2 } from "lucide-react";
import * as authApi from "../../api/authApi";
import { tokenStorage } from "../../auth/token";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/apiError";
import PasswordChangeModal from "./PasswordChangeModal";
import "./Menuhome.css";

export default function AccountManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [height, setHeight] = useState(user?.height?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    setMessage("");
    try {
      await authApi.updateMe({ nickname: trimmedNickname, height: parsedHeight });
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ["home"], exact: true });
      setMessage("프로필을 저장했습니다.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
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
    <div className="menu-page account-management-page">
      <header className="account-page-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기"><ArrowLeft size={21} /></button>
        <div><p>MY ACCOUNT</p><h1>계정 관리</h1></div>
      </header>

      <form className="account-panel" onSubmit={saveProfile}>
        <div className="account-panel-head"><h2>프로필 편집</h2></div>
        <label>닉네임<input value={nickname} maxLength={20} onChange={(event) => setNickname(event.target.value)} /></label>
        <label>키 (cm)<input type="number" min="1" step="0.1" value={height} onChange={(event) => setHeight(event.target.value)} /></label>
        {(error || message) && <p className={`account-feedback${error ? " error" : ""}`}>{error || message}</p>}
        <button className="account-save" disabled={saving}>{saving ? <LoaderCircle className="menu-spin" size={16} /> : <Check size={16} />} 저장</button>
      </form>

      <section className="menu-section">
        <p className="menu-section-title">보안 및 계정</p>
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

      {passwordOpen && <PasswordChangeModal onClose={() => setPasswordOpen(false)} />}
    </div>
  );
}
