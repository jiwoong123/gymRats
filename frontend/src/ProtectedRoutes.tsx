import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { verifyToken } from "./services/auth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      const valid = await verifyToken();

      if (!valid) {
        localStorage.removeItem("access_token");
      }

      setAuthenticated(valid);
      setLoading(false);
    }

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  setAuthenticated(true);
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}