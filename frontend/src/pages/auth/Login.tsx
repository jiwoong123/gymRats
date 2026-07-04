import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Dumbbell, Eye, EyeOff, ArrowRight } from "lucide-react";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    navigate("/");
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

      <form className="login-form" onSubmit={handleSubmit}>
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

        <button type="submit" className="btn-primary">
          로그인
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
