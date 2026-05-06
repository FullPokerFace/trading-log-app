@AGENTS.md

# Diamond Diary

## Stack

- **Framework**: Next.js 16, App Router, TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Auth**: NextAuth v5 beta, Google OAuth only
- **Database**: MongoDB via Mongoose
- **Image storage**: Cloudflare Images, direct creator uploads
- **Font**: Inter via `next/font/google`

## Project Structure

```text
src/
+-- app/
|   +-- api/
|   |   +-- auth.ts                      # NextAuth config, Google provider
|   |   +-- auth-actions.ts              # Server actions: handleSignIn, handleSignOut
|   |   +-- auth/[...nextauth]/route.ts  # NextAuth catch-all handler
|   |   +-- db.ts                        # Mongoose connection, connectDB
|   |   +-- log-actions.ts               # Server actions: createLogEntry, getLogs, deleteLog
|   |   +-- rule-actions.ts              # Server actions: createRule, getRules, deleteRule
|   |   +-- indicator-actions.ts         # Server actions: createIndicator, getIndicators, deleteIndicator
|   |   +-- upload/
|   |   |   +-- route.ts                 # POST /api/upload, returns Cloudflare direct upload URLs
|   |   +-- models/
|   |       +-- log.ts                   # Mongoose Log model and ILog interface
|   |       +-- rule.ts                  # Mongoose Rule model and IRule interface
|   |       +-- indicator.ts             # Mongoose Indicator model and IIndicator interface
|   +-- dashboard/
|   |   +-- page.tsx                     # Protected dashboard, mounts rule/log controls and lists
|   |   +-- loading.tsx                  # Route-level Suspense fallback, PageLoader
|   +-- globals.css                      # Tailwind theme and shadcn CSS variables, dark forced
|   +-- layout.tsx                       # Root layout, dark class on html, mounts Header
|   +-- page.tsx                         # Sign-in landing page
+-- components/
|   +-- header.tsx                       # Global header, Gem icon, sign in/out, user name
|   +-- text.tsx                         # Text component: title, subtitle, body
|   +-- log-entry-form.tsx               # Server wrapper, fetches indicators for new log entry
|   +-- log-entry-form-client.tsx        # Client dialog form, creates a new log entry
|   +-- logs.tsx                         # Server component, fetches and renders log table
|   +-- delete-log-button.tsx            # Client component, deletes a log row
|   +-- trading-rules.tsx                # Server component, fetches and renders rules list
|   +-- trading-rules-dialog.tsx         # Server wrapper, fetches rules for dialog
|   +-- trading-rules-dialog-client.tsx  # Client dialog, add/delete trading rules
|   +-- trade-indicators-dialog.tsx      # Server wrapper, fetches indicators for dialog
|   +-- trade-indicators-dialog-client.tsx # Client dialog, add/delete trade indicators
|   +-- image-lightbox.tsx               # Client thumbnail grid and dialog image viewer
|   +-- page-loader.tsx                  # Reusable centered spinner
|   +-- ui/                              # shadcn/ui primitives
+-- lib/
    +-- utils.ts                         # cn() helper, clsx + tailwind-merge
```

## Auth Flow

- Sign in/out logic lives in `src/app/api/auth-actions.ts` as `"use server"` functions.
- `Header` is a server component that reads the session and conditionally renders sign-in or sign-out.
- Protected routes call `auth()` directly and `redirect("/")` if no session.
- OAuth callback URI: `https://localhost:3000/api/auth/callback/google`
- Session exposes `name`, `email`, `image`. There is no `id` field without a custom session callback. Use `session.user.email` to identify users.

## Database

- MongoDB Atlas cluster, Mongoose ODM.
- `connectDB()` from `src/app/api/db.ts` must be called before model operations.
- Uses a global cache to reuse the connection across hot reloads in dev.
- Database name must be set in the URI: `mongodb+srv://.../<db-name>?appName=...`. Omitting it defaults to `test`.

```ts
import { connectDB } from "@/app/api/db";

await connectDB();
```

## Log Model

`src/app/api/models/log.ts` - collection name `logs`.

| Field                 | Type                       | Notes                                      |
|-----------------------|----------------------------|--------------------------------------------|
| `userEmail`           | `String` indexed           | Identifies the owner                       |
| `direction15m`        | `"Bullish" \| "Bearish"` | Required, enum-validated                   |
| `direction1hr`        | `"Bullish" \| "Bearish"` | Required, enum-validated                   |
| `option`              | `"CALL" \| "PUT"`        | Required, enum-validated                   |
| `outcome`             | `"WIN" \| "LOSS"`        | Required, enum-validated                   |
| `confirmedConditions` | `Boolean`                  | Default false                              |
| `entryPrice`          | `Number`                   | Optional                                   |
| `exitPrice`           | `Number`                   | Optional                                   |
| `contracts`           | `Number`                   | Optional                                   |
| `indicators`          | `Object[]`                 | Snapshot of checkbox indicator answers    |
| `imageUrls`           | `String[]`                 | Cloudflare delivery URLs, default `[]`     |
| `createdAt`           | `Date`                     | Auto via `timestamps: true`                |
| `updatedAt`           | `Date`                     | Auto via `timestamps: true`                |

The model currently uses `delete models["Log"]; model(...)` to prevent stale schema cache during hot reloads after field changes.

## Log Actions

`src/app/api/log-actions.ts`

- `getLogs()` returns logs for the current user sorted newest-first, using `.lean()` for plain serializable objects.
- `createLogEntry(prev, formData)` validates fields, accepts `imageUrls`, verifies submitted indicator IDs against the current user's indicators, snapshots indicator labels/values, writes to DB, and calls `revalidatePath("/dashboard")`.
- `deleteLog(id)` deletes only the current user's log, deletes associated Cloudflare images, and revalidates the dashboard.

## Rule Model

`src/app/api/models/rule.ts` - collection name `rules`.

| Field       | Type             | Notes                       |
|-------------|------------------|-----------------------------|
| `userEmail` | `String` indexed | Identifies the owner        |
| `text`      | `String`         | Required, trimmed, max 500  |
| `createdAt` | `Date`           | Auto via `timestamps: true` |
| `updatedAt` | `Date`           | Auto via `timestamps: true` |

Trading rules are associated with `session.user.email`, matching trade logs.

## Indicator Model

`src/app/api/models/indicator.ts` - collection name `indicators`.

| Field       | Type         | Notes                                      |
|-------------|--------------|--------------------------------------------|
| `userEmail` | `String` indexed | Identifies the owner                   |
| `label`     | `String`     | Required, trimmed, max 100                 |
| `type`      | `"checkbox"` | Required, default checkbox for first pass  |
| `createdAt` | `Date`       | Auto via `timestamps: true`                |
| `updatedAt` | `Date`       | Auto via `timestamps: true`                |

Trade indicators are associated with `session.user.email`, matching trade logs and trading rules. The model includes `type` so future indicator kinds can be added without replacing the collection.

## Rule Actions

`src/app/api/rule-actions.ts`

- `getRules()` returns rules for the current user sorted oldest-first, using `.lean()` for serializable objects.
- `createRule(prev, formData)` validates rule text, writes to DB, and calls `revalidatePath("/dashboard")`.
- `deleteRule(id)` deletes only rules owned by the current user, then revalidates the dashboard.

## Indicator Actions

`src/app/api/indicator-actions.ts`

- `getIndicators()` returns indicators for the current user sorted oldest-first, using `.lean()` for serializable objects.
- `createIndicator(prev, formData)` validates indicator label text, writes a checkbox indicator to DB, and calls `revalidatePath("/dashboard")`.
- `deleteIndicator(id)` deletes only indicators owned by the current user, then revalidates the dashboard.

## Components

### LogEntryForm

`src/components/log-entry-form.tsx` - async server wrapper that fetches indicators and passes them to the client form.

### LogEntryFormClient

`src/components/log-entry-form-client.tsx` - client component. Opens a dialog and submits via `useActionState(createLogEntry)`. Renders current checkbox indicators in the new log entry dialog. Image upload flow: on submit, requests signed direct-upload URLs from `POST /api/upload`, uploads files directly to Cloudflare from the browser, then injects resulting `imageUrls` into `FormData` before calling `formAction` inside `startTransition`.

### Logs

`src/components/logs.tsx` - async server component. Fetches logs directly, no client-side call. Wrapped in `Suspense` on the dashboard page. Includes `ImageLightbox` per row for screenshot thumbnails.

### TradingRules

`src/components/trading-rules.tsx` - async server component. Fetches rules directly with `getRules()` and renders them above the trade log as a single top-to-bottom list. Wrapped in `Suspense` on the dashboard page.

### TradingRulesDialog

`src/components/trading-rules-dialog.tsx` - async server wrapper that fetches rules and passes them to the client dialog. Keep DB/session fetching here rather than in `dashboard/page.tsx`.

### TradingRulesDialogClient

`src/components/trading-rules-dialog-client.tsx` - client component. Opens a dialog, lists current rules with delete buttons, and adds a new rule via `useActionState(createRule)`. Uses `router.refresh()` after add/delete so both the dialog and visible rules section update.

### TradeIndicatorsDialog

`src/components/trade-indicators-dialog.tsx` - async server wrapper that fetches indicators and passes them to the client dialog. Keep DB/session fetching here rather than in `dashboard/page.tsx`.

### TradeIndicatorsDialogClient

`src/components/trade-indicators-dialog-client.tsx` - client component. Opens a dialog, lists current checkbox indicators with delete buttons, and adds a new checkbox indicator via `useActionState(createIndicator)`. Uses `router.refresh()` after add/delete.

### DeleteLogButton

`src/components/delete-log-button.tsx` - client component. Uses `useTransition` to call `deleteLog`. Trash icon is hidden by default and revealed on row hover via `group/row` and `group-hover/row:opacity-100`.

### PageLoader

`src/components/page-loader.tsx` - centered `Loader2` spinner. Used as Suspense fallback and in `dashboard/loading.tsx`.

## Text Component

`src/components/text.tsx` - use this for text rendering.

| Variant    | Tag  | Style                               |
|------------|------|-------------------------------------|
| `title`    | `h1` | `text-2xl font-bold tracking-tight` |
| `subtitle` | `p`  | `text-sm text-muted-foreground`     |
| `body`     | `p`  | `text-base`                         |

```tsx
<Text variant="title">Diamond Log</Text>
<Text variant="subtitle">Your entries</Text>
<Text variant="body">Some content here.</Text>
```

## Dark Mode

The app is permanently dark. The `dark` class is hardcoded on `html` in `layout.tsx`. There is no light mode toggle. All color tokens resolve from the `.dark` block in `globals.css`.

## Local Dev

```bash
npm run dev   # runs on https://localhost:3000 (--experimental-https)
npm run build
npm run lint
```

## Environment Variables

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db-name>?appName=<app>
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

## Known Gotchas

- **Next.js docs**: Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/`. This project uses Next.js 16 with behavior that may differ from older assumptions.
- **Tailwind font variables**: In `globals.css`, `@theme inline` must map `--font-sans` to `var(--font-inter)`.
- **Backend vs frontend**: Backend logic lives in `src/app/api/`. Frontend components live in `src/components/`.
- **Server actions in components**: Components that use server actions import from `src/app/api/*-actions.ts` rather than inlining `"use server"` directly.
- **Server/client component split**: Components that fetch DB-backed data stay as server components. If they need client hooks or event handlers, use a server wrapper plus a separate `*-client.tsx` component, as with `trading-rules-dialog.tsx`.
- **Rules ownership**: Rules use `session.user.email` for ownership, same as logs. Never trust a client-provided user id/email for rule mutations.
- **Indicator ownership**: Indicators use `session.user.email` for ownership, same as logs and rules. Never trust a client-provided user id/email for indicator mutations.
- **NextAuth session has no `id`**: Default JWT strategy with Google provider only includes `name`, `email`, and `image`. Use `session.user.email` as the user identifier.
- **MongoDB default database**: URI without a database name routes to `test`. Always include `/<db-name>` before the query string.
- **Cloudflare direct upload**: `POST /images/v2/direct_upload` must use `multipart/form-data`, not JSON. The upload URL format is `https://upload.imagedelivery.net/<accountHash>/<imageId>`; parse index `[3]` for account hash to build delivery URLs.
- **Cloudflare image delivery URL**: `https://imagedelivery.net/<accountHash>/<imageId>/resize1080`; `resize1080` is the configured delivery variant.
- **formAction outside transition**: Calling `formAction` from `useActionState` outside `startTransition` throws a warning. Wrap programmatic calls with `startTransition(() => formAction(fd))`.
- **ImageLightbox in table**: Keep `ImageLightbox` as a self-contained `DialogRoot`; one dialog per row is fine.
