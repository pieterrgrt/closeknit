# Data model (proposal, awaiting approval)

This is the proposed data model for milestones M1 to M4. It follows the first draft in the build brief and adds what federation and privacy need from the start. Nothing beyond `groups` exists in the database yet; the decisions marked **Decision** need approval before M1 starts, because they are hard to change later.

## Conventions

- Every table has an `id` (UUID) and `created_at`; mutable tables also `updated_at`.
- Every group-bound table has `group_id` and an RLS policy `group_id = app.current_group_id()`.
- Every content row (posts, comments, events, polls, items, messages) has `ap_id` (its global ActivityPub URI) and `origin_server` (`null` for local rows), so federation needs no migration.
- Timestamps are `timestamptz`; times are shown in the member's time zone.

## Tables

### Accounts (global, not group-bound)

| Table          | Columns                                                                                                                        | Notes                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `users`        | id, email (unique), display_name, real_name?, locale, time_zone, created_at                                                    | A person with a login on this server.                                 |
| `passkeys`     | id, user_id, credential_id, public_key, counter, transports, name, created_at, last_used_at                                    | SimpleWebAuthn credentials.                                           |
| `sessions`     | id (hash of the token), user_id, expires_at, created_at, last_seen_at                                                          | Only the SHA-256 of the cookie token is stored.                       |
| `login_tokens` | token_hash, email, expires_at, used_at                                                                                         | Magic links: single use, 15 minutes.                                  |
| `actors`       | id, kind (`local` / `remote`), user_id?, group_id?, ap_id, inbox, shared_inbox, public_key, private_key?, handle, display_name | ActivityPub identity for local users, local groups and remote actors. |

### Groups

| Table              | Columns                                                                                                                                       | Notes                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `groups`           | id, slug, name, type (`building`, `association`, `other`), accent_color, cover_image, require_real_names, require_approval, ap_id, created_at | Exists already with id, slug, name.          |
| `memberships`      | group_id, user_id, role (`owner`, `admin`, `member`), status (`pending`, `active`), unit?, joined_at                                          | `unit` is a house number or floor, optional. |
| `subgroups`        | id, group_id, name, kind (`floor`, `stairwell`, `working_group`, `other`)                                                                     |                                              |
| `subgroup_members` | group_id, subgroup_id, user_id                                                                                                                |                                              |
| `invites`          | id, group_id, token_hash, created_by, expires_at, max_uses, uses, revoked_at                                                                  | For link, QR code and e-mail.                |

### Content

| Table                                 | Columns                                                                                                                           | Notes                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `posts`                               | id, group_id, subgroup_id?, author_actor_id, body, pinned, urgent, ap_id, origin_server, created_at, edited_at                    | Notice board. `urgent` is the only thing that triggers an immediate notification. |
| `comments`                            | id, group_id, post_id, author_actor_id, body, ap_id, origin_server                                                                |                                                                                   |
| `reactions`                           | id, group_id, target_type, target_id, actor_id, emoji                                                                             | No counters shown in the UI.                                                      |
| `attachments`                         | id, group_id, owner_type, owner_id, storage_key, mime_type, size, width, height, alt_text                                         | Files in S3-compatible storage.                                                   |
| `channels`                            | id, group_id, subgroup_id?, name, ap_id                                                                                           | One per group and one per subgroup.                                               |
| `messages`                            | id, group_id, channel_id, author_actor_id, thread_parent_id?, body, ap_id, created_at, edited_at                                  | Chat. Federates in a later version.                                               |
| `events`, `event_attendees`           | event: id, group_id, subgroup_id?, title, description, starts_at, ends_at, location, ap_id … attendee: event_id, actor_id, status |                                                                                   |
| `items`                               | id, group_id, owner_actor_id, kind (`lend`, `give`), title, description, status (`available`, `reserved`, `lent`, `gone`), ap_id  | Lending and give-away corner.                                                     |
| `polls`, `poll_options`, `poll_votes` | poll: id, group_id, question, closes_at, multiple, ap_id … vote: poll_option_id, actor_id                                         |                                                                                   |

### Notifications and federation

| Table                   | Columns                                                          | Notes                                                                           |
| ----------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `notifications`         | id, group_id, user_id, kind, subject_type, subject_id, read_at   | Feeds the "what's going on" overview.                                           |
| `digest_preferences`    | user_id, group_id, frequency (`off`, `daily`, `weekly`), send_at |                                                                                 |
| `push_subscriptions`    | id, user_id, endpoint, p256dh, auth                              | Web Push (M5).                                                                  |
| `tombstones`            | ap_id, group_id, deleted_at                                      | Remembers deleted content so a `Delete` can be re-sent and late copies refused. |
| `federation_deliveries` | handled by the job queue (pg-boss)                               | No table of our own.                                                            |

## Decisions needed

1. **Authors are actors, not users.** Content points to `actors`, so a post from a member on another server and a post from a local member look the same. This costs one join but avoids a large migration in M4. _Recommended._

2. **IDs: UUIDv7, generated in the app.** Time-ordered IDs keep indexes compact and make cursors simple. PostgreSQL 17 cannot generate them, so the app does; v4 stays possible for rows created in SQL. _Recommended._

3. **What RLS enforces.** Option A (built in M0): RLS isolates groups; the app checks membership and role, then sets the group context. Option B: RLS also checks that `app.current_user_id()` is an active member of the group, which doubles the protection but makes every query join on `memberships` and complicates joining and invite flows. _Recommended: A, with B added for the most sensitive tables (messages, members) if wanted._

4. **Deleting.** Content is deleted for real (hard delete), plus a small `tombstones` row with only the `ap_id` for federation. No hidden "soft delete" that keeps the text. _Recommended, in line with data minimisation._

5. **Names.** `display_name` is global; `real_name` is optional and shown only in groups that require real names. A group that requires real names asks for it on joining. _Recommended._ Alternative: a display name per group, which is more flexible but makes mentions and federation identities harder to follow.
