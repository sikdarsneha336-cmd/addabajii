# Clearline — Bun + Supabase

Clearline is a student project for documenting unsafe situations without asking reporters for accounts or direct identity details. It includes a public report flow and a staff review desk. It is not an official police or emergency service. Analysis indicators are simulated placeholders, not AI findings.

## Connect this copy to Supabase

1. `.env.example` is a safe template and belongs in GitHub. Copy it to `.env.local` in your project folder for local use.
2. In `.env.local`, set `VITE_SUPABASE_URL` to your project's URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to its publishable key. `.env.local` is ignored by Git and should not be uploaded. For a hosted deployment, enter these values in the hosting provider's environment-variable settings instead.
3. In the Supabase dashboard, open **SQL Editor**, create a query, paste the contents of `supabase/migrations/20260927000000_clearline_cloud.sql`, and run it.
4. In **Authentication → Users**, create your first staff user. In SQL Editor, replace the email below with that user's email and run:

```sql
insert into public.staff (user_id, email, roles)
select id, lower(email), array['admin', 'authority']::text[]
from auth.users
where lower(email) = lower('YOUR_SIGN_IN_EMAIL')
on conflict (user_id) do update set roles = excluded.roles;
```

5. In PowerShell, run `bun install` and `bun run dev` from the project folder, then open `http://localhost:8080`.

Use only the publishable key in `.env.local`. Never put a Supabase secret/service-role key in this app. The migration enables row-level security and grants only the required access. The `retrieve_anonymous_report` database function returns limited status information; it does not return the report narrative to anonymous users.

## Staff accounts

Staff sign in with Supabase Auth. The first administrator is assigned using the SQL statement above. To add another staff member, enter their email in the administrator panel, then invite that same email in **Authentication → Users**. The migration links the invitation to staff access. Passwords and password resets are handled by Supabase Auth.

## Data and limits

Reports and review history are stored in your Supabase project. Choose a region appropriate for your intended users and privacy requirements. This prototype does not guarantee anonymity, legal confidentiality, police follow-up, or emergency response. Do not use it to collect sensitive real-world reports until its security, retention, privacy, and operational requirements have been reviewed. If someone is in immediate danger, contact local emergency services.
