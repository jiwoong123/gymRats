import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/LoadingScreen";

export default function GuestRoute({children,}: {children: React.ReactNode;}) {
    const {isAuthenticated,isLoading} = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}