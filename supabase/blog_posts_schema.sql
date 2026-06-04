create extension if not exists pgcrypto;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_status on public.blog_posts(status);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_published_at on public.blog_posts(published_at desc);

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_blog_posts_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
on public.blog_posts
for select
using (status = 'published');

drop policy if exists "Authenticated users can manage blog posts" on public.blog_posts;
create policy "Authenticated users can manage blog posts"
on public.blog_posts
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

