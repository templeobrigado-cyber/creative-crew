-- ============================================================
-- Supabase Storage セットアップ
-- Supabase ダッシュボード > SQL Editor で実行してください
-- ============================================================

-- ① site-assets バケット（ロゴ・ファビコン用）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,           -- 公開バケット（画像URLを直接表示するため）
  5242880,        -- 5MB 上限
  ARRAY['image/png','image/jpeg','image/svg+xml','image/webp','image/x-icon','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- ② article-images バケット（記事内画像用）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  10485760,       -- 10MB 上限
  ARRAY['image/png','image/jpeg','image/gif','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- ③ site-assets の RLS ポリシー
-- 既存ポリシーを削除してから再作成
DROP POLICY IF EXISTS "site-assets: anon select" ON storage.objects;
DROP POLICY IF EXISTS "site-assets: anon insert" ON storage.objects;
DROP POLICY IF EXISTS "site-assets: anon update" ON storage.objects;
DROP POLICY IF EXISTS "site-assets: anon delete" ON storage.objects;

-- 誰でも閲覧可（公開画像）
CREATE POLICY "site-assets: anon select"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-assets');

-- アップロード許可（管理画面から使用）
CREATE POLICY "site-assets: anon insert"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'site-assets');

-- 更新・削除許可
CREATE POLICY "site-assets: anon update"
  ON storage.objects FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'site-assets');

CREATE POLICY "site-assets: anon delete"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'site-assets');

-- ④ article-images の RLS ポリシー
DROP POLICY IF EXISTS "article-images: anon select" ON storage.objects;
DROP POLICY IF EXISTS "article-images: anon insert" ON storage.objects;
DROP POLICY IF EXISTS "article-images: anon update" ON storage.objects;
DROP POLICY IF EXISTS "article-images: anon delete" ON storage.objects;

CREATE POLICY "article-images: anon select"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'article-images');

CREATE POLICY "article-images: anon insert"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'article-images');

CREATE POLICY "article-images: anon update"
  ON storage.objects FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'article-images');

CREATE POLICY "article-images: anon delete"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'article-images');

-- 確認
SELECT id, name, public, file_size_limit FROM storage.buckets ORDER BY name;
