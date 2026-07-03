import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Outlet />
    </div>
  );
}