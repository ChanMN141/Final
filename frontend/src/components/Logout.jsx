//You can modify this component.

// BUG FIX: original had <Navigate to={<Login/>}> — wrong, must be a path string
import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { Navigate } from "react-router-dom";

export default function Logout() {
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useUser();

  useEffect(() => {
    logout().then(() => setIsLoading(false));
  }, []);

  if (isLoading) return <h3>Logging out...</h3>;
  return <Navigate to="/login" replace />;
}