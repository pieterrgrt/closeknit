# Contributing to Closeknit

Thank you for helping. This document explains how to propose a change.

## Developer Certificate of Origin

Closeknit uses the [Developer Certificate of Origin](https://developercertificate.org/) (DCO) instead of a contributor licence agreement. You keep the copyright of your contribution and license it under the project licence, AGPL-3.0-or-later.

Certify the DCO by adding a `Signed-off-by` line with your real name and e-mail address to every commit:

```
Signed-off-by: Jane Doe <jane@example.org>
```

`git commit -s` adds it for you. Pull requests with unsigned commits cannot be merged.

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

## Licence headers

Every file that can hold a comment starts with an SPDX header:

```ts
// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later
```

`pnpm format` adds missing headers; `pnpm lint` fails without them. Files that cannot hold a comment (JSON, Markdown) are covered by `REUSE.toml`.

## Before you open a pull request

```sh
pnpm lint
pnpm check
pnpm test        # with TEST_DATABASE_URL set to a Postgres role that may create databases
pnpm test:e2e    # with DATABASE_URL set and `pnpm db:migrate` applied
```

- Write tests with your change: Vitest for logic, Playwright for important flows.
- No external services outside the EU, no trackers, no CDNs, no Google Fonts. Every asset is self-hosted.
- No hard-coded user-facing text: everything goes through the translation files (from milestone M1).
- Every group-bound table has a `group_id` column and a Row Level Security policy.
- Add a line to `CHANGELOG.md` under _Unreleased_ for changes users or self-hosters notice.

## Code of conduct

Be kind and assume good intent. Harassment of any kind is not tolerated.
