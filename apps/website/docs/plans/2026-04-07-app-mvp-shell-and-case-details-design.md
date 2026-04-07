# App MVP Shell and Case Details Design

Date: 2026-04-07
Status: Approved

## Context

The current workspace is mid-refactor from isolated page mocks to a cohesive app shell. The last interrupted implementation step was `cases/[id]/details` component extraction and wiring. Navigation and route normalization are partially implemented, but still need consistency across sidebar, top nav, quick actions, and route entry points.

The product direction is single-user local research workflow (not SaaS), with reusable shadcn-based components and URL-driven state. `deep-research-report.md` is the source of truth for component inventory and interaction requirements.

## Goal

Complete the remaining app MVP UI as one coherent surface by:

1. Finishing case details extraction into reusable components
2. Centralizing mock data and selectors to remove duplicated in-page data
3. Normalizing shell navigation and route contracts
4. Wiring dialogs/menus/dropdowns and validating route integrity

## Chosen Approach

### Selected

Vertical slice (recommended):

- Finish `cases/[id]/details` extraction first
- Immediately apply extracted patterns to shell consistency cleanup

### Why this approach

- Delivers visible progress quickly while reducing architecture drift
- Avoids broad unstable changes across all routes at once
- Provides reusable patterns that can be propagated to remaining pages

### Alternatives considered

- Foundation-first global shell refactor before details page extraction (cleaner upfront but slower and riskier)
- Broad light-touch pass across all pages (fast coverage but likely inconsistent quality)

## Architecture

## 1) Case detail composition

- Extract reusable case detail blocks under `app/Components/Cases/`
- Keep `app/(pages)/cases/[id]/details/page.tsx` as orchestration-only server component
- Preserve URL/search param state for tabs (`?tab=`) and links

Candidate component boundaries:

- `CaseDetailHero`
- `CaseDetailStats`
- `CaseOverviewPanel`
- `CaseSourcesPanel`
- `CaseRunsPanel`
- `CaseActivityPanel`

## 2) Shared mock data and selectors

Use `lib/mock-cases.ts` as single source for:

- Case desk listing
- Case detail payload
- Source detail lookup
- Run/report linking pointers

Required selector-style helpers:

- `getCaseById(id)`
- `getCaseDetailById(id)`
- `getSourceById(caseId, sourceId)`
- `getRunById(runId)`

This removes duplicated static arrays inside route files.

## 3) Shell route model normalization

Canonical shell config stays in `lib/mock-app.ts` and drives both:

- `app/Components/Utility/SideBar.tsx`
- `app/Components/Navigation/DashboardNavbar.tsx`

Normalize links to existing routes:

- `/dashboard`
- `/cases/[id]`
- `/cases/[id]/details`
- `/cases/[id]/sources/[sourceId]`
- `/runs/[runId]`
- `/report/[id]/overview`
- `/search`
- `/settings`

Also tighten active-state matching to avoid false positives on nested routes.

## 4) Interaction boundaries

- Keep server-first pages for initial render and URL state
- Keep dialogs/menus/dropdowns as client components only where interaction requires it
- Reuse existing dialogs:
  - `AddSourceDialog`
  - `RunConfigDialog`
  - `AddToCaseDialog`
  - `ConfirmActionDialog`

## Data Flow

1. Page params/searchParams are parsed in route files
2. Route files call selector helpers from `lib/mock-cases.ts`
3. Route files pass typed data to shared UI blocks
4. Client islands handle transient interactions (open dialogs, menu actions)
5. URL remains the source of truth for tab/filter/sort states

## Error and edge-state posture

- Use existing chips/alerts/dialog primitives for clear status states
- Keep "Needs review" as a positive control state, not a failure state
- Preserve graceful fallback when unknown IDs are requested (seeded default record)

## Verification Criteria

Functional:

- No broken links from sidebar, top nav, or quick actions
- `cases/[id]/details` tabs render and switch via URL
- Source/run/report/settings navigation paths resolve correctly

Quality:

- Page files are orchestration-oriented and smaller
- Reusable case components are used instead of repeated page-level markup
- Mock data duplication is reduced or removed

Validation commands:

- `npm run lint`
- `npm run build`

Manual checks:

- Active nav highlighting for all app routes
- Dialog open/close flows from case detail actions
- Route behavior on desktop and mobile shell layouts

## Out of scope for this pass

- Backend API wiring and persistence
- Realtime subscriptions and autosave
- Full RBAC or multi-user workspace behavior

## Implementation order

1. Extract case detail components and centralize case detail mock data
2. Normalize `mock-app` route entries and active-path logic
3. Align sidebar/navbar links and quick actions with canonical routes
4. Propagate shared selectors into related routes (`sources`, `runs`, `report`, `settings` as needed)
5. Run lint/build and perform route validation
