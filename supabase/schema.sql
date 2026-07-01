-- ============================================================
-- CreativeCrew — データベーススキーマ
-- Supabase の SQL Editor で実行してください
-- ============================================================

-- ユーザー（全ロール共通）
create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  role         text not null default 'creator'
                 check (role in ('admin', 'client', 'creator')),
  name         text not null,
  email        text not null unique,
  avatar_url   text,
  line_user_id text unique,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- クリエイタープロフィール
create table if not exists creator_profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references users(id) on delete cascade,
  nickname            text,
  birth_date          date,
  prefecture          text,
  phone               text,
  occupation          text[],
  skills              text[],
  experience_years    int,
  expertise           text,
  skill_level         text check (skill_level in ('beginner','intermediate','advanced','expert')),
  portfolio_url       text,
  portfolio_pdf_url   text,
  hourly_rate_min     int,
  hourly_rate_max     int,
  available_hours     int,
  side_job_ok         boolean not null default true,
  remote_ok           boolean not null default true,
  immediate_ok        boolean not null default false,
  bio                 text,
  avg_rating          numeric(3,2) not null default 0,
  completed_count     int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ポートフォリオ作品
create table if not exists portfolio_works (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid not null references creator_profiles(id) on delete cascade,
  title        text not null,
  description  text,
  image_url    text,
  work_url     text,
  "order"      int not null default 0,
  created_at   timestamptz not null default now()
);

-- 発注者プロフィール
create table if not exists client_profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references users(id) on delete cascade,
  company_name text,
  company_url  text,
  industry     text,
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 案件カテゴリ
create table if not exists project_categories (
  id      uuid primary key default gen_random_uuid(),
  name    text not null unique,
  icon    text not null default 'Briefcase',
  "order" int not null default 0
);

-- 案件
create table if not exists projects (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references users(id),
  admin_id          uuid references users(id),
  category_id       uuid references project_categories(id) on delete set null,
  title             text not null,
  description       text not null default '',
  required_skills   text[],
  preferred_skills  text[],
  budget_min        int,
  budget_max        int,
  deadline          date,
  headcount         int not null default 1,
  remote_ok         boolean not null default true,
  work_conditions   text,
  attachment_url    text,
  status            text not null default 'draft'
                      check (status in ('draft','open','screening','contracted','completed','closed')),
  application_count int not null default 0,
  referred_count    int not null default 0,
  hired_count       int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 案件振り分け（管理者がクリエイターを指定）
create table if not exists project_targets (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  creator_id    uuid not null references users(id) on delete cascade,
  notified_at   timestamptz,
  notify_status text not null default 'pending'
                  check (notify_status in ('pending','sent','failed')),
  created_at    timestamptz not null default now(),
  unique (project_id, creator_id)
);

-- 応募
create table if not exists applications (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references projects(id) on delete cascade,
  creator_id         uuid not null references users(id) on delete cascade,
  message            text,
  proposed_rate      int,
  application_status text not null default 'pending'
                       check (application_status in ('pending','reviewing','offered','accepted','rejected','withdrawn')),
  applied_via        text not null default 'web'
                       check (applied_via in ('web','line')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (project_id, creator_id)
);

-- 契約
create table if not exists contracts (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id),
  creator_id      uuid not null references users(id),
  contract_status text not null default 'pending'
                    check (contract_status in ('pending','active','completed','cancelled')),
  start_date      date,
  end_date        date,
  agreed_rate     int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 評価
create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id),
  reviewer_id  uuid not null references users(id),
  reviewee_id  uuid not null references users(id),
  score        int not null check (score between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  unique (project_id, reviewer_id, reviewee_id)
);

-- 通知ログ
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  is_read    boolean not null default false,
  sent_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table users              enable row level security;
alter table creator_profiles   enable row level security;
alter table portfolio_works    enable row level security;
alter table client_profiles    enable row level security;
alter table project_categories enable row level security;
alter table projects           enable row level security;
alter table project_targets    enable row level security;
alter table applications       enable row level security;
alter table contracts          enable row level security;
alter table reviews            enable row level security;
alter table notifications      enable row level security;

-- MVP暫定ポリシー（Supabase Auth本格導入前）
create policy "all read users"               on users              for select using (true);
create policy "all write users"              on users              for all    using (true) with check (true);
create policy "all read creator_profiles"    on creator_profiles   for select using (true);
create policy "all write creator_profiles"   on creator_profiles   for all    using (true) with check (true);
create policy "all read portfolio_works"     on portfolio_works    for select using (true);
create policy "all write portfolio_works"    on portfolio_works    for all    using (true) with check (true);
create policy "all read client_profiles"     on client_profiles    for select using (true);
create policy "all write client_profiles"    on client_profiles    for all    using (true) with check (true);
create policy "all read project_categories"  on project_categories for select using (true);
create policy "all write project_categories" on project_categories for all    using (true) with check (true);
create policy "all read projects"            on projects           for select using (true);
create policy "all write projects"           on projects           for all    using (true) with check (true);
create policy "all read project_targets"     on project_targets    for select using (true);
create policy "all write project_targets"    on project_targets    for all    using (true) with check (true);
create policy "all read applications"        on applications       for select using (true);
create policy "all write applications"       on applications       for all    using (true) with check (true);
create policy "all read contracts"           on contracts          for select using (true);
create policy "all write contracts"          on contracts          for all    using (true) with check (true);
create policy "all read reviews"             on reviews            for select using (true);
create policy "all write reviews"            on reviews            for all    using (true) with check (true);
create policy "all read notifications"       on notifications      for select using (true);
create policy "all write notifications"      on notifications      for all    using (true) with check (true);

-- ============================================================
-- シードデータ
-- ============================================================

insert into project_categories (id, name, icon, "order") values
  ('10000000-0000-0000-0000-000000000001', 'イラスト・キャラクターデザイン', 'Palette',   1),
  ('10000000-0000-0000-0000-000000000002', 'グラフィックデザイン',           'PenTool',   2),
  ('10000000-0000-0000-0000-000000000003', 'WEBデザイン・UI/UX',             'Monitor',   3),
  ('10000000-0000-0000-0000-000000000004', '動画・映像制作',                 'Video',     4),
  ('10000000-0000-0000-0000-000000000005', '3DCG・アニメーション',           'Box',       5),
  ('10000000-0000-0000-0000-000000000006', 'ライティング・コピー',           'FileText',  6),
  ('10000000-0000-0000-0000-000000000007', '写真・カメラ',                   'Camera',    7),
  ('10000000-0000-0000-0000-000000000008', '音楽・サウンド',                 'Music',     8),
  ('10000000-0000-0000-0000-000000000009', 'VTuber・バーチャル',             'Star',      9),
  ('10000000-0000-0000-0000-000000000010', 'その他',                         'Briefcase',10)
on conflict (name) do nothing;

insert into users (id, role, name, email) values
  ('00000000-0000-0000-0000-000000000001', 'admin',   '管理者',             'admin@creativecrew.jp'),
  ('00000000-0000-0000-0000-000000000002', 'client',  'サンプル発注者',     'client@example.com'),
  ('00000000-0000-0000-0000-000000000003', 'creator', 'サンプルクリエイター', 'creator@example.com')
on conflict (email) do nothing;

insert into creator_profiles (user_id, nickname, occupation, skills, experience_years, skill_level, remote_ok, immediate_ok, bio) values
  (
    '00000000-0000-0000-0000-000000000003',
    'クリエイターA',
    ARRAY['イラストレーター', 'グラフィックデザイナー'],
    ARRAY['Photoshop', 'Illustrator', 'Procreate'],
    5, 'advanced', true, false,
    'キャラクターデザインとイラスト制作が得意です。'
  )
on conflict (user_id) do nothing;

insert into client_profiles (user_id, company_name) values
  ('00000000-0000-0000-0000-000000000002', 'サンプル株式会社')
on conflict (user_id) do nothing;
