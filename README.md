# Somiti

✅ **Somiti** is a cooperative management backend built with Laravel. It provides APIs and web controllers for managing somitis (groups), deposits, loans, investments, FDRs, shares, approvals, ledgers, notifications, and user membership/permissions.

---

## 🚀 Features

- REST API (Sanctum) and basic web controllers (Inertia-ready stubs)
- Resource policies for authorization (owner / manager / member checks)
- Simple DB-backed permissions (manage_all, manage_users, manage_notifications, manage_somiti_members)
- Notifications model and API (personal & somiti-wide)
- Tests (Pest/PHPUnit) covering key flows and authorization
- Optional packages installed: spatie/laravel-permission, spatie/laravel-activitylog (for future use)

---

## 🛠 Tech Stack

- PHP (Laravel)
- Sanctum (API auth)
- Fortify (auth UI & flows; configured to use `phone` as login field)
- SQLite / MySQL (configurable)
- Pest / PHPUnit for tests

---

## Quick start (local development)

1. Clone

   ```bash
   git clone git@github.com:ringkubd/somiti.git
   cd somiti
   ```

2. Install PHP dependencies

   ```bash
   composer install
   ```

3. Install JS dependencies (optional if working on web/UI)

   ```bash
   npm install
   npm run dev
   ```

4. Configure environment

   ```bash
   cp .env.example .env
   # update DB settings and other env values
   php artisan key:generate
   ```

5. Run migrations & seeders

   ```bash
   php artisan migrate --seed
   ```

   The seeder creates an admin user and seeds default permissions (see `database/seeders/PermissionSeeder`).

6. Run tests

   ```bash
   php artisan test -v
   ```

7. Run the server

   ```bash
   php artisan serve
   ```

---

## Database & Migrations

- New permission system migration: `database/migrations/*_create_permissions_table.php`
- Key domain migrations include: `somitis`, `somiti_members`, `users`, `shares`, `financial_years`, `ledgers`, `notifications`, etc.

Seeder summary:
- `DatabaseSeeder` runs `UserSeeder`, `SomitiSeeder`, and `PermissionSeeder`.

---

## Authentication & Authorization

- Authentication: Fortify + Sanctum. Fortify configured to use `phone` as the login field; two-factor authentication has been disabled for now.
- Authorization: Each resource has a Policy under `app/Policies` (e.g., `SomitiPolicy`, `SharePolicy`, `NotificationPolicy`, `UserPolicy`). Policies check owner/manager/member relationships and now also consider permission checks.
- Simple permission model: `permissions` table + `permission_user` pivot, helpers on `User` model: `givePermissionTo()`, `revokePermission()`, `hasPermission()`.

API endpoints (high level)
- Authenticated (sanctum) endpoints (see `routes/api.php`):
  - Resource controllers: `deposits`, `loans`, `investments`, `fdrs`, `shares` (user shares), `share-types` (metadata), `financial-years`, `somitis`
  - Approvals: `GET /api/approvals`, `POST /api/approvals/{approval}/decide`
  - Ledgers: `GET /api/ledgers`, `GET /api/ledgers/{ledger}`
  - Notifications: `GET /api/notifications`, `GET /api/notifications/{id}`, `POST /api/notifications/{id}/mark-read`, `DELETE /api/notifications/{id}`
  - Users: `GET /api/users/{id}`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`
  - Permissions: `POST /api/users/{id}/permissions` (assign), `DELETE /api/users/{id}/permissions` (revoke)
  - Somiti membership management: `POST /api/somitis/{somiti}/users`, `PUT /api/somitis/{somiti}/users/{user}`, `DELETE /api/somitis/{somiti}/users/{user}`

Notes: Owner/manager rules are implemented in helpers/policies (`User::isManagerOfSomiti`, `isOwnerOfSomiti`). Global permissions (e.g., `manage_all`) bypass local checks.

---

## Tests

- Run the suite with:

  ```bash
  php artisan test -v
  ```

- Tests include coverage for: approvals, share management, notifications, membership management, user administration, and permission assignment.

---

## Development notes

- Web controllers are located in `app/Http/Controllers/Web` (Inertia-ready stubs). You can wire the front-end (Inertia/Vue or Blade) to complete UI flows.
- If you prefer a richer roles/permissions system, convert to Spatie's `HasRoles` and use the provided middleware & blade directives; Spatie is already included in composer.json.
- To audit permission changes, consider enabling `spatie/laravel-activitylog` (already installed) and log assign/revoke events.

---

## Contributing

- Create a branch, add tests for new features, and open a PR.
- Keep changes small and add tests that cover authorization rules.

---

## Troubleshooting

- Duplicate key errors during seeding: ensure your `.env` DB is correct and run `php artisan migrate:fresh --seed` for a clean DB.
- Authentication issues: Fortify uses `phone` as username — ensure registration tests use `phone` field instead of email for login.

---

If you'd like, I can:
- Add a simple web UI for permissions and user management ✅
- Switch to Spatie roles & permissions for a more feature-rich system 🔧

Thanks — let me know which direction you'd like to take next! ✨
