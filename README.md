# points-mall-frontend

> Next.js 14 App Router application — the main user-facing product. Consumes `points-mall-frontend-base` for all shared UI primitives and calls only the BFF gateway for data.

## Pages & Modules

| Module              | Key Pages                                                 | Rendering              |
| ------------------- | --------------------------------------------------------- | ---------------------- |
| Auth                | Login (email + GitHub OAuth), callback                    | CSR                    |
| Employee Dashboard  | Personal points balance, attendance status, announcement  | SSR                    |
| Attendance          | Check-in, attendance history, calendar view               | SSR                    |
| Points Ledger       | Transaction history, type filter, date range              | SSR                    |
| Points Mall         | Product grid, search, category filter                     | ISR (5 min revalidate) |
| Product Detail      | Product info, stock, redeem action                        | ISR                    |
| Order Center        | My orders, status timeline                                | SSR                    |
| Notification Center | Bell dropdown, notification list, mark-as-read            | CSR                    |
| Admin Dashboard     | KPI banner, 4 chart panels, date range picker             | SSR                    |
| Admin Management    | Employee list, attendance admin, points manual adjustment | SSR                    |
| System Config       | Dynamic menu editor, announcements, feature flags         | SSR                    |
| Data Reports        | Chart panels, export button (Excel)                       | SSR                    |

## Key Frontend Capabilities

- **Three-Level RBAC** — route guard (Next Middleware) + page-level 403 + button-level permission hook
- **React Query** — server state management: auto-cache, optimistic updates, window-focus refetch, parallel/serial fetching
- **Zustand** — modular global state: `useAuthStore`, `useThemeStore`, `useConfigStore`; persisted across page refreshes
- **Silent Token Refresh** — 401 interceptor in Axios silently reuses refresh token; user session never drops unexpectedly
- **Error Boundaries** — component-level `ErrorBoundary` + Next global `error.tsx` + runtime `window.onerror` capture
- **Large File Upload** — Blob slice chunked upload, progress bar, resume-on-failure
- **SSG / ISR / SSR** — rendering strategy chosen per page based on data freshness requirements
- **Full SEO** — Next Metadata API (static + dynamic), OG tags, `sitemap.xml`, `robots.txt`, JSON-LD structured data
- **i18n** — next-intl bilingual (EN/ZH), timezone auto-sync, multi-currency format, GDPR cookie consent
- **Safari Compatibility** — CSS flex fixes, SameSite Cookie handling, Date parsing polyfills

## Why This Tech Stack

Next.js 14 with the App Router is the current mainstream full-stack React framework. The App Router enables mixing SSR, SSG, ISR, and CSR rendering strategies at the page level — which is exactly what this project needs: the product grid benefits from ISR (5-minute revalidation), the employee dashboard needs SSR (fresh data per request), and the notification bell needs CSR (real-time without full-page reload).

The App Router's `route.ts` API routes also mean the BFF health check lives in the same codebase as the UI, keeping the frontend self-contained for development and testing.

## Tech Stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 16 (App Router), React 19, TypeScript 5.8 |
| Styling      | TailwindCSS                                       |
| State        | Zustand + React Query                             |
| Forms        | React Hook Form + Zod                             |
| HTTP         | Axios (interceptors from `frontend-base`)         |
| Charts       | ECharts / Recharts                                |
| i18n         | next-intl                                         |
| Testing      | Vitest (unit), Playwright (E2E)                   |
| Base Package | `@points-mall/frontend-base` (npm)                |

## Docker

```bash
docker build -t points-mall-frontend .
docker run --env-file .env.production -p 3003:3003 points-mall-frontend
```

## Local Development

```bash
pnpm install
cp .env.local.example .env.local
pnpm run dev
# App: http://localhost:3003
```

## Code Quality

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier (check only)
pnpm format        # Prettier (auto-fix)
```

Formatting and linting run automatically on staged files via the pre-commit hook. CI runs on every PR via `.github/workflows/ci.yml` in this repository.

## Key Environment Variables

```env
NEXT_PUBLIC_BFF_URL=http://localhost:4000
NEXT_PUBLIC_APP_ENV=development
NEXTAUTH_SECRET=your-nextauth-secret
GITHUB_CLIENT_ID=your-github-client-id
```
