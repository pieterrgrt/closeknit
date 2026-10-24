-- SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
-- SPDX-License-Identifier: AGPL-3.0-or-later

-- Restricted role for the app. It never bypasses RLS; the login role named in
-- DATABASE_URL is made a member of it by src/migrate.ts.
DO $$
BEGIN
	IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'closeknit_app') THEN
		CREATE ROLE closeknit_app NOLOGIN NOSUPERUSER NOBYPASSRLS;
	END IF;
END
$$;
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS app;
--> statement-breakpoint
-- The current group and user, set per transaction by withContext().
-- An unset setting reads as '' after first use in a session, hence nullif().
CREATE FUNCTION app.current_group_id() RETURNS uuid
	LANGUAGE sql STABLE PARALLEL SAFE
	AS $$ SELECT nullif(current_setting('app.group_id', true), '')::uuid $$;
--> statement-breakpoint
CREATE FUNCTION app.current_user_id() RETURNS uuid
	LANGUAGE sql STABLE PARALLEL SAFE
	AS $$ SELECT nullif(current_setting('app.user_id', true), '')::uuid $$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA app TO closeknit_app;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO closeknit_app;
--> statement-breakpoint
-- Tables and sequences created by the owner from here on are usable by the app;
-- which rows it sees is up to the RLS policies.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
	GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO closeknit_app;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public
	GRANT USAGE, SELECT ON SEQUENCES TO closeknit_app;
