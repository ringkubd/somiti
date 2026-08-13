# Mobile App — Complete Review & Plan (2026-08-13)

## 1. What is good ✅
- All screens wired to the API; every module has list/create/detail flows.
- Full i18n adoption: every screen uses `useLanguage()` (7 languages).
- Currency: somiti-level picker (manager-only UI), locale-aware formatting on dashboard.
- Feature relations present: Somiti Detail → managers/dues/reports/settings; deposit/loan detail → member profile; members → profile; dues → member months.
- Manager elections (majority vote), dues + reminders, reports (balance sheet/P&L/portfolio/profiles), receipts, chat, push.
- Tests: 93 passing; release AAB/APK signed; production deployed.

## 2. 🔴 Critical bugs found
1. **Approvals (mobile) uses manager-only `decide` endpoint** → normal members get 403 when voting. Fix: use `POST /api/approvals/vote` with approvable_type/id.
2. **Financial Summary / Trial Balance (mobile)** call `/reports/summary` + `/reports/trial-balance` **without `somiti_id`** → API returns 400. Fix: pass `somiti_id`.
3. **Dividends list (mobile)** calls `/dividends` — route is somiti-scoped (`/somitis/{id}/dividends`) → 404. Fix endpoint.
4. **Join Somiti (mobile)** posts to `/somitis/{id}/users` (manager-gated) → normal member gets 403. Fix: add public `POST /api/somitis/join {unique_code}` endpoint + use it.
5. **More menu shows manager-only screens to everyone** (Managers, Dues Overview, Member Profiles) → members hit 403. Fix: hide based on `can_manage` from dashboard API.

## 3. Role/access review
- Member: create deposits/loans/withdrawals/repayments, vote (after fix), view own dues, reports (read-only), profile.
- Manager/owner: + approve/reject/vote-with-signature, member management, manager elections, dues overview, member profiles, somiti settings, workflows (web), reports.
- Board (signers): managers/owners sign with signature; election candidates can't self-vote; creator can't self-vote (backend enforced).
- ✅ Backend policies enforce most of this; ❌ mobile UI doesn't hide restricted screens (fix #5) and members can't vote (fix #1).

## 4. Feature relations — still missing
- Approvals list item → should open the underlying deposit/loan detail (not just vote dialog).
- Dues Overview member → full Member Profile link (currently only month schedule).
- Notifications → deep link to the related record (deposit/loan/approval).
- Chat → jump to member profile on tap; somiti switcher (multi-somiti users get first somiti only).
- Reports: Summary/Trial Balance (old) duplicate Balance Sheet/Portfolio (new) — merge into one Reports hub.

## 5. Currency / language
- ✅ Currency per somiti (manager-only), 17 currencies, locale formatting on dashboard.
- ⚠️ Other screens use raw symbol prefix (consistent, but not locale-formatted) — acceptable, optional polish.
- ✅ All screens translated; missing keys fall back to English.

## 6. UI/UX
- ✅ Clean light header + fund card on home; no redundant menus; safe-area + floating tab bar padding fixed.
- ⚠️ MemberProfiles/DuesOverview visible to members (403 UX) — hide (fix #5).
- ⚠️ No deep links from notifications/approvals (relations in §4).
- ⚠️ Chat uses first somiti only; no somiti switcher.

## 7. Plan (priority)
### P0 — fix critical bugs (this pass)
1. ✅ Approvals vote endpoint (mobile) — members can vote via `/api/approvals/vote`.
2. ✅ somiti_id on summary/trial-balance (mobile) — no more 400.
3. ✅ Dividends list endpoint (mobile) — `/somitis/{id}/dividends`.
4. ✅ Public join endpoint (backend `POST /api/somitis/join` + mobile) — verified on production (scope bypass for code search).
5. ✅ Role-aware More menu — dashboard returns `can_manage`; manager-only items hidden for members (verified).

### Additional fixes in this pass
- ✅ Dues test made date-agnostic (env date moved past due day).
- ✅ Deployed to production; 93 tests passing; mobile tsc clean.

### P1 — feature relations
6. ✅ Approvals → opens approvable summary (amount/status fetched) before vote.
7. ✅ Dues Overview → full Member Profile; Notifications → deep links (deposit/loan/withdrawal/penalty/repayment/dues) via new `notifications.data` column.
8. ✅ Chat somiti switcher (chips when multiple somitis); Reports hub (one menu → all 6 reports).

### Verified
- Backend deployed: notifications migration + observer link data; production E2E confirmed `data={"type":"deposit","id":...}`.
- 93 tests passing; mobile tsc clean.

### P2 — polish
9. Locale-formatted money everywhere; member-facing UX passes; on-device QA on emulator.

## 8. Verification
- `php artisan test` green; mobile `tsc --noEmit` + `expo export` clean; re-deploy backend after backend changes.
