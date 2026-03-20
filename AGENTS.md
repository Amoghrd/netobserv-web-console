# AI Agents Best Practices for NetObserv Web Console

Best practices for AI coding agents on NetObserv Web Console.

> **Note**: Symlinked as [CLAUDE.md](CLAUDE.md) for Claude Code auto-loading.

## Project Context

**NetObserv Web Console** - OpenShift Console dynamic plugin for network observability visualization and configuration

**Components:**
- **Frontend**: TypeScript/React with PatternFly components (OpenShift Console dynamic plugin SDK)
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
- `web/cypress/e2e/`: Cypress integration tests

## Critical Constraints

### 🚨 OpenShift Console Plugin SDK
- Must use `@openshift-console/dynamic-plugin-sdk` APIs
- Follow OpenShift Console conventions for navigation, extensions, theming
- Test both plugin and standalone modes

### 🚨 Node Version Consistency
- Use Node.js version specified in `Dockerfile.front`
- npm versions matter - use expected versions to avoid build breaks
- Consider using [nvm](https://github.com/nvm-sh/nvm) for version management

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

**Good Example:**
```
Add new table column for DNS latency. Add dnslatency to ColumnsId enum in
web/src/utils/columns.ts. Define column in config/sample-config.yaml with
name, field (DnsLatencyMs), filter, tooltip. Add custom rendering case in
web/src/components/drawer/record/record-field.tsx if needed. Update Loki
query in pkg/loki/flow_query.go to fetch DnsLatencyMs field. Test in both
plugin and standalone modes.
```

**Bad Example:**
```
Add DNS latency column
```

**Key Principles:**
1. Specify exact file paths (`web/src/components/`, not "frontend")
2. Reference existing patterns (columns, filters, Loki queries)
3. Mention i18n requirements for UI strings
4. Mention both plugin and standalone mode testing
5. Check package.json dependencies before adding new packages
6. Column workflow: enum in columns.ts → definition in config/sample-config.yaml → optional RecordField rendering
   - Enum syntax: `dropcause = 'PktDropLatestDropCause',` (key used in code, value matches config id)
   - Column names come from config, not i18n
   - Generic rendering works for most columns (RecordField changes only for special formatting)

## Common Task Templates

### Modify Backend Handler
```
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
```
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
Two deployment configurations:
- **Plugin** (default) - OpenShift Console integration
  - Provides multiple views integrated across console pages
  - Requires local OpenShift Console clone for development
  - Console bridge runs on `http://localhost:9000/` (plugin serves on localhost:9001)
- **Standalone** - Independent application
  - FLAVOR can be set to `enduser` for production build (shows only Network Traffic and Network Health tabs)
  - Navigation with multiple pages (all forms/views available in dev builds)
  - Runs directly: `make start-standalone` or `make start-standalone-mock`
  - Build with: `STANDALONE=true make images`

### Loki Query Optimization
- **Time ranges**: Limit query time ranges to avoid timeouts
- **Label matchers**: Use `=` instead of `=~` where possible
- **Aggregations**: Push aggregations to LogQL (count_over_time, sum, etc.)
- **Limits**: Check `/api/loki/config/limits` for max query length, max entries
- **Mock mode**: Use `make start-standalone-mock` or `make serve-mock` (backend only) for development without Loki

### Frontend Configuration
Two types:
- **Dynamic (Operator-Generated)**: Runtime configuration from FlowCollector CR
  - Operator generates ConfigMap with columns, filters, scopes, features, port naming, quick filters
  - Generated from static defaults + FlowCollector spec (e.g., `spec.consolePlugin.portNaming`, `spec.consolePlugin.quickFilters`)
  - Fetched via `/api/frontend-config`
  - Note: Console plugin backend config (log level, replicas) is NOT in frontend config
- **Static (Development)**: Local configuration for development
  - `config/sample-config.yaml` for local development
  - Includes all config in one file (server, loki, prometheus, frontend sections)
  - Not used in production deployments (operator generates config instead)

### PatternFly Components
- Version specified in `web/package.json` (currently v5.x)
- Use existing components: Table, Form, Topology, Charts, etc.
- Follow PatternFly design patterns and accessibility guidelines
- Test both light and dark themes (uses `pf-v5-theme-dark` class)
- Check [PatternFly documentation](https://www.patternfly.org/) for component APIs

### Multi-Architecture
- Support: amd64, arm64, ppc64le, s390x
- Frontend built once, backend built per arch
- Build multi-arch: `MULTIARCH_TARGETS="amd64 arm64" make images`

## Code Review Checklist

```
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
```

## Testing

### Unit Tests
```
Generate tests for Loki query builder in pkg/loki/*_test.go:
- Query construction with different parameters (see topology_query_test.go)
- Time range validation
- Label matcher formatting
- Edge cases (empty filters, nil values)
Use standard Go testing patterns (see existing test files for examples).
```

### Frontend Tests
```
Generate tests for table component in web/src/components/tabs/netflow-table/__tests__/:
- Column rendering (see netflow-table-header.spec.tsx)
- Row rendering (see netflow-table-row.spec.tsx)
- Sort functionality
Use Jest and Enzyme patterns.
```

### Cypress Tests
```
Test topology view in web/cypress/e2e/:
1. Open Cypress UI: make cypress (or cd web && npm run cypress:open)
2. Add test for new feature in e2e/ directory (overview/, table/, topology/)
3. Use existing custom commands
4. Test both plugin and standalone modes
5. Run headless: cd web && npm run cypress:run
```

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

```
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
