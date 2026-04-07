# Frontend UI Specification for the AI Research Workspace

This guide is a build-ready UX/UI blueprint for a frontend designer AI to implement an “AI Research & Decision Workspace” web app. It is tailored to the product flow we discussed (cases → sources → ingestion/indexing → LangGraph run → review → publish) and it explicitly adopts the attached reference layout and visual language. fileciteturn0file0

## Reference layout and style extraction from the attached image

![Reference layout and style to follow](sandbox:/mnt/data/image.png)

The provided layout is a light, airy, card-forward UI with a strong “friendly fintech” vibe: oversized rounded containers, subtle shadows, big typography, and a single high-contrast “pill” primary action. Your product is more “workspace” than “marketing site,” but the same design DNA maps cleanly to dashboards and structured flows.

Key visual motifs to preserve and reuse across the whole app:

The page frame uses generous outer padding with a centered content column and soft, rounded “section cards.” The hero sections in the reference use a large rounded rectangle with a pastel background color and an illustration as an emotional anchor; in our product, the hero becomes the “Workspace summary” or “Case overview” card with a small “explainability” widget (run status + citations count + last updated).

The reference strongly prefers card-based grids over heavy borders. Data-heavy areas (tables, logs, sources) should still appear inside rounded surfaces. Use “micro-cards” inside “macro-cards” for nested information hierarchy (e.g., a Case Overview macro-card containing micro-cards for Sources, Runs, Report Versions).

Primary actions are always a dark pill button (“Get Started” / “Let’s talk”). Keep that: “New Case”, “Run Analysis”, “Publish Report” must be dark pill buttons, and they must remain visually consistent across pages.

The FAQ uses accordion interactions; preserve that as a pattern for “Explainability,” “Why this citation,” “Run step details,” and “Error details.” Follow an accessible accordion structure (button headers + expanded panels, keyboard navigation) per WAI-ARIA APG. citeturn1search1

## Design system and component primitives

This section defines the tokens and primitives so another AI can implement a consistent design system. Keep these tokens stable; all pages should be composed from them.

### Layout tokens

Use an 8pt spacing grid.

Container:
- `maxWidth`: 1120–1200px for marketing pages; 1280–1360px for app workspace pages.
- Horizontal padding: 24px desktop, 16px mobile.
- Vertical section spacing: 40px desktop, 28px mobile.

Grid:
- Desktop: 12 columns, 24px gutters.
- Tablet: 8 columns, 16–20px gutters.
- Mobile: 4 columns, 12–16px gutters.

Card radii (match the reference’s “soft” look):
- `radius-xl`: 28px (hero containers, big section cards)
- `radius-lg`: 20px (feature cards, stats cards)
- `radius-md`: 14px (chips, input containers)
- `radius-pill`: 999px (primary/secondary pill buttons)

Shadow:
- Always subtle; one elevation style only, to stay clean:
  - `shadow-soft`: blur 24–32px, low alpha (the reference is very low-contrast)

### Color tokens

Base:
- App background: very light neutral (almost white).
- Card background: pure white.
- Section highlight background: pastel tint (blue as primary), like the hero in the reference.

Primary:
- `primarySolid`: near-black for primary CTA button (white text).
- `primarySoft`: pastel blue background for hero/summary surfaces.

Semantic colors:
- Success: soft green background + darker green text.
- Warning: soft amber background + dark amber text.
- Danger: soft red background + darker red text.
- Info: soft blue background + dark blue text.

Status chips should always use “soft background + strong text,” never loud neon.

### Typography

Typeface: a clean geometric sans (Inter-like). Use bold headings, but keep body text light and readable, similar to the reference.

Scale:
- Hero headline: 40–48px desktop / 30–34px mobile
- Page title: 28–32px
- Section title: 20–24px
- Card title: 16–18px (semibold)
- Body: 14–16px
- Microcopy: 12–13px

### Primitives and accessibility baseline

All dialogs must manage focus correctly: focus moves into the dialog on open, Tab cycles within, Escape closes, and focus restores to the triggering control when closed (modal dialog pattern). citeturn1search0turn1search4

All destructive confirmations (delete case, remove source, revoke key) must use an alert dialog pattern (role `alertdialog`, clear labeling, and a primary safe default). citeturn0search3

Accordions must use button semantics with `aria-expanded` and expected keyboard interactions (optional Home/End; Enter/Space toggles). citeturn1search1

## Information architecture and navigation model

### Global route map

Public (marketing):
- `/` Landing
- `/pricing`
- `/security`
- `/docs` (optional)
- `/faq`

Auth (Supabase):
- `/auth/sign-in`
- `/auth/callback` (OAuth return)
- `/auth/confirm` (email OTP / magic link / verify step if used)
- `/onboarding` (create or join workspace)

App (workspace shell):
- `/app` redirect to last workspace
- `/app/[workspaceId]/dashboard`
- `/app/[workspaceId]/cases`
- `/app/[workspaceId]/cases/[caseId]`
- `/app/[workspaceId]/cases/[caseId]/sources/[sourceId]`
- `/app/[workspaceId]/runs/[runId]`
- `/app/[workspaceId]/reports`
- `/app/[workspaceId]/search`
- `/app/[workspaceId]/settings`
- `/app/[workspaceId]/settings/members`
- `/app/[workspaceId]/settings/integrations`
- `/app/[workspaceId]/settings/billing` (optional)

### App shell layout

Follow the reference’s top-navigation vibe rather than a heavy sidebar. Use:

Top bar (always visible):
- Left: product logo + workspace switcher (rounded dropdown).
- Center: main nav links (Dashboard, Cases, Search, Reports, Integrations).
- Right: primary pill “New Case” + notifications bell + avatar menu.

Secondary nav (page-level, optional):
- For Case detail pages: tabs inside a rounded card (Overview / Sources / Runs / Report / History).

This keeps the interface “open” and “friendly” like the reference while still supporting app complexity.

### Identity, auth, and permissions assumptions

Supabase Auth is the identity provider, and the UI must assume that:
- The client receives an authenticated session and auth token.
- Database/API access is scoped by Supabase Auth tokens when paired with Row Level Security (RLS). citeturn0search0turn1search2

SSR vs browser data access:
- The frontend must support both server-rendered pages and client interactivity; Supabase’s guidance for Next.js SSR is to create separate clients for server contexts vs browser contexts. citeturn0search1

Real-time updates:
- The UI should subscribe to run/source status updates (ingestion progress, run steps) using Supabase Realtime “Postgres Changes” subscriptions where appropriate. citeturn1search3

## Page and dashboard build specs

All pages below follow the same structural markdown so an AI designer can create consistent layouts. Each page spec has: purpose, layout, key components, critical states, and required dialogs/alerts.

### Landing page

**Purpose**  
Convert new users: explain the “messy → cited decision” workflow and push sign-in.

**Layout**  
- Top nav (like reference): Logo, links (Product, How it works, Security, Pricing), right-side pill CTA “Get Started”.
- Hero macro-card (pastel background, radius-xl) with:
  - Left: headline + subtext + primary pill “Get Started”
  - Right: friendly illustration (swap finance imagery for “documents, links, citations, graph nodes”)
- Partner row (logos) below hero.
- Feature section: 3 illustrated feature cards (radius-lg).
- Proof section: stat cards grid (2×2) similar to reference right column.
- CTA macro-card: “Boost your decisions with grounded AI” + pill button.
- FAQ accordion section (like reference) + footer.

**Hero copy (example)**
- Headline: “Turn messy sources into cited decisions.”
- Subhead: “Ingest URLs & files, run a traceable LangGraph workflow, review the report, and publish with confidence.”

**Feature cards**
- “Ingest anything”: URLs, PDFs, notes.
- “Run traceable workflows”: step-by-step runs with checkpoints and approvals (human-in-the-loop).
- “Citations everywhere”: every claim maps back to sources.

**Critical states**
- Logged in user: CTA becomes “Go to Dashboard”
- Not logged in: CTA opens `/auth/sign-in`

**Required components**
- `TopNavPublic`
- `HeroCard`
- `LogoRow`
- `FeatureCardGrid`
- `StatCardGrid`
- `CTASectionCard`
- `AccordionFAQ` (APG-compliant). citeturn1search1

### Auth pages

#### Sign-in

**Purpose**  
Authenticate with Supabase Auth (email + OAuth).

**Layout**  
Centered auth card (radius-xl) on a very light neutral page background.

**Sections inside card**
- Title + short reassurance microcopy
- OAuth buttons row (Google/GitHub/etc; configurable)
- Divider (“or”)
- Email input + button (“Continue”)
- Legal microcopy (terms/privacy)
- Footer: “New here? Create workspace after sign-in.”

**OAuth behavior**
- Clicking OAuth provider: begins Supabase OAuth flow; redirect to `/auth/callback`.

**States**
- Loading: disable buttons, show spinner inside pill button.
- Error: inline alert banner inside card (not a toast—auth errors must stay visible).
- Rate limited: alert banner explaining to wait and retry.

**Alerts**
- `InlineAlert` variants: `info`, `error`.

#### Callback / Confirm

**Purpose**  
Handle session establishment and route to onboarding/app.

**Layout**
Minimal: centered “Verifying…” card with progress indicator.

**States**
- Success: redirect to `/onboarding` (if no workspace) else `/app/[workspaceId]/dashboard`
- Failure: show alert dialog with “Try again” (alert dialog pattern for attention-critical failure) citeturn0search3

### Onboarding

**Purpose**  
First session setup: create workspace, optionally invite teammates.

**Layout**  
Wizard-style macro-card:
- Step header (soft progress)
- Step content area
- Footer actions (Back/Continue)

**Steps**
- Create workspace
- Choose role (solo/team)
- Invite teammates (optional)
- Create first case (shortcut)

**Dialogs**
- “Skip invites” confirmation (non-destructive; normal modal dialog). citeturn1search0turn1search4

**Empty/state rules**
- Must never trap user: allow skip, but clearly show benefits.

### Workspace dashboard

**Route**  
`/app/[workspaceId]/dashboard`

**Purpose**  
At-a-glance status: what’s running, what needs review, and quick entry points.

**Layout**  
- Page header: “Dashboard” + workspace pill + primary button “New Case”
- Macro hero summary card (pastel highlight) containing:
  - Left: “Workspace health” summary
  - Right: “In progress” mini timeline widget
- Below: 2×2 stat cards (match reference right grid)
- Below: “Recent Cases” list card
- Below: “Needs Review” card (priority queue)
- Optional: “Tips / FAQ” accordion (reuse pattern)

**Stat cards (2×2)**
- Active runs (running / queued)
- Sources ingesting (success/fail counts)
- Reports published (last 7/30 days)
- Citation coverage (avg citations per report)

**Key interactions**
- Clicking stat card filters below lists.
- “Needs Review” items open run/report review directly.

**Critical states**
- New workspace: show “empty hero” variant with a single call to action and a 3-step illustration:
  - Add sources → Run analysis → Review & publish

**Real-time**
- Active runs and ingestion statuses should update live using Supabase Postgres Changes subscriptions (subscribe to `runs` and `sources` status fields). citeturn1search3

### Cases list

**Route**  
`/app/[workspaceId]/cases`

**Purpose**  
Find, filter, and create cases.

**Layout**
- Page header: title + “New Case” pill
- Filter row card:
  - Search input
  - Status chips (Draft / Ingesting / Ready / Running / Needs review / Published)
  - Sort dropdown
- Cases table card (rounded, subtle dividers)
- Right-side optional “Quick actions” card on wide screens:
  - “Import from URL”
  - “Create from template”
  - “View published reports”

**Table columns**
- Case title (primary)
- Status chip
- Last run status
- Updated time
- Owner
- Actions kebab

**Row actions**
- Open case
- Duplicate
- Archive
- Delete (destructive → alert dialog) citeturn0search3

**States**
- Loading: skeleton rows
- Empty: illustration + “Create your first case”
- Error: inline alert inside table card

### Case detail hub

**Route**  
`/app/[workspaceId]/cases/[caseId]`

**Purpose**  
One place to manage inputs, runs, and outputs.

**Overall layout**
- Case header macro-card (pastel highlight like hero):
  - Title + status
  - Question/goal text
  - Quick stats: #sources, #runs, last published, citations count
  - Right: primary CTA “Run Analysis” + secondary “Add Source”
- Tabs card (Overview | Sources | Runs | Report | History)
- Tab content area (cards)

#### Overview tab

**Cards**
- “Summary” card: editable description, tags, owner, created date.
- “Research goals” card: checklist (optional)
- “Recent activity” card: timeline (ingest completed, run started, review done)
- “Explainability snapshot” accordion:
  - “What sources were used?”
  - “How citations work”
  - “Known limitations”

Use accordion for “Explainability snapshot” (APG). citeturn1search1

#### Sources tab

**Primary actions**
- Add Source (opens Add Source dialog)
- Bulk actions: re-ingest, archive, delete

**Layout**
- Sources list table card with:
  - Source name (URL domain/file name)
  - Type (URL/PDF/Note)
  - Status chip (Pending/Ingesting/Indexed/Failed)
  - Last processed time
  - Actions

**Inline source row expand**
- Expand row to show:
  - Extract preview (first ~300 chars)
  - Chunk count
  - Error details (if failed) in expandable accordion section

**States**
- Ingesting: show progress bar and “View details” link (opens Source detail page)
- Failed: show red soft alert chip + “View error”

**Real-time**
- Subscribe to status changes for each source for this case (Postgres Changes). citeturn1search3

#### Runs tab

**Primary actions**
- “Run Analysis” (opens Run Config dialog)
- “Compare runs” (select multiple; opens Compare modal)

**Layout**
- Runs list card (each run is a mini-card, not just rows):
  - Run status chip
  - Started time, duration
  - “Steps completed” mini bar
  - Output: draft/published indicator
  - Buttons: View run, Review draft (if needs review)

**Run state alignment with LangGraph**
Runs should visually reflect checkpointable statefulness (queued → running steps → interrupted/needs review → resumed → complete). LangGraph supports durable execution with different durability modes that affect when intermediate state is persisted (e.g., checkpoint persistence on exit vs async vs sync). citeturn0search2

#### Report tab

**Primary actions**
- If no draft: CTA card prompting “Run Analysis”
- If draft exists:
  - “Review & Edit”
  - “Request re-run”
  - “Publish” (alert dialog confirmation)
- If published:
  - “View published”
  - “Export”
  - “Create new draft from published”

**Layout**
Two-column editor inside a macro-card:
- Left: report editor surface
- Right: citations + run context sidebar

Editor subcomponents
- Report outline (jump links)
- Content blocks with inline citation markers
- “Claim inspector” panel: click a sentence → shows supporting chunks/sources

Citations must be first-class: the user must always be able to click a citation marker and see source excerpt + metadata, not just a link.

### Source detail

**Route**  
`/app/[workspaceId]/cases/[caseId]/sources/[sourceId]`

**Purpose**  
Deep inspection of a source: extraction, chunking, embeddings readiness.

**Layout**
- Source header card:
  - Title + status chip
  - URL/file metadata
  - Actions: re-ingest, download (if file), archive
- Extraction preview card
- Chunk viewer card:
  - Left: chunk list with search within
  - Right: selected chunk detail including “Used in report?” indicator
- Errors accordion card (only if failed)

**States**
- Pending: show placeholder
- Ingesting: show stepper (Fetch → Extract → Chunk → Embed → Index)
- Indexed: show summary metrics (chunk count, last indexed time)
- Failed: show error details and recommended fix

### Run detail

**Route**  
`/app/[workspaceId]/runs/[runId]`

**Purpose**  
Trust and debugging: show every step of the LangGraph workflow and what it produced.

**Layout**
- Run header macro-card:
  - Status + started/duration
  - Primary actions depend on status:
    - Running: “Stop run” (danger)
    - Needs review: “Open review”
    - Complete: “Open report”
  - Secondary: “Download trace” (optional)
- Steps timeline card:
  - Vertical timeline or left list / right detail split
- Output artifacts card:
  - Draft report
  - Retrieval set summary (top sources)
  - Critic notes / validation results

**Steps timeline details**
Each step item shows:
- Node name (Planner, Retriever, Synthesizer, Critic, Citation Checker, Human Review Gate, Publisher)
- Status icon (queued/running/success/fail/paused)
- Duration
- Expand caret

Expanded step shows:
- Step goal
- Inputs summary
- Outputs preview (e.g., retrieval top-k list)
- If error: error details + “Retry step” button

**Human-in-the-loop gate UI**
If the run is paused for human review:
- The step shows a “Paused: review required” tag.
- The right panel shows a structured checklist:
  - Are claims supported?
  - Are citations adequate?
  - Sensitive content?
- Buttons:
  - Approve & continue
  - Request revision (adds comment)
  - Reject run

This maps to the concept of interruptions/human-in-the-loop checkpoints, which LangGraph supports via interrupts and state persistence. citeturn0search2turn0search10

### Search

**Route**  
`/app/[workspaceId]/search`

**Purpose**  
Semantic search over sources/chunks and published reports.

**Layout**
- Search hero card (pastel):
  - Large search input
  - Filters chips: “Sources”, “Chunks”, “Reports”
- Results card below:
  - Left list of results (source snippets with highlight)
  - Right detail preview (selected result)
- “Add to case” button on result detail (opens picker dialog)

**States**
- No query: show examples (“Try: ‘market sizing risks’”)
- Empty results: show suggestions
- Rate limit: show info alert

### Settings

**Route**  
`/app/[workspaceId]/settings`

**Purpose**  
Workspace management, members, integrations.

**Layout**
- Settings home with simple cards grid:
  - Workspace profile
  - Members
  - Integrations
  - Security

**Members**
- Table with roles, last active, actions
- Invite modal dialog (standard dialog pattern). citeturn1search0turn1search4

**Integrations**
- OAuth provider status (if applicable)
- API keys area:
  - Keys table
  - Create key modal
  - Revoke key alert dialog (alertdialog pattern). citeturn0search3

## Dialogs, alerts, and feedback patterns

These patterns must be implemented consistently everywhere.

### Modal dialog pattern

Use for “Add Source”, “Run Analysis Config”, “Invite member”, “Compare runs”.

Requirements:
- Modal overlay dims background.
- Focus is moved into the dialog on open; Tab cycles within; Escape closes; focus returns to trigger on close. citeturn1search0turn1search4
- Dialog must have clear accessible labeling using `aria-labelledby` or `aria-label`. citeturn1search4turn0search3

**Standard dialog anatomy**
- Title row: title + close button
- Body: form content
- Footer: secondary action left (“Cancel”), primary pill right

### Alert dialog pattern

Use for destructive or high-risk actions:
- Delete case
- Delete source
- Revoke API key
- Publish report (if publishing is irreversible or public)

Requirements:
- Use alertdialog semantics so assistive tech can distinguish it as urgent. citeturn0search3
- Ensure the default focused action is the safe option (Cancel), not destructive.
- Keep content short, direct, and specific.

### Alerts and toasts

Use two layers:

Inline alerts inside cards/forms (persist until dismissed or resolved):
- Auth errors
- Ingestion failures
- Validation errors in report review
- Account/workspace restrictions

Toasts (ephemeral, bottom-right or top-right):
- “Source added”
- “Run started”
- “Draft saved”
- “Copied to clipboard”

Toast rules:
- Success toasts auto-dismiss.
- Error toasts require user dismissal OR remain visible longer.
- Toasts must not be the only surface for critical errors (also show inline).

### Progress and status language

Statuses should match product reality and reduce anxiety:

Sources:
- Pending
- Fetching
- Extracting
- Chunking
- Embedding
- Indexed
- Failed

Runs:
- Queued
- Running
- Needs review (paused)
- Resuming
- Complete
- Failed

When a run is “Needs review,” the UI must present it as a positive control moment (“Review required”) rather than an error.

## Component catalog with specs

This catalog defines the reusable building blocks. Every page above should be composed from these, not bespoke UI.

### Top navigation components

**TopNavPublic**
- Props: `links[]`, `ctaLabel`, `ctaHref`, `userState`
- States: logged out (shows sign-in), logged in (shows “Go to app”)
- Behaviors: sticky on scroll (optional)

**TopNavApp**
- Props: `workspace`, `navItems`, `onNewCase`, `notificationsCount`, `user`
- Includes:
  - WorkspaceSwitcher (rounded dropdown)
  - PrimaryActionButton (pill)
  - NotificationsButton (icon)
  - AvatarMenu

### Cards

**MacroCard**
- Purpose: hero containers and major page sections
- Style: radius-xl, soft shadow, optional pastel background
- Slots: `header`, `body`, `footer`

**StatCard**
- Purpose: dashboard KPIs; matches reference chart cards
- Includes optional mini chart area
- States: loading skeleton; empty “—”

**ListCard**
- Purpose: list/table wrappers with title bar and actions

### Tables and lists

**DataTable**
- Must support:
  - column sorting
  - row selection (bulk actions)
  - loading skeleton
  - empty state component
  - row expand (for source details)
- Accessibility:
  - focusable row actions
  - visible focus ring

**MiniCardRow**
- Used for runs list: each row is a card with status and actions.

### Status chips and badges

**StatusChip**
- Props: `status`, `tone` (info/success/warn/danger), `size`
- Always soft background + readable text

### Inputs

**SearchInput**
- Large variant for search page hero
- Inline clear button
- Debounced onChange callback

**PillButton**
- Variants: `primarySolid` (black), `secondaryOutline`, `ghost`
- Sizes: sm/md/lg
- Loading state: spinner + disabled

**ChipFilterGroup**
- Multi-select chips (statuses, types)
- Keyboard navigable

### Source ingestion components

**AddSourceDialog**
- Tabs:
  - URL
  - Upload file
  - Paste text
- Each tab is a mini form, but shares a unified footer.

Validation rules:
- URL: must be valid URL, show example.
- File: allow PDF/text; show size limit; show upload progress.
- Paste: min length.

Progress:
- On submit: close modal + show toast “Source added”; show the new source row as “Pending/Fetching.”

**IngestionStepper**
- Visual stepper for source detail and source row expand:
  - Fetch → Extract → Chunk → Embed → Index
- Each step can be:
  - pending
  - running
  - success
  - failed (click to see error)

### Run components

**RunConfigDialog**
- Options:
  - Run name (optional)
  - Depth (Quick / Standard / Deep)
  - Citation strictness (Lenient / Strict)
  - Human review gate toggle (always recommended on)
- Submit starts run; show toast + run card appears instantly.

**RunStepsTimeline**
- Left: list of step nodes
- Right: step detail panel
- Each step includes “Outputs” and “Artifacts”
- If interrupted: show “Awaiting your input” banner

### Report editor components

**ReportEditorSurface**
- Markdown-like editor inside card
- Supports:
  - headings/sections
  - inline citation markers (chips)
  - change tracking (optional)

**CitationSidebar**
- Shows source list
- Clicking a citation marker:
  - scrolls sidebar to source excerpt
  - highlights excerpt
- Must support excerpt view with metadata (source name, section, timestamp)

**ClaimInspector**
- Interaction:
  - user highlights a sentence/paragraph
  - inspector shows “Supported by” with top chunks
  - inspector includes “Ask for stronger citations” action (creates a task comment)

### Accordion

**AccordionFAQ / AccordionDetails**
- Structure and keyboard behavior must follow APG:
  - headers are buttons
  - `aria-expanded`
  - optional Home/End to jump headers citeturn1search1

### Alerts

**InlineAlert**
- Variants: info/success/warn/error
- Used inside cards and dialogs
- Must include:
  - title (optional)
  - message
  - optional action button (e.g., “Retry”)

**Toast**
- Variants: success/error/info
- Should not be used as the only error surface for auth/critical failures.

### Dialog primitives

**ModalDialog**
- Implements modal dialog focus behavior (Tab trap, Escape close, restore focus). citeturn1search0turn1search4

**AlertDialog**
- Implements urgent confirmation semantics with alertdialog role and labeling rules. citeturn0search3

## Data binding, real-time updates, and edge-state UX

### Supabase client strategy

For a Next.js App Router architecture, follow Supabase’s recommended separation: a browser client for Client Components and a server client for server-side contexts (Server Components, Route Handlers), so authenticated pages render correctly and mutations are secure. citeturn0search1

Frontend rule:
- Server Components render the “first view” (dashboard lists, case title) from server-side Supabase queries.
- Client Components enhance with:
  - optimistic UI (adding a source, starting a run)
  - live updates (status subscriptions)
  - rich editors (report editing)

### Real-time subscription strategy

Use Supabase Realtime “Postgres Changes” to subscribe to changes on:
- `sources` (status/progress/error_message)
- `runs` (status/current_step/needs_review)
- `report_versions` (published status)

Supabase documents Postgres Changes as a way to listen to database events (INSERT/UPDATE/DELETE) via the client libraries. citeturn1search3

UI behavior under real-time:
- Never jerk the layout: status changes update chips and progress bars in place.
- When a run moves to “Needs review,” show:
  - a non-intrusive toast (“Review required”)
  - and an inline banner in the run card (“Action needed”)

### Handling LangGraph durability and “paused runs”

Your UI should assume that long-running workflows can pause for human review and resume later. LangGraph supports durable execution modes that affect how and when checkpoints are persisted during graph execution (e.g., persisting only on exit vs synchronously between steps). citeturn0search2

That means the UI must:
- Display “last checkpoint time” on Run detail pages.
- Provide a “Resume” button when the run is paused and has pending required input.
- If the run crashes mid-step (no new checkpoint): show a recovery message and a “Retry from last checkpoint” action.

### Edge cases and UX expectations

Network loss during edits:
- Report editor must autosave drafts with a visible “Saved / Saving / Offline” indicator.
- If offline: keep local changes, show inline warning, and retry sync.

Role-based access:
- Viewer: can view reports, sources, run traces; cannot run or publish.
- Editor: can add sources, run analysis, edit drafts.
- Admin: can publish, manage settings, invite users.

Error content style:
- Errors are never just raw logs. Always show:
  - A plain-language summary
  - Technical details tucked into an accordion (“Show details”)
  - A recommended fix path (“Retry ingestion”, “Re-authenticate”, “Contact support”)

Accessibility invariants:
- Dialogs follow APG modal guidance; alert dialogs follow alertdialog guidance; accordions follow accordion guidance. citeturn1search0turn0search3turn1search1

All UI states must be reachable via keyboard, with clear focus indicators.

