import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const initialUser = { isLoggedIn: false, name: '', email: '', role: '' };

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("session");
      return stored ? JSON.parse(stored) : initialUser;
    } catch { return initialUser; }
  });

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      const newUser = { isLoggedIn: true, name: data.username || email, email: data.email || email, role: data.role || "USER" };
      setUser(newUser);
      localStorage.setItem("session", JSON.stringify(newUser));
      return true;
    } catch { return false; }
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/user/logout`, { method: "POST", credentials: "include" });
    const newUser = initialUser;
    setUser(newUser);
    localStorage.setItem("session", JSON.stringify(newUser));
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}