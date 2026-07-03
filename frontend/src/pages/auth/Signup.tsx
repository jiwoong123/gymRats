import { Link } from "react-router";

export default function Signup() {
  return (
    <div>
      <h1>Signup</h1>

      <Link to="/login">
        로그인
      </Link>
    </div>
  );
}