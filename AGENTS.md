# NetObserv Console Plugin - AI Agent Guide

This guide helps AI coding agents understand and work with the NetObserv Console Plugin codebase.

## Project Overview

The NetObserv Console Plugin is an OpenShift Console dynamic plugin for network observability visualization and configuration. It combines:
- **Frontend**: TypeScript/React with PatternFly components (OpenShift Console dynamic plugin SDK)
- **Backend**: Go HTTP server providing API endpoints for Loki queries, Kubernetes resources, and Prometheus metrics

The plugin can run as an OpenShift Console plugin or as a standalone application.

## Critical Constraints

### 1. OpenShift Console Plugin SDK
This is a dynamic plugin for OpenShift Console - must use `@openshift-console/dynamic-plugin-sdk` APIs.

### 2. Node/npm Version Consistency
Use versions specified in `Dockerfile` (both Node.js and npm).

## Repository Structure

```
web/src/                    # Frontend TypeScript/React code
  components/               # React components (forms, tables, topology, etc.)
  api/                      # API client code for Loki, Kubernetes, Prometheus
  model/                    # Data models and transformations
  utils/                    # Utility functions
pkg/                        # Backend Go code
  handler/                  # HTTP request handlers
  loki/                     # Loki client and query builders
  kubernetes/               # Kubernetes API client
  prometheus/               # Prometheus client
  config/                   # Configuration management
web/cypress/e2e/            # Cypress integration tests
config/                     # Kubernetes manifests for deployment
```

## Essential Documentation

Before making changes, consult these existing docs:

1. **[README.md](./README.md)** - Setup, build, test, deploy instructions
2. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

## Common Development Tasks

### Build the Project
```bash
make install-frontend       # First-time setup
make build                  # Build backend and frontend
make lint test              # Lint and test all
make frontend               # Build+lint+test frontend only
make backend                # Build+lint+test backend only
```

### Fast Development Builds
```bash
BUILDSCRIPT=:dev make frontend   # Skip production optimizations
BUILDSCRIPT=:dev make images     # Fast image build
```

### Run Locally

**Plugin mode:**
```bash
make serve                                      # Start backend on :9001
CONSOLE=/path/to/console make bridge            # Start OpenShift Console
# Access at http://localhost:9000/netflow-traffic
```

**Standalone mode:**
```bash
make start-standalone        # With Loki (requires port-forward)
make serve-mock              # With mocked data
# Access at http://localhost:9001
```

### Run Tests
```bash
make test                    # All tests
make test-frontend           # Jest tests
make test-backend            # Go tests
make cypress                 # Cypress integration tests
```

## Code Review Guidelines

### Frontend
- PatternFly component usage consistency
- Follow OpenShift Console conventions for navigation, extensions, and theming
- i18n strings (use react-i18next)
- Test both plugin and standalone modes

### Backend
- Loki query efficiency (appropriate time ranges, limits)

### Backward Compatibility
Frontend configuration schemas must remain compatible:
- ✅ Add optional fields with defaults
- ❌ Never remove/rename fields in schemas or API responses
- Changes to `uiSchema.ts` must preserve existing field behaviors

### Schema Synchronization
When updating FlowCollector CRD fields:
1. Update `web/src/components/forms/config/uiSchema.ts` for form display rules
2. Update wizard files (e.g., `web/src/components/forms/flowCollector-wizard.tsx`)
3. Run `./scripts/generate-schemas.sh` to regenerate `web/moduleMapper/schemas.ts`
4. Test form validation and defaults

## Troubleshooting

### Clearing Console Cache
If plugin changes don't appear in OpenShift Console:
```bash
oc delete pods -n openshift-console -l app=console
```
