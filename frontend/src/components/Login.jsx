//You can modify this component.

import { useRef, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { Navigate } from "react-router-dom";

export default function Login() {
  const [state, setState] = useState({ isLoggingIn: false, isLoginError: false });
  const emailRef = useRef();
  const passRef = useRef();
  const { user, login } = useUser();

  async function onLogin() {
    setState({ isLoggingIn: true, isLoginError: false });
    const result = await login(emailRef.current.value, passRef.current.value);
    setState({ isLoggingIn: false, isLoginError: !result });
  }

  if (user.isLoggedIn) return <Navigate to="/profile" replace />;

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"80vh" }}>
      <div style={{ padding:"40px", border:"1px solid #e5e7eb", borderRadius:"12px", width:"320px", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign:"center", marginBottom:"24px" }}>📚 Library Login</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div>
            <label style={{ display:"block", marginBottom:"4px", fontWeight:"600" }}>Email</label>
            <input type="text" ref={emailRef} style={inp} placeholder="admin@test.com" />
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"4px", fontWeight:"600" }}>Password</label>
            <input type="password" ref={passRef} style={inp} />
          </div>
          <button onClick={onLogin} disabled={state.isLoggingIn}
            style={{ padding:"10px", backgroundColor:"#1e3a5f", color:"#fff", border:"none", borderRadius:"6px", cursor:"pointer" }}>
            {state.isLoggingIn ? "Logging in..." : "Login"}
          </button>
          {state.isLoginError && <div style={{ color:"red", textAlign:"center" }}>Invalid email or password</div>}
        </div>
      </div>
    </div>
  );
}
const inp = { padding:"8px 12px", border:"1px solid #ccc", borderRadius:"6px", width:"100%", fontSize:"14px", boxSizing:"border-box" };