## Goal
Fix the `client_only_login` security finding: remove the hardcoded plaintext users and client-only role checks in `src/pyap/App.jsx`, and gate the app behind real Lovable Cloud (Supabase) authentication with server-side role storage.

## Changes

### 1. Enable Lovable Cloud
Provisions Supabase (auth + database).

### 2. Database migration
- `app_role` enum: `superadmin`, `admin`, `treasurer`, `secretary`, `member`.
- `public.user_roles` table (`user_id`, `role`, unique pair) with grants + RLS.
- `public.has_role(_user_id, _role)` SECURITY DEFINER function.
- `public.profiles` table (`user_id`, `full_name`, `username`) with grants + RLS so users can read their own profile and admins can read all.
- Trigger on `auth.users` insert to create a profile row.
- RLS policies:
  - `user_roles`: users can read their own roles; only superadmin can insert/update/delete.
  - `profiles`: users read/update their own; superadmin/admin read all.

### 3. Auth UI
- Replace the hardcoded `handleLogin` in `src/pyap/App.jsx` with real `supabase.auth.signInWithPassword` / `signUp`.
- Session is loaded via `supabase.auth.getSession()` + `onAuthStateChange`.
- Roles are fetched from `user_roles` after login (server-verified).
- Remove `seedUsers` plaintext array and remove the User Management screen's plaintext password display (passwords no longer exist in client state).

### 4. Role-gated features
- `featureAccess` is derived from the roles returned by the server query, not from client state the user can mutate freely. (Client checks remain for UX, but the sensitive data still lives behind RLS in a follow-up; this finding is about login + role source.)

### 5. First-run superadmin
On empty `user_roles` table, the first user to sign up is auto-assigned `superadmin` via a one-shot trigger (checks row count).

## Out of scope
Members/finance/announcement data stays in client state for now — this finding is specifically about login and role checks. Migrating that data to RLS-protected tables is a separate follow-up.

## Files touched
- New migration (SQL)
- `src/pyap/App.jsx` (login screen + session wiring + role loading; remove seedUsers passwords + password UI)
- No route changes
