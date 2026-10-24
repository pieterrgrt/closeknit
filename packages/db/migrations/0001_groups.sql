-- SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
-- SPDX-License-Identifier: AGPL-3.0-or-later

CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "groups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "groups_isolation" ON "groups" AS PERMISSIVE FOR ALL TO public USING ("groups"."id" = app.current_group_id()) WITH CHECK ("groups"."id" = app.current_group_id());