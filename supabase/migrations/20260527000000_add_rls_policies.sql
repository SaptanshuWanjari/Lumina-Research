ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cases_select_own" ON public.cases;
CREATE POLICY "cases_select_own"
  ON public.cases
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "cases_insert_own" ON public.cases;
CREATE POLICY "cases_insert_own"
  ON public.cases
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "cases_update_own" ON public.cases;
CREATE POLICY "cases_update_own"
  ON public.cases
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "cases_delete_own" ON public.cases;
CREATE POLICY "cases_delete_own"
  ON public.cases
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sources_select_own" ON public.sources;
CREATE POLICY "sources_select_own"
  ON public.sources
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "sources_insert_own" ON public.sources;
CREATE POLICY "sources_insert_own"
  ON public.sources
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "sources_update_own" ON public.sources;
CREATE POLICY "sources_update_own"
  ON public.sources
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "sources_delete_own" ON public.sources;
CREATE POLICY "sources_delete_own"
  ON public.sources
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select_own" ON public.documents;
CREATE POLICY "documents_select_own"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
CREATE POLICY "documents_insert_own"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
CREATE POLICY "documents_update_own"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;
CREATE POLICY "documents_delete_own"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chunks_select_own" ON public.chunks;
CREATE POLICY "chunks_select_own"
  ON public.chunks
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "chunks_insert_own" ON public.chunks;
CREATE POLICY "chunks_insert_own"
  ON public.chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "chunks_update_own" ON public.chunks;
CREATE POLICY "chunks_update_own"
  ON public.chunks
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "chunks_delete_own" ON public.chunks;
CREATE POLICY "chunks_delete_own"
  ON public.chunks
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "runs_select_own" ON public.runs;
CREATE POLICY "runs_select_own"
  ON public.runs
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "runs_insert_own" ON public.runs;
CREATE POLICY "runs_insert_own"
  ON public.runs
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "runs_update_own" ON public.runs;
CREATE POLICY "runs_update_own"
  ON public.runs
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "runs_delete_own" ON public.runs;
CREATE POLICY "runs_delete_own"
  ON public.runs
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.run_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "run_steps_select_own" ON public.run_steps;
CREATE POLICY "run_steps_select_own"
  ON public.run_steps
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "run_steps_insert_own" ON public.run_steps;
CREATE POLICY "run_steps_insert_own"
  ON public.run_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "run_steps_update_own" ON public.run_steps;
CREATE POLICY "run_steps_update_own"
  ON public.run_steps
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "run_steps_delete_own" ON public.run_steps;
CREATE POLICY "run_steps_delete_own"
  ON public.run_steps
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.run_artifacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "run_artifacts_select_own" ON public.run_artifacts;
CREATE POLICY "run_artifacts_select_own"
  ON public.run_artifacts
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "run_artifacts_insert_own" ON public.run_artifacts;
CREATE POLICY "run_artifacts_insert_own"
  ON public.run_artifacts
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "run_artifacts_update_own" ON public.run_artifacts;
CREATE POLICY "run_artifacts_update_own"
  ON public.run_artifacts
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "run_artifacts_delete_own" ON public.run_artifacts;
CREATE POLICY "run_artifacts_delete_own"
  ON public.run_artifacts
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "report_versions_select_own" ON public.report_versions;
CREATE POLICY "report_versions_select_own"
  ON public.report_versions
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "report_versions_insert_own" ON public.report_versions;
CREATE POLICY "report_versions_insert_own"
  ON public.report_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "report_versions_update_own" ON public.report_versions;
CREATE POLICY "report_versions_update_own"
  ON public.report_versions
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "report_versions_delete_own" ON public.report_versions;
CREATE POLICY "report_versions_delete_own"
  ON public.report_versions
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.report_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "report_claims_select_own" ON public.report_claims;
CREATE POLICY "report_claims_select_own"
  ON public.report_claims
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "report_claims_insert_own" ON public.report_claims;
CREATE POLICY "report_claims_insert_own"
  ON public.report_claims
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "report_claims_update_own" ON public.report_claims;
CREATE POLICY "report_claims_update_own"
  ON public.report_claims
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "report_claims_delete_own" ON public.report_claims;
CREATE POLICY "report_claims_delete_own"
  ON public.report_claims
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.report_citations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "report_citations_select_own" ON public.report_citations;
CREATE POLICY "report_citations_select_own"
  ON public.report_citations
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "report_citations_insert_own" ON public.report_citations;
CREATE POLICY "report_citations_insert_own"
  ON public.report_citations
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "report_citations_update_own" ON public.report_citations;
CREATE POLICY "report_citations_update_own"
  ON public.report_citations
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "report_citations_delete_own" ON public.report_citations;
CREATE POLICY "report_citations_delete_own"
  ON public.report_citations
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.ingestion_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ingestion_attempts_select_own" ON public.ingestion_attempts;
CREATE POLICY "ingestion_attempts_select_own"
  ON public.ingestion_attempts
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "ingestion_attempts_insert_own" ON public.ingestion_attempts;
CREATE POLICY "ingestion_attempts_insert_own"
  ON public.ingestion_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "ingestion_attempts_update_own" ON public.ingestion_attempts;
CREATE POLICY "ingestion_attempts_update_own"
  ON public.ingestion_attempts
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "ingestion_attempts_delete_own" ON public.ingestion_attempts;
CREATE POLICY "ingestion_attempts_delete_own"
  ON public.ingestion_attempts
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select_own" ON public.jobs;
CREATE POLICY "jobs_select_own"
  ON public.jobs
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "jobs_insert_own" ON public.jobs;
CREATE POLICY "jobs_insert_own"
  ON public.jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "jobs_update_own" ON public.jobs;
CREATE POLICY "jobs_update_own"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "jobs_delete_own" ON public.jobs;
CREATE POLICY "jobs_delete_own"
  ON public.jobs
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select_own" ON public.audit_logs;
CREATE POLICY "audit_logs_select_own"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "audit_logs_insert_own" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_own"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "audit_logs_update_own" ON public.audit_logs;
CREATE POLICY "audit_logs_update_own"
  ON public.audit_logs
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "audit_logs_delete_own" ON public.audit_logs;
CREATE POLICY "audit_logs_delete_own"
  ON public.audit_logs
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());
