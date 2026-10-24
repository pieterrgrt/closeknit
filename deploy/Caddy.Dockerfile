# SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
# SPDX-License-Identifier: AGPL-3.0-or-later

# Caddy with a DNS provider plugin. A wildcard certificate (*.closeknit.eu, one
# subdomain per group) can only be obtained through a DNS challenge, so stock
# Caddy is not enough. Swap DNS_PLUGIN to use another provider
# (https://github.com/caddy-dns).

ARG CADDY_VERSION=2

FROM caddy:${CADDY_VERSION}-builder AS build
ARG DNS_PLUGIN=github.com/caddy-dns/hetzner
RUN xcaddy build --with ${DNS_PLUGIN}

FROM caddy:${CADDY_VERSION}-alpine
COPY --from=build /usr/bin/caddy /usr/bin/caddy
