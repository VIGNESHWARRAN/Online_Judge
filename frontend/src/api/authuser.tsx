import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [type, setType] = useState<"admin" | "user" | null>(null);
  const [dbUser, setDbUser] = useState(null);
  const navigate = useNavigate();
  const signup = () =>
    loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });
  const login = () => loginWithRedirect();
  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  useEffect(() => {
    const fetchUserFromDB = async () => {
      if (!isAuthenticated || !user) return;
      const token = await getAccessTokenSilently();
      const userData = {
        id: user.sub,                  
        name: user.name,
        email: user.email,
        type: "user", // default
      };

      try {
        const encodedId = encodeURIComponent(user.sub);
        console.log(encodedId)
        const res = await fetch(`http://localhost:5174/api/users/${encodedId}`);
        if (res.ok) {
          const existingUser = await res.json();
          setType(existingUser.type);
          setDbUser(existingUser);
          if (existingUser.type === "admin") {
            navigate("/admin");
          } else if (existingUser.type === "user") {
            navigate("/editor");
          }
        } else {
          const createRes = await fetch("http://localhost:5174/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
  }, [isAuthenticated, user]);
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