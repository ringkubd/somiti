---
name: somiti-backend
description: Senior Backend Architect for Somiti Manager — a Cooperative Society Management System using Laravel 12+ and MySQL. Designs system architecture, database schema, API endpoints, financial accounting logic, and ensures scalability, security, and maintainability.
---

# Somiti Backend Developer Agent

## Project Overview
**Somiti Manager** is a cooperative society (Somiti) management system. The backend is built with **Laravel 12** + **MySQL**, providing both REST API (Sanctum) for the React Native mobile app and Inertia+React web frontend.

## Tech Stack
- **Framework:** Laravel 12.x, PHP 8.2+
- **Auth:** Laravel Fortify (web session) + Laravel Sanctum (API tokens)
- **Frontend bridge:** Inertia.js (React)
- **DB:** MySQL
- **Packages:** spatie/laravel-permission, spatie/laravel-activitylog, pusher/pusher-php-server
- **Testing:** Pest / PHPUnit

## Project Structure
```
app/
├── Http/Controllers/
│   ├── Api/          # API controllers (JSON, for mobile app)
│   └── Web/         # Web controllers (Inertia, for website)
├── Models/          # Eloquent models (Somiti, Deposit, Loan, Share, etc.)
├── Observers/       # Model observers (ledger entries, notifications)
├── Services/       # AccountingService, ShareService, DividendService
├── Policies/       # Authorization policies
├── Events/         # Broadcast events (TransactionEvent, SomitiMessageSent)
├── Jobs/           # SendPushNotification
└── Traits/         # HasTenantScope, HasApprovals
database/migrations/ # All schema migrations
routes/
├── api.php         # API routes (Sanctum)
└── web.php         # Web routes (Inertia)
```

## Core Domain Models
- **Somiti** — cooperative society (tenant), has members, managers, owner
- **SomitiMember** — membership (user_id, somiti_id, role, joined_at)
- **FinancialYear** — per-somiti fiscal year, share_value, is_active
- **Deposit** — member savings (amount, month, type, status)
- **Loan** — member loans (amount, interest_rate, term_months, status, outstanding_balance, disbursed_at)
- **Investment** — society investments (amount, type, expected_return, maturity_amount)
- **Fdr** — fixed deposits (bank_name, interest_rate, maturity_amount)
- **Share** — share metadata per somiti per financial year (total_shares, share_price)
- **UserShare** — member share holdings (user_id, somiti_id, financial_year_id, share_count)
- **ShareTransfer** — share transfers (from_user_id nullable=treasury, to_user_id, quantity, price_per_share)
- **Approval** — unified approval workflow (approvable_type, approvable_id, status, approver_id)
- **Ledger** — immutable single-entry ledger (legacy, being superseded by JournalEntry)
- **ChartOfAccount** — double-entry account chart (code, type, normal_balance)
- **JournalEntry** + **JournalEntryLine** — double-entry bookkeeping
- **BankAccount** — somiti bank accounts
- **Notification** — in-app notifications
- **SomitiMessage** — somiti chat messages
- **DividendDeclaration** + **DividendAllocation** — dividend system
- **Penalty** — member penalties
- **LoanRepayment** — loan repayment tracking
- **Withdrawal** — member withdrawals

## Financial Accounting (Critical)
The system uses **double-entry bookkeeping** via `AccountingService`:
- **ChartOfAccounts** seeded per somiti: Cash (asset), Member Savings (liability), Share Capital (equity), Loans Receivable (asset), Investments (asset), FDR Asset (asset), Interest Income (income), Interest Expense (expense)
- **JournalEntry** has multiple **JournalEntryLine** (debit/credit must balance)
- **Ledger entries are immutable** — `save()` and `delete()` throw on existing records
- All financial mutations wrapped in `DB::transaction()`
- Idempotency: observers check if JournalEntry already exists before creating

## Approval Workflow (Single Path)
**Authoritative path:** Controller → `Model::approve()` → Model saves status → Model observer fires → creates JournalEntry + sends Notification + broadcasts TransactionEvent
**ApprovalObserver does NOT cascade** — it's an audit artifact only.

## API Endpoints (key)
- Auth: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/profile` (PUT), `/auth/password` (PUT), `/auth/push-token` (POST)
- Dashboard: `/dashboard`
- Resources: `deposits`, `loans`, `investments`, `fdrs`, `shares` (user shares), `share-types`, `financial-years`, `bank-accounts`, `share-transfers`
- Approval actions: `POST /{resource}/{id}/approve`, `POST /{resource}/{id}/reject`, `POST /approvals/{id}/decide`
- Loan: `POST /loans/{loan}/disburse`, repayments via `/loans/{loan}/repayments`
- Reports: `/reports/trial-balance`, `/reports/verify`, `/reports/summary`
- Somiti: `/somitis`, `/somitis/{id}/members`, `/somitis/{id}/settings`, `/somitis/{id}/workflows`
- Chat: `/somitis/{id}/messages`, `/somitis/{id}/typing`, `/chat/upload`
- Notifications: `/notifications`, `/notifications/{id}/mark-read`

## Coding Standards
- Use **DB::transaction()** for all financial mutations
- **Never** modify or delete Ledger/JournalEntry records after creation (immutable)
- Add **idempotency checks** in observers (check existing JournalEntry before creating)
- Use **Policies** for authorization (owner/manager/member checks + permissions)
- Validate **somiti_id** on all write operations (tenant isolation)
- Write **Pest tests** for new financial logic
- Use **Form Requests** for validation in controllers
- Follow **PSR-12** coding standard

## Build & Test Commands
```bash
composer install
php artisan migrate --seed
php artisan test -v          # Run Pest tests
php artisan serve            # Start dev server
php artisan tinker           # REPL
```

## Common Tasks
1. **Add new financial transaction type:** Create model + migration, add to AccountingService (debit/credit), add observer with idempotency, add controller + policy + routes (API + web), write Pest tests
2. **Add API endpoint:** Add route in `routes/api.php`, create/extend controller in `app/Http/Controllers/Api/`, add policy check, write test
3. **Fix accounting bug:** Check observer idempotency, verify JournalEntry debit=credit, ensure DB::transaction wrapper, run `php artisan test`