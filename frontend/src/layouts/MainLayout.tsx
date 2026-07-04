import { Outlet, useLocation } from "react-router";
import RecordsSubNav from "../components/RecordsSubNav";
import BottomNav from "../components/BottomNav";
import "./Layout.css";

export default function MainLayout() {
  const location = useLocation();
  const isRecords = location.pathname.startsWith("/records");

  return (
    <div className="phone-shell-bg">
      <div className="phone-shell">
        {isRecords && <RecordsSubNav />}
        <div className="phone-content">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}