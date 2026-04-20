package server

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/mock"

	"github.com/netobserv/network-observability-console-plugin/pkg/config"
	"github.com/netobserv/network-observability-console-plugin/pkg/model"
)

// Helper function to setup mock servers for benchmarks with configurable result size
func setupBenchmarkServersWithSize(useBothDataSources bool, numRecords int) (*httptest.Server, *httptest.Server, *httptest.Server, *http.Client) {
	// Setup mock Loki service
	lokiMock := httpMock{}
	matrixResponse, _ := json.Marshal(model.QueryResponse{
		Status: "",
		Data: model.QueryResponseData{
			ResultType: model.ResultTypeMatrix,
			Result:     model.Matrix{},
		},
	})

	// Generate mock stream data with specified number of records
	streams := model.Streams{}
	if numRecords > 0 {
		entries := make([]model.Entry, numRecords)
		for i := 0; i < numRecords; i++ {
			// Create a JSON log line with flow fields
			logLine := `{"SrcAddr":"10.0.0.1","DstAddr":"10.0.0.2","SrcPort":8080,"DstPort":443,"Proto":6,"Bytes":1024,"Packets":10}`
			entries[i] = model.Entry{
				Timestamp: time.Now(),
				Line:      logLine,
			}
		}
		streams = append(streams, model.Stream{
			Labels:  map[string]string{"app": "test"},
			Entries: entries,
		})
	}
	streamResponse, _ := json.Marshal(model.QueryResponse{
		Status: "",
		Data: model.QueryResponseData{
			ResultType: model.ResultTypeStream,
			Result:     streams,
		},
	})

	lokiMock.On("ServeHTTP", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
		req := args.Get(1).(*http.Request)
		w := args.Get(0).(http.ResponseWriter)

		// Return matrix for metric queries, stream for flow records
		if req.URL.Path == "/loki/api/v1/query_range" {
			query := req.URL.Query().Get("query")
			if len(query) > 0 && query[0] != '{' {
				_, _ = w.Write(matrixResponse)
				return
			}
		}
		_, _ = w.Write(streamResponse)
	})
	lokiSvc := httptest.NewServer(&lokiMock)

	cfg := &config.Config{
		Loki: config.Loki{
			URL:    lokiSvc.URL,
			Labels: []string{"SrcK8S_Namespace", "DstK8S_Namespace"},
		},
		Frontend: config.Frontend{},
	}

	var promSvc *httptest.Server
	// Setup Prometheus mock if needed for Auto mode
	if useBothDataSources {
		promMock := httpMock{}
		promResponse := []byte(`{"status":"success","data":{"resultType":"matrix","result":[]}}`)
		promMock.On("ServeHTTP", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			_, _ = args.Get(0).(http.ResponseWriter).Write(promResponse)
		})
		promSvc = httptest.NewServer(&promMock)
		cfg.Prometheus = config.Prometheus{URL: promSvc.URL}
	}

	// Setup auth mock
	authM := authMock{}
	authM.MockGranted()

	// Setup backend server
	backendRoutes := setupRoutes(context.TODO(), cfg, &authM)
	backendSvc := httptest.NewServer(backendRoutes)

	// Configure HTTP client with connection pooling to reduce port usage
	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 100,
			IdleConnTimeout:     90 * time.Second,
		},
	}

	return lokiSvc, promSvc, backendSvc, client
}

// Helper function to setup mock servers for benchmarks (default 0 records)
func setupBenchmarkServers(useBothDataSources bool) (*httptest.Server, *httptest.Server, *httptest.Server, *http.Client) {
	return setupBenchmarkServersWithSize(useBothDataSources, 0)
}

// Common filter test data used across table, topology, and overview benchmarks
// Returns filter strings in URL-encoded format
func getCommonFilterTests() []struct {
	name   string
	filter string
} {
	return []struct {
		name   string
		filter string
	}{
		{
			"SingleFilter",
			"SrcK8S_Namespace%3Ddefault",
		},
		{
			"TwoFilters",
			"SrcK8S_Namespace%3Ddefault%2CSrcPort%3D8080",
		},
		{
			"FourFilters",
			"SrcK8S_Namespace%3Ddefault%2CSrcPort%3D8080%2CDstK8S_Namespace%3Dkube-system%2CProto%3D6",
		},
		{
			"EightFilters",
			"SrcK8S_Namespace%3Ddefault%2CSrcPort%3D8080%2CDstK8S_Namespace%3Dkube-system%2CProto%3D6%2CSrcK8S_Type%3DPod%2CDstK8S_Type%3DService%2CFlowDirection%3D0%2CPackets%3E100",
		},
	}
}

// BenchmarkExport measures Export Flows performance with CSV format across different scenarios
func BenchmarkExport(b *testing.B) {
	lokiSvc, promSvc, backendSvc, client := setupBenchmarkServers(false)
	defer lokiSvc.Close()
	if promSvc != nil {
		defer promSvc.Close()
	}
	defer backendSvc.Close()

	tests := []struct {
		name   string
		params string
	}{
		{
			"BasicCSV",
			"format=csv",
		},
		{
			"CSVWithColumns",
			"format=csv&columns=SrcAddr,DstAddr,SrcPort,DstPort,Proto",
		},
		{
			"WithFilters",
			"format=csv&filters=SrcK8S_Namespace%3Ddefault",
		},
		{
			"WithMultipleFilters",
			"format=csv&filters=SrcK8S_Namespace%3Ddefault%2CDstK8S_Namespace%3Dkube-system",
		},
		{
			"WithLimit100",
			"format=csv&limit=100",
		},
		{
			"WithLimit1000",
			"format=csv&limit=1000",
		},
		{
			"ComplexQuery",
			"format=csv&filters=SrcK8S_Namespace%3Ddefault%2CProto%3D6&limit=500&columns=SrcAddr,DstAddr,Proto,Bytes,Packets",
		},
	}

	for _, tt := range tests {
		b.Run(tt.name, func(b *testing.B) {
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				req, _ := http.NewRequest("GET", backendSvc.URL+"/api/loki/export?"+tt.params, nil)
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
