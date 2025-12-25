import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, createContext, useRef  } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import { updateUser } from "./users";
import { unregisterUserFromContest } from "./contests";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuthHandler();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthHandler() {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect,
    logout: auth0Logout,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const Logincleaning = useRef(false);
  const [type, setType] = useState<"admin" | "user" | null>(null);
  const [dbUser, setDbUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const signup = () =>
    loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });
  const login = () => loginWithRedirect();
const logout = async () => {
    try {
      Logincleaning.current = false;
      await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/auth/logout`, {
        method: "POST",
        credentials: "include", 
      });
    } catch (err) {
      console.error("Backend logout failed", err);
    } finally {
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };
  useEffect(() => {
    const fetchUserFromDB = async () => {
       if (isLoading) return;
      if (!isAuthenticated || !user) {
        navigate("/");
        return;
      }
      const token = await getAccessTokenSilently();
              await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/auth/set-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });
      const userData = {
        id: user.sub,                  
        name: user.name,
        email: user.email,
        type: "user", // default
      };

      try {
        const encodedId = encodeURIComponent(user.sub);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/users/${encodedId}`, {credentials: "include"});
        if (res.ok) {
  const existingUser = await res.json();
  setType(existingUser.type);
  setDbUser(existingUser);
if (Logincleaning.current && existingUser.contest) {
  await unregisterUserFromContest(existingUser.contest, user.sub);
  await updateUser(user.sub, { contest: null });
  setDbUser({ ...existingUser, contest: null });

  Logincleaning.current = false;
}

  

  // FIXED: Use full browser URL
  const url = new URL(window.location.href);
  const isAdminTestMode = url.searchParams.get("isAdminTest") === "true";

  if (existingUser.type === "admin") {
    if (location.pathname === "/" && !isAdminTestMode) {
      navigate("/admin");
    }
  } else if (existingUser.type === "user") {
    if (location.pathname === "/" || location.pathname === "/login") {
      navigate("/editor");
    }
  }
}
else {
          const createRes = await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/users`, {
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
  }, [isAuthenticated, user?.sub, navigate, getAccessTokenSilently]);
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
  }
}