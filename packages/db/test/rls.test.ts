// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
	assertRlsEnforced,
	createDb,
	resolveGroupSlug,
	schema,
	withContext,
	type Database
} from '../src/index.ts';
import { setupTestDatabase, type TestDatabase } from './setup.ts';

const { groups } = schema;

describe.skipIf(!process.env.TEST_DATABASE_URL)('row level security', () => {
	let testDb: TestDatabase;
	let owner: Database;
	let app: Database;
	let groupA: string;
	let groupB: string;

	beforeAll(async () => {
		testDb = await setupTestDatabase();
		owner = createDb(testDb.ownerUrl, { max: 1 });
		app = createDb(testDb.appUrl, { max: 2 });

		const inserted = await owner.db
			.insert(groups)
			.values([
				{ slug: 'marchlewski63', name: 'Marchlewski 63' },
				{ slug: 'oranjehof', name: 'Oranjehof' }
			])
			.returning({ id: groups.id });
		groupA = inserted[0]!.id;
		groupB = inserted[1]!.id;
	});

	afterAll(async () => {
		await app?.close();
		await owner?.close();
		await testDb?.drop();
	});

	it('connects the app with a role that cannot bypass RLS', async () => {
		await expect(assertRlsEnforced(app.db)).resolves.toBeUndefined();
		await expect(assertRlsEnforced(owner.db)).rejects.toThrow(/bypasses Row Level Security/);
	});

	it('shows nothing without a group context', async () => {
		expect(await app.db.select().from(groups)).toEqual([]);
		const rows = await withContext(app.db, {}, (tx) => tx.select().from(groups));
		expect(rows).toEqual([]);
	});

	it('shows only the current group', async () => {
		const rows = await withContext(app.db, { groupId: groupA }, (tx) => tx.select().from(groups));
		expect(rows.map((r) => r.slug)).toEqual(['marchlewski63']);
	});

	it('keeps the context inside its transaction', async () => {
		await withContext(app.db, { groupId: groupA }, (tx) => tx.select().from(groups));
		// Same pooled connection, outside the transaction: the setting is gone.
		expect(await app.db.select().from(groups)).toEqual([]);
	});

	it('cannot change rows of another group', async () => {
		const updated = await withContext(app.db, { groupId: groupA }, (tx) =>
			tx.update(groups).set({ name: 'Taken over' }).where(eq(groups.id, groupB)).returning()
		);
		expect(updated).toEqual([]);

		const deleted = await withContext(app.db, { groupId: groupA }, (tx) =>
			tx.delete(groups).where(eq(groups.id, groupB)).returning()
		);
		expect(deleted).toEqual([]);

		const [b] = await owner.db.select().from(groups).where(eq(groups.id, groupB));
		expect(b?.name).toBe('Oranjehof');
	});

	it('cannot write rows for another group', async () => {
		await expect(
			withContext(app.db, { groupId: groupA }, (tx) =>
				tx.insert(groups).values({ slug: 'intruder', name: 'Intruder' })
			)
		).rejects.toThrow();
	});

	it('creates a group when the context matches its id', async () => {
		const id = crypto.randomUUID();
		const rows = await withContext(app.db, { groupId: id }, (tx) =>
			tx.insert(groups).values({ id, slug: 'nieuwbouw', name: 'Nieuwbouw' }).returning()
		);
		expect(rows[0]?.id).toBe(id);
	});

	it('resolves a slug without exposing the row', async () => {
		expect(await resolveGroupSlug(app.db, 'oranjehof')).toBe(groupB);
		expect(await resolveGroupSlug(app.db, 'does-not-exist')).toBeNull();
	});

	it('cannot switch off RLS or change the schema', async () => {
		await expect(
			app.db.execute(sql`alter table groups disable row level security`)
		).rejects.toThrow();
		await expect(app.db.execute(sql`drop table groups`)).rejects.toThrow();
	});
});
