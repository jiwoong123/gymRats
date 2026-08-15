import { Outlet, useLocation } from "react-router";
import RecordsSubNav from "../components/RecordsSubNav";
import DietSubNav from "../components/DietSubNav";
import BottomNav from "../components/BottomNav";
import "./Layout.css";

export default function MainLayout() {
  const location = useLocation();
  const isRecords = location.pathname.startsWith("/records");
  const isDietSection = location.pathname === "/diet" || location.pathname === "/body";
  const isWorkoutSession = location.pathname === "/workout-session";

  return (
    <div className="phone-shell-bg">
      <div className={`phone-shell${isDietSection ? " diet-section" : ""}`}>
        {isRecords && <RecordsSubNav />}
        {isDietSection && <DietSubNav />}
        <div className={`phone-content${isWorkoutSession ? " workout-session-content" : ""}`}>
          <Outlet />
        </div>
        {!isWorkoutSession && <BottomNav />}
      </div>
    </div>
  );
}
