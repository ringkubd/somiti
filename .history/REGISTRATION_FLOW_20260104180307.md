# Somiti Registration & User Flow Updates

## Overview
This document describes the updated user registration and onboarding flow for the Somiti application.

## Changes Implemented

### 1. **Dashboard Layout for Somitis Page**
- **File**: `resources/js/pages/Somitis/Index.tsx`
- **Change**: Updated to use `AppLayout` component instead of plain div
- **Result**: Somitis index now displays with proper dashboard sidebar, breadcrumbs, and styling
- **UI Improvements**:
  - Grid layout for Somitis cards (responsive 1-2-3 columns)
  - Enhanced empty state messaging
  - "Create New Somiti" button in header
  - Card-based design with hover effects

### 2. **Somiti Creation Page**
- **File**: `resources/js/pages/Somitis/Create.tsx` (NEW)
- **Features**:
  - Designed specifically for first-time Somiti creation
  - Shows informational banner about Somiti concept
  - Supports both first-time and subsequent Somiti creation
  - Integrated with AppLayout for consistency
  - Clear form validation

### 3. **User Model Enhancement**
- **File**: `app/Models/User.php`
- **Addition**: New `ownedSomitis()` relation
- **Purpose**: Query for Somitis created by user as owner
- **Complements**: Existing `somitis()` relation (through somiti_members table)

### 4. **First-Time Somiti Creation Enforcement**
- **File**: `app/Middleware/EnsureFirstTimeSomitiCreation.php` (NEW)
- **File**: `routes/web.php` (updated)
- **Logic**:
  - All authenticated users must create their first Somiti before accessing other features
  - Checks if user has no owned Somitis
  - Redirects to `/somitis/create` automatically
  - Skips check for: logout, settings, password reset, Somiti creation/store routes
  - Only applies to web requests (not API)

### 5. **Registration Flow Updates**
- **File**: `resources/js/pages/auth/register.tsx`
- **Changes**:
  - Added informational banner explaining first-time user flow
  - Updated description to mention "and Somiti" creation
  - Clear messaging about becoming a Somiti owner
  - Explains member addition process (managers/owners only)

### 6. **Controller Updates**
- **File**: `app/Http/Controllers/Web/SomitiController.php`
- **Updated `create()` method**:
  - Checks if user has created any Somitis before
  - Passes `isFirstTime` flag to frontend
  - Renders Inertia component instead of blade view
- **Updated `store()` method**:
  - Added max length validation (255 chars) for Somiti name

### 7. **Configuration Changes**
- **File**: `config/fortify.php`
- **Change**: Disabled email verification feature (commented out)
- **Reason**: Simplified onboarding flow; can be re-enabled later

### 8. **Bug Fixes**
- **File**: `resources/js/pages/Notifications/Show.tsx`
- **File**: `resources/js/pages/Users/Edit.tsx`
- **Fix**: Updated deprecated `Inertia` import to use `router` from `@inertiajs/react`

---

## User Flow After Implementation

### For New Users (First Registration)
1. User visits registration page
2. Sees message: "After registration, you'll be guided to create your first Somiti"
3. Completes registration with name, phone, password
4. Gets logged in automatically
5. Middleware detects no Somitis exist
6. Redirected to `/somitis/create`
7. User creates their first Somiti (becomes owner)
8. Can now access dashboard and other features
9. Can create additional Somitis later

### For Existing Users
- Can create additional Somitis from dashboard
- Can add members to their Somitis (members must be invited, not self-register)
- Managers/owners control member addition through `POST /somitis/{id}/users`

---

## Member Addition Process

### Current Implementation
- Only Somiti owners/managers can add members
- Members are added via direct API/form (not self-registration)
- Implementation at: `app/Http/Controllers/Web/SomitiMembershipController`

### Next Steps (Future)
- Create UI for member invitation
- Send invitation emails/SMS
- Members accept/decline invitations
- Admin can manage member roles (owner, manager, member)

---

## Technical Notes

### Middleware Behavior
```php
// Routes that skip the "first Somiti" check
- somitis.create
- somitis.store
- logout
- auth.logout
- password.*
- profile.*
```

### Database Relations
- `User -> ownedSomitis()`: Somitis where `created_by_user_id = user.id`
- `User -> somitis()`: All Somitis user is member of (through `somiti_members`)
- `Somiti -> createdBy()`: User who created the Somiti

---

## Testing Recommendations

1. **Registration Flow**
   - Register new user
   - Verify redirect to Somiti creation
   - Create first Somiti
   - Verify access to dashboard

2. **Existing Users**
   - Log in as existing user
   - Verify access to dashboard (if they have Somitis)
   - Create new Somiti
   - Verify middleware doesn't interfere

3. **Edge Cases**
   - User deleted their only Somiti
   - User tries to access admin/settings before creating Somiti
   - API requests should not be affected by middleware

---

## Files Modified

### Backend
- `app/Actions/Fortify/CreateNewUser.php` - Comment update
- `app/Http/Controllers/Web/SomitiController.php` - create/store methods
- `app/Models/User.php` - Added ownedSomitis() relation
- `app/Middleware/EnsureFirstTimeSomitiCreation.php` - NEW
- `config/fortify.php` - Disabled email verification
- `routes/web.php` - Added middleware to auth group

### Frontend
- `resources/js/pages/Somitis/Index.tsx` - Updated layout
- `resources/js/pages/Somitis/Create.tsx` - NEW
- `resources/js/pages/auth/register.tsx` - Updated messaging
- `resources/js/pages/Notifications/Show.tsx` - Fixed import
- `resources/js/pages/Users/Edit.tsx` - Fixed import

---

## Known Issues / TODOs

1. **Build Issues** - Some route files need creating for two-factor auth (disabled for now)
2. **Email Verification** - Currently disabled; re-enable once routes are properly set up
3. **Member Invitation** - Not yet implemented (currently only direct addition available)
4. **API Documentation** - Update API docs to reflect middleware changes

---

## Deployment Checklist

- [ ] Run migrations (if any database changes)
- [ ] Build frontend (`npm run build`)
- [ ] Clear caches (`php artisan cache:clear`)
- [ ] Test registration flow on staging
- [ ] Test existing user login
- [ ] Verify Somiti creation and access
- [ ] Deploy to production

