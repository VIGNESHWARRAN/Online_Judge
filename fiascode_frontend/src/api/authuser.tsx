import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, createContext, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface User {
  sub?: string;
  name?: string;
  email?: string;
  type?: string;
  // Add more user fields if needed
}

export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: Error;
  login: () => Promise<void>;
  signup: () => Promise<void>;
  logout: () => void;
  user?: User;
  type: "admin" | "user" | null;
  dbUser: any | null; // Consider typing your DB user more strictly if possible
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthHandler();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthHandler(): AuthContextType {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect,
    logout: auth0Logout,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const [type, setType] = useState<"admin" | "user" | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const signup = () => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });
  const login = () => loginWithRedirect();
  const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  useEffect(() => {
    const fetchUserFromDB = async () => {
      if (isLoading) return;

      if (!isAuthenticated || !user?.sub) {
        navigate("/");
        return;
      }

      try {
        const token = await getAccessTokenSilently();

        await fetch(`http://${process.env.BACKEND_IP}/api/auth/set-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });

        const userData = {
          id: user.sub,
          name: user.name,
          email: user.email,
          type: "user", // default type
        };

        const encodedId = encodeURIComponent(user.sub);
        const res = await fetch(`http://${process.env.BACKEND_IP}/api/users/${encodedId}`, {
          credentials: "include",
        });

        if (res.ok) {
          const existingUser = await res.json();
          setType(existingUser.type);
          setDbUser(existingUser);

          if (existingUser.type === "admin" && location.pathname !== "/admin") {
            navigate("/admin");
          } else if (existingUser.type === "user" && location.pathname !== "/editor") {
            navigate("/editor");
          }
        } else {
          // User not found, create it
          const createRes = await fetch(`http://${process.env.BACKEND_IP}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(userData),
          });

          if (createRes.ok) {
            const createdUser = await createRes.json();
            setType(createdUser.type);
            setDbUser(createdUser);
          } else {
            const errorText = await createRes.text();
            throw new Error(`User creation failed: ${errorText}`);
          }
        }
      } catch (err) {
        console.error("❌ AuthHandler error:", err);
      }
    };

    fetchUserFromDB();
  }, [isLoading, isAuthenticated, user?.sub, navigate, getAccessTokenSilently, location.pathname]);

  return {
    isLoading,
    isAuthenticated,
    error,
    login,
    signup,
    logout,
    user,
    type,
    dbUser,
  };
}
