import { Link, useLocation } from "react-router-dom";
import "./RecordsSubNav.css";

export default function RecordsSubNav() {
  const loc = useLocation();
  return (
    <nav className="records-subnav" aria-label="운동 기록">
      <Link
        to="/records/workouts"
        className={"subnav-item" + (loc.pathname.startsWith("/records/workouts") ? " active" : "")}
      >
        운동 기록
      </Link>
      <Link
        to="/records/statistics"
        className={"subnav-item" + (loc.pathname === "/records/statistics" ? " active" : "")}
      >
        통계
      </Link>
      <Link
        to="/records/personal-records"
        className={"subnav-item" + (loc.pathname === "/records/personal-records" ? " active" : "")}
      >
        신기록
      </Link>
    </nav>
  );
}
