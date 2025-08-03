import { type ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../api/authuser"; // Adjust import path as needed

interface RequireAuthProps {
  children: ReactNode;
  allowedTypes: Array<NonNullable<AuthContextType["type"]>>; // e.g., ("user" | "admin")[]
}

export function RequireAuth({ children, allowedTypes }: RequireAuthProps) {
  const auth = useContext(AuthContext);

  // Handle case when context is not yet available (auth can be null)
  if (!auth) {
    // Optionally you could render loading or an error here
    return <Navigate to="/" replace />;
  }

  const { isAuthenticated, isLoading, type } = auth;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(type as NonNullable<AuthContextType["type"]>)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
