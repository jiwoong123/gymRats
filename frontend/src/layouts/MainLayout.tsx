import { Outlet } from "react-router";

// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  return (
    <>
      {/* <Navbar /> */}

      <div style={{ display: "flex" }}>
        {/* <Sidebar /> */}

        <main style={{ flex: 1, padding: "20px" }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}