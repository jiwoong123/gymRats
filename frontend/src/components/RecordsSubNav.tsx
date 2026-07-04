import { Link, useLocation } from "react-router-dom";
import "./RecordsSubNav.css";

export default function RecordsSubNav() {
  const loc = useLocation();
  return (
    <div className="records-subnav">
      <Link
        to="/records/workouts"
        className={"subnav-item" + (loc.pathname === "/records/workouts" ? " active" : "")}
      >
        운동 기록
      </Link>
      <Link
        to="/records/body"
        className={"subnav-item" + (loc.pathname === "/records/body" ? " active" : "")}
      >
        체성분
      </Link>
    </div>
  );
}