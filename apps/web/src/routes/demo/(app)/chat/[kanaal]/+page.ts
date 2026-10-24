// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { error } from '@sveltejs/kit';
import { channels } from '#lib/demo/data.js';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	if (!channels.some((c) => c.id === params.kanaal)) error(404, 'Dit kanaal bestaat niet');
	return { id: params.kanaal };
};
