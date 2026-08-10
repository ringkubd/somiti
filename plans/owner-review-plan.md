# Owner Review & Approval Process Plan (2026-08-10)

## 1. Approval process — current state

### What is built
- `HasApprovals` trait → any model can have polymorphic approval rows (one row per user per approvable).
- `SomitiWorkflow` per somiti + transaction type: `requires_approval`, `manager_can_approve_alone`, `min_approvals_required` (web Workflows page + API).
- Voting: `POST /api/approvals/vote` — any active member votes; quorum reached → finalize; manager-alone rule respected; `signature` stored.
- Manager decide: `POST /api/approvals/{id}/decide` (manager/owner path).
- Model approve/reject methods on Deposit, Loan, Fdr, Investment, UserShare, ShareTransfer, LoanRepayment, Withdrawal, Penalty — each updates status, records approver, and (via observers) creates double-entry journal entries idempotently + notifications.
- Mobile approvals screen votes; web Approvals/Show has approve/reject + comment.

### 🔴 Critical gap found in review
- **API (mobile) created records never enter the approval pipeline.**
  - Web controllers (`Web/DepositController`, `Web/FdrController`, etc.) call `requestApproval(...)` on create.
  - **API controllers do NOT** (`Api/DepositController`, `Api/LoanController`, `Api/InvestmentController`, `Api/FdrController`, `Api/UserShareController`, `Api/WithdrawalController`, `Api/PenaltyController`, `Api/LoanRepaymentController`, `Api/ShareTransferController` — only share-transfer does).
  - Result: a deposit created from the mobile app has status `pending` but **no Approval row** → it never appears in the approvals list → members cannot vote → it can only be approved by directly calling `/deposits/{id}/approve` (manager-only, no audit trail via approvals).
  - **Fix:** call `$model->requestApproval(...)` in every API store method (route the request to the somiti owner/manager), same as the web controllers.

### Secondary approval gaps
1. **Stale pending rows** — after an approvable is finalized, other members' `pending` approval rows remain and still show in the approvals list. Fix: index should only show rows whose approvable is still `pending` (or mark them stale).
2. **Self-voting** — the creator can vote on their own request. Fix: prevent the `user_id` who created the approvable from voting (unless manager).
3. **`decide` bypasses workflow** — manager `decide` finalizes even when `manager_can_approve_alone=false`. Fix: respect workflow (route decide through the same rules as vote).
4. **No "all members" quorum option** — only a fixed count. Fix: add `quorum_type` (`count|all_members`) to SomitiWorkflow.
5. **No resubmit/reopen** — rejected requests stay rejected. Fix (optional): allow owner to reset to pending with a new request.
6. **Loan disburse on mobile missing** — approval works, but disbursing an approved loan is web-only.

---

## 2. Owner review — what works / what doesn't

### ✅ Working well
- Auth (phone OR email), onboarding (create/join somiti), super admin panel.
- Core finance: deposits, loans (approve/disburse), investments, FDRs, shares, share transfers — with double-entry ledger, idempotent journals, trial balance.
- Reporting (new): balance sheet, P&L, fund portfolio, member profiles, dues overview — verified live.
- Manager tenure (time-based, auto role revert), member voting + signature, monthly dues + reminders (scheduler).
- Notifications (in-app + Expo push), chat (polling), receipts, CSV exports.
- Tests: 88 passing / 0 failures; production deployed; emulator build clean (no require cycles).

### ⚠️ Not working / broken
- **Mobile-created transactions skip the approval pipeline (see above)** — this is the #1 fix.
- Approvals list shows stale pending rows after finalization.
- Self-approval possible.
- Loan disburse unavailable on mobile.
- Member statement exists only on web (not mobile).

### ❌ Missing (owner-priority)
- Real-time chat (websocket) — currently 3s polling.
- OTP login, 2FA, email verification (all disabled).
- DPS module (only `type='dps'` flag; no plans/maturity).
- Investment maturity/return recording.
- Year-end closing with carry-forward.
- PDF exports (CSV only), charts (no graph library yet).
- Full web dashboard redesign (mobile dashboard done).
- Per-member statement on mobile; loan aging/NPA; cash-flow statement.

---

## 3. Plan (priority order)

### P0 — Approval pipeline integrity (this week)
1. ✅ `requestApproval()` added to all API store controllers (deposit, loan, investment, fdr, user-share, withdrawal, penalty, repayment).
2. ✅ Approvals index only lists approvables still pending (stale rows hidden).
3. ✅ Self-voting blocked (creator cannot vote unless manager/owner).
4. ✅ `decide` routed through workflow rules (respects manager_can_approve_alone + quorum).
5. ✅ `quorum_type` (`count`/`all_members`) added to workflows + web UI.
6. ✅ Tests for each fix — 91 passing / 0 failing; deployed & E2E-verified on production (API deposit → approval row → list → self-vote 422 → manager vote finalizes).

### P1 — progress
- ✅ Mobile loan disburse button (manager, on approved loans).
- ✅ Mobile member profile now includes recent transactions (member statement).
- ⏳ Investment maturity/FDR alert, year-end closing carry-forward, DPS module — still open.

### P1 — Finish missing finance flows
7. Loan disburse action on mobile (manager).
8. Mobile member statement (per-member transactions).
9. Investment maturity/return recording + FDR maturity alert.
10. Year-end closing report + carry-forward.
11. DPS plan module (plan, monthly installment, maturity) or document as out-of-scope.

### P2 — Experience & scale
12. Charts (fund growth, deposits, loan portfolio) — add a chart lib (victory/svg) to mobile + web.
13. PDF export (dompdf/barryvdh on web).
14. Real-time chat via websockets (soketi/reverb + Echo on mobile).
15. OTP login + 2FA enable.
16. Full web dashboard redesign (match mobile financial dashboard).
17. Tenant write-isolation sweep (validate somiti membership in every mutating controller).

## 5. Currency & Languages (2026-08-10)
- ✅ **i18n framework** in mobile: `src/i18n/` with 7 languages — বাংলা, English, हिन्दी, Français, Español, اردو, العربية.
- ✅ Language picker on Login screen + Profile screen; persisted via SecureStore; app-wide context (`useLanguage().t()`).
- ✅ Tab labels + Dashboard + auth screens translated; translation keys ready for all other screens (ongoing).
- ✅ **Currency**: somiti currency code + symbol used with `Intl.NumberFormat` (locale-aware) via `formatMoney`/`useFormatMoney`.
- ✅ **Home screen redesigned**: greeting + notification bell, locale-formatted fund hero, primary actions row (Deposit/Loan/Pay Dues/Withdraw), fund allocation, dues alert, reports, quick actions.
- Backend deployment verified: local ↔ server in sync (app/routes/migrations/resources/build), 57 migrations applied, php-fpm + queue + cron active.

## 4. Definition of done
- Every create path (web + API) enters the approval pipeline with audit trail.
- Approvals list is always accurate (no stale/self votes).
- All finance flows usable from mobile (approve, disburse, repay, statement).
- Reports (balance sheet, P&L, portfolio, dues, member) available on web + mobile.
- Tests green; deployed to production after each phase.
