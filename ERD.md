# Entity Relationship Diagram (ERD) Logic

## Core Entities

### 1. Users
*   **Purpose:** Central identity for all actors (Members, Managers).
*   **Columns:** `id`, `name`, `phone` (unique), `email`, `password`, `role` (enum: member, manager), `status` (pending, active, blocked), `softDeletes`.
*   **Relationships:**
    *   `hasMany` **Approvals** (as the approver).
    *   `hasMany` **LedgerEntries** (as the account holder/actor).
    *   `hasMany` **SomitiMembers** (mapping to groups).

### 2. Somitis (Groups)
*   **Purpose:** The savings group unit.
*   **Columns:** `id`, `name`, `address`, `settings`, `softDeletes`.
*   **Relationships:**
    *   `hasMany` **Members**.
    *   `hasMany` **LedgerEntries** (financial history of the group).
    *   `hasMany` **Shares** (configuration).

### 3. Ledger (The "Truth")
*   **Purpose:** Double-entry style immutable record of all financial actions.
*   **Columns:**
    *   `id`
    *   `transaction_ref` (Unique String, e.g., UUID or Generated Code)
    *   `type` (deposit, loan, profit, expense)
    *   `amount` (Decimal)
    *   `dr_cr` (Enum: 'dr', 'cr')
    *   `user_id` (FK to Users)
    *   `somiti_id` (FK to Somitis)
    *   `status` (completed)
    *   `reference_id`, `reference_type` (Polymorphic FK to source: Deposit, Loan, etc.)
*   **Constraints:** No updates allowed (logic level), SoftDeletes (for reversals).

### 4. Approvals
*   **Purpose:** Stores votes/decisions on critical actions.
*   **Columns:**
    *   `id`
    *   `approvable_id`, `approvable_type` (Polymorphic: Loan, Withdrawal)
    *   `user_id` (FK to Users)
    *   `status` (pending, approved, rejected)
    *   `comment`
*   **Logic:** A quorum of approvals triggers a write to the **Ledger**.

### 5. Shares
*   **Purpose:** Configures the share value/count for a financial year.
*   **Columns:** `id`, `somiti_id`, `financial_year_id`, `share_price`, `total_shares`.

## Key Relationships

1.  **Polymorphic Approval:**
    *   `Loans` -> `morphMany` -> `Approvals`.
    *   `Withdrawals` -> `morphMany` -> `Approvals`.

2.  **Ledger Traceability:**
    *   `Ledger` entry -> `morphTo` -> `Loan` (Source of transaction).
    *   This allows clicking a ledger row and seeing the original approved request.

3.  **User Roles:**
    *   User -> `role` column for simple Auth.
    *   Or `User` -> `SomitiMembers` -> `Role` for per-group roles (if multi-tenancy expands).

## Diagram Flow

[User] --(initiates)--> [Loan Request]
[Loan Request] --(requires)--> [Approvals]
[Approvals] --(given by)--> [Managers/Members]
[Approvals (Quorum Met)] --(triggers)--> [Ledger Entry (Dr)] + [Ledger Entry (Cr)]
