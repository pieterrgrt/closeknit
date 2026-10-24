# Deploying Closeknit

This guide puts Closeknit on a single server with HTTPS on `closeknit.eu` and one subdomain per group (`marchlewski63.closeknit.eu`). `closeknit.nl` and the `www` names forward to `closeknit.eu`. It is written for a Hetzner Cloud server but works on any Linux server with Docker.

> **Status:** until milestone M2 the app is a placeholder page plus `/healthz`. Deploying now proves the whole chain (DNS, certificates, Docker, database) before there is anything to lose.

## What runs where

```
internet ──443──> caddy ──> web (SvelteKit) ──> db (PostgreSQL 17)
                    │                              ▲
            certificates (Let's Encrypt)     migrate (runs once per deploy)
```

- **caddy** terminates HTTPS and is the only container with published ports (80, 443). It is built with a DNS plugin, because a wildcard certificate (`*.closeknit.eu`) can only be issued through a DNS challenge.
- **web** and **db** have no published ports; they are reachable from other containers only.
- **migrate** applies database migrations as the owner role and provisions the restricted app role, then exits. The app refuses to start if its role could bypass Row Level Security.

The files: `docker-compose.yml` (base), `docker-compose.prod.yml` (production overrides and Caddy), `deploy/Caddy.Dockerfile`, `deploy/Caddyfile` and `deploy/env.example`.

## 1. Domains and DNS

1. Register `closeknit.eu` and `closeknit.nl` on the name of Aldus Lab, with a shared mailbox as contact so the stichting can take over later.
2. Put the DNS of both domains on **Hetzner DNS** (free): set the nameservers at the registrar to the ones Hetzner shows you.
3. Create these records. Find the addresses of your server in the Hetzner Cloud console.

| Name               | Type       | Value                                                            |
| ------------------ | ---------- | ---------------------------------------------------------------- |
| `closeknit.eu`     | A          | the server's IPv4 address                                        |
| `closeknit.eu`     | AAAA       | an address inside the server's IPv6 block, usually `<prefix>::1` |
| `*.closeknit.eu`   | A          | the same IPv4 address                                            |
| `*.closeknit.eu`   | AAAA       | the same IPv6 address                                            |
| `closeknit.nl`     | A          | the same IPv4 address                                            |
| `closeknit.nl`     | AAAA       | the same IPv6 address                                            |
| `www.closeknit.nl` | A and AAAA | the same addresses                                               |

Always create both A and AAAA: many mobile and student networks still lack IPv6, and some are IPv6-only.

4. Create an **API token** that may edit the DNS zone of `closeknit.eu`. Caddy uses it to answer the certificate challenge; it never reaches the app.
   - In the [Hetzner Console](https://console.hetzner.com), open the **project** that holds the DNS zone, then _Security_, _API tokens_, _Generate API token_.
   - Give it a name (for example `caddy-closeknit`) and **Read & Write** permission, and copy the token right away: it is shown only once.
   - Put it in `.env` as `HETZNER_API_TOKEN`. Anyone with this token can change your DNS, so keep it out of git and chat.

> **Console DNS versus the old DNS Console.** The build uses `caddy-dns/hetzner/v2`, which talks to the DNS of the new Hetzner Console (Cloud API). If your zones still live in the old `dns.hetzner.com` console, a token from there does not work with v2. Either move the zones to the Console, or build with the v1 plugin: `DNS_PLUGIN=github.com/caddy-dns/hetzner` (see "Another DNS provider" below). Test a token before the first deploy:
>
> ```sh
> curl -sS -H "Authorization: Bearer $HETZNER_API_TOKEN" https://api.hetzner.cloud/v1/zones | head -c 300
> ```
>
> A list of zones means it works; an `unauthorized` error means the token is wrong or from the other system.

## 2. The server

1. Create a Hetzner Cloud server, for example CX22 in Falkenstein or Helsinki, with Ubuntu 24.04, your SSH key and **backups enabled**.
2. Add a Hetzner **Cloud Firewall** that allows inbound TCP 22, 80 and 443, and UDP 443 (HTTP/3). Use this rather than `ufw`: Docker writes its own firewall rules and bypasses `ufw`.
3. Log in and install Docker Engine and the Compose plugin following the [official instructions](https://docs.docker.com/engine/install/ubuntu/). You need Compose 2.24 or newer (the production file uses `!reset`).
4. Optional but recommended, so Caddy sees real client addresses over IPv6 as well: in `/etc/docker/daemon.json` put

```json
{ "ipv6": true, "fixed-cidr-v6": "fd00:db8:1::/64", "ip6tables": true }
```

and run `sudo systemctl restart docker`.

## 3. First deploy

```sh
sudo git clone https://github.com/pieterrgrt/closeknit /opt/closeknit
cd /opt/closeknit
sudo cp deploy/env.example .env
sudo chmod 600 .env
sudo nano .env        # fill in every value; generate passwords with: openssl rand -hex 24
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

The first build takes a few minutes (it compiles Caddy and the app). Then follow Caddy while it requests the certificates:

```sh
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f caddy
```

Look for `certificate obtained successfully`. DNS changes can take a while to spread, so a failed first attempt that succeeds on retry is normal.

**Testing without using up Let's Encrypt's limits:** add `acme_ca https://acme-staging-v02.api.letsencrypt.org/directory` to the global block at the top of `deploy/Caddyfile` while experimenting, and remove it again afterwards. Staging certificates are not trusted by browsers.

To save typing, you can put the file list in your environment: `export COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml`.

## 4. Check that it works

```sh
curl -sS https://closeknit.eu/healthz              # {"status":"ok"}
curl -sS https://anything.closeknit.eu/healthz     # the wildcard certificate and routing
curl -sSI https://closeknit.nl/ | head -3          # 301, Location: https://closeknit.eu/
curl -6 -sS https://closeknit.eu/healthz           # IPv6
```

Until M2 every subdomain shows the same placeholder page; routing per group comes with the group feature.

## 5. Updating

```sh
cd /opt/closeknit
sudo git pull
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Migrations run automatically before the new app starts. The site is unavailable for a few seconds during the switch. To go back, check out the previous commit and run the same command; migrations are forward-only, so restore a backup if one of them must be undone.

## 6. Backups

Hetzner's server backups are a safety net, not a database backup. Add a daily dump (as root: `sudo crontab -e`):

```cron
0 3 * * * cd /opt/closeknit && docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T db pg_dump -U closeknit -Fc closeknit > /var/backups/closeknit/closeknit-$(date +\%F).dump && find /var/backups/closeknit -name '*.dump' -mtime +14 -delete
```

Create `/var/backups/closeknit` first (`sudo mkdir -p /var/backups/closeknit`), and copy the dumps **off this server** as well, for example to a Hetzner Storage Box or Object Storage in another location. A backup on the same disk does not survive losing the server.

Restore into a running stack:

```sh
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T db \
  pg_restore -U closeknit -d closeknit --clean --if-exists < closeknit-2026-10-24.dump
```

Try a restore on a spare machine before you rely on it. Scheduled backups with monitoring belong to milestone M5; this is the minimum until then.

## Behind an existing nginx

If nginx on the same server already uses ports 80 and 443, nginx keeps those ports and passes Closeknit's TLS traffic to Caddy **without decrypting it**, so Caddy keeps handling its own certificates (including the wildcard). nginx looks at the domain name in the TLS handshake (SNI) and chooses: Closeknit names go to Caddy, everything else goes to your existing sites.

This changes how your existing sites listen on 443, so they briefly restart. The configuration in `deploy/nginx/` was tested in an nginx container: routing by name (also upper case and look-alike names such as `notcloseknit.eu`), and visitors' addresses reach your existing sites unchanged. It was not tested against your actual sites, so work through it with the backup at hand.

```
visitor ──443──> nginx stream (SNI) ──closeknit.eu, *.closeknit.eu, …──> Caddy 127.0.0.1:8443
                                    └─everything else (PROXY protocol)──> your sites 127.0.0.1:8444
visitor ──80───> nginx http  ──closeknit names──> 301 to https; your other sites as before
```

**1. Prepare**

```sh
sudo cp -a /etc/nginx /etc/nginx.bak-$(date +%F)          # your way back
nginx -V 2>&1 | tr ' ' '\n' | grep -E 'stream'            # needs stream and stream_ssl_preread
sudo apt install libnginx-mod-stream                       # if the stream module is missing
sudo grep -rnE 'listen.*443' /etc/nginx/                   # every place that must change (step 3)
```

**2. Caddy on other ports.** In `.env` on the server, uncomment `CADDY_BIND=127.0.0.1`, `CADDY_HTTP_PORT=8080`, `CADDY_HTTPS_PORT=8443`, and start the stack as usual. Caddy asks for its certificates through DNS, so it needs nothing from outside yet.

**3. Move your existing sites off port 443.** In each site that has a `listen ... 443` line:

- `listen 443 ssl ...;` becomes `listen 127.0.0.1:8444 ssl proxy_protocol ...;` (keep the other parameters such as `http2` or `default_server`).
- Delete `listen [::]:443 ssl ...;`. IPv6 visitors now arrive through the new front on 443 as well.

Then tell nginx to read the visitor's address from the PROXY header, once, in `/etc/nginx/conf.d/realip.conf`:

```nginx
set_real_ip_from 127.0.0.1;
real_ip_header proxy_protocol;
```

Certbot keeps working (it validates over port 80), but if you let `certbot --nginx` install a certificate in a new site, check afterwards that it did not add a plain `listen 443`.

**4. Add the front on 443 and the redirect on 80**

```sh
sudo mkdir -p /etc/nginx/stream.d
sudo cp deploy/nginx/stream.conf /etc/nginx/stream.d/closeknit.conf
sudo cp deploy/nginx/closeknit-http.conf /etc/nginx/conf.d/closeknit.conf
```

Add this to `/etc/nginx/nginx.conf` at the top level, next to the `http { ... }` block (not inside it):

```nginx
stream {
    include /etc/nginx/stream.d/*.conf;
}
```

**5. Switch**

```sh
sudo nginx -t && sudo systemctl restart nginx
```

Use `restart`, not `reload`: port 443 changes owner from the `http` to the `stream` module, and a restart avoids a clash. Your other sites are unavailable for a few seconds.

**6. Check**

```sh
curl -sSI https://closeknit.eu/ | head -3          # served by Caddy
curl -sSI https://een-van-je-andere-sites.nl/ | head -3
sudo tail -n 3 /var/log/nginx/access.log           # visitor addresses, not 127.0.0.1
```

**Back out:** `sudo rm -r /etc/nginx && sudo cp -a /etc/nginx.bak-<date> /etc/nginx && sudo systemctl restart nginx`.

**Known costs:** Caddy does not see the visitor's address (nginx strips the PROXY header for it), which matters for rate limiting in M1; and HTTP/3 does not pass through. Both can be solved later if needed.

## Another DNS provider

The wildcard certificate needs a DNS provider that Caddy has a plugin for ([list](https://github.com/caddy-dns)). To switch:

1. Change the plugin in the build: `args: { DNS_PLUGIN: github.com/caddy-dns/<provider> }` under `caddy.build` in `docker-compose.prod.yml`.
2. Change the `dns hetzner …` line in `deploy/Caddyfile` to the provider's name and its settings.
3. Replace `HETZNER_API_TOKEN` in `.env` and in the `caddy` service with the variables that provider needs.

Prefer a provider under European jurisdiction, in line with the sovereignty principles of the project.

## Self-hosting under your own domain

Replace `closeknit.eu` and `closeknit.nl` in `deploy/Caddyfile` and `ORIGIN` in `.env` with your own domain. You can drop the second site block. If you only need one group and no subdomains, use the base `docker-compose.yml` behind a reverse proxy you already run.

## Known limits (to be fixed in later milestones)

- **One fixed origin.** `ORIGIN` is set to `https://closeknit.eu`, so forms on group subdomains would be refused by SvelteKit's CSRF check. M2 switches the app to read the host from the proxy headers (`HOST_HEADER`, `PROTOCOL_HEADER`) and checks it against the group list, which is needed anyway for routing per group.
- **No outgoing e-mail yet.** Magic links need an SMTP server (M1) and SPF, DKIM and DMARC records on the domain.
- **`robots.txt` disallows all crawlers.** Open it up for the landing page when the project goes public.
- **Single server.** One machine with one database. That is deliberate for the pilot; the app keeps no state outside PostgreSQL, so adding web instances later is possible.
