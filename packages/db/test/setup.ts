// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import postgres from 'postgres';
import { runMigrations } from '../src/migrate.ts';

export interface TestDatabase {
	ownerUrl: string;
	appUrl: string;
	drop: () => Promise<void>;
}

/**
 * Creates a throwaway database from TEST_DATABASE_URL (a role that may create
 * databases and roles) and migrates it.
 */
export async function setupTestDatabase(): Promise<TestDatabase> {
	const adminUrl = process.env.TEST_DATABASE_URL;
	if (!adminUrl) throw new Error('TEST_DATABASE_URL is not set');

	const name = `closeknit_test_${process.pid}_${Date.now()}`;
	const admin = postgres(adminUrl, { max: 1, onnotice: () => {} });
	await admin.unsafe(`create database ${name}`);

	const ownerUrl = withDatabase(adminUrl, name);
	const appUrl = withCredentials(ownerUrl, 'closeknit_test_app', 'test-app-password');
	await runMigrations(ownerUrl, appUrl);

	return {
		ownerUrl,
		appUrl,
		drop: async () => {
			await admin.unsafe(`drop database if exists ${name} with (force)`);
			await admin.end({ timeout: 5 });
		}
	};
}

function withDatabase(url: string, database: string): string {
	const u = new URL(url);
	u.pathname = `/${database}`;
	return u.toString();
}

function withCredentials(url: string, user: string, password: string): string {
	const u = new URL(url);
	u.username = user;
	u.password = password;
	return u.toString();
}
