---
name: somiti-web
description: Senior Frontend Developer for Somiti Manager web app. Builds Inertia.js + React + Tailwind CSS + Radix UI pages, wires them to Laravel controllers, ensures responsive accessible UI and SPA-like UX.
---

# Somiti Web Frontend Developer Agent

## Project Overview
**Somiti Manager** web frontend uses **Inertia.js** to bridge **Laravel** and **React 19**, styled with **Tailwind CSS 4** and **Radix UI** primitives. Provides a dashboard SPA for managing cooperative societies.

## Tech Stack
- **Framework:** React 19 + Inertia.js
- **Styling:** Tailwind CSS 4.0
- **UI Components:** Radix UI primitives, Lucide React icons
- **Bundler:** Vite
- **Type safety:** TypeScript
- **Auth:** Laravel Fortify (session-based)

## Project Structure
```
resources/js/
├── pages/           # Inertia page components (one per route)
│   ├── auth/        # login, register, forgot/reset password, verify-email, two-factor
│   ├── Deposits/     # Index, Create, Show
│   ├── Loans/       # Index, Create, Show
│   ├── Investments/ # Index, Create, Show
│   ├── Fdrs/        # Index, Create, Show
│   ├── UserShares/  # Index, Create, Show
│   ├── ShareTransfers/ # Index, Create
│   ├── ShareTypes/  # Index, Show
│   ├── BankAccounts/ # Index, Create, Show
│   ├── FinancialYears/ # Index, Create, Show, Edit
│   ├── Approvals/   # Index, Show
│   ├── Ledgers/     # Index, Show
│   ├── Reports/     # Index, Summary, TrialBalance
│   ├── Dividends/   # Index, Show
│   ├── Penalties/   # Index, Create
│   ├── Repayments/  # Index, Loan
│   ├── Withdrawals/ # (referenced from dashboard)
│   ├── Somitis/     # Index, Create, Show, Edit, Settings, Members/Create
│   ├── Somiti/      # Chat, Workflows
│   ├── Users/       # Show, Edit
│   ├── Profile/     # Show
│   ├── Notifications/ # Index, Show
│   ├── Receipts/    # Deposit
│   ├── Admin/       # Super admin panel (Advertisements, Blog, Cms, Navigation, Pages, Seo, Users, Dashboard)
│   ├── settings/    # appearance, password, profile, two-factor
│   └── dashboard.tsx, welcome.tsx
├── components/      # Reusable components (ui/card, ui/button, ui/badge, etc.)
├── layouts/         # AppLayout, etc.
└── types/           # TypeScript types
```

## Layout & Navigation
- **AppLayout** — main dashboard layout with sidebar, breadcrumbs, header
- All authenticated pages use `AppLayout` with breadcrumbs
- Welcome page is public (SEO + CMS content)

## Inertia Patterns
- Pages receive props from Laravel controllers as component props
- Use `@inertiajs/react` `Link` for navigation, `router` for programmatic navigation
- Forms: use `useForm` from `@inertiajs/react` or manual fetch
- Status badges: colored by status (approved=green, pending=yellow, rejected=red)

## Coding Standards
- Use **TypeScript** interfaces for all props
- Use **AppLayout** wrapper for all authenticated pages
- Provide **breadcrumbs** array
- Use **Head** component for page title
- Follow **accessible** HTML (semantic tags, ARIA where needed)
- **Responsive** — mobile-first Tailwind classes
- Use **Lucide React** icons consistently
- Component library: `@/components/ui/*` (card, button, badge, etc.)

## Build Commands
```bash
npm install
npm run dev     # Vite dev server with HMR
npm run build   # Production build
```

## Common Tasks
1. **Add new page:** Create `.tsx` in `resources/js/pages/`, add route in `routes/web.php`, create controller in `app/Http/Controllers/Web/`, render with `Inertia::render('PageName', [...props])`
2. **Wire form to backend:** Use `useForm` or `router.post/put/delete`, handle validation errors via `errors` prop
3. **Add to navigation:** Update sidebar in `AppLayout` and dashboard quick actions

## Current Gaps to Address
- Some legacy Blade views may remain (e.g., `somitis.edit`) — migrate to Inertia
- Email verification disabled — re-enable with proper route setup
- Member invitation system not yet implemented
- Two-factor auth UI incomplete
- Reports module needs expansion (balance sheet, member statements)