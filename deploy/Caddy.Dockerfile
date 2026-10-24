# SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
# SPDX-License-Identifier: AGPL-3.0-or-later

# Caddy with DNS provider plugins. A wildcard certificate (*.closeknit.eu, one
# subdomain per group) can only be obtained through a DNS challenge, so stock
# Caddy is not enough. Both plugins are built in; DNS_PROVIDER in .env picks one
# at runtime. Add another provider (https://github.com/caddy-dns) to DNS_PLUGINS.

ARG CADDY_VERSION=2

FROM caddy:${CADDY_VERSION}-builder AS build
ARG DNS_PLUGINS="github.com/caddy-dns/infomaniak github.com/caddy-dns/hetzner/v2"
RUN xcaddy build $(for p in ${DNS_PLUGINS}; do printf -- '--with %s ' "$p"; done)

FROM caddy:${CADDY_VERSION}-alpine
COPY --from=build /usr/bin/caddy /usr/bin/caddy
