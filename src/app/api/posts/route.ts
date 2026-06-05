export const dynamic = "force-dynamic";

import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allPosts = db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      userId: posts.userId,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(posts.createdAt)
    .all();

  return Response.json(allPosts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, content, userId } = body;

  if (!title || !content || !userId) {
    return Response.json(
      { error: "Title, content, and userId are required" },
      { status: 400 }
    );
  }

  const post = db
    .insert(posts)
    .values({ title, content, userId })
    .returning()
    .get();

  return Response.json(post, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  db.delete(posts).where(eq(posts.id, parseInt(id))).run();
  return Response.json({ success: true });
}
