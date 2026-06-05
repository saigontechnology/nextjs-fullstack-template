# FullstackNextJSTemplate — Agent Instructions

> **Context**: This is a production-ready Next.js 15 fullstack template. These
> instructions govern how an AI agent should work on any project scaffolded from
> this template — they describe conventions, architecture decisions, and the
> correct workflows for adding, modifying, and removing features.

---

## 1. High-Level Architecture

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server Components by default; `"use client"` only when needed |
| Styling | Tailwind CSS v4 + shadcn/ui | CSS-first config via `@theme`; no `tailwind.config.js` |
| Database | SQLite via `better-sqlite3` + Drizzle ORM | Single-file DB; WAL mode + foreign keys enabled |
| Language | TypeScript 5 (strict mode) | `tsconfig.json` has `"strict": true` |
| Deployment | Docker multi-stage | `output: "standalone"`; two Dockerfiles (`Dockerfile` + `Dockerfile.migrate`) |

### 1.1 Directory Map

```
src/
├── actions/          # Server Actions — the primary data layer for the UI
├── app/
│   ├── api/          # REST endpoints (optional; prefer Server Actions)
│   ├── layout.tsx    # Root layout: fonts, ThemeProvider, Toaster
│   ├── page.tsx      # Home page (currently a CRUD demo)
│   └── globals.css   # Tailwind v4 imports + shadcn theme tokens
├── components/
│   ├── ui/           # shadcn/ui primitives (button, card, dialog, etc.)
│   └── *.tsx         # Feature-specific components
├── db/
│   ├── schema.ts     # Drizzle ORM table definitions
│   ├── index.ts      # DB connection factory (better-sqlite3 → drizzle)
│   ├── migrate.ts    # Programmatic migration runner
│   └── seed.ts       # Seed data for development
└── lib/
    └── utils.ts      # `cn()` helper (clsx + tailwind-merge)
```

### 1.2 Design Philosophy

- **Server Components first.** Only add `"use client"` to leaves that need
  interactivity (forms, buttons with click handlers, state).
- **Server Actions are the primary data layer.** API routes exist as a fallback
  for external consumers; new features should use Server Actions.
- **shadcn/ui components live in `src/components/ui/`** and are managed via
  `components.json`. Use the shadcn CLI (`npx shadcn@latest add <name>`) to add
  new primitives — do NOT hand-copy them.
- **Zero-config theme.** Every design token is a CSS custom property defined in
  `globals.css`. The `@theme inline` block re-exposes them as Tailwind utilities
  (e.g., `bg-background`, `text-foreground`, `rounded-lg`).

---

## 2. The Demo Feature (Users + Posts)

This template ships with a complete CRUD demo: **Users** and **Posts**. These
are scaffolding — they are NOT core infrastructure. When building a real
application you will almost always **remove or replace** them.

### 2.1 What Belongs to the Demo

| File | Role |
|---|---|
| `src/db/schema.ts` — `users` & `posts` tables | Demo schema |
| `src/db/seed.ts` | Seeds demo data |
| `src/actions/user.actions.ts` | Server Actions for users |
| `src/actions/post.actions.ts` | Server Actions for posts |
| `src/components/user-form.tsx` | "Add User" form |
| `src/components/user-list.tsx` | User list with avatar + delete |
| `src/components/post-form.tsx` | "Create Post" form |
| `src/components/post-list.tsx` | Post list |
| `src/components/delete-button.tsx` | Reusable delete button (used by both lists) |
| `src/app/api/users/route.ts` | REST fallback for users |
| `src/app/api/posts/route.ts` | REST fallback for posts |
| `src/app/page.tsx` — user/post sections | Dashboard layout with demo sections |
| `drizzle/0000_*.sql` | Migration for the demo tables |

### 2.2 How to Remove the Demo

When the demo feature is not needed, follow this checklist **in order**:

1. **Delete demo files**:
   ```
   rm src/actions/user.actions.ts src/actions/post.actions.ts
   rm src/components/user-form.tsx src/components/user-list.tsx
   rm src/components/post-form.tsx src/components/post-list.tsx
   rm src/components/delete-button.tsx
   rm src/app/api/users/route.ts src/app/api/posts/route.ts
   rm src/db/seed.ts
   rm -rf drizzle/          # Remove old migration; regenerate from scratch later
   ```

2. **Strip the schema** back to empty and regenerate:
   ```ts
   // src/db/schema.ts — minimal starting point
   // Define your tables here. See: https://orm.drizzle.team/docs/sql-schema-declaration
   ```
   Then run: `npm run db:generate` to create a fresh migration.

3. **Replace `src/app/page.tsx`** with your actual home page content.

4. **Remove the API folder** entirely (`rm -rf src/app/api`) if no REST endpoints
   are needed. Server Actions are the preferred pattern.

### 2.3 How to Modify (Keep One, Drop the Other)

If you need users but not posts (or vice versa), delete only the files for the
unwanted entity, remove its table from `schema.ts`, and regenerate migrations.
Update `page.tsx` to remove the deleted section.

---

## 3. Adding a New Feature (Step-by-Step)

Follow this exact workflow when adding a new data entity.

### Step 1: Define the Schema

Add your table to `src/db/schema.ts`:

```ts
// Example: adding a "tasks" table
export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

### Step 2: Generate Migration

```bash
npm run db:generate   # Creates drizzle/*.sql
npm run db:migrate    # Applies it locally
```

### Step 3: Create Server Actions

Create `src/actions/task.actions.ts`:

```ts
"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Task = typeof tasks.$inferSelect;

export async function getTasks(): Promise<Task[]> {
  return db.select().from(tasks).orderBy(tasks.createdAt).all();
}

export async function createTask(data: { title: string }) {
  const task = db.insert(tasks).values(data).returning().get();
  revalidatePath("/");
  return task;
}

export async function deleteTask(id: number) {
  db.delete(tasks).where(eq(tasks.id, id)).run();
  revalidatePath("/");
}
```

> **Key pattern**: Every mutation action calls `revalidatePath()` so the UI
> refreshes automatically. Use `revalidatePath("/path")` scoped to the pages
> that display the data.

### Step 4: Build UI Components

- **Server Components** for data fetching and rendering lists.
- **Client Components** (`"use client"`) for forms, buttons, and interactive
  elements.
- Use `Suspense` boundaries in the parent page so the layout paints before the
  data arrives.

### Step 5 (Optional): Add REST API

Only if an external consumer needs REST. Prefer Server Actions for the app UI.

---

## 4. Database Conventions

### 4.1 Connection (`src/db/index.ts`)

- Uses `better-sqlite3` with WAL mode for concurrent reads.
- Foreign keys are enforced (`PRAGMA foreign_keys = ON`).
- The DB file path is `DATABASE_URL` env var, defaulting to `./data/app.db`.
- In Docker, `DATABASE_URL` points to `/app/db/app.db`.

### 4.2 Schema Changes

1. Edit `src/db/schema.ts`.
2. Run `npm run db:generate` → creates a new migration in `drizzle/`.
3. Run `npm run db:migrate` → applies it to your local SQLite DB.
4. **Never edit migration files by hand.** Always regenerate from the schema.

### 4.3 Seeding

`src/db/seed.ts` is a standalone script (`tsx src/db/seed.ts`). It should:
- Clear existing data before inserting (idempotent).
- Use `.returning().all()` to get back inserted rows when needed for
  relationships.
- Always call `process.exit()` on error so the script fails visibly.

### 4.4 Timestamp Columns

Use this pattern for `createdAt` / `updatedAt`:

```ts
createdAt: integer("created_at", { mode: "timestamp" })
  .notNull()
  .$defaultFn(() => new Date()),
```

`mode: "timestamp"` tells Drizzle to marshal between JS `Date` objects and Unix
epoch integers.

---

## 5. shadcn/ui Component Management

### 5.1 Adding Components

```bash
npx shadcn@latest add button card dialog input
```

Components land in `src/components/ui/` and are tracked in `components.json`.

### 5.2 Removing Unused UI Components

Delete the file from `src/components/ui/`. If the component was the last consumer
of a dependency (check with `grep` across the project), also remove it from
`package.json`. Common ones to audit: `@base-ui/react`, `sonner`, `next-themes`,
`tw-animate-css`.

### 5.3 Current UI Components

The template ships with these shadcn/ui primitives:
`avatar`, `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`,
`label`, `select`, `separator`, `skeleton`, `sonner`, `table`, `textarea`.

If the project does not use `dialog`, `dropdown-menu`, `table`, or `select`,
remove their files from `src/components/ui/`.

---

## 6. Authentication (NextAuth.js / Auth.js)

This template does **not** include authentication out of the box. When auth is
needed, use **Auth.js v5** (formerly NextAuth.js):

### 6.1 Installation

```bash
npm install next-auth@beta @auth/drizzle-adapter
```

### 6.2 Setup Pattern

1. Create `src/auth.ts` with the Auth.js config:
   ```ts
   import NextAuth from "next-auth";
   import GitHub from "next-auth/providers/github";
   import { DrizzleAdapter } from "@auth/drizzle-adapter";
   import { db } from "@/db";

   export const { handlers, auth, signIn, signOut } = NextAuth({
     adapter: DrizzleAdapter(db),
     providers: [GitHub],
   });
   ```

2. Add the Auth.js tables to `src/db/schema.ts` — Auth.js requires specific
   tables (`accounts`, `sessions`, `users`, `verification_tokens`). Use the
   Drizzle adapter's schema helpers or define them manually.

3. Create the route handler at `src/app/api/auth/[...nextauth]/route.ts`:
   ```ts
   import { handlers } from "@/auth";
   export const { GET, POST } = handlers;
   ```

4. In Server Components, call `const session = await auth()` to get the current
   user. In Client Components, use `useSession()` from `next-auth/react`.

5. Protect Server Actions by calling `auth()` and throwing or redirecting when
   unauthenticated.

### 6.3 Remove the Existing `users` Table When Adding Auth

Auth.js manages its own `users` table. Remove the template's `users` table
from `schema.ts` (along with the `posts` table that references it) and
regenerate migrations.

---

## 7. Styling Conventions

### 7.1 Tailwind v4 Specifics

- **No `tailwind.config.js`.** All configuration is CSS-first via `@theme`.
- **Imports**: `@import "tailwindcss"` (NOT the old `@tailwind base/components/utilities`).
- **Dark mode**: `@custom-variant dark (&:is(.dark *))` enables class-based dark
  mode (toggled by `next-themes`).
- **Color tokens**: Use semantic utilities like `bg-background`,
  `text-foreground`, `text-muted-foreground`, `border-border` — never hardcode
  hex/oklch values in component JSX.
- **Radius tokens**: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`
  (these map to the `--radius-*` CSS variables).

### 7.2 The `cn()` Helper

Always use `cn()` from `@/lib/utils` for conditional classes:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class", className)} />
```

It merges Tailwind classes correctly (the last conflicting utility wins).

### 7.3 Component Styling Pattern

```tsx
// Use shadcn/ui primitives + Tailwind utilities
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* content */}
  </CardContent>
</Card>
```

Prefer `space-y-*` for vertical spacing between siblings rather than manual
margins.

---

## 8. Docker Deployment

### 8.1 Image Architecture

| Dockerfile | Purpose | Entrypoint |
|---|---|---|
| `Dockerfile` | Production app | `node server.js` (standalone output) |
| `Dockerfile.migrate` | Run DB migrations | `npm run db:migrate` |

### 8.2 Key Details

- Both images use **node:22-alpine** base.
- The app image runs as **non-root user** `nextjs` (uid 1001).
- The DB file lives at `/app/db/app.db` inside the container (set via
  `DATABASE_URL` env var).
- **Persistent volume** must be mounted at `/app/db` so the DB survives
  container restarts.
- `output: "standalone"` in `next.config.ts` is REQUIRED — the Dockerfile copies
  the standalone output.
- `experimental.optimizePackageImports: ["lucide-react"]` reduces bundle size by
  avoiding barrel-file overhead.

### 8.3 Deployment Order

```bash
# 1. Build both images
docker build -t app .
docker build -t app-migrate -f Dockerfile.migrate .

# 2. Run migrations (uses shared volume)
docker run --rm -v app-db:/app/db app-migrate

# 3. (Optional) Seed data
docker run --rm -v app-db:/app/db --entrypoint "" app npm run db:seed

# 4. Start the app
docker run -d -p 3000:3000 -v app-db:/app/db app
```

### 8.4 When NOT to Modify These Files

- Do **not** change the `Dockerfile` base image, user, or output structure unless
  there is a specific deployment requirement.
- Do **not** change `next.config.ts` `output` from `"standalone"` — it breaks
  the Docker build.
- If you add environment variables, add them to **both** `Dockerfile` and
  `Dockerfile.migrate`.

---

## 9. TypeScript & Linting

- **Strict mode is ON.** No `any` unless absolutely necessary with a comment
  explaining why.
- Use `typeof table.$inferSelect` and `typeof table.$inferInsert` exported from
  the action files as the canonical types for each entity.
- Prefer explicit return types on exported functions.
- Run `npm run lint` before committing. The ESLint config (`eslint.config.mjs`)
  uses `eslint-config-next`.

---

## 10. Common Tasks Cheat Sheet

| Task | Command / Action |
|---|---|
| Add a shadcn/ui component | `npx shadcn@latest add <name>` |
| Schema change | Edit `schema.ts` → `npm run db:generate` → `npm run db:migrate` |
| Seed local DB | `npm run db:seed` |
| Fresh DB (reset) | Delete `data/app.db` → `npm run db:setup` |
| Dev server | `npm run dev` |
| Lint check | `npm run lint` |
| Add a new page | Create `src/app/<route>/page.tsx` |
| Add a new entity | Follow §3 above |
| Add auth | Follow §6 above |
| Remove demo | Follow §2.2 above |

---

## 11. Quick-Reference: When to Use What

| Pattern | Use Case |
|---|---|
| **Server Component** | Fetching data, rendering read-only UI |
| **Client Component** | Forms, event handlers, `useState`, `useEffect` |
| **Server Action** | Mutations (create/update/delete) called from forms or buttons |
| **API Route** | External consumers, webhooks, or when you need Response streaming |
| **Suspense** | Wrapping async Server Components so the page shell renders first |
| **revalidatePath** | In every mutation action to refresh cached page data |
| **`useTransition`** | In Client Components to show pending state during Server Action calls |

---

## 12. Agent Operating Rules

When working on a project from this template:

1. **Read this file first.** It is the authoritative map of the codebase.
2. **Remove before you add.** If the project does not use users/posts, strip
   them out before building anything else.
3. **Follow the patterns.** New entities should mirror the action → component
   structure demonstrated by the demo.
4. **Regen migrations after every schema change.** Never hand-edit SQL
   migration files.
5. **Keep `Dockerfile` and `Dockerfile.migrate` in sync.** If you add
   environment variables or build steps, update both.
6. **Prefer `revalidatePath` over `router.refresh()`.** The former works on
   the server; the latter is a client-side escape hatch.
7. **Never import barrel files** from `lucide-react` — use named imports
   (the config already optimizes this, but avoid `import *`).
8. **When in doubt, Server Component.** Only add `"use client"` when the
   compiler rejects a server-only API (hooks, event handlers, browser APIs).
