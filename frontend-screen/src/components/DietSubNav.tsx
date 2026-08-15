import { NavLink } from "react-router-dom";
import "./DietSubNav.css";

export default function DietSubNav() {
  return (
    <nav className="diet-subnav" aria-label="식단 및 신체 기록">
      <NavLink to="/diet" end className="diet-subnav-item">
        식단 기록
      </NavLink>
      <NavLink to="/body" className="diet-subnav-item">
        신체 기록
      </NavLink>
    </nav>
  );
}
