# App MVP Shell and Case Details Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the interrupted `cases/[id]/details` extraction and complete shell/route normalization so the app behaves as one cohesive single-user research workspace.

**Architecture:** Keep route files server-first and URL-driven, extract reusable case detail UI blocks under `app/Components/Cases`, and centralize lookup data in `lib/mock-cases.ts` + `lib/mock-app.ts`. Keep dialogs/menus as client islands only where interaction requires it, and reuse existing shadcn primitives.

**Tech Stack:** Next.js App Router (v16), React 19, TypeScript, shadcn/ui, Tailwind CSS, lucide-react.

---

### Task 1: Add canonical case detail data contracts

**Files:**
- Modify: `lib/mock-cases.ts`

**Step 1: Add failing type references in `cases/[id]/details` page**

```ts
// temporary import to force compile failure until data contracts exist
import { getCaseDetailById } from "@/lib/mock-cases";
```

**Step 2: Run build to verify failure**

Run: `npm run build`
Expected: FAIL with module export/type errors for `getCaseDetailById`

**Step 3: Add minimal case detail types and sample records**

```ts
export type RunStatus = "queued" | "running" | "needs_review" | "complete";
export type SourceStatus = "pending" | "ingesting" | "indexed" | "failed";

export interface CaseDetailRecord {
  id: string;
  title: string;
  status: "ANALYZING" | "READY";
  // ...summary, stats, goals, sources, runs, activity
}
```

**Step 4: Add selector helpers**

```ts
export function getCaseById(id: string) { ... }
export function getCaseDetailById(id: string) { ... }
export function getSourceById(caseId: string, sourceId: string) { ... }
export function getRunById(runId: string) { ... }
```

**Step 5: Run build to verify pass**

Run: `npm run build`
Expected: PASS (or next remaining type error unrelated to this task)

### Task 2: Extract case detail hero and stats components

**Files:**
- Create: `app/Components/Cases/CaseDetailHero.tsx`
- Create: `app/Components/Cases/CaseDetailStats.tsx`
- Modify: `app/(pages)/cases/[id]/details/page.tsx`

**Step 1: Write failing imports in page**

```ts
import CaseDetailHero from "@/app/Components/Cases/CaseDetailHero";
import CaseDetailStats from "@/app/Components/Cases/CaseDetailStats";
```

**Step 2: Run build to verify failure**

Run: `npm run build`
Expected: FAIL with "Cannot find module" for new components

**Step 3: Implement `CaseDetailHero` with action slots/dialog triggers**

```tsx
export default function CaseDetailHero({ entry }: { entry: CaseDetailRecord }) {
  return <header>{/* status chip, title, prompt, actions */}</header>;
}
```

**Step 4: Implement `CaseDetailStats`**

```tsx
export default function CaseDetailStats({ stats }: { stats: CaseDetailRecord["stats"] }) {
  return <div>{/* sources/runs/citations/lastPublished */}</div>;
}
```

**Step 5: Replace inline header/stat markup in page with extracted components**

Run: `npm run build`
Expected: PASS for this extraction step

### Task 3: Extract overview, sources, runs, and activity panels

**Files:**
- Create: `app/Components/Cases/CaseOverviewPanel.tsx`
- Create: `app/Components/Cases/CaseSourcesPanel.tsx`
- Create: `app/Components/Cases/CaseRunsPanel.tsx`
- Create: `app/Components/Cases/CaseActivityPanel.tsx`
- Modify: `app/(pages)/cases/[id]/details/page.tsx`

**Step 1: Add imports in page and remove inline panel blocks**

```ts
import CaseOverviewPanel from "@/app/Components/Cases/CaseOverviewPanel";
// ...other panel imports
```

**Step 2: Run build to verify failure for missing files**

Run: `npm run build`
Expected: FAIL with missing component module errors

**Step 3: Implement each panel with typed props and existing shadcn primitives**

```tsx
export default function CaseRunsPanel({ runs }: { runs: CaseDetailRecord["runs"] }) {
  return <section>{/* run rows + status chips */}</section>;
}
```

**Step 4: Wire tab-based conditional rendering in page orchestration**

```tsx
{activeTab === "overview" && <CaseOverviewPanel entry={entry} />}
```

**Step 5: Run lint/build**

Run: `npm run lint && npm run build`
Expected: PASS

### Task 4: Remove duplicated source detail mock arrays from route

**Files:**
- Modify: `app/(pages)/cases/[id]/sources/[sourceId]/page.tsx`
- Modify: `lib/mock-cases.ts`

**Step 1: Replace local `SOURCES` constants with selector import**

```ts
import { getSourceById } from "@/lib/mock-cases";
```

**Step 2: Run build to surface selector mismatch**

Run: `npm run build`
Expected: FAIL if return types do not align with route usage

**Step 3: Align selector return type and route consumption**

```ts
const source = getSourceById(id, sourceId);
```

**Step 4: Add safe fallback behavior for unknown IDs**

```ts
const source = getSourceById(id, sourceId) ?? getSourceById("c_001", "default");
```

**Step 5: Run lint/build**

Run: `npm run lint && npm run build`
Expected: PASS

### Task 5: Normalize shell navigation contract

**Files:**
- Modify: `lib/mock-app.ts`

**Step 1: Add/adjust canonical route entries for nav + quick actions**

```ts
export const sidebarNavItems = [
  { label: "Dashboard", href: "/dashboard", matchPrefix: "/dashboard" },
  { label: "Cases", href: "/cases/deep-analysis", matchPrefix: "/cases" },
  { label: "Runs", href: "/runs/rr-9942-x", matchPrefix: "/runs" },
  { label: "Reports", href: "/report/rpt-101/overview", matchPrefix: "/report" },
  { label: "Preferences", href: "/settings", matchPrefix: "/settings" },
];
```

**Step 2: Tighten active path utility**

```ts
export function isActivePath(pathname: string, item: AppNavItem) {
  return pathname === item.href || pathname.startsWith(`${item.matchPrefix}/`) || pathname === item.matchPrefix;
}
```

**Step 3: Run build/lint**

Run: `npm run lint && npm run build`
Expected: PASS

### Task 6: Apply normalized nav to sidebar and top navbar

**Files:**
- Modify: `app/Components/Utility/SideBar.tsx`
- Modify: `app/Components/Navigation/DashboardNavbar.tsx`

**Step 1: Remove hardcoded route/query variants and consume canonical items**

```tsx
<Link href={item.href}>{item.label}</Link>
```

**Step 2: Ensure consistent settings link route in navbar action**

```tsx
<Link href="/settings">
```

**Step 3: Keep single-user wording and remove SaaS language in labels**

```tsx
<p className="text-xs text-slate-500">Private research mode</p>
```

**Step 4: Run lint/build**

Run: `npm run lint && npm run build`
Expected: PASS

### Task 7: Add reports index bridge route (if needed)

**Files:**
- Create: `app/(pages)/reports/page.tsx` (only if `/reports` is still referenced)
- Modify: `lib/mock-app.ts` (if switching to `/reports` index)

**Step 1: Decide one canonical reports entry (`/report/[id]/overview` vs `/reports`)**

```ts
// keep exactly one canonical entry in nav config
```

**Step 2: If `/reports` is needed, create lightweight server page listing links to report overviews**

```tsx
export default function ReportsIndexPage() { ... }
```

**Step 3: Run build**

Run: `npm run build`
Expected: PASS and no dead-link nav entries

### Task 8: Clean up `cases/[id]/details` page orchestration

**Files:**
- Modify: `app/(pages)/cases/[id]/details/page.tsx`

**Step 1: Keep page limited to params/search parsing + composition**

```tsx
const entry = getCaseDetailById(id);
const activeTab = normalizeTab(searchParams.tab);
```

**Step 2: Move helper functions with presentation-only concerns into component files where appropriate**

```ts
// e.g., status class helpers local to panel component
```

**Step 3: Re-run lint/build**

Run: `npm run lint && npm run build`
Expected: PASS

### Task 9: Verify desktop/mobile shell integrity

**Files:**
- Modify (if needed): `app/Components/Layout/DashboardLayout.tsx`
- Modify (if needed): `app/Components/Navigation/DashboardNavbar.tsx`
- Modify (if needed): `app/Components/Utility/SideBar.tsx`

**Step 1: Run dev server and check mobile sidebar trigger behavior**

Run: `npm run dev`
Expected: sidebar opens/closes correctly on small screens

**Step 2: Validate sticky navbar + content scroll behavior on major pages**

Run: manual route checks on `/dashboard`, `/cases/deep-analysis`, `/search`, `/runs/rr-9942-x`, `/report/rpt-101/overview`, `/settings`
Expected: no layout overlap, no unreachable actions

**Step 3: Apply minimal class-level fixes only where necessary**

```tsx
<SidebarInset className="min-h-screen">...</SidebarInset>
```

### Task 10: Final verification and cleanup

**Files:**
- Modify: touched files only

**Step 1: Run final lint/build gate**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 2: Run git status review**

Run: `git status --short`
Expected: only intended files changed

**Step 3: Prepare commit groups (do not commit automatically)**

```bash
# Group A: case detail extraction + mock data
# Group B: shell/nav normalization
```

**Step 4: Document quick QA results in PR/notes**

```md
- Verified route links
- Verified active nav states
- Verified dialogs and tab URL behavior
```
