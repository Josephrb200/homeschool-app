-- Table permissions for the Data API roles.
--
-- Older Supabase projects granted these automatically to every new table in
-- `public`. Newer projects may not, which leaves signed-in users unable to read
-- even their own profile ("permission denied"). Row-level security (0001) still
-- decides which rows each person can see; these grants only let the roles ask.
-- Safe to run more than once.

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;

grant execute on all functions in schema public to authenticated, service_role;
