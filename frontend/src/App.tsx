import { Routes, Route } from "react-router";
import ProtectedRoute from "./ProtectedRoutes";


import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Menu from "./pages/Menu"
import Home from "./pages/Home";
import Records from "./pages/Records";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

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
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/records" element={<Records />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
</Routes>
  );
}

export default App;