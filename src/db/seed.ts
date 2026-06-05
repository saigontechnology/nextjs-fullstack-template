import { db } from "./index";
import { users, posts } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  db.delete(posts).run();
  db.delete(users).run();

  // Insert sample users
  const insertedUsers = db
    .insert(users)
    .values([
      { name: "Alice Johnson", email: "alice@example.com" },
      { name: "Bob Smith", email: "bob@example.com" },
      { name: "Carol Williams", email: "carol@example.com" },
    ])
    .returning()
    .all();

  console.log(`  ✅ Created ${insertedUsers.length} users`);

  // Insert sample posts
  const insertedPosts = db
    .insert(posts)
    .values([
      {
        title: "Getting Started with Next.js",
        content:
          "Next.js 15 introduces the App Router with React Server Components by default. This is a game changer for building fullstack applications.",
        userId: insertedUsers[0].id,
      },
      {
        title: "Why SQLite for Production",
        content:
          "SQLite is incredibly fast for read-heavy workloads and requires zero configuration. With WAL mode enabled, it handles concurrent reads efficiently.",
        userId: insertedUsers[1].id,
      },
      {
        title: "Docker Best Practices",
        content:
          "Use multi-stage builds to keep your production images small. The standalone output mode in Next.js makes Docker deployment trivial.",
        userId: insertedUsers[2].id,
      },
    ])
    .returning()
    .all();

  console.log(`  ✅ Created ${insertedPosts.length} posts`);
  console.log("✨ Seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
