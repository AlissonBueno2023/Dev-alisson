# Sayure TV — Access approval plan

Planned roles:

- `owner`: Alisson (primary administrator)
- `admin`: Sayuri (can approve/reject access requests)
- `user`: approved users
- New accounts: `pending` until approved by owner or admin

Security requirement: approval must be enforced in Supabase with Row Level Security (RLS), not only hidden in the frontend. The database migration/policies should be installed before enabling the approval UI in production.

Configured administrator identifiers:
- Alisson: alissonbueno2012@gmail.com
- Sayuri: sayuremiranda@gmail.com

Next implementation step: create the profiles/access table, RLS policies, pending screen, and administrator requests panel.