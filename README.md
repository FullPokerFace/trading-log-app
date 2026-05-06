# Diamond Diary

Trading journal built with Next.js 16, App Router, TypeScript, Tailwind CSS v4, shadcn/ui, NextAuth v5 beta, MongoDB/Mongoose, and Cloudflare Images.

## Features

- Google OAuth sign-in with NextAuth.
- Protected dashboard at `/dashboard`.
- Trade log entries stored per user by `session.user.email`.
- Optional Cloudflare Images screenshots on trade entries.
- Trading rules stored per user and displayed above the trade log.
- Rules dialog for adding and deleting trading rules.
- Trade indicators stored per user, with an indicators dialog for adding and deleting checkbox indicators.
- Indicators support user-selected Lucide icons from a curated 40-icon set.
- New log entries use user-created indicators instead of hardcoded direction, option, outcome, or entry-rules fields.
- Trade log indicator columns are generated from the user's indicators and show saved per-trade answers.
- Permanently dark UI.

## Key Files

- `src/app/dashboard/page.tsx` renders the protected dashboard and mounts rule/log components.
- `src/components/logs.tsx` fetches and renders trade logs.
- `src/components/log-entry-form.tsx` fetches user indicators for the new log form.
- `src/components/log-entry-form-client.tsx` creates new trade logs, renders indicator checkboxes, and handles image uploads.
- `src/components/trading-rules.tsx` fetches and renders trading rules top-to-bottom.
- `src/components/trading-rules-dialog.tsx` fetches rules for the rules dialog.
- `src/components/trading-rules-dialog-client.tsx` handles interactive add/delete rule behavior.
- `src/components/trade-indicators-dialog.tsx` fetches indicators for the indicators dialog.
- `src/components/trade-indicators-dialog-client.tsx` handles interactive add/delete indicator behavior and icon selection.
- `src/components/indicator-icon.tsx` renders the selected Lucide icon for an indicator.
- `src/app/api/log-actions.ts` contains trade log server actions.
- `src/app/api/rule-actions.ts` contains trading rule server actions.
- `src/app/api/indicator-actions.ts` contains trade indicator server actions.
- `src/app/api/models/log.ts` defines the log schema.
- `src/app/api/models/rule.ts` defines the rule schema.
- `src/app/api/models/indicator.ts` defines the indicator schema.
- `src/lib/indicator-icons.ts` defines the allowed indicator icon names and labels.

## Local Dev

```bash
npm run dev
npm run build
npm run lint
```

The dev server runs on `https://localhost:3000` because `npm run dev` uses Next's experimental HTTPS flag.

## Environment Variables

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db-name>?appName=<app>
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

Include the database name in `DB_URI`; otherwise MongoDB defaults to `test`.
