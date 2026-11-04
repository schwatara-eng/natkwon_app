-- Supabase의 SQL Editor에 통째로 붙여넣고 Run을 눌러줘. 처음 한 번만 실행하면 돼.
-- 아래 표는 모두 RLS를 켜고 정책을 만들지 않았어. 브라우저에서는 직접 읽고 쓸 수 없고,
-- 로그인을 확인한 서버 코드(api 폴더)만 service role 키로 접근해.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  daily_limit integer,            -- 비어 있으면 기본 한도를 쓴다
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  genre text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists books_user_idx on public.books (user_id, created_at desc);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  calls integer not null default 1,
  book_id uuid references public.books (id) on delete set null,
  saved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists generations_user_idx on public.generations (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.generations enable row level security;

-- 동화책·그림책 그림을 저장하는 공간. 이미 표를 만들었다면 아래 한 문장만 실행하면 돼.
insert into storage.buckets (id, name, public) values ('book-images', 'book-images', true) on conflict (id) do nothing;
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
