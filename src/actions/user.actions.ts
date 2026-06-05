"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export async function getUsers(): Promise<User[]> {
  return db.select().from(users).orderBy(users.createdAt).all();
}

export async function getUserById(id: number): Promise<User | undefined> {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export async function createUser(data: { name: string; email: string }) {
  const result = db.insert(users).values(data).returning().get();
  revalidatePath("/");
  return result;
}

export async function deleteUser(id: number) {
  db.delete(users).where(eq(users.id, id)).run();
  revalidatePath("/");
}

export const deleteUserAction = deleteUser;
