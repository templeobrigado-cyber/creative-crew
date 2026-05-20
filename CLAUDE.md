# FAQ-CMS デザイン＆実装コンテキスト v0.2

**最終更新**：2026-05-19
**目的**：本ドキュメントはFigma MakeプロトタイプおよびClaude Codeでの実装の双方で参照される単一のソース・オブ・トゥルース。プロジェクトに参加する全員（デザイナー／エンジニア／Claude Code）が最初に読むべきもの。

> **v0.2 変更サマリ**：Figma Makeで生成されたプロトタイプ実装（React+Vite）をベースに、カラートークン・アイコンライブラリ・ディレクトリ構成・管理画面仕様を更新。本番実装はNext.js 15に移行予定。

---

## 1. プロジェクト概要

- 事業者がクライアント企業向けに提供する**B2B SaaS型のFAQ-CMS**
- Faber Help Center（mieru-ca）の構造を踏襲、**Amber（琥珀）ベース**の独自デザイン
- V1は**AI機能なし**で「シンプルで実用的なFAQ-CMS」として勝負。AI機能はV3で投入

ターゲット：中小〜中堅企業のCS／マーケ部門。Helpfeelより低価格・低運用負荷で導入できることを売りに。

---

## 2. デザイン基本方針

### 2.1 ベンチマーク参照
| 役割 | サイト | 参照ポイント |
|---|---|---|
| 機能の幅と訴求軸 | Helpfeel（helpfeel.com） | プロダクトラインの広げ方、AI訴求 |
| レイアウト構造の模範 | Faber Help Center（mieru-ca） | 画面構成、UI密度、シンプルさ |

### 2.2 デザインフィロソフィー
- **シンプル・実用優先**：装飾を最小限に、情報設計重視
- **温かみのある親しみやすさ**：Amber色で柔らかい印象
- **フラット・クリーン**：グラデーション・シャドウは最小限（ヘッダー/フッターのみグラデーション使用）
- **B2B SaaSとしての信頼性**：プロフェッショナルな見た目、過度なポップさは避ける

---

## 3. デザイントークン

### 3.1 カラーパレット

> ★ v0.2更新：Figma Make実装値に統一。旧値（#BA7517系）は破棄。

#### Primary（Amber）
| CSS変数 | HEX | 主な用途 |
|---|---|---|
| `--amber-50` | `#FFF8E7` | セクションカードの背景 |
| `--amber-100` | `#FFE8B3` | 薄いアクセント |
| `--amber-200` | `#FFD480` | 中間アクセント |
| `--amber-400` | `#FFB84D` | サブブランドカラー、アクティブボーダー |
| `--amber-600` | `#FF9D1A` | ヘッダー・フッター・メインブランド色 |
| `--amber-800` | `#E68A00` | CTAボタン、重要リンク |
| `--amber-900` | `#B36B00` | 最深色（特殊用途） |

#### Accent（Coral）
| CSS変数 | HEX | 主な用途 |
|---|---|---|
| `--coral-400` | `#D85A30` | 削除ボタン、警告、`media`タイプバッジ |

#### Neutral（Gray）
| CSS変数 | HEX | 主な用途 |
|---|---|---|
| `--gray-50` | `#FAF8F3` | ミュートされた背景 |
| `--gray-200` | `#C9C7BE` | ボーダー（強調） |
| `--gray-300` | `#E0DED5` | ボーダー（デフォルト） |
| `--gray-600` | `#6B6961` | 補助テキスト |
| `--gray-900` | `#2C2C2A` | 主要テキスト |

#### その他
| CSS変数 | HEX | 主な用途 |
|---|---|---|
| `--background` | `#FBF9F4` | ページ背景 |
| `--card` | `#FFFFFF` | カード背景 |

#### Tailwind設定（`tailwind.config.ts`）
```ts
theme: {
  extend: {
    colors: {
      amber: {
        50:  '#FFF8E7',
        100: '#FFE8B3',
        200: '#FFD480',
        400: '#FFB84D',
        600: '#FF9D1A',
        800: '#E68A00',
        900: '#B36B00',
      },
      coral: { 400: '#D85A30' },
      gray: {
        50:  '#FAF8F3',
        200: '#C9C7BE',
        300: '#E0DED5',
        600: '#6B6961',
        900: '#2C2C2A',
      },
    },
    fontFamily: {
      sans: ['"Noto Sans JP"', 'sans-serif'],
    },
  },
}
```

### 3.2 タイポグラフィ

- **フォント**：Noto Sans JP（400 / 500 の2ウェイトのみ）
- `h1`〜`h4`タグは `theme.css` で定義済み。`text-xl`等のTailwindクラスは極力使わない

| タグ | サイズ | ウェイト | 行間 |
|---|---|---|---|
| h1 | 28px | 500 | 1.4 |
| h2 | 22px | 500 | 1.5 |
| h3 | 18px | 500 | 1.6 |
| h4 | 16px | 500 | 1.6 |
| body（p） | 16px | 400 | 1.7 |
| small | 14px | 400 | 1.6 |
| xs | 12px | 400 | 1.5 |

### 3.3 スペーシング
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80（px）の10段階。

### 3.4 角丸
| トークン | 値 | 用途 |
|---|---|---|
| `--radius-sm` / `rounded-sm` | 4px | ボタン、バッジ、検索ボックス |
| `--radius-md` / `rounded-md` | 8px | カード、入力欄 |
| `--radius-lg` / `rounded-lg` | 12px | 大きなカード、モーダル |

### 3.5 ボーダー
- デフォルト：`border-gray-300`（`#E0DED5`）
- 強調：`border-gray-200`（`#C9C7BE`）
- フォーカス・選択中：`border-amber-400`（`#FFB84D`）＋ `ring-4 ring-amber-300/30`

### 3.6 シャドウ
- カード・パネル：`shadow-sm`〜`shadow-md`（控えめに）
- モーダル：`shadow-2xl`
- ヘッダー・フッター：`shadow-md`
- フォーカスリング以外の目的で使う場合は必要最小限に

---

## 4. レイアウトグリッド

### 4.1 ブレイクポイント
| 名前 | 範囲 |
|---|---|
| mobile | ～ 640px |
| tablet | 640 ～ 1024px |
| desktop | 1024 ～ 1440px |
| wide | 1440px ～ |

### 4.2 コンテンツ最大幅
- 公開サイト：`max-w-[1200px]` 中央寄せ
- 管理画面：フルワイドにサイドナビ（240px）＋ メインエリア

### 4.3 パディング
```
mobile:  px-6       (24px)
tablet:  md:px-8    (32px)
desktop: lg:px-12   (48px)
```

---

## 5. 共通コンポーネント

### 5.1 ヘッダー

**Type A：トップページ用（ヒーロー一体型）**
- 高さ：ヒーロー込みで約280px
- 背景：`amber-600`
- 内容：ロゴ ＋ サブタイトル「FAQ よくあるご質問」＋ 戻るボタン（右上）
- ヒーロー：「どんなことでお困りですか？」＋ 大きな検索ボックス（中央配置、最大幅480px）

**Type B：一般ページ用（コンパクト）**
- 高さ：約56px
- 背景：`amber-600`
- 内容：ロゴ ＋ サブタイトル ＋ 検索ボックス（横長、flex: 1）＋ 戻るボタン

### 5.2 フッター
**通常版**：メインカテゴリリンク（左）＋ "Back to 〇〇"（右）、背景 `amber-600`

**シンプル版（トップページ用）**：`Privacy Policy / Terms / Conditions` ＋ Copyright

### 5.3 カテゴリカード（トップページ用）
- 背景：white、ボーダー `border-gray-300`、角丸 `md`
- アイコン（52px、Lucide、color: `amber-600`）＋ カテゴリ名（h3）＋ CTAボタン「See Articles」
- デフォルト6カテゴリ：Settings / FileText / User / Wrench / CreditCard / HelpCircle

### 5.4 カテゴリヘッダー（カテゴリ詳細ページ用）
- 高さ：約200px、背景：`gray-50`
- 大型アイコン（64px）＋ カテゴリ名（h1）＋ パンくず

### 5.5 アコーディオン（サブカテゴリ用）
- 各行：高さ56px、ボーダー `border-gray-300`
- 展開ボタン：`ChevronDown`/`ChevronUp`（Lucide）
- デフォルト全閉、複数同時展開OK

### 5.6 セクションカード（記事詳細用） ★差別化機能

背景：`amber-50`、角丸 `md`、パディング 20px、2カラムレイアウト（左：テキスト、右：ビジュアル）

| タイプ | バッジ色 | 用途 |
|---|---|---|
| `overview` | 青 | 概要・全体説明 |
| `analysis` | 緑 | 分析・比較 |
| `procedure` | オレンジ | 手順 |
| `troubleshoot` | 赤 | トラブルシューティング |
| `note` | 黄 | 注意・補足 |
| `media` | 紫 | 動画・画像中心 |

### 5.7 検索ボックス

**Hero variant**（h-12）：検索アイコン付き、左側配置、フォーカス時 `border-amber-400` + `ring-4 ring-amber-300/30`

**Header variant**（h-10）：アイコンなし、コンパクト

共通：クリアボタン（X）は入力時のみ表示。`[&::-webkit-search-cancel-button]:appearance-none` で標準ボタン非表示。サジェスト（最近の検索 `Clock` / 人気の検索 `TrendingUp`）付きドロップダウン。

```css
/* Selectのカスタム矢印 */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,...");
  background-position: right 0.75rem center;
  background-size: 1.5rem 1.5rem;
  padding-right: 3rem;
}
```

### 5.8 ボタン

| バリアント | スタイル |
|---|---|
| Primary（CTA） | `bg-amber-800` / white text / `hover:bg-amber-900` / `rounded-sm` |
| Secondary | `bg-white` / `border-gray-300` / `gray-900` text / `hover:bg-gray-50` |
| Ghost | `bg-transparent` / `amber-600` text / `hover:bg-amber-50` |

### 5.9 バッジ・タグ
- 高さ：22〜24px、パディング：3px 10px、角丸：sm
- `default`：`gray-200` bg / `gray-900` text
- `amber`：`amber-600` bg / white text
- `coral`：`coral-400` bg / white text

### 5.10 パンくずナビ
- 12〜13px / セパレータ：` / `（`gray-200`）
- リンク色：`amber-600`、最終アイテムは `gray-900`

### 5.11 フィードバックウィジェット
- 「この記事は役に立ちましたか？」＋ 「はい」「いいえ」（ThumbsUp / ThumbsDown、Lucide）
- 「いいえ」押下 → コメント入力欄展開
- 送信後 → 「フィードバックありがとうございます」

### 5.12 動画埋込
- アスペクト比 16:9 維持、iframe埋込
- YouTube：`youtube.com/watch?v=*` / `youtu.be/*`
- Vimeo：`vimeo.com/*`
- 不明URL：「対応外のURLです」エラー表示

### 5.13 KPIカード（管理画面用）
- 背景 `gray-50`、角丸 `md`、パディング 16px
- ラベル（13px、`gray-600`）→ 数値（24px、500）→ 増減（small、上昇=緑/下降=赤）

### 5.14 データテーブル（管理画面用）
- ヘッダー：背景 `gray-50`、13px medium
- 行：`border-b border-gray-300`、`hover:bg-gray-50`、パディング 12px 16px
- 行全体がクリッカブル（cursor-pointer）

### 5.15 サイドナビ（管理画面用）
- 幅 240px、背景 `gray-900`、テキスト white
- アクティブ：`border-l-2 border-amber-400 bg-gray-800`
- アイコン（20px Lucide）＋ ラベル

### 5.16 モーダル・確認ダイアログ
- オーバーレイ：`bg-black/50`
- カード：`bg-white rounded-lg shadow-2xl`
- アクションに応じた色分け（削除=赤、確認=amber）

---

## 6. アイコン

> ★ v0.2更新：Tabler Icons → **Lucide React** に変更（Figma Make実装に合わせる）

```bash
pnpm add lucide-react
```

主要アイコン：
- Navigation: `ArrowLeft`, `ChevronDown`, `ChevronRight`, `ChevronUp`
- Actions: `Plus`, `Edit`, `Trash2`, `Eye`, `Search`, `X`
- Status: `CheckCircle`, `AlertTriangle`, `Clock`, `TrendingUp`, `Loader`
- Settings: `Settings`, `User`, `Mail`, `Bell`, `LogOut`
- Content: `FileText`, `Wrench`, `CreditCard`, `HelpCircle`, `GripVertical`
- Feedback: `ThumbsUp`, `ThumbsDown`
- Media: `Play`

---

## 7. 画面一覧

### 7.1 公開FAQサイト
| ID | 画面 | 優先 | ファイル |
|---|---|---|---|
| F-01 | トップページ | ★★★ | `TopPage.tsx` |
| F-02 | 検索結果ページ | ★★ | `SearchResultPage.tsx` |
| F-03 | カテゴリ詳細ページ | ★★★ | `CategoryDetailPage.tsx` |
| F-04 | 記事詳細ページ | ★★★ | `ArticleDetailPage.tsx` |
| F-05 | お問い合わせ | ★ | `ContactPage.tsx` |
| F-06 | 404 / エラーページ | ★ | `NotFoundPage.tsx` |

### 7.2 管理画面

> ★ v0.2更新：Figma Make実装に合わせて画面IDを整理

| ID | 画面 | 優先 | ファイル |
|---|---|---|---|
| M-01 | ログイン | ★★ | `LoginPage.tsx` |
| M-02 | ダッシュボード | ★★★ | `DashboardPage.tsx` |
| M-03 | 記事一覧 | ★★★ | `ArticleListPage.tsx` |
| M-04 | 記事エディタ（セクションカード型） | ★★★ | `ArticleEditorPage.tsx` |
| M-05 | カテゴリ管理 | ★★ | `CategoryManagementPage.tsx` |
| M-06 | タグ管理 | ★ | `TagManagementPage.tsx` |
| M-07 | ユーザー管理 | ★ | `UserManagementPage.tsx` |
| M-08 | 分析 | ★ | `AnalyticsPage.tsx` |
| M-09 | ヒット0クエリ一覧 | ★★ | `ZeroHitQueriesPage.tsx` |
| M-10 | フィードバック一覧 | ★ | `FeedbackPage.tsx` |
| M-11 | 設定（9タブ） | ★★ | `SettingsPage.tsx` |

### 7.3 SaaS運営者バックオフィス（V2以降）
B-01〜B-06（テナント管理・プラン・請求）

★★★ = V1 MVPで必須 / ★★ = V1で実装 / ★ = V1.5で実装

---

## 8. 画面別の詳細仕様

### 8.1 F-01 トップページ
- ヘッダーType A（ヒーロー一体型）
- カテゴリカード × 6（3列×2行グリッド）
- シンプルフッター

### 8.2 F-02 検索結果ページ
- コンパクトヘッダー with 検索ボックス
- フィルター（カテゴリ、ステータス）
- 検索結果一覧（スニペット付き）＋ ページネーション

### 8.3 F-03 カテゴリ詳細ページ
- ヘッダーType B ＋ カテゴリヘッダー ＋ パンくず
- サブカテゴリアコーディオン ＋ 記事一覧

### 8.4 F-04 記事詳細ページ
- セクションカード × N（6タイプ対応）
- フィードバックウィジェット ＋ 関連記事セクション

### 8.5 F-05 お問い合わせ
- フォーム（名前・メール・種別・件名・内容・プライバシー同意）
- 送信完了画面（お問い合わせ番号表示）

### 8.6 M-01 ログインページ
- メール + パスワード認証、Amberグラデーション背景
- **開発用デフォルト**: `admin@faq-cms.example.com` / `admin123`

### 8.7 M-02 ダッシュボード
- KPIカード × 4（総記事数、公開記事、PV、検索数）
- 期間セレクター（7日/30日/90日）
- 最近のフィードバック一覧 ＋ ヒット0クエリ Top5

### 8.8 M-03 記事一覧
- フィルター（検索・カテゴリ・ステータス）
- 記事テーブル（タイトル・カテゴリ・ステータス・閲覧数・更新日・作成者）
- 操作：👁 プレビュー / ✏ 編集 → M-04 / 🗑 削除（確認モーダル）

### 8.9 M-04 記事エディタ ★最重要

**左サイドバー（メタデータ）**：タイトル・スラッグ・カテゴリ・タグ・リード文・ステータス・公開日時・内部メモ

**メインエリア（セクションカードリスト）**：
- ドラッグ&ドロップ並び替え（`GripVertical` ハンドル）
- セクション追加（6タイプから選択）
- 各セクション：タイプバッジ・タイトル・サブタイトル・Markdownエディタ・メディアアップロード

**トップバー**：戻る / プレビュー / 下書き保存 / 公開

自動保存：変更後3秒 or 30秒ごと

### 8.10 M-05 カテゴリ管理
- 階層構造ツリー（大>中>小、3階層まで）
- インデント（level × 40px）、展開/折りたたみ
- 追加/編集/削除

### 8.11 M-06 タグ管理
- タグ一覧 ＋ 作成/編集サイドパネル
- カラーパレット（42色 = 7行×6列）＋ アイコン選択（6アイコン）＋ ライブプレビュー

### 8.12 M-07 ユーザー管理
- ユーザーテーブル（アバター・名前・権限・ステータス）
- 追加/編集サイドパネル（権限：admin/editor/viewer）

### 8.13 M-08 分析
- KPIカード × 5（総閲覧数・検索数・解決率・ユニークユーザー・平均滞在時間）
- デバイス内訳 ＋ 流入元 ＋ 人気ページTop8 ＋ 検索キーワードTop10

### 8.14 M-09 ヒット0クエリ
- 統計カード × 5（総クエリ数・今週・今月・未対応・対応済み）
- アクション：📝 記事化 → M-04新規 / ✅ 対応済み / 🚫 無視

### 8.15 M-10 フィードバック
- 統計カード × 5（総数・役立った・役立たなかった・コメント付き・解決率）
- コメント付き行は `amber-50` 背景ハイライト

### 8.16 M-11 設定（9タブ）
1. 一般設定（サイト名・URL・説明文・ロゴ・管理者メール）
2. 表示設定（記事数/ページ・日付形式・タイムゾーン・言語・レイアウト）
3. 検索設定（検索エンジン・サジェスト・除外ワード・最大結果数）
4. お問い合わせ設定（送信先・自動返信・フォーム項目）
5. SEO設定（タイトル・説明文・OGP・robots.txt・sitemap）
6. アナリティクス（GA・トラッキングコード）
7. テーマ設定（プライマリカラー・ヘッダー背景・カスタムCSS）
8. セキュリティ（2FA・パスワードポリシー・セッションタイムアウト）
9. 通知設定（記事公開・問い合わせ・フィードバック・ヒット0クエリ）

---

## 9. 状態管理（Reactプロトタイプ）

```typescript
// App.tsx の主要 state
currentPage: 'top' | 'category' | 'article' | 'search' | 'contact' | '404' | 'error' | 'admin' | 'login'
adminPage: 'dashboard' | 'articles' | 'categories' | 'tags' | 'users' | 'analytics' | 'zero-hit' | 'feedback' | 'settings'
isLoggedIn: boolean
articleEditorId: string | null  // 'new'=新規作成, null=一覧に戻る
```

**ページ遷移フロー**：
1. 公開サイト：`currentPage` で制御
2. 管理画面：`currentPage='admin'` + `adminPage` で制御
3. 記事エディタ：`articleEditorId !== null` のとき `ArticleEditorPage` 表示
4. ログイン：`isLoggedIn=false` 時、admin アクセスで `LoginPage` へリダイレクト

---

## 10. 技術スタック

### 10.1 Figma Makeプロトタイプ（現在）
| 領域 | 採用 |
|---|---|
| フレームワーク | React 18.3.1 + TypeScript |
| スタイリング | Tailwind CSS v4.1.12 |
| ビルドツール | Vite 6.3.5 |
| アイコン | Lucide React 0.468.0 |
| パッケージマネージャー | pnpm |

### 10.2 本番実装スタック（Next.js移行後）
| 領域 | 採用 | 補足 |
|---|---|---|
| フレームワーク | Next.js 15（App Router） | SSR/ISR |
| 言語 | TypeScript | strict mode |
| スタイリング | Tailwind CSS 4 + shadcn/ui | カスタムカラーパレット定義必須 |
| データベース | PostgreSQL（Supabase） | マネージド |
| ORM | Drizzle ORM | 軽量、TypeScript親和 |
| 検索 | PostgreSQL FTS（V1） | tsvector + GIN index |
| 認証 | Supabase Auth | パスワード ＋ Google/MS SSO（V1.5） |
| ストレージ | Cloudflare R2 | S3互換 |
| ホスティング | Vercel | |
| 監視 | Sentry + PostHog | |
| 動画 | YouTube / Vimeo iframe | URL解析で自動embed |

---

## 11. ディレクトリ構成

### 11.1 Figma Makeプロトタイプ（`src/`）
```
src/
├── app/
│   ├── App.tsx                          # メインアプリ・ルーティング・state管理
│   └── components/
│       ├── pages/                       # 公開サイトページ（F-01〜F-06）
│       │   ├── TopPage.tsx
│       │   ├── SearchResultPage.tsx
│       │   ├── CategoryDetailPage.tsx
│       │   ├── ArticleDetailPage.tsx
│       │   ├── ContactPage.tsx
│       │   └── NotFoundPage.tsx
│       ├── admin/                       # 管理画面
│       │   ├── AdminLayout.tsx
│       │   ├── AdminSidebar.tsx
│       │   ├── AdminTopbar.tsx
│       │   └── pages/
│       │       ├── LoginPage.tsx
│       │       ├── DashboardPage.tsx
│       │       ├── ArticleListPage.tsx
│       │       ├── ArticleEditorPage.tsx
│       │       ├── CategoryManagementPage.tsx
│       │       ├── TagManagementPage.tsx
│       │       ├── UserManagementPage.tsx
│       │       ├── AnalyticsPage.tsx
│       │       ├── ZeroHitQueriesPage.tsx
│       │       ├── FeedbackPage.tsx
│       │       └── SettingsPage.tsx
│       ├── ui/                          # shadcn/ui コンポーネント
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── SearchBox.tsx
│       ├── CategoryCard.tsx
│       ├── CategoryHeader.tsx
│       ├── Breadcrumbs.tsx
│       ├── SectionCard.tsx
│       ├── SubcategoryAccordion.tsx
│       └── FeedbackWidget.tsx
├── styles/
│   ├── theme.css                        # カラー・タイポグラフィ定義
│   └── fonts.css                        # Noto Sans JP読み込み
└── imports/                             # アセット
```

### 11.2 本番実装（Next.js App Router）
```
faq-cms/
├── CLAUDE.md
├── app/
│   ├── (public)/[tenant]/
│   │   ├── page.tsx                     # F-01
│   │   ├── search/page.tsx              # F-02
│   │   ├── category/[slug]/page.tsx     # F-03
│   │   └── article/[slug]/page.tsx      # F-04
│   ├── (admin)/
│   │   ├── dashboard/page.tsx           # M-02
│   │   ├── articles/
│   │   │   ├── page.tsx                 # M-03
│   │   │   ├── new/page.tsx             # M-04（新規）
│   │   │   └── [id]/edit/page.tsx       # M-04（編集）
│   │   ├── categories/page.tsx          # M-05
│   │   └── settings/page.tsx            # M-11
│   ├── (saas-admin)/tenants/page.tsx    # B-02
│   └── api/
├── components/
│   ├── ui/                              # shadcn
│   ├── public/
│   ├── admin/
│   └── editor/
├── lib/
│   ├── db/                              # Drizzle schema
│   ├── search/
│   └── auth/
└── tailwind.config.ts
```

---

## 12. 命名規則

- ファイル：kebab-case（`article-detail.tsx`）
- コンポーネント：PascalCase（`ArticleDetail`）
- 関数・変数：camelCase
- 定数：UPPER_SNAKE_CASE
- DBテーブル：snake_case 単数形（`article`、`article_section`）
- APIルート：kebab-case（`/api/articles/zero-hit-queries`）
- イベントハンドラ：`on*` プレフィックス（`onSearch`, `onEdit`）

---

## 13. データモデル（主要テーブル）

```typescript
// Drizzle schema（抜粋）
tenant { id, slug, name, plan_id, custom_domain, status, created_at }
user { id, tenant_id, email, role: 'admin'|'editor'|'viewer', created_at }
category { id, tenant_id, parent_id, slug, name, icon, order, created_at }
tag { id, tenant_id, slug, name, color, icon }
article {
  id, tenant_id, category_id, slug, title, lead,
  status: 'draft'|'review'|'published'|'unpublished',
  published_at, view_count, helpful_count, unhelpful_count,
  created_at, updated_at, created_by
}
article_section {
  id, article_id, order,
  type: 'overview'|'analysis'|'procedure'|'troubleshoot'|'note'|'media',
  title, subtitle, body_md, media_url, media_provider: 'youtube'|'vimeo'
}
article_tag { article_id, tag_id }
feedback { id, article_id, is_helpful, comment, session_id, created_at }
search_query { id, tenant_id, query, result_count, clicked_article_id, session_id, created_at }
site_setting { tenant_id, key, value }
```

---

## 14. API設計

- RESTful基本：`/api/articles`、`/api/categories` など
- マルチテナント分離：全APIはテナントスコープ（middleware で `tenant_id` 抽出）
- 認証：Supabase Auth トークンをミドルウェアで検証
- 検索：PostgreSQL FTS `tsvector` + GIN index。日本語は `pg_bigm` または `pgroonga`

---

## 15. 環境変数

```
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

---

## 16. セットアップ

```bash
# プロトタイプ（React+Vite）
pnpm install
pnpm dev
pnpm build

# 本番（Next.js 移行後）
# → 別途セットアップ手順を追記予定
```

---

## 17. 既知の実装ノート（トラブルシューティング）

| 問題 | 解決策 |
|---|---|
| 検索ボックスにブラウザ標準Xボタンが重複 | `[&::-webkit-search-cancel-button]:appearance-none` |
| Selectの矢印が表示されない | `appearance: none` + `background-image` でカスタム矢印 |
| モーダルが即閉じる | `onBlur` に `setTimeout` で遅延処理 |
| 記事エディタから戻れない | `articleEditorId` を `null` に設定 |

---

## 18. 未確定事項・TODO

- [ ] React+Vite プロトタイプ → Next.js 15 への移行タイミング
- [ ] Supabase セットアップ・DB初期マイグレーション
- [ ] テナント切替方式（サブドメイン vs パスベース）最終決定
- [ ] 日本語FTSドライバ選定（`pg_bigm` vs `pgroonga`）
- [ ] カスタムドメインのDNS方針
- [ ] 価格プランの詳細設計（Free / Starter / Pro / Enterprise）
- [ ] CSVインポート機能の優先度
- [ ] テーマカスタマイズの自由度

---

## 19. 改訂履歴

| 版 | 日付 | 主な変更 |
|---|---|---|
| v0.1 | 2026-05-19 | 初版（Figma WF + Claude Code 用統合コンテキスト） |
| v0.2 | 2026-05-19 | Figma Make実装に合わせてカラートークン・アイコン（Lucide）・ディレクトリ構成・管理画面仕様を更新。技術スタックを「プロトタイプ（React+Vite）」と「本番（Next.js）」の2層に整理 |
