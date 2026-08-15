import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Check, ChevronLeft, Eye, EyeOff, LoaderCircle, Mail } from "lucide-react";

import * as authApi from "../../api/authApi";
import type { TrainingLevel } from "../../api/authApi";
import { getErrorMessage } from "../../utils/apiError";
import "./Signup.css";

const STEPS = ["이메일 인증", "계정 보안", "기본 정보", "운동 설정"];
const TRAINING_LEVELS: { value: TrainingLevel; label: string; description: string }[] = [
  { value: "untrained", label: "입문 전", description: "웨이트 트레이닝 경험이 거의 없어요." },
  { value: "novice", label: "초급", description: "기본 동작과 운동 습관을 익히는 단계예요." },
  { value: "intermediate", label: "중급", description: "꾸준한 훈련 경험과 안정적인 자세가 있어요." },
  { value: "advanced", label: "고급", description: "장기간 체계적으로 훈련하고 있어요." },
  { value: "elite", label: "엘리트", description: "경기 수준의 전문적인 훈련 경험이 있어요." },
];

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nickname: "", email: "", password: "", confirm: "", birth: "", height: "",
    gender: "0", training_level: "untrained" as TrainingLevel,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "email") {
      setChallengeId(null);
      setVerificationToken("");
      setCode("");
    }
    setError("");
  }

  async function sendCode() {
    if (!form.email.trim()) return setError("이메일을 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      const response = await authApi.requestEmailVerification(form.email.trim());
      setChallengeId(response.challenge_id);
      setCooldown(60);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmail() {
    if (challengeId === null) return setError("먼저 인증 코드를 요청해 주세요.");
    if (!/^\d{6}$/.test(code)) return setError("6자리 인증 코드를 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      const response = await authApi.confirmEmailVerification(form.email.trim(), challengeId, code);
      setVerificationToken(response.verification_token);
      setStep(1);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  function nextStep() {
    setError("");
    if (step === 1) {
      if (form.password.length < 8) return setError("비밀번호는 8자 이상이어야 합니다.");
      if (form.password !== form.confirm) return setError("비밀번호가 일치하지 않습니다.");
    }
    if (step === 2) {
      const height = Number(form.height);
      if (!form.nickname.trim() || !form.birth || !Number.isFinite(height) || height <= 0) {
        return setError("기본 정보를 모두 올바르게 입력해 주세요.");
      }
      if (new Date(form.birth) > new Date()) return setError("생년월일을 확인해 주세요.");
    }
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!verificationToken) return setError("이메일 인증을 다시 진행해 주세요.");
    setBusy(true);
    setError("");
    try {
      await authApi.signup({
        email: form.email.trim(), password: form.password, nickname: form.nickname.trim(),
        gender: Number(form.gender), birth: form.birth, height: Number(form.height),
        training_level: form.training_level, email_verification_token: verificationToken,
      });
      navigate("/login", { replace: true, state: { signupComplete: true } });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  function goBack() {
    if (step === 0) navigate("/login");
    else setStep((current) => current - 1);
    setError("");
  }

  return (
    <div className="signup-page">
      <header className="signup-header">
        <button type="button" className="back-btn" onClick={goBack} aria-label="이전 단계"><ChevronLeft size={22} /></button>
        <h1 className="signup-title">회원가입</h1><span />
      </header>

      <div className="signup-progress" aria-label={`회원가입 ${step + 1}/${STEPS.length} 단계`}>
        {STEPS.map((label, index) => <span className={index <= step ? "active" : ""} key={label} />)}
      </div>
      <div className="signup-step-heading"><span>STEP {step + 1} OF {STEPS.length}</span><h2>{STEPS[step]}</h2></div>

      <form className="signup-form" onSubmit={submit}>
        {step === 0 && (
          <div className="signup-step-content">
            <p className="signup-help">가입할 이메일로 보내드리는 6자리 코드를 확인해 주세요.</p>
            <label className="form-group"><span className="form-label">이메일</span><div className="signup-inline-input"><input className="form-input" type="email" autoComplete="email" placeholder="name@example.com" value={form.email} disabled={Boolean(verificationToken)} onChange={(event) => update("email", event.target.value)} /><button type="button" disabled={busy || cooldown > 0 || Boolean(verificationToken)} onClick={sendCode}>{cooldown > 0 ? `${cooldown}초` : challengeId ? "재전송" : "코드 전송"}</button></div></label>
            {challengeId !== null && !verificationToken && <label className="form-group"><span className="form-label">인증 코드</span><input className="form-input signup-code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" placeholder="000000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} /></label>}
            {challengeId !== null && <button type="button" className="btn-primary" disabled={busy} onClick={verifyEmail}>{busy ? <LoaderCircle className="signup-spin" size={18} /> : <Mail size={18} />} 이메일 인증</button>}
          </div>
        )}

        {step === 1 && <div className="signup-step-content"><p className="signup-help">다른 서비스에서 사용하지 않는 8자 이상의 비밀번호를 권장합니다.</p><label className="form-group"><span className="form-label">비밀번호</span><div className="input-wrapper"><input className="form-input" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="8자 이상" value={form.password} onChange={(event) => update("password", event.target.value)} /><button type="button" className="input-eye" aria-label="비밀번호 표시 전환" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><label className="form-group"><span className="form-label">비밀번호 확인</span><input className="form-input" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="비밀번호 재입력" value={form.confirm} onChange={(event) => update("confirm", event.target.value)} /></label></div>}

        {step === 2 && <div className="signup-step-content"><label className="form-group"><span className="form-label">닉네임</span><input className="form-input" maxLength={20} placeholder="홍길동" value={form.nickname} onChange={(event) => update("nickname", event.target.value)} /></label><div className="signup-field-grid"><label className="form-group"><span className="form-label">생년월일</span><input className="form-input" type="date" value={form.birth} onChange={(event) => update("birth", event.target.value)} /></label><label className="form-group"><span className="form-label">키 (cm)</span><input className="form-input" type="number" min="1" step="0.1" placeholder="170" value={form.height} onChange={(event) => update("height", event.target.value)} /></label></div><label className="form-group"><span className="form-label">성별</span><select className="form-input" value={form.gender} onChange={(event) => update("gender", event.target.value)}><option value="0">선택 안 함</option><option value="1">남성</option><option value="2">여성</option></select></label></div>}

        {step === 3 && <div className="signup-step-content"><p className="signup-help">운동 수준에 맞춰 운동 시작 중량을 추천해 드립니다. 나중에 설정에서 변경할 수 있어요.</p><div className="signup-levels" role="radiogroup" aria-label="운동 수준">{TRAINING_LEVELS.map((level) => <button type="button" role="radio" aria-checked={form.training_level === level.value} className={form.training_level === level.value ? "selected" : ""} key={level.value} onClick={() => setForm((current) => ({ ...current, training_level: level.value }))}><span><strong>{level.label}</strong><small>{level.description}</small></span>{form.training_level === level.value && <Check size={17} />}</button>)}</div></div>}

        {error && <p className="form-error" role="alert">{error}</p>}
        {step > 0 && step < 3 && <button type="button" className="btn-primary" onClick={nextStep}>다음 <ArrowRight size={18} /></button>}
        {step === 3 && <button type="submit" className="btn-primary" disabled={busy}>{busy ? <LoaderCircle className="signup-spin" size={18} /> : <Check size={18} />} 가입 완료</button>}
        <p className="signup-footer">이미 계정이 있으신가요? <Link to="/login" className="link-accent">로그인</Link></p>
      </form>
    </div>
  );
}
