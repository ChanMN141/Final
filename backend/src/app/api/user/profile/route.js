// REFERENCE: This file is provided as a user registration example.
// Students must implement authentication and role-based logic as required in the exam.
// BUG FIX: original used `user.email` where user was never defined
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }
  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const profile = await db.collection("users").findOne({ email: user.email }, { projection: { password: 0 } });
    return NextResponse.json(profile, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(error.toString(), { headers: corsHeaders });
  }
}