# Somiti Manager: System Analysis Report

## 1. Project Overview
**Somiti Manager** is a specialized ERP/Financial Management system designed for cooperative societies (Somitis). It facilitates the management of members, savings (deposits), loans, shares, and overall financial transparency through a robust ledger and multi-tier approval system.

---

## 2. Technology Stack

### Backend
- **Framework**: Laravel 12.x (Modern/Latest)
- **Language**: PHP 8.2+
- **Authentication**: Laravel Fortify (Session-based) & Laravel Sanctum (Token-based for API)
- **Key Packages**:
  - `spatie/laravel-permission`: Role-based access control.
  - `spatie/laravel-activitylog`: Audit trails for financial transactions.
  - `inertiajs/inertia-laravel`: Seamless React integration.

### Frontend
- **Framework**: React 19 (Latest)
- **State Management/Routing**: Inertia.js (Bridge between Laravel and React)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI (Primitives), Lucide React (Icons)
- **Tooling**: Vite (Bundler), TypeScript (Type safety)

### Database & Storage
- **Database**: MySQL (configured in `.env`)
- **Queue/Cache/Session**: Database-driven (for reliability and ease of deployment in small-to-medium environments)

---

## 3. Core Domain Features

### Society Management
- **Somiti Creation**: Multi-tenant-like structure where users can own or join multiple societies.
- **Onboarding**: A forced-onboarding flow ensuring every new user creates or joins a Somiti before accessing the dashboard.
- **Membership**: Granular management of members, managers, and owners.

### Financial Modules
- **Deposits**: Tracking member savings.
- **Loans**: Managing loan applications, approvals, and disbursements.
- **FDR (Fixed Deposits)**: Long-term deposit management.
- **Shares**: Managing member equity/shares within the society.
- **Investments**: Tracking society-level investments.

### Accountability & Transparency
- **Approvals System**: A unified system to 'decide' on transactions, ensuring they are vetted before finalization.
- **Ledgers**: Automatic financial accounting for every transaction.
- **Activity Logs**: Comprehensive logging of user actions.

---

## 4. Current Status & Progress

### Recent Updates
- **Registration Flow**: Completely overhauled to guide users through their first Somiti creation.
- **Frontend Migration**: Moving from traditional Blade templates to Inertia + React (e.g., Somiti Index/Create pages are already migrated).
- **Middleware Integration**: `EnsureFirstTimeSomitiCreation` ensures data integrity and user engagement.

### Known Technical Debt / TODOs
- **Blade-to-Inertia Migration**: Some views (e.g., `somitis.edit`) still use traditional Blade `view()` calls and need migration to React.
- **Email Verification**: Currently disabled in `fortify.php` and requires route setup.
- **Member Invitation**: Currently, members are added directly; an invitation/acceptance system is planned.
- **Two-Factor Auth**: Disabled/Incomplete setup in Fortify.

---

## 5. Security & Architecture Observations
- **RBAC**: Uses Spatie Permission, but custom Policies (e.g., in `SomitiController`) are also in place for domain-specific checks.
- **Soft Deletes**: Implemented on all domain tables, ensuring data is never permanently lost.
- **API Parity**: There is a strong alignment between Web (Inertia) and API (JSON) routes, allowing for potential mobile app integration in the future.

---

## 6. Recommendations
1. **Unify Frontend**: Complete the migration of the remaining Blade templates to Inertia/React to maintain a consistent SPA feel.
2. **Setup Pusher/Broadcasting**: The `.env` currently uses `log` for broadcasting. Real-time notifications (e.g., for transaction approvals) would significantly improve UX.
3. **Automated Testing**: While Pest is installed, increasing coverage for the financial 'Approval' logic is critical for a system handling money.
