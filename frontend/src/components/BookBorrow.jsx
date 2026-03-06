import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserProvider";

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_STATUS_OPTIONS = ["INIT","CLOSE-NO-AVAILABLE-BOOK","ACCEPTED","CANCEL-ADMIN"];

export default function BookBorrow() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bookId:"", targetDate:"" });
  const [msg, setMsg] = useState("");

  async function fetchRequests() {
    try {
      const res = await fetch(`${API_URL}/api/borrow`, { credentials:"include" });
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
    if (user.role !== "ADMIN") {
      fetch(`${API_URL}/api/book`, { credentials:"include" })
        .then(r => r.json())
        .then(data => { if(Array.isArray(data)) setBooks(data.filter(b=>b.status!=="DELETED")); })
        .catch(() => {});
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("Submitting...");
    try {
      const res = await fetch(`${API_URL}/api/borrow`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body:JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Request submitted!");
        setForm({ bookId:"", targetDate:"" });
        fetchRequests();
      } else {
        setMsg(data.message || "Error");
      }
    } catch (err) {
      setMsg("Cannot reach backend - is it running on port 3000?");
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${API_URL}/api/borrow/${id}`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body:JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) fetchRequests();
      else alert(data.message || "Update failed");
    } catch {
      alert("Network error");
    }
  }

  const statusColor = s => ({ ACCEPTED:"#16a34a", "CANCEL-ADMIN":"#dc2626", "CANCEL-USER":"#dc2626", "CLOSE-NO-AVAILABLE-BOOK":"#dc2626" }[s] || "#2563eb");

  return (
    <div style={{ padding:"20px", maxWidth:"900px", margin:"0 auto" }}>
      <h2>📋 Borrow Requests</h2>

      {user.role !== "ADMIN" && (
        <div style={{ marginBottom:"28px", padding:"16px", border:"1px solid #e5e7eb", borderRadius:"8px" }}>
          <h3>New Request</h3>
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"10px", maxWidth:"400px" }}>
            <label>Book:
              <select required value={form.bookId} onChange={e=>setForm({...form,bookId:e.target.value})} style={{ display:"block", padding:"8px", border:"1px solid #ccc", borderRadius:"4px", width:"100%", marginTop:"4px" }}>
                <option value="">-- Select --</option>
                {books.map(b=><option key={b._id} value={b._id}>{b.title} — {b.author}</option>)}
              </select>
            </label>
            <label>Target Pick-up Date:
              <input type="date" required value={form.targetDate} onChange={e=>setForm({...form,targetDate:e.target.value})} style={{ display:"block", padding:"8px", border:"1px solid #ccc", borderRadius:"4px", marginTop:"4px" }} />
            </label>
            <button type="submit" style={{ padding:"8px 16px", backgroundColor:"#2563eb", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer" }}>Submit</button>
            {msg && <p style={{ color: msg.includes("submitted")?"green":"red", fontWeight:"bold" }}>{msg}</p>}
          </form>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ backgroundColor:"#f3f4f6" }}>
            {user.role==="ADMIN" && <th style={th}>User</th>}
            {["Book","Created","Target Date","Status"].map(h=><th key={h} style={th}>{h}</th>)}
            <th style={th}>{user.role==="ADMIN"?"Update Status":"Action"}</th>
          </tr></thead>
          <tbody>
            {requests.length===0
              ? <tr><td colSpan={6} style={{textAlign:"center",padding:"20px"}}>No requests</td></tr>
              : requests.map(r=>(
                <tr key={r._id} style={{ borderBottom:"1px solid #e5e7eb" }}>
                  {user.role==="ADMIN" && <td style={td}>{r.userEmail}</td>}
                  <td style={td}>{r.bookTitle}</td>
                  <td style={td}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td style={td}>{new Date(r.targetDate).toLocaleDateString()}</td>
                  <td style={td}><span style={{ color:statusColor(r.status), fontWeight:"600" }}>{r.status}</span></td>
                  <td style={td}>
                    {user.role==="ADMIN"
                      ? <select value={r.status} onChange={e=>updateStatus(r._id,e.target.value)} style={{ padding:"4px", borderRadius:"4px", border:"1px solid #ccc" }}>
                          {ADMIN_STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      : r.status==="INIT" && (
                          <button onClick={()=>updateStatus(r._id,"CANCEL-USER")} style={{ padding:"4px 10px", backgroundColor:"#dc2626", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer" }}>Cancel</button>
                        )
                    }
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
const th = { padding:"10px", textAlign:"left", fontWeight:"600", borderBottom:"2px solid #e5e7eb" };
const td = { padding:"10px" };