-- 기존 프로젝트: Supabase SQL Editor에서 한 번 실행한다.
-- 원고·키워드·이메일·API 응답 원문은 기록하지 않는다.
create table if not exists public.generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generation_id uuid,
  book_id uuid,
  step text not null,
  outcome text not null check (outcome in ('success', 'failed', 'cancelled')),
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists generation_events_created_idx
  on public.generation_events (created_at desc, id desc);
create index if not exists generation_events_user_idx
  on public.generation_events (user_id, created_at desc);
alter table public.generation_events enable row level security;
