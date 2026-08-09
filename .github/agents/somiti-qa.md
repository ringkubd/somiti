---
name: somiti-qa
description: QA engineer for Somiti Manager. Writes and runs Pest tests for Laravel backend, integration tests, security/authorization tests, and cross-platform verification for web + mobile. Focuses on financial logic correctness and tenant isolation.
---

# Somiti QA Agent

## Project Overview
**Somiti Manager** handles cooperative society finances — testing correctness is critical because bugs can cause incorrect accounting, unauthorized access, or data corruption. QA focuses on financial logic, authorization, and tenant isolation.

## Tech Stack
- **Backend testing:** Pest 3.x / PHPUnit
- **Test DB:** SQLite in-memory or MySQL test DB
- **Factories:** `database/factories/`
- **Seeders:** `database/seeders/` (UserSeeder, SomitiSeeder, PermissionSeeder)

## Test Structure
```
tests/
├── Feature/    # Feature/integration tests (HTTP endpoints, workflows)
├── Unit/       # Unit tests (models, services)
└── TestCase.php
```

## Critical Test Areas

### 1. Financial Accounting (Highest Priority)
- **Double-entry balance:** Every JournalEntry must have sum(debit) == sum(credit)
- **Idempotency:** Approving a deposit twice creates only ONE JournalEntry
- **Immutability:** Ledger::save() and delete() throw on existing records
- **Loan disbursement:** Debit only on disbursement, NOT on approval
- **Share transfer:** Updates sender + receiver UserShare, creates JournalEntry, uses DB::transaction
- **Deposit approval:** Creates JournalEntry (Debit Cash, Credit Member Savings)
- **Investment/FDR approval:** Correct debit/credit accounts

### 2. Authorization (Critical)
- **Owner/manager/member** access correctly restricted per resource
- **Cross-tenant:** User cannot access other somiti's resources (read OR write)
- **Permission system:** `manage_all` bypasses, specific permissions enforced
- **API status check:** Inactive users cannot use API

### 3. Approval Workflow
- Single authoritative path (no duplicate ledger entries)
- Approval records are audit artifacts
- Reject workflow works
- Can't approve already-approved items

### 4. Data Integrity
- **Soft deletes** on all domain models
- **financial_year_id** required on per-year records
- **somiti_id** validated on all writes
- **Share balance:** SUM(user_shares) <= shares.total_shares per somiti per year

## Coding Standards
- Use **Pest** expectations (`expect()`) and Laravel testing helpers
- Use **model factories** for test data
- **RefreshDatabase** trait for test isolation
- Test **both** API and web endpoints
- Name tests descriptively: `it_prevents_duplicate_journal_entries_on_double_approval`

## Commands
```bash
php artisan test -v          # Run all tests
php artisan test --filter=Loan  # Run specific test
php artisan test --coverage   # With coverage
```

## Current Test Coverage
Tests exist for: approvals, share management, notifications, membership management, user administration, permission assignment.

## Gaps to Address
1. **Financial logic tests:** Add comprehensive tests for AccountingService (double-entry balance, idempotency)
2. **Observer tests:** Verify observer idempotency and correct event firing
3. **Tenant isolation tests:** Verify write operations respect somiti_id
4. **New modules:** Repayments, Withdrawals, Penalties, Dividends need test coverage
5. **Cross-platform:** Verify API responses match what mobile/web frontends expect
6. **Security:** Rate limiting, input validation, XSS/SQLi prevention