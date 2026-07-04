import { Navigate } from "react-router";

function ProtectedRoute({
  children,
}: {
    children: React.ReactNode;
}) {
    // const token = localStorage.getItem("access_token");

    // if (true) {
    //     return <Navigate to="/login" replace />;
    // }

    return children;
}

export default ProtectedRoute