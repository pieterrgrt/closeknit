// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

// dns-probe calls the Hetzner DNS plugin that Caddy uses (libdns/hetzner/v2) the
// way Caddy's ACME solver does, and prints every HTTP request and response with
// the API token removed. It adds and deletes one TXT record, _ck-probe, per zone.
//
// With -burst it fires the calls at the same moment instead, as Caddy does when it
// requests several certificates at once (closeknit.eu and *.closeknit.eu even write
// to the same record).
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
	"sync"
	"time"

	"github.com/libdns/hetzner/v2"
	"github.com/libdns/libdns"
)

var bearer = regexp.MustCompile(`(?i)(authorization: bearer )\S+`)

// logTransport prints requests and responses; the token never reaches stdout.
type logTransport struct{ next http.RoundTripper }

var printMu sync.Mutex

func (t logTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	reqDump, _ := httputil.DumpRequestOut(req, true)
	resp, err := t.next.RoundTrip(req)

	printMu.Lock()
	defer printMu.Unlock()
	fmt.Printf("--- request\n%s\n", bearer.ReplaceAll(reqDump, []byte("${1}***")))
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

// burst mimics Caddy obtaining closeknit.eu, *.closeknit.eu, closeknit.nl and
// www.closeknit.nl at once: one provider per site block, four calls in parallel.
func burst(token string) {
	eu, nl := hetzner.New(token), hetzner.New(token)
	calls := []struct {
		p    *hetzner.Provider
		zone string
		name string
	}{
		{eu, "closeknit.eu.", "_ck-probe"},
		{eu, "closeknit.eu.", "_ck-probe"},
		{nl, "closeknit.nl.", "_ck-probe"},
		{nl, "closeknit.nl.", "_ck-probe.www"},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)
	defer cancel()

	var wg sync.WaitGroup
	for i, c := range calls {
		wg.Add(1)
		go func() {
			defer wg.Done()
			rec := libdns.TXT{Name: c.name, Text: fmt.Sprintf("probe-%d", i)}
			_, err := c.p.AppendRecords(ctx, c.zone, []libdns.Record{rec})
			printMu.Lock()
			fmt.Printf("===== burst %d %s %s: AppendRecords error: %v\n", i, c.zone, c.name, err)
			printMu.Unlock()
		}()
	}
	wg.Wait()

	// Clean up whatever was created in the zone we own.
	for i := range 2 {
		rec := libdns.TXT{Name: "_ck-probe", Text: fmt.Sprintf("probe-%d", i)}
		_, err := eu.DeleteRecords(ctx, "closeknit.eu.", []libdns.Record{rec})
		fmt.Printf("===== burst cleanup %d: DeleteRecords error: %v\n", i, err)
	}
}

func main() {
	token := os.Getenv("HETZNER_API_TOKEN")
	if token == "" {
		fmt.Println("HETZNER_API_TOKEN is not set")
		os.Exit(1)
	}
	http.DefaultTransport = logTransport{http.DefaultTransport}

	if len(os.Args) > 1 && os.Args[1] == "-burst" {
		burst(token)
		return
	}

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
