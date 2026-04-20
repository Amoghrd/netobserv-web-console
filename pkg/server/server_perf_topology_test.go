package server

import (
	"net/http"
	"testing"
)

// BenchmarkTopologyLoki measures Topology View with Loki data source for all metric types
func BenchmarkTopologyLoki(b *testing.B) {
	lokiSvc, promSvc, backendSvc, client := setupBenchmarkServers(false)
	defer lokiSvc.Close()
	if promSvc != nil {
		defer promSvc.Close()
	}
	defer backendSvc.Close()

	tests := []struct {
		name  string
		query string
	}{
		{"Bytes", "/api/flow/metrics?dataSource=loki&aggregateBy=resource&function=rate&type=Bytes"},
		{"Packets", "/api/flow/metrics?dataSource=loki&aggregateBy=resource&function=rate&type=Packets"},
		{"DNSLatency", "/api/flow/metrics?dataSource=loki&aggregateBy=resource&function=avg&type=DnsLatencyMs"},
		{"RTT", "/api/flow/metrics?dataSource=loki&aggregateBy=resource&function=avg&type=TimeFlowRttNs"},
		{"Dropped", "/api/flow/metrics?dataSource=loki&aggregateBy=resource&function=rate&type=PktDropPackets"},
	}

	for _, tt := range tests {
		b.Run(tt.name, func(b *testing.B) {
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				runMetricsQuery(b, client, backendSvc.URL, tt.query)
			}
		})
	}

	b.Run("BytesWithDrops", func(b *testing.B) {
		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			runMetricsQuery(b, client, backendSvc.URL,
				"/api/flow/metrics?dataSource=loki&aggregateBy=resource&function=rate&type=Bytes")
			runMetricsQuery(b, client, backendSvc.URL,
				"/api/flow/metrics?dataSource=loki&aggregateBy=resource&function=rate&type=PktDropPackets")
		}
	})
}

// BenchmarkTopologyAuto measures Topology View with Auto data source for all metric types
func BenchmarkTopologyAuto(b *testing.B) {
	lokiSvc, promSvc, backendSvc, client := setupBenchmarkServers(true)
	defer lokiSvc.Close()
	if promSvc != nil {
		defer promSvc.Close()
	}
	defer backendSvc.Close()

	tests := []struct {
		name  string
		query string
	}{
		{"Bytes", "/api/flow/metrics?dataSource=auto&aggregateBy=resource&function=rate&type=Bytes"},
		{"Packets", "/api/flow/metrics?dataSource=auto&aggregateBy=resource&function=rate&type=Packets"},
		{"DNSLatency", "/api/flow/metrics?dataSource=auto&aggregateBy=resource&function=avg&type=DnsLatencyMs"},
		{"RTT", "/api/flow/metrics?dataSource=auto&aggregateBy=resource&function=avg&type=TimeFlowRttNs"},
		{"Dropped", "/api/flow/metrics?dataSource=auto&aggregateBy=resource&function=rate&type=PktDropPackets"},
	}

	for _, tt := range tests {
		b.Run(tt.name, func(b *testing.B) {
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				runMetricsQuery(b, client, backendSvc.URL, tt.query)
			}
		})
	}

	b.Run("BytesWithDrops", func(b *testing.B) {
		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			runMetricsQuery(b, client, backendSvc.URL,
				"/api/flow/metrics?dataSource=auto&aggregateBy=resource&function=rate&type=Bytes")
			runMetricsQuery(b, client, backendSvc.URL,
				"/api/flow/metrics?dataSource=auto&aggregateBy=resource&function=rate&type=PktDropPackets")
		}
	})
}

// BenchmarkFilterHeavyTopology measures topology view performance with complex filter combinations
func BenchmarkFilterHeavyTopology(b *testing.B) {
	lokiSvc, promSvc, backendSvc, client := setupBenchmarkServers(true)
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
				params := "dataSource=auto&aggregateBy=resource&function=rate&type=Bytes&filters=" + tt.filter
				req, _ := http.NewRequest("GET", backendSvc.URL+"/api/flow/metrics?"+params, nil)
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

// BenchmarkConcurrentTopology measures Topology view performance under concurrent user load
func BenchmarkConcurrentTopology(b *testing.B) {
	lokiSvc, promSvc, backendSvc, client := setupBenchmarkServers(true)
	defer lokiSvc.Close()
	if promSvc != nil {
		defer promSvc.Close()
	}
	defer backendSvc.Close()

	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			req, _ := http.NewRequest("GET",
				backendSvc.URL+"/api/flow/metrics?dataSource=auto&aggregateBy=resource&function=rate&type=Bytes", nil)
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

// BenchmarkTopologyAggregations measures Topology view with different aggregation levels
func BenchmarkTopologyAggregations(b *testing.B) {
	lokiSvc, promSvc, backendSvc, client := setupBenchmarkServers(true)
	defer lokiSvc.Close()
	if promSvc != nil {
		defer promSvc.Close()
	}
	defer backendSvc.Close()

	tests := []struct {
		name  string
		query string
	}{
		{"ByNamespace", "/api/flow/metrics?dataSource=auto&aggregateBy=namespace&function=rate&type=Bytes"},
		{"ByApp", "/api/flow/metrics?dataSource=auto&aggregateBy=app&function=rate&type=Bytes"},
		{"ByResource", "/api/flow/metrics?dataSource=auto&aggregateBy=resource&function=rate&type=Bytes"},
		{"ByOwner", "/api/flow/metrics?dataSource=auto&aggregateBy=owner&function=rate&type=Bytes"},
	}

	for _, tt := range tests {
		b.Run(tt.name, func(b *testing.B) {
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				runMetricsQuery(b, client, backendSvc.URL, tt.query)
			}
		})
	}
}
