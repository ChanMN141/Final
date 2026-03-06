// TODO: Students must implement CRUD for Book here, similar to Item.
// Example: GET (get book by id), PATCH (update), DELETE (remove)

import corsHeaders from "@/lib/cors";
import { verifyAuth, isAdmin } from "@/lib/auth";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req, { params }) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

  try {
    const { id } = await params;
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const book = await db.collection("books").findOne({ _id: new ObjectId(id) });
    if (!book) return NextResponse.json({ message: "Not found" }, { status: 404, headers: corsHeaders });
    if (book.status === "DELETED" && !isAdmin(user)) return NextResponse.json({ message: "Not found" }, { status: 404, headers: corsHeaders });
    return NextResponse.json(book, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(req, { params }) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  if (!isAdmin(user)) return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: corsHeaders });

  try {
    const { id } = await params;
    const data = await req.json();
    const updateFields = {};
    if (data.title !== undefined) updateFields.title = data.title;
    if (data.author !== undefined) updateFields.author = data.author;
    if (data.quantity !== undefined) updateFields.quantity = data.quantity;
    if (data.location !== undefined) updateFields.location = data.location;
    if (data.status !== undefined) updateFields.status = data.status;

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const result = await db.collection("books").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ message: "Not found" }, { status: 404, headers: corsHeaders });
    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req, { params }) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  if (!isAdmin(user)) return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: corsHeaders });

  try {
    const { id } = await params;
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const result = await db.collection("books").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: "DELETED" } },
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ message: "Not found" }, { status: 404, headers: corsHeaders });
    return NextResponse.json({ message: "Book soft-deleted", book: result }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}