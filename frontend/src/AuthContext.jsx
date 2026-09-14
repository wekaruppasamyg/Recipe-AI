import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("recipe_ai_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("recipe_ai_user", JSON.stringify(userData));
    localStorage.setItem("recipe_ai_token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("recipe_ai_user");
    localStorage.removeItem("recipe_ai_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
