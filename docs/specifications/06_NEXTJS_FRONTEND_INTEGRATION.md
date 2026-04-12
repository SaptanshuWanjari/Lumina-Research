# 06. Next.js Frontend Integration

## Role and Responsibilities
The `apps/website` acts as the user interface and Backend-for-Frontend (BFF). It is built with Next.js App Router. Its primary role is to authenticate users, display cases, upload sources, and trigger/review research runs.

## Architecture
- **Framework:** Next.js App Router (Server Components by default).
- **Styling:** Tailwind CSS.
- **Authentication:** Supabase Auth (Google/GitHub OAuth).
- **State Management:** React Server Components (RSC) fetch data directly from Supabase using Row Level Security (RLS). Client components manage local state for UI interactions.
- **API Communication:** Browser client -> Next.js Route Handlers/Server Actions -> FastAPI Gateway -> Python Workers/Orchestrator.

## Integration Points

### 1. Authentication
- Next.js uses `@supabase/ssr` to manage auth state in cookies.
- When communicating with the FastAPI backend, Next.js MUST extract the `access_token` (JWT) from the user's session and pass it in the `Authorization: Bearer <token>` header.

### 2. Database Reads (BFF directly to Supabase)
For reading application state (cases, sources, reports), Next.js should communicate *directly* with Supabase PostgreSQL. This is the most efficient path and leverages RLS for security.
- **Example:** Fetching a user's cases on the dashboard.
```typescript
// app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: cases, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // Handle error
  }

  return (
    // ... render cases
  )
}
```

### 3. API Mutations (BFF to FastAPI Gateway)
For actions that require background processing (e.g., uploading a source for ingestion, triggering a LangGraph run), Next.js MUST call the FastAPI Gateway endpoints.
- **Example:** Triggering a research run.
```typescript
// app/cases/[id]/actions.ts
'use server'
import { createClient } from '@/utils/supabase/server'

export async function triggerRun(caseId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  const response = await fetch(`http://localhost:8000/api/v1/cases/${caseId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
     // Handle error
  }
}
```

### 4. Real-time Subscriptions
To provide a responsive UI (e.g., showing the progress of ingestion or a LangGraph run), Next.js client components should use Supabase Realtime to listen for changes to specific rows.
- Subscribe to `UPDATE` events on the `sources` table to track ingestion progress.
- Subscribe to `UPDATE` events on the `runs` table to track orchestrator progress (e.g., waiting for the status to change to `needs_review`).

### 5. Human-in-the-Loop Review UI
When a run hits the `needs_review` state, the frontend alerts the user.
- The UI presents the draft `report_version`.
- The user can edit the draft or approve it as-is.
- Upon approval, Next.js sends a `POST` request to the FastAPI Gateway (`/api/v1/runs/{run_id}/resume`) with the approved draft content. The API signals the LangGraph checkpointer to resume the workflow.