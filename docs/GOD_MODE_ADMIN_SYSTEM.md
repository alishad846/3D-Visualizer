# ScanVista God Mode Admin System

## 1) Purpose and Scope

The God Mode Admin System is ScanVista's super-admin intelligence and control plane for operating the entire QR -> product -> 3D/AR -> analytics ecosystem safely at scale.

It is designed to:

- Provide a real-time, system-wide operational view across products, scans, AR usage, and platform health.
- Enable high-impact administrative actions through controlled APIs (not direct data manipulation).
- Create a complete, immutable audit history for every sensitive operation.
- Support incident response, governance, and operational excellence for enterprise-grade deployments.

This system is an operations platform, not a CRUD backdoor.

## 2) Why Direct Database Access Is Not Allowed

Direct database edits from admin UI are explicitly disallowed for safety and governance reasons:

- **Bypasses business rules**: raw SQL can skip validation, ownership checks, and domain constraints.
- **Breaks auditability**: ad-hoc edits make before/after intent and actor attribution incomplete or unverifiable.
- **Increases blast radius**: one incorrect query can impact multiple tenants/products instantly.
- **Weakens reversibility**: unstructured changes are harder to rollback with deterministic workflows.
- **Violates least-privilege**: UI should never have broad write-level DB credentials.

All admin mutations must flow through validated service APIs, policy checks, and append-only logs.

## 3) System Definition

ScanVista Super Admin is a controlled intelligence + monitoring + action system:

- **Intelligence**: continuous observability for product behavior, customer usage, and platform reliability.
- **Control**: scoped, policy-driven admin actions that invoke explicit workflows.
- **Assurance**: immutable action/event logs for compliance, forensics, and safe rollback.

## 4) High-Level Architecture

```text
                    +----------------------------------+
                    |   ScanVista Admin Console (UI)  |
                    |  React + Role-aware dashboards  |
                    +----------------+-----------------+
                                     |
                                     | HTTPS + JWT + MFA Session
                                     v
                 +------------------------------------------+
                 | Admin API Gateway (Express)              |
                 | - AuthN/AuthZ guard                      |
                 | - Request schema validation              |
                 | - Rate limiting + idempotency            |
                 +----------------+-------------------------+
                                  |
                                  v
                 +------------------------------------------+
                 | Policy & Validation Engine               |
                 | - RBAC + action policy matrix            |
                 | - Business invariants                    |
                 | - Risk checks / safety constraints       |
                 +----------------+-------------------------+
                                  |
             +--------------------+--------------------+
             |                                         |
             v                                         v
  +------------------------------+         +-------------------------------+
  | Observability Query Services |         | Controlled Mutation Services   |
  | - scan metrics               |         | - product metadata updates     |
  | - QR integrity               |         | - rollback product version     |
  | - AR funnel + sessions       |         | - disable/enable product       |
  | - system health              |         | - cache/pipeline triggers      |
  +---------------+--------------+         +---------------+---------------+
                  |                                        |
                  +--------------------+-------------------+
                                       v
                 +------------------------------------------+
                 | Data Layer                               |
                 | PostgreSQL + Analytics views/materialize |
                 | qr_scans, products, qr_codes, events     |
                 +----------------+-------------------------+
                                  |
                                  v
                 +------------------------------------------+
                 | Immutable Audit & Event Log Store        |
                 | admin_action_log / action_event_log      |
                 | append-only + tamper-evident chain hash  |
                 +------------------------------------------+
```

## 5) Core Modules

### A) Observability Layer (Read-only Intelligence Plane)

Purpose: provide trusted visibility into system behavior and business outcomes.

Responsibilities:

- Real-time scan stream (token, product, source, geo, device, session trend).
- QR mapping integrity (broken tokens, stale destination URLs, inactive mappings).
- Product health (asset availability, model load failures, publish state drift).
- AR performance and conversion funnel (scan -> view -> AR -> CTA/conversion).
- API/SRE indicators (latency, error rate, throughput, service dependency health).
- Tenant/project-level and global rollups with time-window filters.

Data principles:

- Read-only APIs only.
- Source-of-truth from production event tables and derived analytics views.
- No write paths in observability endpoints.

### B) Control Plane (Safe Admin Action Plane)

Purpose: perform explicit, bounded admin actions under policy control.

Supported action categories (initial):

- Update product metadata with schema validation.
- Fix broken model URLs through validated asset registry checks.
- Rollback product version to previous known-good snapshot.
- Disable or re-enable published product visibility.
- Regenerate QR mapping/token with safe deprecation rules.
- Trigger cache rebuild or analytics backfill jobs.

Action safety controls:

- Action-specific permission gate (RBAC + optional two-person approval for critical actions).
- Dry-run simulation support for high-risk mutations.
- Idempotency keys for replay safety.
- Mandatory reason/comment for sensitive actions.
- Automatic before/after snapshot capture.

### C) Audit & Logging System (Assurance Plane)

Purpose: guarantee non-repudiation and forensic traceability.

Requirements:

- Every mutation must produce an immutable log record.
- Logs are append-only; no update/delete operations allowed by application role.
- Capture who, what, when, why, where:
  - actor id, role, session id, IP hash, user agent
  - action type, target entity, correlation id
  - before state, requested state, applied state
  - outcome status, failure reason, latency
- Chain-hash each log row (`prev_hash`, `entry_hash`) for tamper evidence.
- Expose secured audit search APIs for compliance and incident response.

## 6) End-to-End Data Flow

```text
User scan event
   -> QR token resolution
   -> Product viewer load (3D)
   -> AR launch telemetry + session events
   -> Analytics ingestion/aggregation
   -> Admin observability dashboards (read-only)
   -> Admin action (if needed) via control plane
   -> Validation + policy checks
   -> Mutation service applies change
   -> Immutable audit/event logs written
   -> Updated state reflected in dashboards
```

## 7) Security Model

### 7.1 RBAC Model

Roles (minimum):

- `super_admin`: full global observability + high-risk control actions.
- `ops_admin`: operational controls for products/QR/cache, no role/security management.
- `support_admin`: read-heavy + low-risk corrective actions only.
- `audit_reader`: audit visibility only, no mutations.

Permission unit = `resource:action` (examples):

- `product:read_all`, `product:update_metadata`, `product:rollback`
- `qr:regenerate`, `system:cache_rebuild`
- `audit:read`, `admin_action:approve`

### 7.2 Authentication and Session Security

- JWT with short-lived access token and secure refresh flow.
- Enforce MFA for super-admin sessions.
- Device/session fingerprinting for anomaly detection.
- Strict CSRF and same-site cookie strategy for admin endpoints.

### 7.3 Request Safety

- Request schema validation for every endpoint.
- Business-rule validation after schema validation.
- Per-action rate limiting + global abuse throttling.
- Idempotency keys on mutation endpoints.

### 7.4 Audit and Data Protection

- All admin actions written to append-only audit tables.
- PII minimization and masking in audit payloads.
- Sensitive payload fields encrypted at rest where required.
- Security alerts on suspicious admin action patterns.

## 8) Admin Dashboard Information Architecture

### 8.1 Live System Map

- Global counters: active scans/min, active sessions, AR launch rate, errors/min.
- Geographic activity heat map and source breakdown.
- Real-time event ticker (scan spikes, error bursts, action events).

### 8.2 Product Intelligence Panel

- Product inventory with health score.
- Model load success/failure trend.
- QR mapping state and integrity checks.
- Version history and publish/rollback timeline.

### 8.3 User Activity Stream

- Session funnel: scan -> view -> AR -> conversion/exit.
- Drop-off analysis by device/source/region.
- Cohort and campaign comparison.

### 8.4 System Health Monitor

- API latency/error SLIs by route group.
- DB utilization and queue/job status.
- Broken links/assets and stale cache signals.

### 8.5 AI Insight Layer (Optional Phase)

- Anomaly detection over scans, AR usage, and conversion rates.
- Suggested root-cause hints for regressions.
- Priority recommendations for product remediation.

### 8.6 Controlled Admin Actions Center

- Action forms with scoped permissions and guardrails.
- Dry-run preview and impact summary.
- Approval queue (for high-risk actions).
- Action execution history with status timeline.

## 9) Operational Principles and Constraints

Hard constraints:

- No direct DB editing from UI.
- No uncontrolled admin actions.
- Every mutation is logged.
- Every mutation passes validation + policy layers.

Operational principles:

- Least privilege by default.
- Safe-by-default UX (confirmations, warnings, dry-runs).
- Reversible workflows where feasible.
- Deterministic runbooks for incident operations.

## 10) Implementation Blueprint (No Coding Yet)

This section defines how to integrate with the current ScanVista stack (React client + Express server + PostgreSQL).

### 10.1 Suggested Backend Structure (Express Alignment)

Recommended server structure additions:

```text
server/src/
  routes/
    admin/
      observability.js
      control.js
      audit.js
  controllers/
    admin/
      observabilityController.js
      controlController.js
      auditController.js
  services/
    admin/
      observabilityService.js
      controlService.js
      auditService.js
      policyService.js
      snapshotService.js
  middleware/
    adminAuth.js
    requirePermission.js
    validateRequest.js
    idempotency.js
  validators/
    admin/
      observabilitySchemas.js
      controlSchemas.js
```

Execution model:

- Route layer: endpoint grouping and middleware composition.
- Controller layer: request orchestration.
- Service layer: business logic and transactional mutations.
- Policy layer: centralized permission and action constraints.
- Audit layer: mandatory logging wrapper around all mutation services.

### 10.2 Suggested Database Additions

New tables (minimum set):

1) `admin_roles`
- `id`, `role_name`, `description`

2) `admin_user_roles`
- `id`, `user_id`, `role_id`, `assigned_by`, `assigned_at`

3) `admin_permissions`
- `id`, `permission_key`, `description`

4) `admin_role_permissions`
- `id`, `role_id`, `permission_id`

5) `admin_action_log` (immutable, append-only)
- `id` (UUID), `correlation_id`
- `actor_user_id`, `actor_role`
- `action_type`, `resource_type`, `resource_id`
- `request_payload_masked` (JSONB)
- `before_state` (JSONB), `after_state` (JSONB)
- `status` (`attempted|succeeded|failed|rejected`)
- `failure_reason`, `created_at`
- `ip_hash`, `user_agent_hash`
- `prev_hash`, `entry_hash`

6) `admin_action_approval` (optional for high-risk actions)
- `id`, `action_log_id`, `approver_user_id`, `decision`, `reason`, `decided_at`

7) `analytics_event_fact` (if normalizing event stream)
- canonical event rows for observability joins/materialized views.

8) `product_version_history` (if rollback support is not yet formalized)
- `id`, `product_id`, `version_no`, `snapshot`, `created_by`, `created_at`.

Indexes and constraints:

- Index `admin_action_log` by (`created_at`, `actor_user_id`, `action_type`, `resource_id`).
- Unique idempotency constraint on (`actor_user_id`, `idempotency_key`, `action_type`, date bucket).
- DB-level rule/trigger to block updates/deletes on immutable audit tables.

### 10.3 API Categories

#### A) Read-only Observability APIs

All endpoints under `/api/admin/observability/*` and must be read-only.

Examples:

- `GET /api/admin/observability/overview`
- `GET /api/admin/observability/realtime`
- `GET /api/admin/observability/products/health`
- `GET /api/admin/observability/qr/integrity`
- `GET /api/admin/observability/funnel`
- `GET /api/admin/observability/system/health`

#### B) Controlled Mutation APIs

All endpoints under `/api/admin/control/*`, never raw SQL patch APIs.

Examples:

- `POST /api/admin/control/product/update-metadata`
- `POST /api/admin/control/product/rollback-version`
- `POST /api/admin/control/product/disable`
- `POST /api/admin/control/qr/regenerate`
- `POST /api/admin/control/system/cache-rebuild`
- `POST /api/admin/control/analytics/reprocess`

Mutation API requirements:

- Permission check + policy check + schema validation.
- Optional approval checkpoint for high-risk actions.
- Transactional execution with compensation path where feasible.
- Mandatory audit write regardless of success/failure.

### 10.4 Event Tracking Strategy

Adopt an event taxonomy with versioned names:

- `scan.qr_resolved.v1`
- `viewer.product_loaded.v1`
- `ar.session_started.v1`
- `ar.session_completed.v1`
- `admin.action_attempted.v1`
- `admin.action_succeeded.v1`
- `admin.action_failed.v1`

Event envelope (common fields):

- `event_id`, `event_name`, `event_version`, `occurred_at`
- `trace_id`, `session_id`, `actor_type` (`user|admin|system`)
- `actor_id` (nullable), `resource_type`, `resource_id`
- `context` (device/source/location), `payload` (JSONB)

Pipeline strategy:

- Online path: write critical events synchronously (scan/admin action).
- Async path: aggregate to materialized views for dashboard performance.
- Retention tiers: hot (30-90 days), warm (up to 1 year), archive (>1 year).

### 10.5 Safety Workflow for Admin Mutations

Standard flow:

1. Receive action request with idempotency key.
2. Validate schema and business invariants.
3. Evaluate RBAC + policy constraints.
4. Create audit row with `attempted` status.
5. Execute mutation in transaction (or enqueue job).
6. Update audit row outcome (`succeeded/failed`).
7. Emit corresponding admin action event.
8. Refresh observability cache/view if required.

### 10.6 UI Blueprint for Admin Console

Client modules:

- `client/src/pages/admin/GodModeDashboard.jsx`
- `client/src/pages/admin/AdminAuditLog.jsx`
- `client/src/pages/admin/AdminActionCenter.jsx`
- `client/src/components/admin/*`

UI capabilities:

- Role-aware navigation and hidden routes by permission.
- Global date/time/project filters shared across widgets.
- Drill-down from aggregate metric -> entity timeline -> raw event details.
- Action forms with guardrails, dry-run previews, and explicit confirmations.

### 10.7 Scalability and Reliability Considerations

- Introduce read replicas/materialized views for heavy analytics queries.
- Use queue workers for expensive reprocessing actions.
- Add circuit breakers/timeouts around dependent services.
- Add SLO-based alerts for admin API latency/error budgets.
- Keep observability and control plane services independently scalable.

## 11) Rollout Plan (Suggested)

Phase 1 (Foundation):

- RBAC primitives, admin routes scaffold, immutable audit table.
- Read-only observability overview and realtime endpoints.

Phase 2 (Safe controls):

- Product metadata update, disable/enable, QR regenerate.
- Action center UI + mandatory audit timeline.

Phase 3 (Advanced operations):

- Version rollback, analytics reprocess, cache rebuild orchestration.
- Approval workflows + anomaly insights.

Phase 4 (Enterprise hardening):

- MFA enforcement, chain-hash verification tooling, compliance exports.
- SLO dashboards and incident automation hooks.

## 12) Definition of Done for the Design Phase

The design is ready for implementation when:

- Architecture, module boundaries, and data flow are approved.
- RBAC matrix and action policy catalog are finalized.
- Audit schema and immutability strategy are agreed.
- API contracts (read vs mutation) are reviewed.
- UI information architecture for God Mode dashboards is signed off.

At that point, implementation can proceed in controlled milestones.
