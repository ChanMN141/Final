import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export default function Navbar() {
  const { user } = useUser();
  if (!user.isLoggedIn) return null;
  return (
    <nav style={{ backgroundColor:"#1e3a5f", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", color:"#fff" }}>
      <div style={{ display:"flex", gap:"20px", alignItems:"center" }}>
        <span style={{ fontWeight:"700", fontSize:"18px" }}>📚 Library</span>
        <Link to="/books" style={lnk}>Books</Link>
        <Link to="/borrow" style={lnk}>{user.role==="ADMIN"?"Manage Requests":"My Requests"}</Link>
      </div>
      <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
        <span style={{ fontSize:"14px", opacity:0.8 }}>
          {user.email}
          <span style={{ backgroundColor: user.role==="ADMIN"?"#f59e0b":"#3b82f6", padding:"2px 8px", borderRadius:"12px", fontSize:"11px", marginLeft:"6px" }}>{user.role}</span>
        </span>
        <Link to="/logout" style={{ ...lnk, backgroundColor:"#dc2626", padding:"4px 12px", borderRadius:"4px" }}>Logout</Link>
      </div>
    </nav>
  );
}
const lnk = { color:"#fff", textDecoration:"none", fontSize:"14px" };