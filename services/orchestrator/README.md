# Orchestrator

## Testing

Pure validation tests run without external services:

```bash
uv run pytest -q tests/test_graph_contract.py
```

Independent LangGraph dry-run test runs the production graph through planner,
retriever, analyzer, writer, human review interrupt, resume, and publish using
deterministic in-process test doubles for external services:

```bash
uv run pytest -q tests/test_langgraph_dry_run.py
```

Full suite includes real Supabase integration tests. Export the same cloud Supabase settings used by the API service, then run:

```bash
export SUPABASE_URL=https://<project-ref>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<cloud service role key>
export ORCHESTRATOR_SUPABASE_INTEGRATION=1
uv run pytest -q
```

The integration tests expect the seeded records from `supabase/seed/seed.sql` to exist in the cloud project, including owner `11111111-1111-1111-1111-111111111111` and case `22222222-2222-2222-2222-222222222222`. They create a temporary run and clean up its run steps, artifacts, report versions, and run row after the test.
