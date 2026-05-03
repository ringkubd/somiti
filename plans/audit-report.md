# 🔎 COMPREHENSIVE AUDIT REPORT — Somiti Management System

**Audit Date:** 2026-05-03  
**Auditor:** Senior Software Architect & Financial Systems Auditor  
**Codebase:** Laravel 11 + MySQL + Inertia.js/React  

---

## 🔎 EXECUTIVE SUMMARY

**Overall System Rating: 4.5 / 10**

The system has a reasonable foundation — multi-tenant Somiti model, approval workflows, observer-driven ledger entries, and share tracking per financial year. However, it contains **critical financial accounting flaws**, **broken authorization for share transfers**, **data integrity risks**, and is **not SaaS-ready**.

### Key Risks

| # | Risk | Severity |
|---|------|----------|
| 1 | Ledger is single-entry — no double-entry accounting, no account chart | 🔴 Critical |
| 2 | Duplicate ledger entries from dual approval paths (controller + observer) | 🔴 Critical |
| 3 | Share transfer system is non-functional (policy blocks all access) | 🔴 Critical |
| 4 | Share transfers lack `financial_year_id` — breaks per-year share tracking | 🔴 Critical |
| 5 | No database transactions on financial operations — race conditions | 🔴 Critical |
| 6 | Loan observer creates debit on BOTH approved AND disbursed — double counting | 🔴 Critical |
| 7 | `Somiti::removeMember()` force-deletes membership — destroys audit trail | 🟠 High |
| 8 | `ShareController.update()` bypasses model events — no ledger entry on price change | 🟠 High |
| 9 | Ledger entries are mutable/deletable — no immutability protection | 🟠 High |
| 10 | `UserAccessScope` only filters reads, not writes — cross-tenant write risk | 🟠 High |

### Immediate Priorities

1. **Fix share transfer system** — broken policy, missing `financial_year_id`, no transactions
2. **Eliminate duplicate ledger creation paths** — choose one: observer OR controller, not both
3. **Add database transactions** to all financial mutation operations
4. **Make ledger entries immutable** — prevent update/delete
5. **Fix loan observer** — debit should only be created on disbursement, not approval

---

## 📦 MODULE-BY-MODULE ANALYSIS

---

### Module 1: Share Management

**Status:** ⚠️ Partially Implemented

#### Issues

1. **Share price stored in two places** — [`shares.share_price`](database/migrations/2026_01_03_060709_create_shares_table.php:18) and [`financial_years.share_value`](database/migrations/2026_05_03_055657_add_share_value_to_financial_years_table.php:15). No synchronization mechanism. If one is updated without the other, data diverges.

2. **Share price update bypasses observer** — [`ShareController.update()`](app/Http/Controllers/Api/ShareController.php:57) uses `Share::whereKey()->update()` which fires no Eloquent events, meaning [`ShareObserver::updated()`](app/Observers/ShareObserver.php:10) is **never triggered**. Share price changes produce no ledger entries.

3. **Authorization commented out** — [Line 51 of ShareController](app/Http/Controllers/Api/ShareController.php:51) has authorization commented out: `// if (! (Auth::user()->isManagerOfSomiti...`.

4. **No validation that total user shares ≤ total_shares** — There is no constraint or application-level check ensuring the sum of `user_shares.share_count` for a somiti+financial_year does not exceed `shares.total_shares`.

5. **`UserShareObserver::created()`** only fires on creation, not on share count updates. If a `UserShare` is updated (share count changed), no ledger entry is created.

#### Recommendations

- Remove `financial_years.share_value` or make `shares.share_price` the single source of truth
- Fix `ShareController::update()` to use `$share->save()` instead of direct query update
- Add a validation check: `SUM(user_shares.share_count) ≤ shares.total_shares`
- Add an observer for `UserShare::updated()` to track share count changes

---

### Module 2: UserShare & Share Transfer

**Status:** ❌ Broken / Non-functional

#### Issues

1. **`ShareTransferPolicy` blocks ALL access** — [`ShareTransferPolicy`](app/Policies/ShareTransferPolicy.php:14) returns `false` for every method (`viewAny`, `view`, `create`, `update`, `delete`). This means no user can interact with share transfers through policy-gated routes.

2. **`StoreShareTransferRequest` blocks all requests** — [`authorize()` returns `false`](app/Http/Requests/StoreShareTransferRequest.php:13), which means form requests will always be rejected.

3. **Missing `financial_year_id` on `share_transfers`** — The [`share_transfers` table](database/migrations/2026_05_03_055807_create_share_transfers_table.php:14) has no `financial_year_id` column. This means transfers are not tied to a financial year, breaking the per-year share tracking model.

4. **`ShareTransfer::approve()` doesn't use `financial_year_id`** — [Lines 47-62](app/Models/ShareTransfer.php:47) look up `UserShare` without specifying `financial_year_id`. The `firstOrCreate` for the receiver also omits `financial_year_id`, creating orphaned records.

5. **No database transaction** — The `approve()` method modifies sender shares, receiver shares, and creates ledger entries without a transaction wrapper. A partial failure would leave inconsistent data.

6. **No share balance validation at approval time** — The transfer checks sender balance at creation time ([Web controller line 64](app/Http/Controllers/Web/ShareTransferController.php:64)), but between creation and approval, the sender's shares could change. No re-validation at approval.

7. **Peer-to-peer transfers create no ledger entries** — Only treasury issuance (from_user_id = null) creates a ledger entry. Transfers between members produce no financial record.

8. **`ShareTransfer` model uses `quantity` but `UserShare` uses `share_count`** — Inconsistent naming. The `approve()` method accesses `$fromShare->quantity` but the `UserShare` model's column is `share_count`. This would cause a runtime error.

#### Recommendations

- Fix `ShareTransferPolicy` to implement proper authorization checks
- Add `financial_year_id` to `share_transfers` table
- Wrap `approve()` in `DB::transaction()`
- Re-validate sender share balance at approval time
- Create ledger entries for ALL transfers (both treasury and peer-to-peer)
- Fix `quantity` vs `share_count` property name mismatch

---

### Module 3: Deposit System

**Status:** ⚠️ Partially Implemented

#### Issues

1. **Dual approval path creates duplicate ledger entries** — When [`DepositController::approve()`](app/Http/Controllers/Api/DepositController.php:71) sets `status = 'approved'` AND creates an `Approval` record, the [`ApprovalObserver`](app/Observers/ApprovalObserver.php:19) fires and also sets the deposit status to approved, which triggers [`DepositObserver::updated()`](app/Observers/DepositObserver.php:14) which creates a ledger entry. But the controller's direct status change ALSO triggers the observer. Result: **potential double ledger entry**.

2. **No deposit reversal mechanism** — Once approved, there is no way to reverse or adjust a deposit.

3. **`DepositController::store()`** does not set `financial_year_id` — [Line 35](app/Http/Controllers/Api/DepositController.php:35) creates a deposit without requiring `financial_year_id`, even though the column exists and is required for per-year tracking.

4. **Deposits can be updated after approval** — [`DepositController::update()`](app/Http/Controllers/Api/DepositController.php:49) allows updating amount even after approval, with no guard against modifying approved records.

#### Recommendations

- Choose ONE approval path: either controller-driven OR observer-driven, not both
- Add `financial_year_id` validation to deposit creation
- Prevent modification of approved deposits
- Add deposit reversal/adjustment workflow

---

### Module 4: Loan System

**Status:** ⚠️ Partially Implemented — Critical Accounting Bug

#### Issues

1. **🔴 CRITICAL: Double debit on loan** — [`LoanObserver::updated()`](app/Observers/LoanObserver.php:14) creates a **debit** ledger entry when status changes to `approved` (line 27) AND another **debit** when status changes to `disbursed` (line 59). This means every loan creates TWO debit entries of the same amount, doubling the fund's apparent liabilities.

2. **No credit entry for loan repayment** — There is no mechanism to record loan repayments. The `outstanding_balance` field exists but is never updated through any observed event.

3. **`LoanController::approve()`** creates an `Approval` record directly, which triggers `ApprovalObserver`, which also sets status to approved, which triggers `LoanObserver`. Same dual-path problem as deposits.

4. **No loan EMI/schedule tracking** — The `term_months` and `interest_rate` fields exist but there is no EMI schedule, no repayment tracking, and no interest calculation logic.

#### Recommendations

- Fix loan observer: create debit ONLY on disbursement, not on approval
- Add loan repayment model and ledger entries (credit to fund)
- Implement EMI schedule calculation
- Remove dual approval path

---

### Module 5: Investment & FDR System

**Status:** ⚠️ Partially Implemented

#### Issues

1. **FDR observer fires on `created`** — [`FdrObserver::created()`](app/Observers/FdrObserver.php:10) creates a ledger entry immediately on creation, before approval. This means pending FDRs already affect the fund balance.

2. **`FdrController::store()`** sets `user_id` from `Auth::id()` but the `fdrs` table migration has no `user_id` column — this will cause a mass assignment error or silent failure.

3. **Investment ledger entry only on approval** — [`InvestmentObserver`](app/Observers/InvestmentObserver.php:10) creates a debit on approval, but there is no credit entry when the investment matures or returns profit.

4. **No maturity/return tracking** — `expected_return` and `maturity_amount` exist but there is no workflow to record actual returns.

#### Recommendations

- Move FDR ledger creation to an approval-triggered event, not creation
- Add `user_id` to `fdrs` table migration
- Add investment return recording with corresponding ledger entries

---

### Module 6: Ledger / Financial Accounting

**Status:** ❌ Fundamentally Flawed

#### Issues

1. **🔴 Single-entry bookkeeping** — The [`ledgers` table](database/migrations/2026_01_03_061239_create_ledgers_table.php) has `debit` and `credit` columns on the same row, but there is no double-entry structure. Each financial event creates ONE row with either a debit OR a credit, not both. There is no account chart, no contra entries, and no way to verify that debits equal credits.

2. **No account codes** — Ledger entries have no account type classification (asset, liability, income, expense, equity). All entries are in a single pool per somiti.

3. **`Ledger::createUnique()` deduplication is flawed** — [Lines 43-60](app/Models/Ledger.php:43) check for existing entries by matching `reference_type`, `reference_id`, `somiti_id`, AND the `credit`/`debit` amount. Two different transactions with the same amount would be considered duplicates.

4. **Ledger entries are mutable** — The `Ledger` model has no protection against updates or deletes. There is no `immutable` flag or write-once constraint.

5. **No balance verification** — There is no mechanism to verify that `SUM(credits) - SUM(debits)` equals the fund balance at any point in time.

6. **Missing `financial_year_id`** — Ledger entries are not tied to a financial year, making year-end closing impossible.

#### Recommendations

- Implement proper double-entry accounting with account codes
- Add `financial_year_id` to ledger entries
- Make ledger entries immutable (prevent update/delete via model events or database triggers)
- Add balance verification endpoints
- Replace `createUnique()` with proper idempotency keys

---

### Module 7: Approval System

**Status:** ⚠️ Partially Implemented — Dual-Path Bug

#### Issues

1. **🔴 Dual approval execution** — Controllers like [`DepositController::approve()`](app/Http/Controllers/Api/DepositController.php:71) and [`LoanController::approve()`](app/Http/Controllers/Api/LoanController.php:78) both set the model status AND create an `Approval` record. The `ApprovalObserver` then also sets the model status, and the model's own observer fires on the status change. This creates a chain: Controller sets status → Model observer fires → Approval record created → ApprovalObserver fires → Model status set again → Model observer fires again.

2. **No approval for share transfers** — `ShareTransfer` uses `requestApproval()` from the `HasApprovals` trait, but the `ShareTransferPolicy` blocks all access, so the approval workflow is unreachable through policy-gated routes.

3. **`ApprovalController::decide()`** calls both `$approval->approve()` AND `$approval->approvable->approve()` — [Lines 35-43](app/Http/Controllers/Api/ApprovalController.php:35). This means the approvable's `approve()` method is called, which also creates/update approval records, creating circular updates.

4. **Web `ApprovalController::update()`** has a similar dual-path issue — [Lines 44-57](app/Http/Controllers/Web/ApprovalController.php:44).

#### Recommendations

- Choose a single approval path: either controller-driven OR observer-driven
- If observer-driven: controllers should ONLY create the Approval record; the ApprovalObserver should handle status changes
- If controller-driven: remove the ApprovalObserver and handle everything in the controller
- Fix ShareTransferPolicy to allow proper access

---

### Module 8: Financial Year Management

**Status:** ✅ Mostly Correct

#### Issues

1. **`FinancialYearObserver`** correctly ensures only one active financial year per somiti — ✅
2. **`FinancialYearController::activate()`** manually deactivates other years — this duplicates the observer logic but is not harmful.
3. **No year-end closing mechanism** — There is no process to close a financial year, carry forward balances, or lock entries from modification.

#### Recommendations

- Add year-end closing workflow with balance carry-forward
- Add mechanism to lock ledger entries for closed financial years

---

### Module 9: Somiti & Membership

**Status:** ⚠️ Needs Improvement

#### Issues

1. **`Somiti::removeMember()` force-deletes** — [Line 124](app/Models/Somiti.php:124) uses `forceDelete()` which permanently removes the membership record, destroying the audit trail of who was a member when.

2. **No cascade handling on member removal** — When a member is removed, their shares, deposits, and loans remain in the system with no reassignment or settlement process.

3. **`SomitiMembershipController::store()`** uses `updateOrCreate` — [Line 24](app/Http/Controllers/Api/SomitiMembershipController.php:24) which means re-adding a removed member overwrites their previous `joined_at` date instead of creating a new membership period.

4. **No validation on member role** — The `role` field accepts any string; there is no enum constraint. The migration uses `enum('role', ['manager', 'member', 'auditor'])` but the controller accepts any string via `$request->input('role')`.

#### Recommendations

- Change `removeMember()` to use soft delete + set `left_at` instead of force delete
- Add member exit workflow that handles shares, deposits, and loans
- Validate role against allowed values
- Track membership periods with `joined_at`/`left_at` properly

---

### Module 10: Admin & Permission System

**Status:** ⚠️ Needs Improvement

#### Issues

1. **Simple string role** — [`users.role`](database/migrations/2026_05_03_045539_add_role_to_users_table.php:15) is a plain string field with default `'user'`. Only `'super_admin'` is used for special access. No proper role-based access control.

2. **Permission system is basic** — [`Permission`](app/Models/Permission.php) model is a simple name/description table with many-to-many to users. No role-permission mapping, no hierarchical permissions.

3. **No audit log** — There is no table tracking who did what, when. The `approvals` table captures approval decisions but not general data modifications.

4. **`CheckUserStatus` middleware only works for web** — [The middleware](app/Http/Middleware/CheckUserStatus.php:18) redirects to login page, which doesn't work for API routes. API routes have no status check.

5. **`IsSuperAdmin` middleware** — [Only used for admin web routes](app/Http/Middleware/IsSuperAdmin.php:18), not for API routes. API has no super admin middleware.

#### Recommendations

- Implement proper role-permission system with roles table
- Add comprehensive audit log table
- Add API-compatible user status middleware
- Add API super admin middleware

---

### Module 11: Tenant Isolation (SaaS Readiness)

**Status:** ❌ Not SaaS-Ready

#### Issues

1. **`UserAccessScope` only filters reads** — [`UserAccessScope`](app/Models/Scopes/UserAccessScope.php:14) adds WHERE clauses to SELECT queries but does NOT prevent writes to other somitis. A user could POST a deposit with any `somiti_id` and it would be saved.

2. **Inconsistent scope application** — Not all models use `HasTenantScope`. `Investment`, `Fdr`, `ShareTransfer` use it, but `Deposit`, `Loan`, `Share` do not use it consistently. Some controllers manually filter by somiti membership.

3. **No tenant-level database isolation** — All somitis share the same database tables. While this is acceptable for same-schema multi-tenancy, there is no row-level security at the database level.

4. **No subscription/billing system** — No way to charge somitis for usage.

5. **No tenant-specific configuration** — Beyond `currency` and `receipt_header/footer`, there is no per-tenant configuration for features, limits, or customization.

6. **Global admin routes have no tenant context** — Super admin routes operate across all somitis with no tenant awareness.

#### Recommendations

- Add tenant validation on ALL write operations (not just reads)
- Apply `HasTenantScope` consistently to all domain models
- Add database-level constraints or policies
- Implement subscription/billing system
- Add tenant configuration system

---

## 🧨 CRITICAL ISSUES (MUST FIX)

### 1. 🔴 Double Ledger Entry Bug (Loan Observer)

**File:** [`app/Observers/LoanObserver.php`](app/Observers/LoanObserver.php:14)

The observer creates a debit entry when a loan is approved AND another when it is disbursed. This doubles the fund's apparent liabilities.

**Impact:** Financial statements will show inflated loan amounts. Fund balance calculations will be wrong.

**Fix:** Only create a debit entry on disbursement, not on approval.

---

### 2. 🔴 Dual Approval Path Creates Duplicate Ledger Entries

**Files:** [`DepositController::approve()`](app/Http/Controllers/Api/DepositController.php:71), [`ApprovalObserver`](app/Observers/ApprovalObserver.php:19), [`DepositObserver`](app/Observers/DepositObserver.php:14)

When a deposit is approved via the API controller:
1. Controller sets `status = 'approved'` → triggers `DepositObserver::updated()` → creates ledger entry
2. Controller creates `Approval` record → triggers `ApprovalObserver` → sets status again → triggers `DepositObserver::updated()` again → attempts to create another ledger entry

The `Ledger::createUnique()` deduplication partially mitigates this, but its matching logic is flawed (matches on amount, not on unique transaction identity).

**Impact:** Potential duplicate financial records.

**Fix:** Choose ONE approval path. Recommended: Controller creates Approval record only; ApprovalObserver handles status change; Model observer creates ledger entry.

---

### 3. 🔴 Share Transfer System Is Non-Functional

**Files:** [`ShareTransferPolicy`](app/Policies/ShareTransferPolicy.php:14), [`StoreShareTransferRequest`](app/Http/Requests/StoreShareTransferRequest.php:13)

All policy methods return `false`. The form request `authorize()` returns `false`. No user can create, view, approve, or manage share transfers through any policy-gated route.

**Impact:** Share transfers are completely broken.

**Fix:** Implement proper authorization in `ShareTransferPolicy` based on somiti membership/ownership.

---

### 4. 🔴 Share Transfer Lacks `financial_year_id`

**File:** [`share_transfers` migration](database/migrations/2026_05_03_055807_create_share_transfers_table.php:14)

The `share_transfers` table has no `financial_year_id`. The `approve()` method in [`ShareTransfer`](app/Models/ShareTransfer.php:39) does not include `financial_year_id` when looking up or creating `UserShare` records. Since `UserShare` has a unique constraint on `(user_id, somiti_id, financial_year_id)`, the `firstOrCreate` will fail or create incorrect records.

**Impact:** Share transfers will create orphaned or incorrect `UserShare` records, breaking share accounting.

**Fix:** Add `financial_year_id` to `share_transfers` table and update the `approve()` method.

---

### 5. 🔴 No Database Transactions on Financial Operations

**Files:** [`ShareTransfer::approve()`](app/Models/ShareTransfer.php:39), [`DepositController::approve()`](app/Http/Controllers/Api/DepositController.php:71), [`LoanController::approve()`](app/Http/Controllers/Api/LoanController.php:78)

None of the financial mutation operations use `DB::transaction()`. A failure partway through (e.g., after deducting shares but before adding to receiver) would leave inconsistent data.

**Impact:** Data corruption on partial failures.

**Fix:** Wrap all financial mutations in `DB::transaction()`.

---

### 6. 🔴 `UserShare.quantity` vs `share_count` Property Mismatch

**File:** [`ShareTransfer::approve()`](app/Models/ShareTransfer.php:51)

The code accesses `$fromShare->quantity` and `$toShare->quantity`, but the `UserShare` model's column is `share_count`, not `quantity`. This will cause a runtime error (undefined property).

**Impact:** Share transfer approval will crash.

**Fix:** Change `quantity` to `share_count` in `ShareTransfer::approve()`.

---

### 7. 🟠 Share Price Update Bypasses Observer

**File:** [`ShareController::update()`](app/Http/Controllers/Api/ShareController.php:57)

Uses `Share::whereKey()->update()` which bypasses Eloquent model events, meaning `ShareObserver::updated()` never fires. Share price changes produce no ledger entries.

**Impact:** Share revaluation gains/losses are not recorded in the ledger.

**Fix:** Use `$share->share_price = ...; $share->save();` instead of direct query update.

---

### 8. 🟠 Ledger Entries Are Mutable

**File:** [`Ledger` model](app/Models/Ledger.php)

The `Ledger` model has no protection against updates or deletes. Any user with access can modify or delete financial records.

**Impact:** Financial fraud risk. Records can be tampered with.

**Fix:** Add model-level protection (override `save()`/`delete()` to prevent modifications), add database triggers, or use immutable append-only design.

---

## 🛠 IMPROVEMENT PLAN

### Phase 1 (Critical Fixes)

1. **Fix ShareTransferPolicy** — Implement proper authorization checks for all CRUD operations
2. **Fix StoreShareTransferRequest** — Set `authorize()` to return true with proper checks
3. **Add `financial_year_id` to `share_transfers`** — Migration + model update
4. **Fix `ShareTransfer::approve()`** — Use `share_count` not `quantity`, add `financial_year_id`, wrap in `DB::transaction()`
5. **Fix LoanObserver** — Remove debit entry on approval; keep only on disbursement
6. **Eliminate dual approval path** — Standardize on observer-driven approach
7. **Fix ShareController::update()** — Use model save instead of direct query
8. **Add `DB::transaction()` to all financial mutations**
9. **Make ledger entries immutable** — Prevent update/delete on Ledger model
10. **Fix `Somiti::removeMember()`** — Use soft delete + `left_at` instead of force delete

### Phase 2 (Structural Improvements)

1. **Implement double-entry accounting** — Add account chart, contra entries, balance verification
2. **Add `financial_year_id` to ledgers** — Enable year-end closing
3. **Add loan repayment tracking** — EMI schedule, repayment model, credit ledger entries
4. **Add investment return tracking** — Maturity workflow, profit/loss recording
5. **Add share balance validation** — Ensure `SUM(user_shares) ≤ total_shares` per somiti per year
6. **Add comprehensive audit log** — Track all data modifications with user, timestamp, old/new values
7. **Fix FDR observer** — Move ledger creation from `created` to approval-triggered event
8. **Add `user_id` to `fdrs` table** — Currently missing from migration
9. **Remove `financial_years.share_value`** — Consolidate to `shares.share_price` as single source of truth
10. **Add deposit reversal workflow** — Allow correcting mistakes with audit trail

### Phase 3 (SaaS Readiness)

1. **Implement proper tenant isolation on writes** — Validate `somiti_id` on all write operations
2. **Apply `HasTenantScope` consistently** — All domain models should use it
3. **Add subscription/billing system** — Plan model, usage tracking, payment integration
4. **Add tenant configuration** — Per-somiti feature flags, limits, customization
5. **Add API rate limiting per tenant**
6. **Add data export/import** — Per-tenant data portability
7. **Implement year-end closing workflow** — Lock periods, carry forward balances
8. **Add reporting module** — Balance sheets, member statements, fund summaries
9. **Add email/notification templates per tenant**
10. **Add multi-language support**

---

## 🧱 SUGGESTED ARCHITECTURE FIXES

### Database Changes

```sql
-- 1. Add financial_year_id to share_transfers
ALTER TABLE share_transfers ADD COLUMN financial_year_id BIGINT UNSIGNED AFTER somiti_id;
ALTER TABLE share_transfers ADD CONSTRAINT fk_share_transfers_fy 
    FOREIGN KEY (financial_year_id) REFERENCES financial_years(id) ON DELETE CASCADE;

-- 2. Add financial_year_id to ledgers
ALTER TABLE ledgers ADD COLUMN financial_year_id BIGINT UNSIGNED AFTER somiti_id;
ALTER TABLE ledgers ADD CONSTRAINT fk_ledgers_fy 
    FOREIGN KEY (financial_year_id) REFERENCES financial_years(id) ON DELETE CASCADE;

-- 3. Add user_id to fdrs
ALTER TABLE fdrs ADD COLUMN user_id BIGINT UNSIGNED AFTER somiti_id;
ALTER TABLE fdrs ADD CONSTRAINT fk_fdrs_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 4. Add immutable flag to ledgers
ALTER TABLE ledgers ADD COLUMN is_immutable BOOLEAN DEFAULT FALSE;

-- 5. Create audit_logs table
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    somiti_id BIGINT UNSIGNED,
    action VARCHAR(50),
    auditable_type VARCHAR(255),
    auditable_id BIGINT UNSIGNED,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP,
    INDEX idx_auditable (auditable_type, auditable_id),
    INDEX idx_user (user_id),
    INDEX idx_somiti (somiti_id)
);

-- 6. Create account_codes table for double-entry
CREATE TABLE account_codes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    somiti_id BIGINT UNSIGNED,
    code VARCHAR(20),
    name VARCHAR(150),
    type ENUM('asset', 'liability', 'income', 'expense', 'equity'),
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY uk_somiti_code (somiti_id, code),
    FOREIGN KEY (somiti_id) REFERENCES somitis(id)
);

-- 7. Add account_code_id to ledgers for double-entry
ALTER TABLE ledgers ADD COLUMN account_code_id BIGINT UNSIGNED AFTER somiti_id;
ALTER TABLE ledgers ADD COLUMN reference_type VARCHAR(255) AFTER account_code_id;
-- Rename existing reference columns or add transaction grouping
ALTER TABLE ledgers ADD COLUMN transaction_group_id BIGINT UNSIGNED;
```

### New Tables

```
loan_repayments
├── id
├── loan_id (FK)
├── somiti_id (FK)
├── financial_year_id (FK)
├── amount
├── principal_portion
├── interest_portion
├── payment_date
├── status
├── approved_by
├── approved_at
├── timestamps, softDeletes

investment_returns
├── id
├── investment_id (FK)
├── somiti_id (FK)
├── financial_year_id (FK)
├── amount
├── return_date
├── status
├── timestamps

transaction_groups
├── id
├── somiti_id (FK)
├── type
├── description
├── posted_at
├── timestamps
```

### Refactoring Suggestions

1. **Create a `TransactionService` class** that wraps all financial mutations in database transactions and creates proper double-entry ledger records:

```php
class TransactionService {
    public function recordDeposit(Deposit $deposit): void {
        DB::transaction(function() use ($deposit) {
            // Create transaction group
            // Create debit: Cash account
            // Create credit: Member savings account
            // Create approval record
        });
    }
}
```

2. **Create a `ShareService` class** for share operations:

```php
class ShareService {
    public function transferShares(ShareTransfer $transfer): void {
        DB::transaction(function() use ($transfer) {
            // Validate sender balance
            // Deduct from sender UserShare
            // Add to receiver UserShare
            // Create ledger entries
            // Mark transfer as approved
        });
    }
}
```

3. **Remove model observers for financial events** — Replace with explicit service class calls. Observers are implicit, hard to debug, and cause the dual-path issues identified above.

4. **Create a `BalanceVerificationService`** that can verify:
   - `SUM(deposits) - SUM(loans disbursed) + SUM(investment returns) = fund balance`
   - `SUM(user_shares * share_price) = total fund equity`
   - `SUM(ledger credits) - SUM(ledger debits) = 0` per transaction group

5. **Implement immutable ledger pattern** — Override `save()` and `delete()` on `Ledger` to prevent modifications:

```php
class Ledger extends Model {
    public function save(array $options = []) {
        if ($this->exists) {
            throw new \Exception('Ledger entries cannot be modified');
        }
        return parent::save($options);
    }
    
    public function delete() {
        throw new \Exception('Ledger entries cannot be deleted');
    }
}
```

---

## 📈 FINAL VERDICT

| Question | Answer | Details |
|----------|--------|---------|
| **Is the system reliable?** | **No** | Critical bugs in share transfers, double ledger entries, loan accounting, and no transaction safety |
| **Is it scalable?** | **Partially** | Basic multi-tenant structure exists but tenant isolation is incomplete and inconsistent |
| **Is it SaaS-ready?** | **No** | Missing subscription billing, tenant write isolation, proper role system, audit logging, and reporting |

### Summary

The system has a reasonable domain model structure and covers the core entities of a cooperative fund management system. However, it has **critical financial accounting bugs** (double ledger entries, single-entry bookkeeping, mutable ledger), **broken features** (share transfers blocked by policy, property name mismatch), and **data integrity risks** (no transactions, force-deletes, bypassed observers). These must be fixed before the system can be considered production-ready for financial operations.

The highest priority is fixing the share transfer system, eliminating the dual approval path, adding database transactions, and making the ledger immutable. After that, implementing proper double-entry accounting and tenant write isolation will be essential for SaaS readiness.