// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

// dns-probe calls the Hetzner DNS plugin that Caddy uses (libdns/hetzner/v2) the
// way Caddy's ACME solver does, and prints every HTTP request and response with
// the API token removed. It adds and deletes one TXT record, _ck-probe, per zone.
//
// See "Troubleshooting the certificate" in docs/deploy.md.
package main

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"os"
	"regexp"
	"time"

	"github.com/libdns/hetzner/v2"
	"github.com/libdns/libdns"
)

var bearer = regexp.MustCompile(`(?i)(authorization: bearer )\S+`)

// logTransport prints requests and responses; the token never reaches stdout.
type logTransport struct{ next http.RoundTripper }

func (t logTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	if dump, err := httputil.DumpRequestOut(req, true); err == nil {
		fmt.Printf("--- request\n%s\n", bearer.ReplaceAll(dump, []byte("${1}***")))
	}
	resp, err := t.next.RoundTrip(req)
	if err != nil {
		fmt.Printf("--- transport error: %v\n", err)
		return nil, err
	}
	if dump, err := httputil.DumpResponse(resp, true); err == nil {
		if len(dump) > 1500 {
			dump = append(dump[:1500], []byte("\n[...]")...)
		}
		fmt.Printf("--- response\n%s\n", bytes.TrimSpace(dump))
	}
	return resp, nil
}

func main() {
	token := os.Getenv("HETZNER_API_TOKEN")
	if token == "" {
		fmt.Println("HETZNER_API_TOKEN is not set")
		os.Exit(1)
	}
	http.DefaultTransport = logTransport{http.DefaultTransport}

	zones := os.Args[1:]
	if len(zones) == 0 {
		zones = []string{"closeknit.eu."}
	}

	for _, zone := range zones {
		ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)
		p := hetzner.New(token)
		// Caddy's solver passes the zone with a trailing dot and no TTL.
		rec := libdns.TXT{Name: "_ck-probe", Text: "probe"}

		fmt.Printf("\n===== %s: AppendRecords\n", zone)
		_, err := p.AppendRecords(ctx, zone, []libdns.Record{rec})
		fmt.Printf("===== %s: AppendRecords error: %v\n", zone, err)

		if err == nil {
			fmt.Printf("\n===== %s: DeleteRecords\n", zone)
			_, err = p.DeleteRecords(ctx, zone, []libdns.Record{rec})
			fmt.Printf("===== %s: DeleteRecords error: %v\n", zone, err)
		}
		cancel()
	}
}
