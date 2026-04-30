@AGENTS.md

# Diamond Log

## Stack

- **Framework**: Next.js 16, App Router, TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Auth**: NextAuth v5 beta — Google OAuth only
- **Database**: MongoDB via Mongoose
- **Image storage**: Cloudflare Images (direct creator uploads)
- **Font**: Inter (via `next/font/google`)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth.ts                      # NextAuth config (Google provider)
│   │   ├── auth-actions.ts              # Server actions: handleSignIn, handleSignOut
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth catch-all handler
│   │   ├── db.ts                        # Mongoose connection (connectDB)
│   │   ├── log-actions.ts               # Server actions: createLogEntry, getLogs, deleteLog
│   │   ├── upload/
│   │   │   └── route.ts                 # POST /api/upload — returns Cloudflare direct upload URLs
│   │   └── models/
│   │       └── log.ts                   # Mongoose Log model + ILog interface
│   ├── dashboard/
│   │   ├── page.tsx                     # Protected page — mounts LogEntryForm + Logs
│   │   └── loading.tsx                  # Route-level Suspense fallback (PageLoader)
│   ├── globals.css                      # Tailwind theme + shadcn CSS variables (dark forced)
│   ├── layout.tsx                       # Root layout — dark class on <html>, mounts Header
│   └── page.tsx                         # Sign-in landing page
├── components/
│   ├── header.tsx                       # Global header — Gem icon, sign in/out, user name
│   ├── text.tsx                         # Text component (title / subtitle / body)
│   ├── log-entry-form.tsx               # Dialog form — creates a new log entry
│   ├── logs.tsx                         # Server component — fetches + renders log table
│   ├── delete-log-button.tsx            # Client component — deletes a log row
│   ├── image-lightbox.tsx               # Client component — thumbnail grid + dialog image viewer
│   ├── page-loader.tsx                  # Reusable centered spinner
│   └── ui/                             # shadcn/ui primitives (button, card, separator…)
└── lib/
    └── utils.ts                         # cn() helper (clsx + tailwind-merge)
```

## Auth Flow

- Sign in/out logic lives in `src/app/api/auth-actions.ts` as `"use server"` functions.
- `Header` is a server component that reads the session and conditionally renders sign-in or sign-out.
- Protected routes call `auth()` directly and `redirect("/")` if no session.
- OAuth callback URI: `https://localhost:3000/api/auth/callback/google`
- Session exposes `name`, `email`, `image` — no `id` field without a custom session callback. Use `session.user.email` to identify users.

## Database

- MongoDB Atlas cluster, Mongoose ODM.
- `connectDB()` from `src/app/api/db.ts` — call this before any model operations.
- Uses a global cache to reuse the connection across hot reloads in dev.
- Database name must be set in the URI: `mongodb+srv://.../<db-name>?appName=...` — omitting it defaults to `test`.

```ts
import { connectDB } from "@/app/api/db";

await connectDB();
```

## Log Model

`src/app/api/models/log.ts` — collection name `logs`.

| Field               | Type                          | Notes                        |
|---------------------|-------------------------------|------------------------------|
| `userEmail`         | `String` (indexed)            | Identifies the owner         |
| `direction15m`      | `"Bullish" \| "Bearish"`      | Required, enum-validated     |
| `direction1hr`      | `"Bullish" \| "Bearish"`      | Required, enum-validated     |
| `option`            | `"CALL" \| "PUT"`             | Required, enum-validated     |
| `outcome`           | `"WIN" \| "LOSS"`             | Required, enum-validated     |
| `confirmedConditions` | `Boolean`                   | Default false                |
| `imageUrls`         | `String[]`                    | Cloudflare delivery URLs, default `[]` |
| `createdAt`         | `Date`                        | Auto via `timestamps: true`  |

The model uses `delete models["Log"]; model(...)` instead of `models.Log ?? model(...)` to prevent stale schema cache during hot reloads after a field rename.

## Log Actions

`src/app/api/log-actions.ts`

- `createLogEntry(prev, formData)` — validates fields, accepts `imageUrls` hidden inputs, writes to DB, calls `revalidatePath("/dashboard")`
- `getLogs()` — returns logs for current user sorted newest-first, uses `.lean()` for plain serializable objects, includes `imageUrls`
- `deleteLog(id)` — uses `findOneAndDelete` to get the doc first, then deletes each image from Cloudflare via `DELETE /images/v1/:id`, then revalidates

## Components

### LogEntryForm
`src/components/log-entry-form.tsx` — client component. Opens a dialog, submits via `useActionState(createLogEntry)`. Closes dialog automatically on `state.success`. Button disabled while pending. Image upload flow: on submit, requests signed direct-upload URLs from `POST /api/upload`, uploads files directly to Cloudflare from the browser, then injects resulting `imageUrls` as hidden FormData fields before calling `formAction` inside `startTransition`. Images optional.

### Logs
`src/components/logs.tsx` — async server component. Fetches logs directly, no client-side call. Wrapped in `<Suspense>` on the dashboard page. Table rows are sky-tinted for WIN, red-tinted for LOSS. Positive values use `text-sky-400`, negative use `text-red-400`. Includes `ImageLightbox` per row for screenshot thumbnails.

### DeleteLogButton
`src/components/delete-log-button.tsx` — client component. Uses `useTransition` to call `deleteLog`. Trash icon hidden by default, revealed on row hover via `group/row` + `group-hover/row:opacity-100`.

### PageLoader
`src/components/page-loader.tsx` — centered `Loader2` spinner. Used as Suspense fallback and in `dashboard/loading.tsx`.

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

## Dark Mode

App is permanently dark — `dark` class is hardcoded on `<html>` in `layout.tsx`. No light mode toggle. All color tokens resolve from the `.dark` block in `globals.css`.

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
DB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db-name>?appName=<app>
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

## Known Gotchas

- **Tailwind font variables**: In `globals.css`, `@theme inline` must map `--font-sans` to `var(--font-inter)` (not `var(--font-sans)` — circular reference, falls back to browser serif).
- **Backend vs frontend**: All backend logic lives in `src/app/api/`. Frontend components live in `src/components/`. Keep this separation.
- **Server actions in components**: Components that use server actions import from `src/app/api/log-actions.ts` or `src/app/api/auth-actions.ts` rather than inlining `"use server"` directly.
- **Mongoose model cache**: After renaming schema fields, `models.Log ?? model(...)` returns the stale registered model. Use `delete models["Log"]; model(...)` to bust it, then restore the guard once the rename is stable.
- **NextAuth session has no `id`**: Default JWT strategy with Google provider only includes `name`, `email`, `image` in the session. Use `session.user.email` as the user identifier.
- **MongoDB default database**: URI without a database name routes to `test`. Always include `/<db-name>` before the `?` query string.
- **Cloudflare direct upload**: `POST /images/v2/direct_upload` must use `multipart/form-data`, not JSON. Returns `{ result: { id, uploadURL } }`. The `uploadURL` format is `https://upload.imagedelivery.net/<accountHash>/<imageId>` — parse index `[3]` for the account hash to build delivery URLs.
- **Cloudflare image delivery URL**: `https://imagedelivery.net/<accountHash>/<imageId>/resize1080` — variant `resize1080` is the configured delivery variant.
- **formAction outside transition**: Calling `formAction` from `useActionState` outside `startTransition` throws a warning. Always wrap it: `startTransition(() => formAction(fd))`.
- **ImageLightbox in table**: Putting a stateful client component inside a `<tr>` can cause DOM glitches. Keep `ImageLightbox` as a self-contained `DialogRoot` — one dialog per row is fine.
