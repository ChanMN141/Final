import { useUser } from "../contexts/UserProvider";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useUser();
  return (
    <div style={{ padding:"40px", maxWidth:"600px", margin:"0 auto" }}>
      <h2>Welcome, {user.name || user.email}!</h2>
      <p>Role: <strong>{user.role}</strong></p>
      <div style={{ display:"flex", gap:"16px", marginTop:"24px" }}>
        <Link to="/books" style={card}>📚 Books</Link>
        <Link to="/borrow" style={card}>{user.role==="ADMIN"?"📋 Manage Requests":"📋 My Requests"}</Link>
      </div>
    </div>
  );
}
const card = { padding:"20px 30px", backgroundColor:"#f3f4f6", borderRadius:"8px", textDecoration:"none", color:"#1e3a5f", fontWeight:"600", border:"1px solid #e5e7eb" };