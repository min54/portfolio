-- =============================================
-- Interactive Media Portfolio — Supabase Schema
-- =============================================

-- 1. Enum: 이미지 방향
create type orientation as enum ('landscape', 'portrait', 'square');

-- 2. Works 테이블
create table if not exists works (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  description   text,
  thumbnail_url text        not null,
  video_url     text        not null,
  orientation   orientation not null default 'landscape',
  order_index   integer     not null default 0,
  is_published  boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- 3. 순서 인덱스
create index if not exists works_order_idx on works (order_index asc);

-- 4. RLS (Row Level Security) 활성화
alter table works enable row level security;

-- 5. 공개 읽기 허용 (쇼케이스 페이지용)
create policy "Public read published works"
  on works for select
  using (is_published = true);

-- 6. 인증된 사용자만 쓰기 허용 (Admin용)
create policy "Authenticated full access"
  on works for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================
-- Storage Buckets
-- =============================================

-- thumbnails 버킷 (공개)
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict do nothing;

-- videos 버킷 (공개)
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict do nothing;

-- Storage 정책: 공개 읽기
create policy "Public read thumbnails"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

create policy "Public read videos"
  on storage.objects for select
  using (bucket_id = 'videos');

-- Storage 정책: 인증 사용자 업로드/삭제
create policy "Auth upload thumbnails"
  on storage.objects for insert
  with check (bucket_id = 'thumbnails' and auth.role() = 'authenticated');

create policy "Auth delete thumbnails"
  on storage.objects for delete
  using (bucket_id = 'thumbnails' and auth.role() = 'authenticated');

create policy "Auth upload videos"
  on storage.objects for insert
  with check (bucket_id = 'videos' and auth.role() = 'authenticated');

create policy "Auth delete videos"
  on storage.objects for delete
  using (bucket_id = 'videos' and auth.role() = 'authenticated');
