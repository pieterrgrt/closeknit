// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Until there is a landing page, the home page opens the clickable demo.
export const load: PageServerLoad = () => {
	redirect(307, '/demo');
};
