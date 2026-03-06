// TODO: Students must implement authentication and role-based access control here.
// Remove this stub and implement JWT verification and role checking as required in the exam.

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "mydefaulyjwtsecret";

export async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

export function isAdmin(user) {
  return user?.role === "ADMIN";
}