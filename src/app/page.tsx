export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getUsers } from "@/actions/user.actions";
import { getPosts } from "@/actions/post.actions";
import { UserForm } from "@/components/user-form";
import { UserList } from "@/components/user-list";
import { PostForm } from "@/components/post-form";
import { PostList } from "@/components/post-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

async function UserSection() {
  const users = await getUsers();

  return (
    <section className="space-y-4">
      <UserList users={users} />
    </section>
  );
}

async function PostSection() {
  const [posts, users] = await Promise.all([getPosts(), getUsers()]);

  return (
    <section className="space-y-4">
      <PostForm users={users} />
      <PostList posts={posts} />
    </section>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <Skeleton className="h-[200px] w-full rounded-xl" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary" />
            <h1 className="font-semibold text-sm">
              Fullstack Next.js Template
            </h1>
          </div>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Next.js 15</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Tailwind v4</span>
            <Separator orientation="vertical" className="h-3" />
            <span>SQLite</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Docker</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            A fullstack CRUD demo using Server Components, Server Actions, and
            SQLite.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Users Column */}
          <div className="space-y-4">
            <UserForm />
            <Suspense fallback={<SectionSkeleton />}>
              <UserSection />
            </Suspense>
          </div>

          {/* Posts Column */}
          <div className="space-y-4">
            <Suspense fallback={<SectionSkeleton />}>
              <PostSection />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Built with Next.js 15 + Tailwind CSS v4 + shadcn/ui + SQLite + Docker
      </footer>
    </div>
  );
}
