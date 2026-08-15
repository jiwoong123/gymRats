import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/LoadingScreen";

function ProtectedRoute({children,}: {children: React.ReactNode;}) {
    const {isAuthenticated, isLoading} = useAuth();    
    if (isLoading) {
        return <LoadingScreen />;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute