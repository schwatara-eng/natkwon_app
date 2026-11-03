-- Supabase의 SQL Editor에 통째로 붙여넣고 Run을 눌러줘. 처음 한 번만 실행하면 돼.
-- 세 표 모두 RLS를 켜고 정책을 만들지 않았어. 브라우저에서는 직접 읽고 쓸 수 없고,
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
