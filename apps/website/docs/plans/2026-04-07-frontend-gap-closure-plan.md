# Frontend Gap Closure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close missing and half-implemented UI/UX requirements from `deep-research-report.md` while keeping the product strictly single-user/local (no SaaS workspace/member/billing scope).

**Architecture:** Keep current route structure (`/dashboard`, `/cases`, `/runs`, `/reports`, etc.) and complete behavior/state depth in-place. Prioritize reusable componentization and URL-driven state, then add local-first data/realtime adapters behind typed interfaces so mock data can be replaced incrementally.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind, shadcn/ui, Sonner, Supabase (to be reintroduced for data/realtime).

---

## Gap Audit Summary

## Fully missing (not implemented)

- Supabase client layer and realtime subscriptions are absent (`lib/supabase/*` currently missing).
- Report editor surface/citation sidebar/claim inspector interaction is not implemented (overview page is read-only composition).
- Offline/autosave status model for report editing not implemented.

## Intentionally out of scope (do not implement)

- Multi-workspace constructs (workspace switcher, workspace members, invite flows, billing).
- SaaS auth funnel pages from the original spec (`/pricing`, `/security`, `/auth/*`, `/onboarding`) unless explicitly reintroduced.
- Team/RBAC role matrices (viewer/editor/admin) for this branch.

## Partially implemented

- App shell exists, but top-bar action contract is incomplete (notifications and primary New Case action consistency).
- Cases list exists, but lacks full table behavior from spec (owner, last run status, duplicate/archive/delete flows with destructive confirmation, loading skeleton path).
- Case detail tabs are present, but Sources tab lacks row expansion and inline ingest error drill-down; Runs tab lacks compare-runs flow.
- Run detail contains timeline and HITL section, but lacks checkpoint metadata and resume-from-checkpoint recovery actions.
- Search page layout exists, but no debounced query pipeline, no “no query” guided state, and no rate-limit state.
- Settings page exists, but local security/data controls are mostly static and missing key action behaviors.

## Quality/accessibility debt

- Multiple static action buttons have no behavior wiring (placeholders).
- Source detail contains repeated invalid Tailwind classes like `text-[12px]s`.
- Several forms rely on placeholders without complete validation/error patterns required by spec.

---

### Task 1: Reintroduce Data + Realtime Foundation (Local-First)

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/realtime.ts`
- Create: `app/Components/Providers/AppRealtimeProvider.tsx`
- Modify: `app/Components/Layout/DashboardLayout.tsx`

**Steps:**
1. Add server/browser Supabase client split for App Router.
2. Add lightweight realtime subscription hooks for `runs`, `sources`, `report_versions`.
3. Inject provider in app shell to expose status updates.
4. Keep existing mock fallback when no backend data is available.

**Validation:**
- `npm run lint`
- `npm run build`
- Manual: log subscription events and verify no hydration errors.

### Task 2: Complete TopNavApp Contract

**Files:**
- Modify: `app/Components/Navigation/DashboardNavbar.tsx`
- Create: `app/Components/Common/NotificationsButton.tsx`
- Modify: `lib/mock-app.ts`

**Steps:**
1. Add notification control in top bar.
2. Add or normalize primary “New Case” CTA in top bar.
3. Keep current sidebar trigger behavior and mobile nav pills.
4. Preserve URL-driven active states.

**Validation:**
- `npm run lint`
- `npm run build`
- Manual: keyboard navigation + focus states for each top-bar action.

### Task 3: Finish Cases List Table Behaviors

**Files:**
- Modify: `app/(pages)/cases/[id]/page.tsx`
- Modify: `app/Components/Common/ActionMenu.tsx`
- Create: `app/Components/Cases/CasesTableSkeleton.tsx`
- Modify: `lib/mock-cases.ts`

**Steps:**
1. Add missing columns (`last run status`, `owner`) and sorting/filter options per spec.
2. Add row actions: duplicate, archive, delete (delete via `ConfirmActionDialog`).
3. Add loading and empty-state variants.
4. Ensure row actions are keyboard-focusable and screen-reader labeled.

**Validation:**
- `npm run lint`
- `npm run build`
- Manual: action menu flows and destructive confirmation behavior.

### Task 4: Finish Case Detail Sources/Runs Tabs

**Files:**
- Modify: `app/Components/Cases/CaseSourcesPanel.tsx`
- Modify: `app/Components/Cases/CaseRunsPanel.tsx`
- Create: `app/Components/Cases/SourceRowExpanded.tsx`
- Create: `app/Components/Dialogs/CompareRunsDialog.tsx`
- Modify: `app/(pages)/cases/[id]/details/page.tsx`

**Steps:**
1. Add expandable source rows with extract preview/chunk count/error details.
2. Add ingest progress row treatment for active sources.
3. Add compare-runs trigger and modal.
4. Add run card CTAs (`View run`, `Review draft`) based on run status.

**Validation:**
- `npm run lint`
- `npm run build`
- Manual: tab state via URL and expanded-row accessibility.

### Task 5: Implement Report Editing Surface (Spec Core)

**Files:**
- Create: `app/Components/Report/ReportEditorSurface.tsx`
- Create: `app/Components/Report/CitationSidebar.tsx`
- Create: `app/Components/Report/ClaimInspector.tsx`
- Modify: `app/(pages)/report/[id]/overview/page.tsx`
- Modify: `lib/mock-reports.ts`

**Steps:**
1. Replace read-only article with two-column editor + citations sidebar.
2. Add citation marker click/scroll/highlight behavior.
3. Add claim inspector actions and stronger-citation request affordance.
4. Add draft state status strip (`Saved`, `Saving`, `Offline`).

**Validation:**
- `npm run lint`
- `npm run build`
- Manual: citation interactions and inspector flow.

### Task 6: Complete Run Detail Durability UX

**Files:**
- Modify: `app/(pages)/runs/[runId]/page.tsx`
- Modify: `lib/mock-cases.ts`
- (Optional) Create: `app/Components/Runs/CheckpointBanner.tsx`

**Steps:**
1. Add `last checkpoint` metadata display.
2. Add `Resume` action for paused runs.
3. Add `Retry from last checkpoint` recovery flow for interrupted/failed steps.
4. Keep “Needs review” language as positive control state.

**Validation:**
- `npm run lint`
- `npm run build`
- Manual: verify status-specific primary actions.

### Task 7: Complete Local Settings Behaviors

**Files:**
- Modify: `app/(pages)/settings/page.tsx`
- Create: `app/Components/Settings/LocalPathsTable.tsx`
- Create: `app/Components/Settings/ModelDefaultsPanel.tsx`
- Modify: `app/Components/Dialogs/ConfirmActionDialog.tsx`

**Steps:**
1. Wire existing settings actions (clear cache, add data path, save defaults) to local state handlers.
2. Add inline success/error alert surfaces for settings operations.
3. Add confirmations for destructive local actions.
4. Keep all language and controls single-user/local.

**Validation:**
- `npm run lint`
- `npm run build`
- Manual: destructive revoke flow defaults to safe action.

### Task 8: Search UX Completion

**Files:**
- Modify: `app/(pages)/search/page.tsx`
- Modify: `app/Components/Common/Searchbar.tsx`
- Modify: `lib/mock-search.ts`

**Steps:**
1. Add debounced query input model.
2. Add “no query” and empty result suggestion states.
3. Add rate-limit info alert state.
4. Ensure URL reflects query/scope/result state.

**Validation:**
- `npm run lint`
- `npm run build`
- Manual: direct-link to search state reproduces UI.

### Task 9: UI Consistency + Accessibility Hardening

**Files:**
- Modify: `app/(pages)/cases/[id]/sources/[sourceId]/page.tsx`
- Modify: `app/Components/**` (focused sweep)
- Modify: `components/ui/**` (only if utility fixes needed)

**Steps:**
1. Fix invalid utility classes (e.g., `text-[12px]s`).
2. Ensure icon-only controls have labels and focus-visible states.
3. Add inline alerts where critical flows currently rely on static copy.
4. Confirm all action controls are semantic buttons/links.

**Validation:**
- `npm run lint`
- `npm run build`
- Manual: keyboard-only walkthrough across dashboard/cases/runs/report/settings.

---

## Suggested Execution Order (Priority)

1. Task 1 (data/realtime foundation)
2. Tasks 4, 5, 6 (core workflow: case → source/run → report)
3. Tasks 2 and 3 (shell and case list completion)
4. Tasks 7 and 8 (settings/search depth)
5. Task 9 (final hardening)

## Verification Gate Before Any Merge

- `npm run lint`
- `npm run build`
- Manual UX pass on desktop + mobile:
  - dashboard
  - cases list
  - case detail (all tabs)
  - source detail
  - run detail
  - report overview/editor
  - search
  - settings
