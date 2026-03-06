import corsHeaders from "@/lib/cors";
import { verifyAuth, isAdmin } from "@/lib/auth";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const VALID_STATUSES = ["INIT", "CLOSE-NO-AVAILABLE-BOOK", "ACCEPTED", "CANCEL-ADMIN", "CANCEL-USER"];

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function PATCH(req, { params }) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400, headers: corsHeaders });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const request = await db.collection("borrow_requests").findOne({ _id: new ObjectId(id) });
    if (!request) return NextResponse.json({ message: "Not found" }, { status: 404, headers: corsHeaders });

    if (isAdmin(user)) {
      if (status === "CANCEL-USER") return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: corsHeaders });
    } else {
      if (status !== "CANCEL-USER" || request.userId !== user.id.toString()) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: corsHeaders });
      }
    }

    const result = await db.collection("borrow_requests").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}