import { Routes, Route } from "react-router";
import ProtectedRoute from "./ProtectedRoutes";


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

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
</Routes>
  );
}

export default App;