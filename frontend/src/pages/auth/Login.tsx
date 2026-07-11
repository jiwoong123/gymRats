import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Dumbbell, Eye, EyeOff, ArrowRight } from "lucide-react";
import "./Login.css";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const {login, isLoading} = useAuth();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    if (isLoading) return;

    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      login(email, password);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-logo">
          <Dumbbell size={32} />
        </div>
        <h1 className="login-title">LIFT<span>LOG</span></h1>
        <p className="login-subtitle">당신의 성장을 기록하세요</p>
      </div>

      <form className="login-form" aria-disabled = {isLoading} onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">이메일</label>
          <input
            className="form-input"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            autoComplete="email"

          />
        </div>

        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <div className="input-wrapper">
            <input
              className="form-input"
              type={showPw ? "text" : "password"}
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              autoComplete="current-password"

            />
            <button
              type="button"
              className="input-eye"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary"  disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
          <ArrowRight size={18} />
        </button>

        <div className="login-divider">
          <span>또는</span>
        </div>

        <p className="login-footer">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="link-accent">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}
