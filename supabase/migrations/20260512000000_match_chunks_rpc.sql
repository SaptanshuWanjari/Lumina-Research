create extension if not exists vector;

create or replace function public.match_chunks(
  query_embedding vector(1536),
  match_threshold double precision,
  match_count integer,
  filter_case_id uuid,
  filter_owner_id uuid
)
returns table (
  id uuid,
  document_id uuid,
  source_id uuid,
  case_id uuid,
  owner_user_id uuid,
  content text,
  metadata_json jsonb,
  similarity double precision
)
language sql
stable
as $$
  select
    c.id,
    c.document_id,
    d.source_id,
    c.case_id,
    c.owner_user_id,
    c.content,
    c.metadata_json,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.chunks c
  join public.documents d on d.id = c.document_id
  where c.embedding is not null
    and c.case_id = filter_case_id
    and c.owner_user_id = filter_owner_id
    and d.owner_user_id = filter_owner_id
    and 1 - (c.embedding <=> query_embedding) >= match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
