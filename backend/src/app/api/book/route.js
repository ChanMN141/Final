// TODO: Students must implement CRUD for Book here, similar to Item.
// Example: GET (list all books), POST (create book)

// import necessary modules and setup as in Item

import corsHeaders from "@/lib/cors";
import { verifyAuth, isAdmin } from "@/lib/auth";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "";
    const author = searchParams.get("author") || "";
    const query = {};
    if (!isAdmin(user)) query.status = { $ne: "DELETED" };
    if (title) query.title = { $regex: title, $options: "i" };
    if (author) query.author = { $regex: author, $options: "i" };

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const books = await db.collection("books").find(query).toArray();
    return NextResponse.json(books, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  if (!isAdmin(user)) return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: corsHeaders });

  try {
    const { title, author, quantity, location } = await req.json();
    if (!title || !author) return NextResponse.json({ message: "Title and author required" }, { status: 400, headers: corsHeaders });

    const book = { title, author, quantity: quantity ?? 1, location: location ?? "", status: "ACTIVE", createdAt: new Date() };
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const result = await db.collection("books").insertOne(book);
    return NextResponse.json({ id: result.insertedId, ...book }, { status: 201, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}