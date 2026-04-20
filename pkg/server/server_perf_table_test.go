package server

import (
	"net/http"
	"testing"
)

// BenchmarkTable measures Table View performance with and without histogram
func BenchmarkTable(b *testing.B) {
	lokiSvc, promSvc, backendSvc, client := setupBenchmarkServers(true)
	defer lokiSvc.Close()
	if promSvc != nil {
		defer promSvc.Close()
	}
	defer backendSvc.Close()

	b.Run("Basic", func(b *testing.B) {
		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			req, _ := http.NewRequest("GET", backendSvc.URL+"/api/loki/flow/records", nil)
			resp, err := client.Do(req)
			if err != nil {
				b.Fatalf("Request failed: %v", err)
			}
			resp.Body.Close()
			if resp.StatusCode != http.StatusOK {
				b.Fatalf("Expected 200, got %d", resp.StatusCode)
			}
		}
	})

	b.Run("WithHistogram", func(b *testing.B) {
		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			// Get flow records
			req1, _ := http.NewRequest("GET", backendSvc.URL+"/api/loki/flow/records", nil)
			resp1, err := client.Do(req1)
			if err != nil {
				b.Fatalf("Flow records request failed: %v", err)
			}
			resp1.Body.Close()
			if resp1.StatusCode != http.StatusOK {
				b.Fatalf("Expected 200, got %d", resp1.StatusCode)
			}

			// Get histogram data
			req2, _ := http.NewRequest("GET",
				backendSvc.URL+"/api/flow/metrics?dataSource=auto&function=count&aggregateBy=app&type=Flows", nil)
			resp2, err := client.Do(req2)
			if err != nil {
				b.Fatalf("Histogram metrics request failed: %v", err)
			}
			resp2.Body.Close()
			if resp2.StatusCode != http.StatusOK {
				b.Fatalf("Expected 200, got %d", resp2.StatusCode)
			}
		}
	})
}

// BenchmarkLargeResultSets measures performance with varying result set sizes
func BenchmarkLargeResultSets(b *testing.B) {
	sizes := []struct {
		name  string
		count int
	}{
		{"100records", 100},
		{"1000records", 1000},
		{"5000records", 5000},
		{"10000records", 10000},
	}

	for _, size := range sizes {
		b.Run(size.name, func(b *testing.B) {
			lokiSvc, promSvc, backendSvc, client := setupBenchmarkServersWithSize(false, size.count)
			defer lokiSvc.Close()
			if promSvc != nil {
				defer promSvc.Close()
			}
			defer backendSvc.Close()

			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				req, _ := http.NewRequest("GET", backendSvc.URL+"/api/loki/flow/records", nil)
				resp, err := client.Do(req)
				if err != nil {
					b.Fatalf("Request failed: %v", err)
				}
				resp.Body.Close()
				if resp.StatusCode != http.StatusOK {
					b.Fatalf("Expected 200, got %d", resp.StatusCode)
				}
			}
		})
	}
}

// BenchmarkFilterHeavyTableView measures table view performance with complex filter combinations
func BenchmarkFilterHeavyTableView(b *testing.B) {
	lokiSvc, promSvc, backendSvc, client := setupBenchmarkServers(false)
	defer lokiSvc.Close()
	if promSvc != nil {
		defer promSvc.Close()
	}
	defer backendSvc.Close()

	filterTests := getCommonFilterTests()

	for _, tt := range filterTests {
		b.Run(tt.name, func(b *testing.B) {
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				req, _ := http.NewRequest("GET", backendSvc.URL+"/api/loki/flow/records?filters="+tt.filter, nil)
				resp, err := client.Do(req)
				if err != nil {
					b.Fatalf("Request failed: %v", err)
				}
				resp.Body.Close()
				if resp.StatusCode != http.StatusOK {
					b.Fatalf("Expected 200, got %d", resp.StatusCode)
				}
			}
		})
	}
}

// BenchmarkConcurrentTableView measures Table View performance under concurrent user load
func BenchmarkConcurrentTableView(b *testing.B) {
	lokiSvc, promSvc, backendSvc, client := setupBenchmarkServers(false)
	defer lokiSvc.Close()
	if promSvc != nil {
		defer promSvc.Close()
	}
	defer backendSvc.Close()

	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			req, _ := http.NewRequest("GET", backendSvc.URL+"/api/loki/flow/records", nil)
			resp, err := client.Do(req)
			if err != nil {
				b.Fatalf("Request failed: %v", err)
			}
			resp.Body.Close()
			if resp.StatusCode != http.StatusOK {
				b.Fatalf("Expected 200, got %d", resp.StatusCode)
			}
		}
	})
}
