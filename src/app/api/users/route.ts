export const dynamic = "force-dynamic";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allUsers = db.select().from(users).orderBy(users.createdAt).all();
  return Response.json(allUsers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email } = body;

  if (!name || !email) {
    return Response.json({ error: "Name and email are required" }, { status: 400 });
  }

  const existing = db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) {
    return Response.json({ error: "Email already exists" }, { status: 409 });
  }

  const user = db.insert(users).values({ name, email }).returning().get();
  return Response.json(user, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  db.delete(users).where(eq(users.id, parseInt(id))).run();
  return Response.json({ success: true });
}
