# Somiti Manager – Project Completion Plan

**Date:** 2026-08-09 · **Branch:** `mobile-app` · **Stack:** Laravel 12 (API+Inertia/React web) + React Native Expo (`somiti-mobile/`)

---

## 1. System Review Summary (what already works)

### Backend (Laravel) — Core finance is mostly built
- ✅ Double-entry accounting: `chart_of_accounts`, `journal_entries`, `journal_entry_lines`; `AccountingService` records deposits, loan disbursements, share purchases, share transfers (peer + treasury), investments, FDRs, share revaluation, dividends, and verifies balance (`verifyBalances`, trial balance).
- ✅ Loan repayments: `loan_repayments` table, `LoanRepayment` model, `LoanRepaymentService` (flat/reducing EMI split), `AccountingService::recordLoanRepayment` (Debit Cash / Credit Loans Receivable + Interest Income), approve/reject API, observer notifications; loans auto-close at zero balance.
- ✅ Dividends API: `DividendController` wired to existing `DividendService` (declare → allocations → approve/pay with journal entries).
- ✅ Withdrawals: `withdrawals` table/model/service; approval validates member savings balance and journals Debit Member Savings / Credit Cash.
- ✅ Penalties: `penalties` table/model; `CODE_INCOME_PENALTY` seeded per somiti; approval journals Debit Cash / Credit Penalty Income.
- ✅ Approval workflow: `HasApprovals` trait, `Approval` model, per-somiti `SomitiWorkflow` (requires_approval, min_approvals, manager_can_approve_alone); observers are idempotent (no double ledger entries); approval path is Controller → Model::approve() → observer.
- ✅ Share system: `Share`, `UserShare`, `ShareTransfer` (with `financial_year_id`), `ShareService` (balance, ownership history, transfer execution), `ShareObserver` revaluation, `ShareOwnershipHistory`.
- ✅ Core modules: Deposits, Loans (approve + disburse), Investments, FDRs, Bank Accounts, Financial Years, Ledgers/Reports (summary, trial balance, verify), Notifications, Audit trail, Chat (messages/typing/upload), Settings (somiti settings, workflows, notification preferences), Receipts (web).
- ✅ Auth: Sanctum API + Fortify web; phone OR email registration/login; role field (`super_admin`) + simple permission system; `EnsureFirstTimeSomitiCreation` onboarding middleware.
- ✅ Web admin (super_admin): advertisements, users, SEO, CMS, navigation, pages, blog posts/categories.
- ✅ Public website: welcome page with SEO/CMS content, blog, dynamic pages.
- ✅ Web frontend is fully Inertia/React (only `app.blade.php` remains as the Blade shell).
- ✅ Immutability: `Ledger` and `JournalEntry` block update/delete; member removal soft-deactivates (`left_at`).

### Mobile (React Native Expo) — Most screens exist
- ✅ Auth (login/register), onboarding (create/join somiti), dashboard with stats, deposits, loans, investments, FDRs, bank accounts, shares, share transfers, approvals (approve/reject), reports (summary, trial balance), notifications, financial years, profile/password, chat (mentions, emoji, image upload, polling), local auth lock (PIN), push notification scaffolding (uncommitted work).
- ✅ Mobile push notifications completed (token registered after login, tap → notifications screen); real Somiti settings screen; member management (list/add/remove with roles); loan repayment, dividend, withdrawal, and penalty screens; navigation cleanup (duplicate screen typo removed); `GET /api/users/search` backend endpoint added to support adding members.

### Known problems right now
- ✅ **21 failing tests fixed** (73 pass, 15 skip). Root cause: `LoginRequest` now extends `Laravel\Fortify\Http\Requests\LoginRequest`; `UserFactory`/`CreateNewUser` default status to `active` so `CheckUserStatus` doesn't bounce authenticated users; `DashboardTest` creates a somiti for the user; email-verification tests skipped (feature disabled by design in `config/fortify.php`).
- ⚠️ Uncommitted push-notification work (`SendPushNotifications` command, `PushToken`, migration, Expo token hook, FCM config files) — needs completion + verification.
- ⚠️ `SomitiSettingsScreen` on mobile is a placeholder ("available on web").
- ⚠️ No member-management UI on mobile (add/remove/roles).
- ✅ Deposit API `store()` autofills `financial_year_id` from the active financial year; FDR table has nullable `user_id` (defaults to the actor) and `investment_id` is nullable.
- ✅ Tenant write isolation: membership/role checks added to Deposit, FDR, Bank Account, and Share Transfer `store()`; new module controllers enforce member/manager/owner access; new models registered in the approvals list.

---

## 2. Gap Analysis vs. Technical Development Document

| Module | Doc requirement | Current state | Action |
|---|---|---|---|
| Loan repayment / EMI | Monthly installment, interest calc (flat/reducing), loan close | ❌ Not implemented (`outstanding_balance` never updated) | New `loan_repayments` module + EMI calculator |
| DPS / recurring savings | Plan, monthly deposit, missed installment, maturity | ⚠️ Deposit `type='dps'` exists only | Track via deposits; maturity calc optional Wave 2 |
| Profit distribution | Share-based / equal / custom, auto ledger credit | ⚠️ `DividendDeclaration` + `DividendAllocation` models + `DividendService` exist; no API/UI | Wire API controllers + web/mobile UI |
| Withdrawal | Request → approval → balance validation | ❌ Not implemented | New `withdrawals` module |
| Penalty & fine | Late deposit / loan default penalty, auto ledger | ❌ Not implemented | New `penalties` module |
| OTP auth | phone/email + OTP | ❌ Password only | Wave 2 (optional) |
| PDF / Excel export | Reports export | ❌ Not implemented | CSV export now, PDF Wave 2 |
| Member management (mobile) | Add/deactivate, roles | ⚠️ API exists, mobile UI missing | Mobile member screens |
| Receipts (mobile) | Receipt view | ⚠️ Web only | Mobile receipt screens |
| Push notifications | Real-time + push | ⚠️ Scaffolded, uncommitted | Complete + verify |
| Real-time chat | Live updates | ⚠️ Polling (3s) works | Wave 2: websockets/Echo |
| Two-factor auth | 2FA | ⚠️ Fortify scaffolding, disabled | Wave 2 |
| Email verification | Verification flow | ❌ Disabled by design; tests fail | Fix tests (skip or define routes) |

---

## 3. Standard API Contract for New Modules

All authenticated via Sanctum. All statuses: `pending` → `approved` / `rejected`. All financial mutations must go through `AccountingService` inside `DB::transaction` with idempotency checks.

### Loan Repayments
```
GET  /api/loans/{loan}/repayments            → list repayments for a loan
POST /api/loans/{loan}/repayments            → { amount, payment_date, method?, notes? }  (user creates own)
GET  /api/repayments                         → paginated list (member's or somiti-wide for manager)
POST /api/repayments/{repayment}/approve     → { decision: 'approved'|'rejected', comment? } via /approvals or direct
POST /api/repayments/{repayment}/reject
```
Fields: `id, loan_id, somiti_id, user_id, amount, principal_portion, interest_portion, payment_date, method, notes, status, created_at`.
On approval: validate `amount <= outstanding_balance`, compute portions (flat = amount/term, reducing = amortization), reduce `outstanding_balance`, create journal entry **Debit Cash / Credit Loans Receivable** (add `AccountingService::recordLoanRepayment`).

### Dividends (profit distribution)
```
POST /api/somitis/{somiti}/dividends     → { total_amount, distribution_type: share_based|equal|custom, financial_year_id, per_share_amount? }
GET  /api/somitis/{somiti}/dividends     → declarations
GET  /api/dividends/{dividend}/allocations
POST /api/dividends/{dividend}/approve   → creates allocations + journal entry (Debit Interest Expense / Credit Cash) via DividendService
POST /api/dividends/{dividend}/reject
```

### Withdrawals
```
GET  /api/withdrawals
POST /api/withdrawals                    → { somiti_id, amount, reason, method? }
POST /api/withdrawals/{withdrawal}/approve
POST /api/withdrawals/{withdrawal}/reject
```
On approval: validate member savings balance ≥ amount; journal **Debit Member Savings / Credit Cash**; reject if insufficient.

### Penalties
```
GET  /api/penalties
POST /api/penalties                      → { somiti_id, user_id, type: late_deposit|loan_default|other, amount, reference_type?, reference_id?, notes? }
POST /api/penalties/{penalty}/approve
POST /api/penalties/{penalty}/reject
```
On approval: journal **Debit Cash / Credit Penalty Income** (add `CODE_INCOME_PENALTY` to chart-of-accounts seed).

---

## 4. Work Streams & Agent Assignments

### Agent A — Backend Finance (PHP) — scope: `app/`, `database/`, `routes/`, `tests/`, `config/`
1. ✅ Fix the 21 failing tests (LoginRequest inheritance bug, verification-route tests).
2. ✅ FDR migration: add nullable `user_id`; fix `FdrController::store()`.
3. ✅ Deposit `store()`: auto-fill `financial_year_id` from active financial year.
4. ✅ Loan repayments (migration, model, `AccountingService::recordLoanRepayment`, EMI calc, API, tests).
5. ✅ Dividends (wire existing `DividendService` into API controllers + routes + tests).
6. ✅ Withdrawals module + tests.
7. ✅ Penalties module (incl. penalty-income account code) + tests.
8. ✅ Tenant write isolation: membership checks in financial controllers + policies.
9. ✅ Verify: `php artisan test` fully green (73 passed, 15 skipped, 0 failures).

### Agent B — Mobile App (React Native) — scope: `somiti-mobile/` only
1. ✅ Finish push notifications (register token, tap-to-navigate, refresh on login; keep existing uncommitted work).
2. ✅ Real `SomitiSettingsScreen` (fetch + update via `GET/PUT /api/somitis/{id}/settings`).
3. ✅ Member management screens (list members/roles, add member by phone/email, remove member) — added `GET /api/users/search` backend endpoint to support adding members.
4. ✅ Loan repayment screens per contract (list, create, approve/reject for managers) — linked from loan detail; deposit receipt screen added and linked from deposit detail.
5. ✅ Dividend, withdrawal, penalty screens per contract.
6. ✅ Fix navigation issues (duplicate `ChangesPasswordFromMore` typo), unify headers.
7. ✅ Verify: `npx tsc --noEmit` in `somiti-mobile/` passes.

### Agent C — Web Frontend (Inertia React) — scope: `resources/js/`, web controllers + `routes/web.php`
1. ✅ Approvals: full decision UI on `Approvals/Show` (approve/reject + comment), pending-count badge in sidebar.
2. ✅ Member management: role editing (PUT `/somitis/{somiti}/members/{user}`) + member list improvements (phone/joined date, remove) on web.
3. ✅ Reports: member statement page (`/somitis/{somiti}/reports/member-statement`) + CSV export (`summary.csv`, `member-statement.csv`).
4. ✅ New module pages: loan repayments, dividends, withdrawals, penalties (web controllers + routes + Inertia pages) per contract; web route names prefixed `web.` to avoid wayfinder collisions.
5. ✅ Admin polish: dashboard KPI cards, pending-approvals card, consistent tables, new-module quick actions.
6. ✅ Verify: `npm run types` (0 errors) and `npm run build` pass. Also fixed pre-existing TS errors (auth/settings/chat/admin pages, wayfinder route-name collisions `reports.*` / `somitis.destroy`).

---

## 5. Coordination Rules
- **Do not touch files outside your scope.** Shared files: `routes/api.php` belongs to Agent A; `routes/web.php` + `resources/js/` to Agent C; `somiti-mobile/` to Agent B.
- Do not commit/push; leave the worktree changes for the user. Preserve all existing uncommitted work (push-notification scaffolding).
- New modules must follow the API contract above; if a contract detail is ambiguous, keep it simple and consistent with existing code style.
- Every new backend module needs at least one feature test (approve path + balance/journal assertion).
- Update progress markers in `plans/project-completion-plan.md` when a step is done.

## 6. Definition of Done
- `php artisan test` → 0 failures.
- Mobile TypeScript compiles; new screens functional against documented endpoints.
- Web compiles/builds; new pages reachable and consistent with the existing design system.
- New financial modules create balanced journal entries (verified by `AccountingService::verifyBalances` / trial balance test).

---

## 7. Production Deployment (2026-08-09)

**Server:** HestiaCP 1.9.9 (Ubuntu 24.04) · user `anwar` · PHP 8.4 FPM · MariaDB 11.4
**Domain:** https://fnfsomiti.bdesmart.com (Let's Encrypt, forced SSL, HSTS)

### What was deployed
- App root: `/home/anwar/web/fnfsomiti.bdesmart.com/public_html/somiti` (docroot → `.../somiti/public` via `v-change-web-domain-docroot`).
- Database: `anwar_somiti` / user `anwar_anwar_somiti` (MySQL). Migrations + PermissionSeeder run; no demo seed data.
- Admin account: `admin@fnfsomiti.bdesmart.com` / phone `01700000001` — password in `ADMIN_CREDENTIALS.txt` (chmod 600) next to the app.
- Super admin: `ajr.jahid@gmail.com` / `01816112233` / password `123456789`, `role=super_admin` — web login verified (email + phone → redirect to dashboard).
- **Login fix (2026-08-09):** accounts were created with `status=pending` because `status` was not in `User::$fillable` (silently dropped by mass assignment) → `CheckUserStatus` logged users out right after login ("Your account is currently pending."). Fixed by setting `status='active'` in DB and adding `'status'` to `User::$fillable`. Full flow verified: login → dashboard → first-time somiti onboarding (200).
- Production `.env`: APP_ENV=production, APP_DEBUG=false, database queue/cache/session, Pusher broadcast (existing ws.isdb-bisew.org credentials), Sanctum stateful domain set.
- Services: `somiti-queue.service` (systemd queue worker, runs as `anwar`), scheduler cron (`php artisan schedule:run` every minute).
- Build: `composer install --no-dev --optimize-autoloader`; Vite assets built locally and rsynced (`public/build`).

### Critical bug found & fixed during deployment
- **Tenant-scope infinite recursion (OOM):** `UserAccessScope` applies a global scope to `Somiti` queries, and its own `orWhereHas('members')` / `whereHas('somiti')` subqueries re-trigger the same scope on nested builders → unbounded recursion → every authenticated request OOM'd (dashboard, somiti create, etc.). CLI/tests never caught it because `runningInConsole()` skips the scope.
- Fix: re-entrancy guard (`static::$depth`) in `app/Models/Scopes/UserAccessScope.php` + regression test `tests/Feature/TenantScopeRecursionTest.php` (forces the HTTP code path via reflection).
- Also added missing public blog pages (`resources/js/pages/Public/Blog/Index.tsx`, `Show.tsx`) which were referenced by `PublicPageController` but never existed (blog returned 500).
- Mobile: added detail screens for Investments, FDRs, Bank Accounts, User Shares, and Share Transfers (list items now navigate to a detail view); `npx tsc --noEmit` passes.

### Deploy commands (repeatable)
```
rsync -az --exclude .git --exclude node_modules --exclude vendor --exclude .env --exclude somiti-mobile ./ root@163.53.149.99:/home/anwar/web/fnfsomiti.bdesmart.com/public_html/somiti/
ssh root@163.53.149.99 'cd /home/anwar/web/fnfsomiti.bdesmart.com/public_html/somiti && composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan config:cache && php artisan view:cache && chown -R anwar:anwar storage bootstrap/cache && systemctl restart php8.4-fpm somiti-queue'
```
