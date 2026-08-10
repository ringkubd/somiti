# Roles, Voting & Monthly Dues — Feature Plan

## Status: IMPLEMENTED & DEPLOYED (2026-08-10)
- Backend: migrations (`somitis.monthly_deposit_amount/due_day`, `deposits.due_month`, `approvals.signature`, `due_reminders`, fixed `somiti_members.role` enum to include `owner`).
- Services: `DuesService`, `ApprovalService` (voting + quorum + signature), `ManagerService` (tenure + role sync).
- API: managers index/store/destroy, dues overview + my-dues, approvals/vote, members backfill, loans/legacy, settings fields, membership `joined_at`.
- Commands: `dues:remind` (daily 09:00), `managers:expire` (daily 00:30) — scheduled.
- Mobile: My Dues, Dues Overview, Member Dues, Managers, Manager Add screens; approvals now vote via `/api/approvals/vote`; settings fields.
- Web: Somiti/Dues + Somiti/Managers pages; settings fields.
- Tests: 7 new feature tests (83 total passing, 0 failures).
- Production: deployed to fnfsomiti.bdesmart.com and verified E2E (dues, voting finalize, manager tenure, backfill, legacy loan).

## 6. Financial Reporting & UI Redesign (2026-08-10)

### New reporting engine (`app/Services/ReportService.php`)
- **Balance sheet** — Assets (cash, bank, investments, FDR, loans receivable) = Liabilities (member savings) + Equity (share capital + retained earnings); `balanced` flag.
- **Profit & Loss** — income accounts (interest, penalty) vs expense accounts; net profit.
- **Fund portfolio** — total fund, allocation (cash/bank/invested/loans), deployment rate, investments list, FDR list.
- **Member profiles** — savings, shares, loans outstanding, dividends received, dues, net worth (manager-only for others).
- API: `/api/somitis/{id}/reports/balance-sheet|profit-loss|portfolio|members|members/{user?}`.
- Dashboard API now includes `fund` (allocation) + `dues` (due/overdue/collected).

### UI redesign (financial / mutual-fund style)
- Mobile dashboard rewritten: total fund hero, fund allocation bar, dues alert, report links, quick actions.
- New mobile screens: Balance Sheet, Profit & Loss, Fund Portfolio, Member Profiles (list + profile).
- Web: Balance Sheet + Fund Portfolio pages, links added to Reports index.

### Bugs fixed while building reports
- `InvestmentController::index` queried non-existent `investments.user_id` → removed (membership scoping already covers it).
- `ReportService` dividend sum used `amount`/`somiti_id` that don't exist on `dividend_allocations` → use `total_dividend` via declaration.

### Still open (Wave 3 ideas)
- Charts (fund growth, deposit trends), PDF export, year-end closing report, loan aging/NPA, cash-flow statement, per-member statement on mobile, full web redesign of dashboard.

## 7. Interconnection & UX pass (2026-08-10)
- Fixed `Require cycle: Shared.tsx → ui/index → DetailScreen → Shared` by importing `AppCard`/`Badge` directly (verified via `expo export`: 0 cycles).
- Feature interconnection:
  - Somiti Detail → Manage section (Set Manager, Monthly Dues, Members, Balance Sheet, Fund Portfolio).
  - Dashboard hero → manager chip ("Manager: Name" or "Set Manager →"), fund allocation, dues alert, report shortcuts.
  - Members list → tap member → full financial profile (manager-only restriction handled).
  - Deposit/Loan detail → Member Profile button.
- Dashboard API now returns current `manager` (id/name/tenure).
- Deployed to production; backend tests 88 passing, mobile tsc clean, bundle builds without cycles.

## 1. Manager role with time-based tenure
- `somiti_managers` already exists (from_date/to_date/note). Add API to appoint/end managers; observer already ends the previous current manager.
- Appointing a manager also sets `somiti_members.role = 'manager'`; ending a tenure reverts to `member` (owner stays owner).
- Scheduler `managers:expire` runs daily: managers whose `to_date` passed are ended and role reverted.

## 2. Approval / voting / signature
- `approvals` table already allows one row per (approvable, user) → use each member's own row as their **vote**.
- New endpoint `POST /api/approvals/vote` `{approvable_type, approvable_id, decision, comment?, signature?}`:
  - any active member of the somiti can vote once (unique constraint already enforces);
  - manager/owner vote finalizes immediately when `manager_can_approve_alone`;
  - otherwise finalize when approved/rejected votes reach `min_approvals_required`.
- `signature` column added to approvals (manager can sign).
- Existing `decide` endpoint kept for managers (now also stores signature).

## 3. Monthly deposit dues + reminders
- Somiti settings: `monthly_deposit_amount`, `due_day` (default 10).
- Deposits get `due_month` (first day of month) for reliable month matching.
- `DuesService` computes per-member schedule from `joined_at` (or somiti start) to now:
  paid / partial / due / overdue per month + totals.
- Endpoints: manager overview `GET /api/somitis/{id}/dues`, member's own `GET /api/somitis/{id}/my-dues`.
- `dues:remind` command runs daily: notifies members before due day and when overdue
  (dedup via `due_reminders` table) → in-app + push notifications.

## 4. Backdated / legacy data
- `POST /api/somitis/{id}/members/{user}/backfill` `{from_date, monthly_amount?, paid_months?}`:
  auto-creates pending monthly deposits for each month since `from_date` (idempotent),
  or approved deposits for listed paid months. Members can also be given `joined_at` via membership update.
- `POST /api/somitis/{id}/loans/legacy` `{user_id, principal, outstanding_balance?, interest_rate, term_months, start_date, purpose?}`:
  records an existing disbursed loan with journal entry.

## 5. UI
- Mobile: my-dues screen, manager dues overview, manager management, vote in approvals, settings fields.
- Web: dues page, managers page, vote counts on approvals, settings fields.
