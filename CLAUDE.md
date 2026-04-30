@AGENTS.md

# Diamond Log

## Stack

- **Framework**: Next.js 16, App Router, TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Auth**: NextAuth v5 beta — Google OAuth only
- **Database**: MongoDB via Mongoose
- **Font**: Inter (via `next/font/google`)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth.ts                      # NextAuth config (Google provider)
│   │   ├── auth-actions.ts              # Server actions: handleSignIn, handleSignOut
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth catch-all handler
│   │   └── db.ts                        # Mongoose connection (connectDB)
│   ├── dashboard/page.tsx               # Protected page, redirects to / if no session
│   ├── globals.css                      # Tailwind theme + shadcn CSS variables
│   ├── layout.tsx                       # Root layout — mounts Header
│   └── page.tsx                         # Sign-in landing page
├── components/
│   ├── header.tsx                       # Global header — sign in/out, user name
│   ├── text.tsx                         # Text component (title / subtitle / body)
│   └── ui/                             # shadcn/ui primitives (button, card, separator…)
└── lib/
    └── utils.ts                         # cn() helper (clsx + tailwind-merge)
```

## Auth Flow

- Sign in/out logic lives in `src/app/api/auth-actions.ts` as `"use server"` functions.
- `Header` is a server component that reads the session and conditionally renders sign-in or sign-out.
- Protected routes call `auth()` directly and `redirect("/")` if no session.
- OAuth callback URI: `https://localhost:3000/api/auth/callback/google`

## Database

- MongoDB Atlas cluster, Mongoose ODM.
- `connectDB()` from `src/app/api/db.ts` — call this before any model operations.
- Uses a global cache to reuse the connection across hot reloads in dev.

```ts
import { connectDB } from "@/app/api/db";

await connectDB();
```

## Text Component

`src/components/text.tsx` — use this for all text rendering.

| Variant    | Tag  | Style                               |
|------------|------|-------------------------------------|
| `title`    | `h1` | `text-2xl font-bold tracking-tight` |
| `subtitle` | `p`  | `text-sm text-muted-foreground`     |
| `body`     | `p`  | `text-base`                         |

Accepts an optional `className` prop for overrides.

```tsx
<Text variant="title">Diamond Log</Text>
<Text variant="subtitle">Your entries</Text>
<Text variant="body">Some content here.</Text>
```

## Local Dev

```bash
npm run dev   # runs on https://localhost:3000 (--experimental-https)
npm run build
npm run lint
```

## Environment Variables

```
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DB_USER=
DB_PASSWORD=
DB_URI=
```

## Known Gotchas

- **Tailwind font variables**: In `globals.css`, `@theme inline` must map `--font-sans` to `var(--font-inter)` (not `var(--font-sans)` — that's a circular reference and falls back to browser serif).
- **Backend vs frontend**: All backend logic lives in `src/app/api/`. Frontend components live in `src/components/`. Keep this separation.
- **Server actions in components**: Components that use server actions import from `src/app/api/auth-actions.ts` rather than inlining `"use server"` directly.
