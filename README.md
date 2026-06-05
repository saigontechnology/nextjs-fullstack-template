# Fullstack Next.js Template

A production-ready fullstack template with **Next.js 15**, **Tailwind CSS v4**, **shadcn/ui**, **SQLite**, and **Docker**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | SQLite (via better-sqlite3 + Drizzle ORM) |
| Language | TypeScript (strict mode) |
| Deployment | Docker (multi-stage, standalone output) |

## Project Structure

```
src/
├── actions/         # Server Actions (type-safe DB operations)
│   ├── user.actions.ts
│   └── post.actions.ts
├── app/
│   ├── api/         # REST API routes
│   │   ├── users/route.ts
│   │   └── posts/route.ts
│   ├── layout.tsx   # Root layout (ThemeProvider, fonts, Toaster)
│   ├── page.tsx     # Dashboard with CRUD demo
│   └── globals.css  # Tailwind v4 + shadcn theme
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── user-form.tsx
│   ├── post-form.tsx
│   ├── user-list.tsx
│   ├── post-list.tsx
│   └── delete-button.tsx
├── db/
│   ├── schema.ts    # Drizzle ORM schema (users, posts)
│   ├── index.ts     # Database connection
│   ├── migrate.ts   # Migration runner
│   └── seed.ts      # Seed script
└── lib/utils.ts     # Utility functions (cn helper)
```

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Generate migration files after schema changes
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start dev server
npm run dev
```

### Docker Deployment

```bash
# Build the app image
docker build -t fullstack-app .

# Build and run migrations
docker build -t fullstack-migrate -f Dockerfile.migrate .
docker run --rm -v app-data:/data fullstack-migrate

# Seed the database (optional)
docker run --rm -v app-data:/data --entrypoint "" fullstack-app npm run db:seed

# Run the app
docker run -p 3000:3000 -v app-data:/data fullstack-app
```

## Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate SQL migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Insert sample data |
| `npm run db:setup` | Migrate + seed in one command |

## API Endpoints

- `GET/POST /api/users` — List or create users
- `DELETE /api/users?id=1` — Delete a user
- `GET/POST /api/posts` — List or create posts
- `DELETE /api/posts?id=1` — Delete a post
