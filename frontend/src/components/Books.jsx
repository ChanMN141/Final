import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Books() {
  const { user } = useUser();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [newBook, setNewBook] = useState({ title:"", author:"", quantity:1, location:"" });
  const [msg, setMsg] = useState("");

  async function fetchBooks() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterTitle) params.set("title", filterTitle);
      if (filterAuthor) params.set("author", filterAuthor);
      const res = await fetch(`${API_URL}/api/book?${params}`, { credentials:"include" });
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks([]);
    }
    setLoading(false);
  }

  useEffect(() => { fetchBooks(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${API_URL}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newBook)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Book created successfully!");
        setNewBook({ title:"", author:"", quantity:1, location:"" });
        fetchBooks();
      } else {
        setMsg(data.message || "Error creating book");
      }
    } catch {
      setMsg("Network error");
    }
  }

  return (
    <div style={{ padding:"20px", maxWidth:"900px", margin:"0 auto" }}>
      <h2>📚 Books</h2>

      <div style={{ marginBottom:"16px", display:"flex", gap:"8px" }}>
        <input
          placeholder="Filter by title..."
          value={filterTitle}
          onChange={e => setFilterTitle(e.target.value)}
          style={inp}
        />
        <input
          placeholder="Filter by author..."
          value={filterAuthor}
          onChange={e => setFilterAuthor(e.target.value)}
          style={inp}
        />
        <button onClick={fetchBooks} style={btn("#2563eb")}>Search</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ backgroundColor:"#f3f4f6" }}>
              {["Title","Author","Qty","Location","Status","Actions"].map(h =>
                <th key={h} style={th}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {books.length === 0
              ? <tr><td colSpan={6} style={{ textAlign:"center", padding:"20px" }}>No books found</td></tr>
              : books.map(book => (
                <tr key={book._id} style={{ borderBottom:"1px solid #e5e7eb" }}>
                  <td style={td}>{book.title}</td>
                  <td style={td}>{book.author}</td>
                  <td style={td}>{book.quantity}</td>
                  <td style={td}>{book.location}</td>
                  <td style={td}>
                    <span style={{ color: book.status === "DELETED" ? "red" : "green" }}>
                      {book.status}
                    </span>
                  </td>
                  <td style={td}>
                    <Link to={`/books/${book._id}`} style={{ marginRight:"8px", color:"#2563eb" }}>View</Link>
                    {user.role !== "ADMIN" && (
                      <Link to="/borrow" style={{ color:"#16a34a" }}>Borrow</Link>
                    )}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )}

      {user.role === "ADMIN" && (
        <div style={{ marginTop:"32px", padding:"20px", border:"1px solid #e5e7eb", borderRadius:"8px" }}>
          <h3>Add New Book</h3>
          <form onSubmit={handleCreate} style={{ display:"flex", flexDirection:"column", gap:"10px", maxWidth:"400px" }}>
            <input
              required
              placeholder="Title *"
              value={newBook.title}
              onChange={e => setNewBook({...newBook, title: e.target.value})}
              style={inp}
            />
            <input
              required
              placeholder="Author *"
              value={newBook.author}
              onChange={e => setNewBook({...newBook, author: e.target.value})}
              style={inp}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newBook.quantity}
              onChange={e => setNewBook({...newBook, quantity: parseInt(e.target.value)})}
              style={inp}
            />
            <input
              placeholder="Location"
              value={newBook.location}
              onChange={e => setNewBook({...newBook, location: e.target.value})}
              style={inp}
            />
            <button type="submit" style={btn("#16a34a")}>➕ Create Book</button>
            {msg && (
              <p style={{ color: msg.includes("success") ? "green" : "red", margin:0 }}>
                {msg}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

const inp = { padding:"8px", border:"1px solid #ccc", borderRadius:"4px", fontSize:"14px" };
const th = { padding:"10px", textAlign:"left", fontWeight:"600", borderBottom:"2px solid #e5e7eb" };
const td = { padding:"10px" };
const btn = (bg) => ({ padding:"8px 16px", backgroundColor:bg, color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"14px" });