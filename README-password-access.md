# Account security rollout

This branch adds the frontend password flows and stages the access-approval database migration.

## Password features
- Forgot-password link sends a Supabase recovery email back to `https://sayuretv.com/`.
- Recovery link opens a create-new-password screen.
- Account screen includes Change password.
- Change password verifies the current password before updating it.
- Signup email redirect now uses `https://sayuretv.com/` instead of the old GitHub Pages URL.

## Access approval
The SQL migration is intentionally staged but must be reviewed/run in Supabase before the pending/admin approval UI is enabled. This is necessary because access control must be enforced by database RLS, not only by frontend JavaScript.