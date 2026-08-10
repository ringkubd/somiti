# Somiti — System Architecture & Relation Map

**তৈরি:** 2026-08-10
**Scope:** Mobile app (`somiti-mobile/`) ↔ Laravel backend ↔ Web (Inertia) — সবকিছুর relation, flow, আর verified gap/fix plan

---

## ১. System Overview — এক নজরে

```
┌─────────────────┐     HTTPS (REST)      ┌─────────────────────────┐
│  Mobile (Expo)  │  ──────────────────►  │  Laravel 12 Backend     │
│  somiti-mobile/ │  Bearer token         │  /api/** (Sanctum)      │
└─────────────────┘                       └────────────┬────────────┘
                                                       │
┌─────────────────┐                                    ▼
│  Web (Inertia)  │  ──────────────────►  ┌─────────────────────────┐
│  resources/js   │  Session             │  Models/Services/DB      │
└─────────────────┘                      └─────────────────────────┘
```

| Layer | Tech | অবস্থান |
|---|---|---|
| Mobile | Expo RN 54, React Navigation, Zustand, axios | `somiti-mobile/src/` |
| Web | Inertia + React, Tailwind, Radix | `resources/js/pages/` |
| API | Laravel 12 + Sanctum | `routes/api.php`, `app/Http/Controllers/Api/` |
| Core | 9 Services, 30+ Models, Observers, Policies | `app/Services/`, `app/Models/` |

---

## ২. Domain Model — Relations

```
User ──< SomitiMember >── Somiti ──< FinancialYear (active one at a time)
 │                          │  └──< SomitiManager (tenure: from/to_date)
 │                          ├──< Share (share types) ──< UserShare ──< ShareTransfer
 │                          ├──< Deposit │ Loan ──< LoanRepayment
 │                          ├──< Investment │ Fdr │ Withdrawal │ Penalty
 │                          ├──< DividendDeclaration ──< DividendAllocation
 │                          ├──< BankAccount │ SomitiMessage │ SomitiWorkflow
 │                          └──< Approval (MorphTo any approvable)
 │
 └──< Notification, PushToken, DueReminder, Ledger ← JournalEntry(Line)
```

**মূল সম্পর্ক:** সব financial entity `somiti_id` + `user_id` ধরে; প্রতিটা approve হলে `AccountingService` double-entry journal তৈরি করে → `Ledger` → Reports।

---

## ৩. Money Flow — Transaction Lifecycle

```
Create (pending) → Approve (dedicated endpoint OR /approvals vote)
  → AccountingService::recordXxx() → JournalEntry(2 lines)
  → Ledger balance → Reports
```

| Module | Service method | Mobile screen | Endpoint |
|---|---|---|---|
| Deposit | `recordDeposit` | DepositCreate/Detail/Receipt | `/deposits` |
| Loan | `recordLoanDisbursement` | LoanCreate/Detail + Repayments | `/loans` + `/loans/{id}/disburse` |
| Withdrawal | `WithdrawalService::approve` | WithdrawalCreate/List | `/withdrawals` |
| Penalty | `recordPenalty` | PenaltyCreate/List | `/penalties` |
| Investment | `recordInvestment` | InvestmentCreate/Detail | `/investments` |
| FDR | `recordFdr` | FdrCreate/Detail | `/fdrs` |
| UserShare | `recordSharePurchase` | UserShareCreate/Detail | `/shares` |
| ShareTransfer | `recordShareTransfer` | ShareTransferCreate/Detail | `/share-transfers` |
| Repayment | `recordLoanRepayment` | RepaymentCreate/List | `/loans/{id}/repayments` |
| Dividend | `DividendService::payDividends` | DividendCreate/Detail | `/somitis/{id}/dividends` |
| FY close | `DividendService::closeFinancialYear` | (mobile-এ নেই) | `/financial-years/{id}/close` |

**Cross-cutting services:** `DuesService` (deposits থেকে monthly dues), `ApprovalService` (vote/quorum/signature), `ReportService` (balance-sheet/profit-loss/portfolio), `ManagerService` (tenure), `ShareService` (revaluation)।

---

## ৪. Gap Analysis — Relation Break Points (Verified)

### 🔴 P0 — গুরুতর

| # | Gap | Evidence |
|---|---|---|
| 1 | **Somiti switcher নেই** — Backend `somiti_id` param accept করে (`DashboardController.php:19`) কিন্তু mobile কখনো পাঠায় না → সবসময় first somiti | `DashboardScreen.tsx:46` → `client.get('/dashboard')` (no query param); কোনো switch UI নেই |
| 2 | **ChatScreen wrong somiti** — `/somitis` list-এর `[0]` use করে, `useSomiti()`-এর selected somiti না। Multi-somiti হলে ভুল chat room | `ChatScreen.tsx:29-33` |
| 3 | **Dual approval paradigm** — Mobile-এ ২ রকম approval: unified voting (`/approvals` + `/approvals/vote`) আর inline (`/{id}/approve|reject`)। Same data ২ system-এ, voting hub-এর সাথে sync নয় | `ApprovalsListScreen.tsx:20` vs `WithdrawalsListScreen.tsx:21`, `RepaymentsListScreen.tsx:28`, `DividendDetailScreen.tsx` |

### 🟠 P1 — Missing approvals in mobile (Backend আছে, mobile call করে না)

| Endpoint (backend) | Mobile status |
|---|---|
| `POST /deposits/{id}/approve` | ❌ কখনো call হয় না |
| `POST /loans/{id}/approve`, `/loans/{id}/disburse` | ❌ নেই (LoanDetail-এ শুধু View Repayments) |
| `POST /fdrs/{id}/approve` | ❌ নেই |
| `POST /investments/{id}/approve` | ❌ নেই (শুধু approved_at দেখায়) |
| `POST /shares/{id}/approve` | ❌ নেই |
| `POST /share-transfers/{id}/approve` / `reject` | ❌ নেই |

### 🟡 P2 — Feature অসম্পূর্ণ / missing

| Gap | Detail |
|---|---|
| Financial-year activate/close | Mobile শুধু list করে; activate/close call হয় না |
| Workflows settings | `/somitis/{id}/workflows` GET/PUT আছে, mobile UI নেই |
| Notification preferences | `/somitis/{id}/notification-preferences` আছে, mobile-এ নেই |
| Audit trail | `/audit/*` আছে, mobile-এ screen নেই (web-এ আছে) |
| Ledgers | `ledgers` API + web page আছে, mobile-এ TrialBalance-এর বেশি কিছু নেই |
| Backfill/legacy | `/members/{user}/backfill`, `/loans/legacy` — শুধু web/manager |
| Chat realtime | Mobile-এ `setInterval` polling (`ChatScreen.tsx:42`); WebSocket/Pusher শুধু web Echo stub |
| API URL | `client.ts:4` hardcoded `https://fnfsomiti.bdesmart.com/api`; env config দরকার |
| Refresh token | 401-এ token মুছে logout — retry/refresh নেই |

---

## ৫. Relation Matrix — Screen ↔ API ↔ Controller ↔ Model ↔ Web

| Mobile screen | API endpoint | Controller | Model | Web page |
|---|---|---|---|---|
| Login/Register/Profile/ChangePassword | `/auth/*` | AuthController | User | auth/Profile/settings |
| DashboardScreen | `/dashboard` | DashboardController | — (aggregate) | dashboard.tsx |
| DepositsList/Create/Detail/Receipt | `/deposits*`, `receipts/deposit` | DepositController, ReceiptApiController | Deposit | Deposits, Receipts |
| LoansList/Create/Detail | `/loans*`, `loans/{id}/repayments` | LoanController, LoanRepaymentController | Loan, LoanRepayment | Loans, Repayments |
| WithdrawalsList/Create | `/withdrawals*` | WithdrawalController | Withdrawal | Withdrawals |
| PenaltiesList/Create | `/penalties*` | PenaltyController | Penalty | Penalties |
| Investments/Fdrs list+create+detail | `/investments*`, `/fdrs*` | InvestmentController, FdrController | Investment, Fdr | Investments, Fdrs |
| UserShares/ShareTransfers | `/shares*`, `/share-transfers*` | UserShareController, ShareTransferController | UserShare, ShareTransfer | UserShares, ShareTransfers |
| BankAccounts | `/bank-accounts*` | BankAccountController | BankAccount | BankAccounts |
| ApprovalsList | `/approvals`, `/approvals/vote` | ApprovalController | Approval | Approvals |
| Dividends | `/somitis/{id}/dividends*`, `/dividends/{id}` | DividendController | DividendDeclaration/Allocation | Dividends |
| MyDues/DuesOverview/MemberDues | `/somitis/{id}/my-dues`, `/dues` | DuesController | Deposit+SomitiMember | Somiti/Dues |
| Managers/ManagerAdd | `/somitis/{id}/managers*` | ManagerController | SomitiManager | Somiti/Managers |
| FinancialYearsList | `/financial-years` | FinancialYearController | FinancialYear | FinancialYears |
| Reports (6 screens) | `/reports/*`, `/somitis/{id}/reports/*` | LedgerController, ReportApiController | Ledger/ChartOfAccount | Reports |
| Chat | `/somitis/{id}/messages`, `/typing`, `/chat/upload` | ChatController | SomitiMessage | chat |
| Notifications | `/notifications*` | NotificationController | Notification | Notifications |
| MembersList/MemberAdd | `/somitis/{id}/members`, `/users` | SomitiController, SomitiMembershipController | SomitiMember, User | Somiti/Members |
| SomitiDetail/Settings | `/somitis/{id}`, `/settings` | SomitiController, SomitiSettingApiController | Somiti | Somitis/settings |
| Create/JoinSomiti | `/somitis`, `/somitis/{id}/users` | SomitiController, SomitiMembershipController | Somiti, SomitiMember | auth |

---

## ৬. Recommended Fix Order

1. **P0-1:** Somiti switcher — `useSomiti`-এ somiti_id state + DashboardScreen-এ switcher UI; সব screen-এ useSomiti enforce
2. **P0-2:** ChatScreen → `useSomiti().somitiId` use
3. **P0-3:** একক approval source of truth — vote hub-কে primary করা বা inline-এর সাথে sync
4. **P1:** Loan approve/disburse + deposit/FDR/investment/share approve buttons (manager role filter)
5. **P2:** FY activate/close, workflows UI, share-transfer approve, ledger view, audit trail, WebSocket chat, env-based API URL
