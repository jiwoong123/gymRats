import "./Layout.css";
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="phone-shell-bg">
      <div className="phone-shell">
        <div className="phone-content-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}