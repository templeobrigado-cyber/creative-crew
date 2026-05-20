-- ============================================================
-- FAQ-CMS テーブル定義
-- Supabase の SQL Editor で実行してください
-- ============================================================

-- カテゴリ
create table if not exists category (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  icon        text not null default 'HelpCircle',
  parent_id   uuid references category(id) on delete set null,
  "order"     int  not null default 0,
  created_at  timestamptz not null default now()
);

-- タグ
create table if not exists tag (
  id    uuid primary key default gen_random_uuid(),
  slug  text not null unique,
  name  text not null,
  color text,
  icon  text
);

-- 記事
create table if not exists article (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid references category(id) on delete set null,
  slug             text not null unique,
  title            text not null,
  lead             text not null default '',
  status           text not null default 'draft'
                     check (status in ('draft','review','published','unpublished')),
  published_at     timestamptz,
  view_count       int  not null default 0,
  helpful_count    int  not null default 0,
  unhelpful_count  int  not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  created_by       text not null default 'admin'
);

-- 記事セクション
create table if not exists article_section (
  id              uuid primary key default gen_random_uuid(),
  article_id      uuid not null references article(id) on delete cascade,
  "order"         int  not null default 0,
  type            text not null default 'overview'
                    check (type in ('overview','analysis','procedure','troubleshoot','note','media')),
  title           text not null default '',
  subtitle        text,
  body_md         text not null default '',
  media_url       text,
  media_provider  text check (media_provider in ('youtube','vimeo','image'))
);

-- 記事タグ（多対多）
create table if not exists article_tag (
  article_id  uuid not null references article(id) on delete cascade,
  tag_id      uuid not null references tag(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- フィードバック
create table if not exists feedback (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references article(id) on delete cascade,
  is_helpful  boolean not null,
  comment     text,
  session_id  text not null,
  created_at  timestamptz not null default now()
);

-- 検索クエリログ
create table if not exists search_query (
  id                  uuid primary key default gen_random_uuid(),
  query               text not null,
  result_count        int  not null default 0,
  clicked_article_id  uuid references article(id) on delete set null,
  session_id          text not null,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- RLS (Row Level Security) 設定
-- ============================================================

alter table category       enable row level security;
alter table tag             enable row level security;
alter table article        enable row level security;
alter table article_section enable row level security;
alter table article_tag    enable row level security;
alter table feedback       enable row level security;
alter table search_query   enable row level security;

-- 公開テーブル：匿名ユーザーが読める
create policy "public read categories"
  on category for select using (true);

create policy "public read tags"
  on tag for select using (true);

create policy "public read published articles"
  on article for select using (status = 'published');

create policy "public read article sections"
  on article_section for select using (
    exists (
      select 1 from article
      where article.id = article_section.article_id
        and article.status = 'published'
    )
  );

create policy "public read article tags"
  on article_tag for select using (true);

-- 管理画面：全ステータスの記事・セクションを読める
create policy "admin read all articles"
  on article for select using (true);

create policy "admin read all article sections"
  on article_section for select using (true);

-- 管理画面：記事の書き込み（V1プロトタイプ用 - Supabase Auth導入前の暫定ポリシー）
create policy "admin insert articles"
  on article for insert with check (true);

create policy "admin update articles"
  on article for update using (true) with check (true);

create policy "admin delete articles"
  on article for delete using (true);

-- 管理画面：セクションの書き込み
create policy "admin insert article sections"
  on article_section for insert with check (true);

create policy "admin update article sections"
  on article_section for update using (true) with check (true);

create policy "admin delete article sections"
  on article_section for delete using (true);

-- カテゴリ・タグの書き込み
create policy "admin write categories"
  on category for all using (true) with check (true);

create policy "admin write tags"
  on tag for all using (true) with check (true);

-- フィードバック・検索ログ：匿名ユーザーが書き込める
create policy "public insert feedback"
  on feedback for insert with check (true);

create policy "public insert search query"
  on search_query for insert with check (true);

-- ============================================================
-- シードデータ
-- ============================================================

insert into category (id, slug, name, icon, parent_id, "order") values
  ('00000000-0000-0000-0000-000000000001', 'features',        '機能説明',             'Settings',   null, 1),
  ('00000000-0000-0000-0000-000000000002', 'billing',         '契約・支払方法',       'FileText',   null, 2),
  ('00000000-0000-0000-0000-000000000003', 'account',         'アカウント',           'User',       null, 3),
  ('00000000-0000-0000-0000-000000000004', 'troubleshooting', 'トラブルシューティング','Wrench',     null, 4),
  ('00000000-0000-0000-0000-000000000005', 'pricing',         '料金プラン',           'CreditCard', null, 5),
  ('00000000-0000-0000-0000-000000000006', 'other',           'その他',               'HelpCircle', null, 6),
  ('00000000-0000-0000-0000-000000000007', 'account-settings',    'アカウント設定',   'User',    '00000000-0000-0000-0000-000000000003', 1),
  ('00000000-0000-0000-0000-000000000008', 'display-settings',    '表示設定',         'Settings','00000000-0000-0000-0000-000000000003', 2),
  ('00000000-0000-0000-0000-000000000009', 'privacy-settings',    'プライバシー設定', 'Settings','00000000-0000-0000-0000-000000000003', 3),
  ('00000000-0000-0000-0000-000000000010', 'notification-settings','通知設定',        'Bell',    '00000000-0000-0000-0000-000000000003', 4)
on conflict (slug) do nothing;

insert into article (id, category_id, slug, title, lead, status, published_at, view_count, helpful_count, unhelpful_count) values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'password-reset',
    'パスワードの変更とリセット',
    'セキュリティを保つため、定期的なパスワード変更をおすすめします。パスワードを忘れた場合のリセット方法も解説します。',
    'published',
    now(),
    1240, 98, 5
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'cannot-login-solution',
    'ログインできない場合の対処方法',
    'ログインできない場合の一般的な原因と解決方法について説明します。',
    'published',
    now(),
    890, 76, 8
  )
on conflict (slug) do nothing;

insert into article_section (article_id, "order", type, title, subtitle, body_md) values
  (
    '10000000-0000-0000-0000-000000000001', 1, 'overview',
    '概要', 'パスワード管理の基本',
    '以下の2つの操作をカバーしています：\n\n- **パスワード変更**：現在のパスワードがわかる場合\n- **パスワードリセット**：パスワードを忘れた場合'
  ),
  (
    '10000000-0000-0000-0000-000000000001', 2, 'procedure',
    'パスワードの変更手順', '現在のパスワードがわかる場合',
    '1. 右上のアカウントアイコンをクリック\n2. 「アカウント設定」を選択\n3. 「セキュリティ」タブをクリック\n4. 「パスワードを変更」ボタンをクリック\n5. 現在のパスワードと新しいパスワードを入力\n6. 「保存」をクリック'
  ),
  (
    '10000000-0000-0000-0000-000000000001', 3, 'note',
    '安全なパスワードのガイドライン', null,
    '- 8文字以上\n- 英大文字・小文字・数字・記号を組み合わせる\n- 他のサービスと同じパスワードを使い回さない'
  ),
  (
    '10000000-0000-0000-0000-000000000002', 1, 'overview',
    '概要', 'ログイン問題の一般的な原因',
    '以下のような原因が考えられます：\n\n- パスワードの入力ミス\n- Caps Lockキーがオン\n- ブラウザのキャッシュ問題\n- アカウントのロック'
  ),
  (
    '10000000-0000-0000-0000-000000000002', 2, 'procedure',
    '解決手順', 'ステップバイステップ',
    '1. パスワードを再確認する\n2. Caps Lockキーを確認する\n3. ブラウザのキャッシュをクリアする\n4. パスワードリセットを試す'
  );
