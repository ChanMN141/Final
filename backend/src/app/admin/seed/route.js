import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("pass");
  if (!challenge || challenge !== process.env.ADMIN_SETUP_PASS) {
    return NextResponse.json({ message: "Admin password incorrect" }, { status: 400 });
  }
  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME || "library");
    const users = db.collection("users");
    const testUsers = [
      { username: "admin", email: "admin@test.com", password: "admin123", role: "ADMIN", firstname: "Admin", lastname: "User", status: "ACTIVE" },
      { username: "user",  email: "user@test.com",  password: "user123",  role: "USER",  firstname: "Test",  lastname: "User", status: "ACTIVE" }
    ];
    const results = [];
    for (const u of testUsers) {
      const exists = await users.findOne({ email: u.email });
      if (!exists) {
        const result = await users.insertOne({ ...u, password: await bcrypt.hash(u.password, 10) });
        results.push({ email: u.email, created: true, id: result.insertedId });
      } else {
        results.push({ email: u.email, created: false, message: "Already exists" });
      }
    }
    return NextResponse.json({ message: "Seed complete", results });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500 });
  }
}
