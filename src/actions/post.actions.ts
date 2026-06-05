"use server";

import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Post = typeof posts.$inferSelect;

export type PostWithAuthor = Post & {
  author: { id: number; name: string; email: string } | null;
};

export async function getPosts(): Promise<PostWithAuthor[]> {
  const result = db
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

  return result;
}

export async function getPostById(
  id: number
): Promise<PostWithAuthor | undefined> {
  const result = db
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
    .where(eq(posts.id, id))
    .get();

  return result;
}

export async function createPost(data: {
  title: string;
  content: string;
  userId: number;
}) {
  const result = db.insert(posts).values(data).returning().get();
  revalidatePath("/");
  return result;
}

export async function deletePost(id: number) {
  db.delete(posts).where(eq(posts.id, id)).run();
  revalidatePath("/");
}

export const deletePostAction = deletePost;
