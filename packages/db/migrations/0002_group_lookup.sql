-- SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
-- SPDX-License-Identifier: AGPL-3.0-or-later

-- Resolves a subdomain to a group id before any group context exists.
-- SECURITY DEFINER runs it as the owner, which is not subject to RLS; it reveals
-- only the id, never the row.
CREATE FUNCTION app.resolve_group_slug(group_slug text) RETURNS uuid
	LANGUAGE sql STABLE SECURITY DEFINER
	SET search_path = pg_catalog, pg_temp
	AS $$ SELECT id FROM public.groups WHERE slug = group_slug $$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION app.resolve_group_slug(text) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app.resolve_group_slug(text) TO closeknit_app;
