import { Routes, Route } from "react-router";
import ProtectedRoute from "./auth/ProtectedRoutes";


import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Home from "./pages/home/Home";
import Workouts from "./pages/records/Workouts";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Body from "./pages/records/Body";
import MenuHome from "./pages/menu/Menuhome";
import Root from "./pages/root";
import Diet from "./pages/diet/Diet";
import GuestRoute from "./auth/GuestRoutes";

function App() {
    return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Root />} />
        <Route path="/home" element={<Home />} />
        <Route path="/menu" element={<MenuHome />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/records/workouts" element={<Workouts />} />
        <Route path="/records/body" element={<Body />} />
      </Route>

      <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
</Routes>
  );
}

export default App;