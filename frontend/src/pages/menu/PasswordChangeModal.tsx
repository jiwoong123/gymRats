import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Check, KeyRound, LoaderCircle, X } from "lucide-react";
import { changePassword } from "../../api/authApi";
import { getErrorMessage } from "../../utils/apiError";

type PasswordChangeModalProps = {
  onClose: () => void;
};

export default function PasswordChangeModal({ onClose }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("비밀번호를 변경했습니다.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="password-modal-backdrop" role="presentation" onMouseDown={() => !saving && onClose()}>
      <section
        className="password-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="password-modal-header">
          <div className="password-modal-icon"><KeyRound size={20} /></div>
          <div>
            <p>ACCOUNT SECURITY</p>
            <h2 id="password-modal-title">비밀번호 변경</h2>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="닫기"><X size={19} /></button>
        </header>

        <form className="password-modal-form" onSubmit={handleSubmit}>
          <label>현재 비밀번호<input autoFocus type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
          <label>새 비밀번호<input type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
          <label>새 비밀번호 확인<input type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
          {(error || message) && <p className={`password-modal-feedback${error ? " error" : ""}`}>{error || message}</p>}
          <button className="account-save" disabled={saving || !currentPassword || !newPassword || !confirmPassword}>
            {saving ? <LoaderCircle className="menu-spin" size={16} /> : <Check size={16} />} 변경
          </button>
        </form>
      </section>
    </div>,
    document.body,
  );
}
