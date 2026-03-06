
// REFERENCE: This file is provided as a user registration example.
// Students must implement authentication and role-based logic as required in the exam.
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(req) {
  const data = await req.json();
  const { username, email, password, firstname, lastname, role } = data;

  if (!username || !email || !password) {
    return NextResponse.json({ message: "Missing mandatory data" }, { status: 400, headers: corsHeaders });
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const result = await db.collection("users").insertOne({
      username, email,
      password: await bcrypt.hash(password, 10),
      firstname, lastname,
      role: role || "USER",
      status: "ACTIVE"
    });
    return NextResponse.json({ id: result.insertedId }, { status: 200, headers: corsHeaders });
  } catch (exception) {
    const errorMsg = exception.toString();
    let displayErrorMsg = "Error creating user";
    if (errorMsg.includes("duplicate")) {
      if (errorMsg.includes("username")) displayErrorMsg = "Duplicate Username!!";
      else if (errorMsg.includes("email")) displayErrorMsg = "Duplicate Email!!";
    }
    return NextResponse.json({ message: displayErrorMsg }, { status: 400, headers: corsHeaders });
  }
}