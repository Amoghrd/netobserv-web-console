# AI Agents Best Practices for NetObserv Web Console

Best practices for AI coding agents on NetObserv Web Console.

> **Note**: Symlinked as [CLAUDE.md](CLAUDE.md) for Claude Code auto-loading.

## Project Context

**NetObserv Web Console** - a network observability console that can be deployed either as:
- OpenShift console plugin: Integrates into OpenShift Console with extended views
- Standalone console: Single-page application showing Netflow Traffic and Network Health

**Components:**
- **Frontend**: TypeScript/React with PatternFly components (uses OpenShift Console dynamic plugin SDK for plugin mode)
- **Backend**: Go HTTP server providing API endpoints for Loki queries, Kubernetes resources, and Prometheus metrics

**Deployment Modes:**
- **Plugin mode**: Integrated into OpenShift Console
- **Standalone mode**: Independent web application

**Key Directories:**
- `web/src/components/`: React components (forms, tables, topology, etc.)
- `web/src/api/`: Backend API client
- `web/src/model/`: Data models and transformations
- `web/src/utils/`: Utility functions
- `pkg/handler/`: HTTP request handlers
- `pkg/loki/`: Loki client and query builders
- `pkg/kubernetes/`: Kubernetes API client
- `pkg/prometheus/`: Prometheus client
- `web/cypress/e2e/`: Cypress E2E tests (developer tests)
- `web/cypress/integration-tests/`: QE integration tests

## Critical Constraints

### 🚨 OpenShift Console Plugin SDK
- Plugin mode must use `@openshift-console/dynamic-plugin-sdk` APIs
- Plugin mode must follow OpenShift Console conventions for navigation, extensions, theming
- Standalone mode uses the same codebase but without Console integration
- Test both plugin and standalone modes

### 🚨 Node Version Consistency
- Use Node.js version specified in `Dockerfile.front`
- npm versions matter - use expected versions to avoid build breaks
- Consider using [nvm](https://github.com/nvm-sh/nvm) for version management

### 🚨 Dockerfiles
- `Dockerfile`: Production multi-stage build (frontend + backend)
- `Dockerfile.front`: Frontend build (Node.js version source of truth)
- `Dockerfile.downstream`: Downstream/productized builds
- `Dockerfile.ci`: CI environment builds
- `Dockerfile.e2e`, `Dockerfile.cypress`: Test runner images

### 🚨 Backward Compatibility
Frontend configuration schemas must remain compatible:
- ✅ Add optional fields with defaults
- ❌ Never remove/rename fields in schemas or API responses
- Changes to `web/src/components/forms/config/uiSchema.ts` must preserve existing field behaviors

### 🚨 i18n Strings
- All user-facing strings must use react-i18next
- Run `make i18n` to update translation files
- Never hardcode English strings in UI

## Effective Prompting

Be specific about file paths, existing patterns, and testing requirements.

**Good**: "Add dnslatency to ColumnsId enum in web/src/utils/columns.ts. Define in config/sample-config.yaml. Update Loki query in pkg/loki/flow_query.go. Test both modes."

**Bad**: "Add DNS latency column"

**Key Principles:**
1. Exact file paths (`web/src/components/`, not "frontend")
2. Reference existing patterns (columns, filters, Loki queries)
3. i18n for UI strings, dual-mode testing
4. Check package.json before adding dependencies
5. Column workflow: columns.ts enum → sample-config.yaml → optional RecordField rendering

## Common Task Templates

### Modify Backend Handler
```text
Add new API endpoint for zone filtering:
1. Add route in pkg/server/routes.go:
   - Register route with api.HandleFunc()
2. Add handler implementation in pkg/handler/ (e.g., resources.go):
   - Create handler function on Handlers struct
   - Validate query parameters
   - Use existing error handling patterns
3. Update pkg/loki/flow_query.go if Loki query needed
4. Update web/src/api/routes.ts with new endpoint
5. Add Go unit tests in pkg/handler/*_test.go
6. Test with both real Loki and mocks (see pkg/handler/lokiclientmock/)
```

### Update Schema Synchronization
```text
FlowCollector CRD field changed in operator:
1. Follow instructions in README.md#updating-schemas
2. Update web/src/components/forms/config/uiSchema.ts with new field display rules
3. Update web/src/model/flow-query.ts if query params change
4. Update web/src/components/tabs/netflow-overview/ if overview UI changes
5. Regenerate schemas using scripts/generate-schemas.sh (requires running cluster)
6. Ensure backward compatibility with older field names
7. Test with both old and new FlowCollector versions
```

## Repository-Specific Context

### Plugin vs Standalone Modes
- **Plugin mode**: Console integration (localhost:9001), requires Console clone for dev
- **Standalone mode**: Independent app (`make start-standalone` or `make start-standalone-mock`), build with `STANDALONE=true make images`
- FLAVOR=`enduser` limits production standalone to Network Traffic/Health tabs

### Loki Query Optimization
- Limit time ranges, prefer `=` over `=~` matchers, push aggregations to LogQL
- Check `/api/loki/config/limits` for query constraints
- Mock mode: `make start-standalone-mock` or `make serve-mock`

### Frontend Configuration
Two types:
- **Dynamic (Operator-Generated)**: Runtime configuration from FlowCollector CR
  - Operator generates ConfigMap with columns, filters, scopes, features, port naming, quick filters
  - Generated from [static-frontend-config.yaml](https://github.com/netobserv/netobserv-operator/blob/main/internal/controller/consoleplugin/config/static-frontend-config.yaml) (operator repo) + FlowCollector spec
  - **Important**: Changes to `config/sample-config.yaml` frontend section must be synced to operator's `static-frontend-config.yaml`
  - Fetched via `/api/frontend-config`
- **Static (Development)**: Local configuration for development
  - `config/sample-config.yaml` for local development
  - Not used in production (operator generates config instead)

### PatternFly Components
- Version: v5.x (see `web/package.json`)
- Follow PatternFly patterns, test light/dark themes (`pf-v5-theme-dark`)
- Docs: [patternfly.org](https://www.patternfly.org/)

### Multi-Architecture
Support: amd64, arm64, ppc64le, s390x. Frontend built once, backend per arch. Build: `MULTIARCH_TARGETS="amd64 arm64" make images`

## Code Review Checklist

```text
Review for:
1. TypeScript type safety (no 'any' types without justification)
2. PatternFly component usage consistency
3. i18n strings for all user-facing text
4. Error handling (proper error messages and patterns)
5. Unit tests (Jest for frontend, Go tests for backend)
6. Loki query efficiency (time ranges, label matchers)
7. Backward compatibility (schema changes)
8. Both plugin and standalone mode testing
9. Accessibility (ARIA labels, keyboard navigation)
10. Performance (avoid unnecessary re-renders, optimize queries)
11. Usability and user experience (intuitive workflows, clear feedback)
```

## Testing

**Unit Tests**: Go tests in `pkg/loki/*_test.go` (query construction, validation, edge cases), Jest/Enzyme in `web/src/components/tabs/netflow-table/__tests__/`

**E2E Tests**: Cypress in `web/cypress/e2e/` (dev) and `web/cypress/integration-tests/` (QE). Run: `make cypress` or `cd web && npm run cypress:open`

## Quick Reference

**Essential Commands:**
```bash
make build                      # Build backend and frontend
make frontend                   # Build, lint, test frontend
make backend                    # Build, lint, test backend
make start-standalone           # Start standalone mode (requires Loki)
make start-standalone-mock      # Start standalone with mocked data
make bridge                     # Bridge plugin to OpenShift Console
make i18n                       # Update i18n translation files
make image-build image-push     # Build and push image
```

**Key Files:**
- Frontend config: [web/src/model/config.ts](web/src/model/config.ts)
- API routes: [web/src/api/routes.ts](web/src/api/routes.ts)
- Loki queries: [pkg/loki/flow_query.go](pkg/loki/flow_query.go), [pkg/loki/topology_query.go](pkg/loki/topology_query.go)
- Backend routes: [pkg/server/routes.go](pkg/server/routes.go)
- Backend handlers: [pkg/handler/handlers.go](pkg/handler/handlers.go)
- Table columns: [web/src/utils/columns.ts](web/src/utils/columns.ts)
- UI schema: [web/src/components/forms/config/uiSchema.ts](web/src/components/forms/config/uiSchema.ts)
- Sample config: [config/sample-config.yaml](config/sample-config.yaml)

## AI Workflow Example

```text
1. Research: "Explain how topology view fetches and renders network flows"
2. Plan: "Add edge highlighting for high-latency flows - suggest component changes"
3. Implement: "Implement with proper data filtering and PatternFly styling"
4. Review: "Review for performance impact and edge cases"
5. i18n: "Run make i18n to update translation files"
6. Test: "Provide Cypress test scenarios for edge highlighting"
```

## Contribution Checklist

Before commit:
1. AI code review
2. Add unit tests (Jest for frontend, Go tests for backend)
3. Add Cypress tests for UI features
4. `make build lint test` (both frontend and backend)
5. `make i18n` (if UI strings changed)
6. Test both plugin and standalone modes
7. Update README.md (if new features added)
8. Conventional commit messages

## Resources

- [README.md](README.md) - Setup, build, test, deploy, run locally
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines

**Remember**: AI agents need clear context. Always review generated code, test thoroughly in both plugin and standalone modes, and follow project conventions.
