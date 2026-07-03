import { Link } from "react-router";

export default function Login() {
  return (
    <div>
      <h1>Login</h1>

      <Link to="/signup">
        회원가입
      </Link>
    </div>
  );
}