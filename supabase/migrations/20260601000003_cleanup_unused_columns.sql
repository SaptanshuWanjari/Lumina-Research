-- Drop ReportCitation and ReportClaim tables
DROP TABLE IF EXISTS public.report_citations CASCADE;
DROP TABLE IF EXISTS public.report_claims CASCADE;

-- Drop citations_json from report_versions
ALTER TABLE public.report_versions DROP COLUMN IF EXISTS citations_json;
