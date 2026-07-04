import { Dumbbell, Home, User, UtensilsCrossed } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import "./BottomNav.css";


export default function BottomNav() {
  const location = useLocation();
  const isRecords = location.pathname.startsWith("/records");

  const items = [
    { to: "/", icon: <Home size={22} />, label: "홈", exact: true },
    {
      to: "/records/workouts",
      icon: <Dumbbell size={22} />,
      label: "운동기록",
      exact: false,
      active: isRecords,
    },
    { to: "/diet", icon: <UtensilsCrossed size={22} />, label: "식단", exact: false },
    { to: "/menu", icon: <User size={22} />, label: "메뉴", exact: false },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) =>
            "bottom-nav-item" + (isActive || item.active ? " active" : "")
          }
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}