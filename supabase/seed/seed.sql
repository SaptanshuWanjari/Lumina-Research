-- Seed data for local development

insert into public.profiles (user_id, email, display_name, created_at, updated_at) values
    ('11111111-1111-1111-1111-111111111111', 'demo@lumina.local', 'Demo User', now(), now());

insert into public.cases (
    id,
    owner_user_id,
    title,
    question,
    summary,
    status,
    priority,
    tags,
    last_ingested_at,
    last_run_at,
    last_published_at,
    created_at,
    updated_at
) values
    (
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'Retail expansion analysis',
        'Should we open three new stores in 2026?',
        'Evaluate demand signals and logistics constraints for expansion.',
        'indexed',
        'high',
        array['expansion','retail'],
        now(),
        now(),
        null,
        now(),
        now()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'Battery technology overview',
        'What are the most promising solid-state battery suppliers?',
        'Map supplier landscape and maturity milestones.',
        'draft',
        'normal',
        array['energy','materials'],
        null,
        null,
        null,
        now(),
        now()
    );

insert into public.sources (
    id,
    case_id,
    owner_user_id,
    source_type,
    title,
    url,
    storage_path,
    note_text,
    content_hash,
    status,
    error_message,
    metadata_json,
    created_at,
    updated_at
) values
    (
        '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'file',
        'Market report PDF',
        null,
        'cases/22222222-2222-2222-2222-222222222222/sources/44444444-4444-4444-4444-444444444444/market-report.pdf',
        null,
        'sha256:demo-market-report',
        'indexed',
        null,
        '{"source":"market-report"}'::jsonb,
        now(),
        now()
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'note',
        'Interview notes',
        null,
        null,
        'Early customer interviews emphasize logistics reliability and delivery time.',
        null,
        'pending',
        null,
        '{"source":"interview"}'::jsonb,
        now(),
        now()
    );

insert into public.documents (
    id,
    source_id,
    case_id,
    owner_user_id,
    version,
    parser,
    language,
    mime_type,
    content_text,
    char_count,
    token_count,
    metadata_json,
    created_at,
    updated_at
) values
    (
        '66666666-6666-6666-6666-666666666666',
        '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        1,
        'pdf-extractor',
        'en',
        'application/pdf',
        'Regional demand grows 12% YoY. Store revenue peaks within 9 months when logistics SLAs are met.',
        106,
        22,
        '{"source":"market-report","page_range":"3-7"}'::jsonb,
        now(),
        now()
    );

insert into public.chunks (
    id,
    document_id,
    case_id,
    owner_user_id,
    chunk_index,
    content,
    token_count,
    embedding,
    metadata_json,
    created_at
) values
    (
        '77777777-7777-7777-7777-777777777777',
        '66666666-6666-6666-6666-666666666666',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        0,
        'Regional demand grows 12% YoY. Store revenue peaks within 9 months when logistics SLAs are met.',
        22,
        null,
        '{"section":"summary"}'::jsonb,
        now()
    );

insert into public.runs (
    id,
    case_id,
    owner_user_id,
    status,
    current_step,
    needs_review,
    review_summary,
    checkpoint_ref,
    checkpoint_at,
    triggered_by_user_id,
    approved_by_user_id,
    error_message,
    started_at,
    completed_at,
    duration_ms,
    created_at,
    updated_at,
    approved_at
) values
    (
        '88888888-8888-8888-8888-888888888888',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'needs_review',
        'await_human_review',
        true,
        'Awaiting approval of draft report.',
        'checkpoint-demo-1',
        now(),
        '11111111-1111-1111-1111-111111111111',
        null,
        null,
        now(),
        null,
        null,
        now(),
        now(),
        null
    );

insert into public.run_steps (
    id,
    run_id,
    owner_user_id,
    step_key,
    step_order,
    status,
    goal,
    input_json,
    output_json,
    error_message,
    started_at,
    completed_at,
    duration_ms,
    created_at,
    updated_at
) values
    (
        '99999999-9999-9999-9999-999999999999',
        '88888888-8888-8888-8888-888888888888',
        '11111111-1111-1111-1111-111111111111',
        'synthesize_report',
        3,
        'completed',
        'Draft initial report',
        '{"prompt":"draft report"}'::jsonb,
        '{"draft":"Initial report draft generated."}'::jsonb,
        null,
        now(),
        now(),
        18342,
        now(),
        now()
    );

insert into public.run_artifacts (
    id,
    run_id,
    case_id,
    owner_user_id,
    artifact_type,
    title,
    payload_json,
    created_at
) values
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '88888888-8888-8888-8888-888888888888',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'draft_report',
        'Draft report v1',
        '{"summary":"Draft emphasizes logistics SLA as key risk."}'::jsonb,
        now()
    );

insert into public.report_versions (
    id,
    case_id,
    run_id,
    owner_user_id,
    version_number,
    status,
    title,
    summary,
    content_markdown,
    citations_json,
    created_by_user_id,
    published_at,
    created_at,
    updated_at,
    archived_at
) values
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        '88888888-8888-8888-8888-888888888888',
        '11111111-1111-1111-1111-111111111111',
        1,
        'draft',
        'Retail expansion draft',
        'Initial draft for review.',
        '## Draft\n\nRegional demand is accelerating, but logistics reliability is the critical risk factor.',
        '[{"source_id":"44444444-4444-4444-4444-444444444444","quote":"Regional demand grows 12% YoY."}]'::jsonb,
        '11111111-1111-1111-1111-111111111111',
        null,
        now(),
        now(),
        null
    );

insert into public.report_claims (
    id,
    report_version_id,
    owner_user_id,
    claim_index,
    section,
    claim_text,
    support_score,
    created_at,
    updated_at
) values
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        1,
        'Summary',
        'Demand is rising, but logistics performance is a gating factor.',
        0.84,
        now(),
        now()
    );

insert into public.report_citations (
    id,
    report_version_id,
    owner_user_id,
    claim_id,
    source_id,
    document_id,
    chunk_id,
    citation_label,
    excerpt,
    location_json,
    confidence,
    created_at
) values
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '44444444-4444-4444-4444-444444444444',
        '66666666-6666-6666-6666-666666666666',
        '77777777-7777-7777-7777-777777777777',
        'MR-01',
        'Regional demand grows 12% YoY.',
        '{"page":"4"}'::jsonb,
        0.9,
        now()
    );

insert into public.ingestion_attempts (
    id,
    source_id,
    case_id,
    owner_user_id,
    attempt_no,
    status,
    stage,
    error_message,
    metrics_json,
    started_at,
    finished_at,
    created_at,
    updated_at
) values
    (
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        '55555555-5555-5555-5555-555555555555',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        1,
        'queued',
        'fetching',
        null,
        '{"attempt":"scheduled"}'::jsonb,
        null,
        null,
        now(),
        now()
    );

insert into public.jobs (
    id,
    owner_user_id,
    case_id,
    source_id,
    run_id,
    job_type,
    status,
    priority,
    payload_json,
    scheduled_at,
    locked_at,
    finished_at,
    worker_id,
    attempts,
    max_attempts,
    last_error,
    created_at,
    updated_at
) values
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '55555555-5555-5555-5555-555555555555',
        null,
        'ingestion.process_source',
        'queued',
        100,
        '{"source_id":"55555555-5555-5555-5555-555555555555"}'::jsonb,
        now(),
        null,
        null,
        null,
        0,
        3,
        null,
        now(),
        now()
    );
