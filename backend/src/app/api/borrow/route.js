import corsHeaders from "@/lib/cors";
import { verifyAuth, isAdmin } from "@/lib/auth";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const query = isAdmin(user) ? {} : { userId: user.id?.toString() };
    const requests = await db.collection("borrow_requests").find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(requests, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  if (isAdmin(user)) return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: corsHeaders });
  try {
    const body = await req.json();
    const { bookId, targetDate } = body;
    if (!bookId || !targetDate) return NextResponse.json({ message: "bookId and targetDate required" }, { status: 400, headers: corsHeaders });
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const book = await db.collection("books").findOne({ _id: new ObjectId(bookId) });
    if (!book) {
      // try with string id in case books collection uses different id
      return NextResponse.json({ message: "Book not found" }, { status: 404, headers: corsHeaders });
    }
    const request = {
      userId: user.id?.toString(),
      userEmail: user.email,
      bookId: bookId,
      bookTitle: book.title,
      createdAt: new Date(),
      targetDate: new Date(targetDate),
      status: "INIT"
    };
    const result = await db.collection("borrow_requests").insertOne(request);
    return NextResponse.json({ id: result.insertedId, ...request }, { status: 201, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
  }
}