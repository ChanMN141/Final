import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

const API_URL = import.meta.env.VITE_API_URL;

export function BookDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/book/${id}`, { credentials:"include" })
      .then(r=>r.json()).then(data=>{ setBook(data); setForm(data); });
  }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/book/${id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      credentials:"include",
      body: JSON.stringify({ title:form.title, author:form.author, quantity:form.quantity, location:form.location })
    });
    if (res.ok) { setBook(await res.json()); setEditing(false); setMsg("Updated!"); }
    else { const err = await res.json(); setMsg(err.message); }
  }

  async function handleDelete() {
    if (!confirm("Delete this book?")) return;
    else { const err = await res.json(); setMsg(err.message); }
  }

  if (!book) return <div style={{padding:"20px"}}>Loading...</div>;

  return (
    <div style={{ padding:"20px", maxWidth:"600px", margin:"0 auto" }}>
      <button onClick={()=>navigate("/books")} style={{ marginBottom:"16px", cursor:"pointer" }}>← Back</button>
      {!editing ? (
        <>
          <h2>📖 {book.title}</h2>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <tbody>
              {[["Author",book.author],["Quantity",book.quantity],["Location",book.location],["Status",book.status]].map(([l,v])=>(
                <tr key={l} style={{ borderBottom:"1px solid #e5e7eb" }}>
                  <th style={{padding:"10px",textAlign:"left",width:"130px"}}>{l}</th>
                  <td style={{padding:"10px"}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {user.role==="ADMIN" && (
            <div style={{ marginTop:"20px", display:"flex", gap:"10px" }}>
              <button onClick={()=>setEditing(true)} style={btn("#2563eb")}>Edit</button>
              {book.status!=="DELETED" && <button onClick={handleDelete} style={btn("#dc2626")}>Delete</button>}
            </div>
          )}
        </>
      ) : (
        <>
          <h2>Edit Book</h2>
          <form onSubmit={handleUpdate} style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {[["Title","title"],["Author","author"],["Quantity","quantity"],["Location","location"]].map(([label,key])=>(
              <label key={key}>{label}:
                <input type={key==="quantity"?"number":"text"} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})} style={{ display:"block", padding:"8px", border:"1px solid #ccc", borderRadius:"4px", width:"100%", marginTop:"4px" }} />
              </label>
            ))}
            <div style={{ display:"flex", gap:"10px" }}>
              <button type="submit" style={btn("#16a34a")}>Save</button>
              <button type="button" onClick={()=>setEditing(false)} style={btn("#6b7280")}>Cancel</button>
            </div>
          </form>
        </>
      )}
      {msg && <p style={{ color: msg==="Updated!"?"green":"red" }}>{msg}</p>}
    </div>
  );
}
const btn = (bg) => ({ padding:"8px 16px", backgroundColor:bg, color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer" });