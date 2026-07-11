import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ChevronLeft, Eye, EyeOff, ArrowRight } from "lucide-react";
import "./Signup.css";
import { signup } from "../../api/authApi";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nickname: "", email: "", password: "", birth: "", height: "", gender: 0, confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string) {

    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setError("");
    };
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    if (loading) return;
    e.preventDefault();
    if (!form.nickname || !form.email || !form.password || !form.confirm) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    try {
          setLoading(true);
    
          await signup({
            nickname: form.nickname,
            email: form.email,
            password: form.password,
            gender: form.gender,
            birth: form.birth,
            height: Number(form.height),
          });
    
          navigate("/", { replace: true });
    
        } catch (err: any) {
          if (err.response?.status === 401) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
          } else {
            setError("로그인 중 오류가 발생했습니다.");
          }
        } finally {
          setLoading(false);
        }
  }

  return (
    <div className="signup-page">
      <div className="signup-header">
        <button className="back-btn" onClick={() => navigate("/login")}>
          <ChevronLeft size={22} />
        </button>
        <h1 className="signup-title">회원가입</h1>
        <span />
      </div>

      <p className="signup-desc">오늘부터 운동 기록을 시작해보세요</p>

      <form className="signup-form" onSubmit={handleSubmit}>
        {[
          { field: "nickname", label: "이름", type: "text", placeholder: "홍길동" },
          { field: "email", label: "이메일", type: "email", placeholder: "name@example.com" },
          { field: "height", label: "키", type: "number", placeholder: "000.0" },
          { field: "gender", label: "성별", type: "number", placeholder: "000.0" },
          { field: "birth", label: "생일", type: "datetime.date",placeholder: "000.0" },
        ].map(({ field, label, type, placeholder }) => (
          <div className="form-group" key={field}>
            <label className="form-label">{label}</label>
            <input
              className="form-input"
              type={type}
              placeholder={placeholder}
              value={form[field as keyof typeof form]}
              onChange={set(field)}
            />
          </div>
        ))}

        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <div className="input-wrapper">
            <input
              className="form-input"
              type={showPw ? "text" : "password"}
              placeholder="6자 이상"
              value={form.password}
              onChange={set("password")}
            />
            <button type="button" className="input-eye" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">비밀번호 확인</label>
          <input
            className="form-input"
            type={showPw ? "text" : "password"}
            placeholder="비밀번호 재입력"
            value={form.confirm}
            onChange={set("confirm")}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary">
          시작하기
          <ArrowRight size={18} />
        </button>

        <p className="signup-footer">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="link-accent">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
