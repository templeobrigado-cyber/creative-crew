import type { Category, Tag, Article, ArticleSection } from '../types'

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', slug: 'features',        name: '機能説明',             icon: 'Settings',    parent_id: null, order: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-2', slug: 'billing',         name: '契約・支払方法',       icon: 'FileText',    parent_id: null, order: 2, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-3', slug: 'account',         name: 'アカウント',           icon: 'User',        parent_id: null, order: 3, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-4', slug: 'troubleshooting', name: 'トラブルシューティング', icon: 'Wrench',      parent_id: null, order: 4, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-5', slug: 'pricing',         name: '料金プラン',           icon: 'CreditCard',  parent_id: null, order: 5, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-6', slug: 'other',           name: 'その他',               icon: 'HelpCircle',  parent_id: null, order: 6, created_at: '2026-01-01T00:00:00Z' },
  // サブカテゴリ
  { id: 'cat-3-1', slug: 'account-settings', name: 'アカウント設定', icon: 'User', parent_id: 'cat-3', order: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-3-2', slug: 'display-settings', name: '表示設定',       icon: 'Settings', parent_id: 'cat-3', order: 2, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-3-3', slug: 'privacy-settings', name: 'プライバシー設定', icon: 'Settings', parent_id: 'cat-3', order: 3, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cat-3-4', slug: 'notification-settings', name: '通知設定',  icon: 'Bell',    parent_id: 'cat-3', order: 4, created_at: '2026-01-01T00:00:00Z' },
]

export const MOCK_TAGS: Tag[] = [
  { id: 'tag-1', slug: 'login',             name: 'ログイン' },
  { id: 'tag-2', slug: 'troubleshooting',   name: 'トラブルシューティング' },
  { id: 'tag-3', slug: 'password',          name: 'パスワード' },
  { id: 'tag-4', slug: 'account',           name: 'アカウント' },
  { id: 'tag-5', slug: 'billing',           name: '支払い' },
  { id: 'tag-6', slug: 'security',          name: 'セキュリティ' },
]

const MOCK_SECTIONS_PASSWORD: ArticleSection[] = [
  {
    id: 'sec-1', article_id: 'art-1', order: 1,
    type: 'overview',
    title: '概要',
    subtitle: 'パスワード管理の基本',
    body_md: '以下の2つの操作をカバーしています：\n\n- **パスワード変更**：現在のパスワードがわかる場合\n- **パスワードリセット**：パスワードを忘れた場合'
  },
  {
    id: 'sec-2', article_id: 'art-1', order: 2,
    type: 'procedure',
    title: 'パスワードの変更手順',
    subtitle: '現在のパスワードがわかる場合',
    body_md: '1. 右上のアカウントアイコンをクリック\n2. 「アカウント設定」を選択\n3. 「セキュリティ」タブをクリック\n4. 「パスワードを変更」ボタンをクリック\n5. 現在のパスワードと新しいパスワードを入力\n6. 「保存」をクリック'
  },
  {
    id: 'sec-3', article_id: 'art-1', order: 3,
    type: 'procedure',
    title: 'パスワードのリセット手順',
    subtitle: 'パスワードを忘れた場合',
    body_md: '1. ログイン画面で「パスワードを忘れた方はこちら」をクリック\n2. 登録済みのメールアドレスを入力\n3. 送信されたメールのリンクをクリック\n4. 新しいパスワードを設定'
  },
  {
    id: 'sec-4', article_id: 'art-1', order: 4,
    type: 'note',
    title: '安全なパスワードのガイドライン',
    body_md: '- 8文字以上\n- 英大文字・小文字・数字・記号を組み合わせる\n- 他のサービスと同じパスワードを使い回さない\n- 定期的に変更することを推奨'
  },
]

const MOCK_SECTIONS_LOGIN: ArticleSection[] = [
  {
    id: 'sec-5', article_id: 'art-2', order: 1,
    type: 'overview',
    title: '概要',
    subtitle: 'ログイン問題の一般的な原因',
    body_md: '以下のような原因が考えられます：\n\n- パスワードの入力ミス\n- Caps Lockキーがオン\n- ブラウザのキャッシュ問題\n- アカウントのロック'
  },
  {
    id: 'sec-6', article_id: 'art-2', order: 2,
    type: 'procedure',
    title: '解決手順',
    subtitle: 'ステップバイステップ',
    body_md: '1. パスワードを再確認する\n2. Caps Lockキーを確認する\n3. ブラウザのキャッシュをクリアする\n4. パスワードリセットを試す\n5. サポートに連絡する'
  },
  {
    id: 'sec-7', article_id: 'art-2', order: 3,
    type: 'troubleshoot',
    title: 'それでも解決しない場合',
    body_md: '上記の手順を試してもログインできない場合は、アカウントがロックされている可能性があります。\n\nサポートへお問い合わせください。'
  },
]

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'art-1',
    category_id: 'cat-3',
    slug: 'password-reset',
    title: 'パスワードの変更とリセット',
    lead: 'セキュリティを保つため、定期的なパスワード変更をおすすめします。パスワードを忘れた場合のリセット方法も解説します。',
    status: 'published',
    published_at: '2026-01-15T00:00:00Z',
    view_count: 1240,
    helpful_count: 98,
    unhelpful_count: 5,
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
    created_by: 'admin',
    tags: [MOCK_TAGS[2], MOCK_TAGS[3], MOCK_TAGS[5]],
    sections: MOCK_SECTIONS_PASSWORD,
  },
  {
    id: 'art-2',
    category_id: 'cat-3',
    slug: 'cannot-login-solution',
    title: 'ログインできない場合の対処方法',
    lead: 'ログインできない場合の一般的な原因と解決方法について説明します。',
    status: 'published',
    published_at: '2026-01-20T00:00:00Z',
    view_count: 890,
    helpful_count: 76,
    unhelpful_count: 8,
    created_at: '2026-01-18T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
    created_by: 'admin',
    tags: [MOCK_TAGS[0], MOCK_TAGS[1]],
    sections: MOCK_SECTIONS_LOGIN,
  },
  {
    id: 'art-3',
    category_id: 'cat-3',
    slug: 'two-factor-auth',
    title: '2段階認証の設定方法',
    lead: 'アカウントのセキュリティを強化するため、2段階認証の設定方法を説明します。',
    status: 'published',
    published_at: '2026-02-01T00:00:00Z',
    view_count: 654,
    helpful_count: 62,
    unhelpful_count: 3,
    created_at: '2026-01-28T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
    created_by: 'admin',
    tags: [MOCK_TAGS[3], MOCK_TAGS[5]],
    sections: [],
  },
  {
    id: 'art-4',
    category_id: 'cat-3',
    slug: 'profile-change',
    title: 'プロフィール情報の変更方法',
    lead: 'アカウントのプロフィール情報（名前、メールアドレス等）を変更する方法を説明します。',
    status: 'published',
    published_at: '2026-02-05T00:00:00Z',
    view_count: 430,
    helpful_count: 41,
    unhelpful_count: 2,
    created_at: '2026-02-03T00:00:00Z',
    updated_at: '2026-02-05T00:00:00Z',
    created_by: 'admin',
    tags: [MOCK_TAGS[3]],
    sections: [],
  },
  {
    id: 'art-5',
    category_id: 'cat-2',
    slug: 'payment-methods',
    title: '支払い方法の変更',
    lead: 'クレジットカードや銀行振込など、支払い方法の変更手順を説明します。',
    status: 'draft',
    published_at: null,
    view_count: 0,
    helpful_count: 0,
    unhelpful_count: 0,
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-02-10T00:00:00Z',
    created_by: 'admin',
    tags: [MOCK_TAGS[4]],
    sections: [],
  },
]
