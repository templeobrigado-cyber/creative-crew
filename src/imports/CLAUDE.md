# FAQ-CMS デザイン＆実装コンテキスト v0.1

**最終更新**：2026-05-19
**目的**：本ドキュメントはFigmaでのワイヤーフレーム制作と、Claude Codeでの実装の双方で参照される単一のソース・オブ・トゥルース。プロジェクトに参加する全員（デザイナー／エンジニア／Claude Code）が最初に読むべきもの。

**参照ドキュメント**
- 機能仕様書：`faq-cms-spec-v0.2.md`
- 画面遷移図：チャット中の SVG（screen_flow_overview）
- モックアップ：チャット中の HTML（top_page_mockup / article_detail_mockup）

---

## 1. プロジェクト概要

3行サマリ：
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
- **温かみのある親しみやすさ**：黄色・琥珀色で柔らかい印象
- **フラット・クリーン**：グラデーション、ドロップシャドウ、過剰なホバー効果は禁止
- **B2B SaaSとしての信頼性**：プロフェッショナルな見た目、過度なポップさは避ける

---

## 3. デザイントークン

### 3.1 カラーパレット

#### Primary（Amber）
| トークン | HEX | 主な用途 |
|---|---|---|
| `amber-50` | `#FAEEDA` | セクションカードの背景 |
| `amber-100` | `#FAC775` | 薄いアクセント |
| `amber-200` | `#EF9F27` | 中間アクセント |
| `amber-400` | `#EF9F27` | サブブランドカラー |
| `amber-600` | `#BA7517` | ヘッダー・フッター・メインブランド色 |
| `amber-800` | `#854F0B` | CTAボタン、重要リンク |
| `amber-900` | `#412402` | 最深色（特殊用途） |

#### Accent（Coral）
| トークン | HEX | 主な用途 |
|---|---|---|
| `coral-400` | `#D85A30` | `media`タイプのセクションカードバッジ、警告系 |

#### Neutral（Gray）
| トークン | HEX | 主な用途 |
|---|---|---|
| `gray-50` | `#F1EFE8` | ページ背景 |
| `gray-200` | `#B4B2A9` | ボーダー（強調） |
| `gray-300` | `#D3D1C7` | ボーダー（デフォルト） |
| `gray-600` | `#5F5E5A` | 補助テキスト |
| `gray-900` | `#2C2C2A` | 主要テキスト |

#### その他
- `white`：`#FFFFFF`（カード、コンテンツエリア）
- フォーカスリング：`rgba(186, 117, 23, 0.2)` 3px

### 3.2 タイポグラフィ

- **フォント**：Noto Sans JP（ウェブフォント）
- **ウェイト**：400（Regular）と500（Medium）の2種類のみ
- **サイズ階層**：

| 用途 | サイズ | ウェイト | 行間 |
|---|---|---|---|
| h1（ページタイトル） | 28px | 500 | 1.4 |
| h2（セクション見出し） | 22px | 500 | 1.5 |
| h3（カード内見出し） | 18px | 500 | 1.6 |
| body（本文） | 16px | 400 | 1.7 |
| small（補助テキスト） | 14px | 400 | 1.6 |
| xs（メタ情報・バッジ） | 12px | 400 | 1.5 |

### 3.3 スペーシング
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80（px）の10段階。Tailwindの `space-*` クラスに対応。

### 3.4 角丸
| トークン | 値 | 用途 |
|---|---|---|
| `rounded-sm` | 4px | ボタン、バッジ、検索ボックス |
| `rounded-md` | 8px | カード、入力欄 |
| `rounded-lg` | 12px | 大きなカード、モーダル |

### 3.5 ボーダー
- デフォルト：`0.5px solid #D3D1C7`
- 強調：`1px solid #B4B2A9`
- フォーカス・選択中：`2px solid #BA7517`

### 3.6 シャドウ
**原則として使わない**。フラットデザインを徹底。フォーカスリング（`0 0 0 3px rgba(186, 117, 23, 0.2)`）のみ例外。

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
- mobile：24px
- tablet：32px
- desktop：48px

### 4.4 グリッド
- desktop：12カラム / 24px gutter
- mobile：4カラム / 16px gutter

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
**通常版**
- 高さ：約64px
- 背景：`amber-600`
- 内容：メインカテゴリリンク（左、4個）＋ "Back to 〇〇"（右）

**シンプル版（トップページ用）**
- 内容：`Privacy Policy / Terms / Conditions` ＋ Copyright

### 5.3 カテゴリカード（トップページ用）
- サイズ：約220 × 200px
- 背景：white、ボーダー `0.5px solid gray-300`、角丸 `md`
- レイアウト：縦並び中央寄せ
  - アイコン（52px、Tabler、color: `amber-600`）
  - カテゴリ名（h3）
  - CTAボタン「See Articles」（Amber 800）

### 5.4 カテゴリヘッダー（カテゴリ詳細ページ用）
- 高さ：約200px
- 背景：`gray-50`
- 内容：大型アイコン（64px）＋ カテゴリ名（h1）＋ パンくず

### 5.5 アコーディオン（サブカテゴリ用）
- 各行：高さ56px、ボーダー `0.5px solid gray-300`
- クリックで展開 → 内側に記事タイトルリンクのリスト
- 展開ボタン：`ti-chevron-down`（収納）/ `ti-chevron-up`（展開）
- デフォルト全閉、複数同時展開OK

### 5.6 セクションカード（記事詳細用） ★差別化機能
- 背景：`amber-50` (#FAEEDA)
- 角丸：`md`、パディング：20px
- レイアウト：2カラム
  - 左：テキスト（タイプバッジ → タイトル → サブタイトル → 説明 → 箇条書き）
  - 右：ビジュアル（画像 or 動画埋込、最低180px高）
- 左上にタイプ識別バッジ：`overview` / `analysis` / `procedure` / `troubleshoot` / `note` / `media`
  - 通常タイプ：`amber-600` 背景、white テキスト
  - mediaタイプ：`coral-400` 背景、white テキスト

### 5.7 検索ボックス
- 高さ：44px（ヒーロー用）/ 36px（ヘッダー用）
- 背景：white、ボーダー `0.5px solid gray-300`、角丸 `sm`
- アイコン：`ti-search`、サイズ20px、color: `gray-600`
- プレースホルダー：「検索」または「検索（例：…）」
- フォーカス時：ボーダー `amber-600` ＋ フォーカスリング

### 5.8 ボタン

**Primary（CTA）**
- 背景：`amber-800` / テキスト：white / パディング：8px 20px / 角丸：sm
- ホバー：`amber-900`

**Secondary**
- 背景：white / ボーダー：`0.5px solid gray-300` / テキスト：`gray-900`
- ホバー：`gray-50` 背景

**Ghost**
- 背景：transparent / テキスト：`amber-600`
- ホバー：`amber-50` 背景

### 5.9 バッジ・タグ
- 高さ：22～24px、パディング：3px 10px、角丸：3～4px
- バリエーション：
  - `default`：`gray-200` bg / `gray-900` text
  - `amber`：`amber-600` bg / white text
  - `coral`：`coral-400` bg / white text

### 5.10 パンくずナビ
- フォント：12～13px
- セパレータ：` / `（`gray-200`）
- リンク色：`amber-600`、最終アイテムは `gray-900`

### 5.11 フィードバックウィジェット
- 「この記事は役に立ちましたか？」＋ 「はい」「いいえ」ボタン（Secondary + アイコン）
- 「いいえ」押下後：コメント入力欄が下に展開
- 送信後：「フィードバックありがとうございます」表示

### 5.12 動画埋込
- アスペクト比：16:9 維持
- プレースホルダー：暗色背景（`gray-900`）＋ Play アイコン（`ti-player-play`、48px、white）＋ 「YouTube埋込」or「Vimeo埋込」テキスト
- 実装時：iframe で埋込

### 5.13 KPIカード（管理画面用）
- 背景：`gray-50`、ボーダーなし、角丸 `md`、パディング 16px
- 内容：ラベル（13px、`gray-600`）→ 数値（24px、500）→ 増減（small、上昇は緑／下降は赤）

### 5.14 データテーブル（管理画面用）
- ヘッダー：背景 `gray-50`、テキスト 13px medium
- 行：ボーダー底辺 `0.5px solid gray-300`、ホバーで `gray-50`
- 行クリックでカーソルポインタ、行全体がリンク
- パディング：12px 16px

### 5.15 サイドナビ（管理画面用）
- 幅：240px、背景：`gray-900`、テキスト：white
- ロゴ（上部）＋ ナビ項目リスト
- アクティブ：左ボーダー `2px solid amber-400`、背景 `gray-800`
- アイコン（20px）＋ ラベル

---

## 6. 画面一覧

### 6.1 公開FAQサイト（優先度：高）
| ID | 画面 | 優先 |
|---|---|---|
| F-01 | トップページ | ★★★ |
| F-02 | 検索結果ページ | ★★ |
| F-03 | カテゴリ詳細ページ | ★★★ |
| F-04 | 記事詳細ページ | ★★★ |
| F-05 | 問い合わせフォーム（または外部リダイレクト） | ★ |
| F-06 | 404 / エラーページ | ★ |

### 6.2 管理画面（優先度：中）
| ID | 画面 | 優先 |
|---|---|---|
| M-01 | ログイン | ★★ |
| M-02 | ダッシュボード | ★★★ |
| M-03 | 記事一覧 | ★★★ |
| M-04 | 記事編集（セクションカードエディタ） | ★★★ |
| M-05 | カテゴリ管理 | ★★ |
| M-06 | タグ管理 | ★ |
| M-07 | ヒット0クエリ一覧 | ★★ |
| M-08 | 検索クエリ分析 | ★ |
| M-09 | 記事パフォーマンス | ★ |
| M-10 | フィードバック一覧 | ★ |
| M-11 | ユーザー管理 | ★ |
| M-12 | サイト設定 | ★★ |
| M-13 | テーマ設定 | ★ |

### 6.3 SaaS運営者バックオフィス（優先度：低）
| ID | 画面 | 優先 |
|---|---|---|
| B-01 | ログイン | ★ |
| B-02 | テナント一覧 | ★★ |
| B-03 | テナント詳細 | ★ |
| B-04 | プラン管理 | ★ |
| B-05 | 請求管理 | △ |
| B-06 | システムログ | △ |

★★★ = V1 MVPで必須 / ★★ = V1で実装 / ★ = V1.5で実装 / △ = V2以降

---

## 7. 画面別の詳細仕様（★★★画面）

### 7.1 F-01 トップページ
**目的**：エンドユーザーが目的のFAQに到達するエントリーポイント

**含まれるコンポーネント**：ヘッダーType A（ヒーロー一体型）/ カテゴリカード × 4枚（3カラムグリッド、4枚目は2列目左寄せ）/ シンプルフッター

**インタラクション**：
- 検索ボックスフォーカス → ボーダー強調、サジェスト候補ドロップダウン表示
- 検索送信 → F-02へ遷移（`?q=...`）
- カテゴリカードクリック → F-03へ遷移

**状態**：通常時のみ

### 7.2 F-03 カテゴリ詳細ページ
**目的**：カテゴリ内のサブカテゴリと記事を一覧表示

**含まれるコンポーネント**：ヘッダーType B / カテゴリヘッダー / パンくず / アコーディオン × N（サブカテゴリ）/ フッター

**インタラクション**：
- アコーディオン展開・収納
- 記事リンククリック → F-04へ遷移

**状態**：通常時、空状態（サブカテゴリ・記事なし）

### 7.3 F-04 記事詳細ページ
**目的**：個別FAQ記事の表示

**含まれるコンポーネント**：ヘッダーType B / パンくず / 記事タイトル＋リード文＋概要箇条書き / セクションカード × N / フィードバックウィジェット / フッター

**インタラクション**：
- セクション内のリンクで他記事へ遷移
- 動画再生（iframeロード）
- フィードバック送信 → 確認表示
- 「解決しなかった」選択時にコメント入力欄展開

**状態**：通常時 / フィードバック送信後 / 動画ロード前後

### 7.4 M-02 ダッシュボード
**目的**：事業者管理者の起点。主要KPIとアクションへの導線

**含まれるコンポーネント**：サイドナビ / ページタイトル / KPIカード × 4（PV、検索数、解決率、ヒット0クエリ数）/ 折れ線グラフ（PV推移）/ 最新フィードバックリスト（5件）/ ヒット0クエリTop5

**インタラクション**：
- 期間切替（7日／30日／90日）
- KPIカードクリックで詳細画面へ
- 「すべて見る」リンクで対応する一覧画面へ

**状態**：通常時、初期データなし時の空状態

### 7.5 M-03 記事一覧
**含まれるコンポーネント**：サイドナビ / フィルタバー（カテゴリ・タグ・ステータス・検索）/ アクションバー（新規作成・一括操作）/ データテーブル（チェックボックス、タイトル、カテゴリ、ステータス、公開日、編集者、操作）

**インタラクション**：
- フィルタ適用、ソート
- チェックで複数選択、一括操作（一括公開・非公開・カテゴリ変更）
- 行クリックでM-04へ
- 新規作成 → M-04（空状態）

### 7.6 M-04 記事編集（セクションカード型エディタ） ★最重要画面
**目的**：V1の差別化機能。Markdownベース＋セクションカード構造のエディタ

**含まれるコンポーネント**：
- 上部バー：戻る / 保存 / プレビュー / 公開 ボタン
- 左カラム（300px）：記事メタデータ（タイトル、スラッグ、カテゴリ、タグ、リード文、ステータス、公開日時、内部メモ）
- 中央カラム（fluid）：セクションカードリスト
  - 各セクション：ドラッグハンドル、タイプバッジ、Markdownエディタ、ビジュアルアップロード or 動画URL入力フィールド
  - セクション末尾：「+ セクション追加」ボタン → タイプ選択ドロップダウン（6種）
- 右カラム（オプション、トグル可）：ライブプレビュー

**インタラクション**：
- セクション追加・削除・並び替え（ドラッグ＆ドロップ）
- Markdownライブプレビュー
- 動画URL入力時の自動embed解決（YouTube/Vimeo判定）
- 自動保存（変更後3秒、または30秒ごと）

**状態**：新規作成 / 既存編集 / 保存中 / 公開済み / エラー（バリデーション失敗）

### 7.7 M-07 ヒット0クエリ一覧
**目的**：AIなしで「未回答質問の発見」を実現する画面

**含まれるコンポーネント**：フィルタ（期間）/ データテーブル（クエリ、検索回数、最終検索日時、関連カテゴリ推測、アクション）

**インタラクション**：
- 「記事化する」クリック → M-04 新規（タイトル仮入力済み）へ遷移
- 「無視する」マーク機能（再表示しない）

---

## 8. インタラクション・状態定義

### 8.1 検索のサジェスト動作
- 入力（debounce 200ms）→ 候補表示
- V1は「人気質問」「最近の検索」をベースとした静的サジェスト
- 候補0件時：「該当する候補がありません」を表示

### 8.2 アコーディオン
- デフォルト：全閉
- クリック → 個別開閉
- 一度に複数開閉可能

### 8.3 セクションカードのドラッグ＆ドロップ
- ハンドル（左端のドット6個アイコン `ti-grip-vertical`）をドラッグ
- 移動中：カードが半透明、置き場所にハイライト枠
- ドロップ → 並び順を即座に反映、API保存

### 8.4 動画埋込のURL解決
- YouTube：`youtube.com/watch?v=*` または `youtu.be/*`
- Vimeo：`vimeo.com/*`
- 不明：エラー表示「対応外のURLです」

### 8.5 ローディング状態
- 全体ローディング：中央にスピナー（Tabler `ti-loader` をCSSアニメ）
- ボタン押下中：ボタン内テキストを「処理中…」に変更、disabled
- 自動保存中：エディタ右上に「保存中…」表示、完了で「保存しました」3秒表示

---

## 9. アセット要件

### 9.1 アイコン
- **Tabler Icons（outlined）**を全面採用
- 主要使用：`ti-search` / `ti-chart-bar` / `ti-file-text` / `ti-settings` / `ti-tool` / `ti-thumb-up` / `ti-thumb-down` / `ti-player-play` / `ti-chevron-down` / `ti-chevron-up` / `ti-plus` / `ti-trash` / `ti-edit` / `ti-eye` / `ti-external-link` / `ti-grip-vertical` / `ti-loader`
- カテゴリアイコンも Tabler から選定（V1では独自イラストは不要）

### 9.2 画像・イラスト
- カテゴリアイコン：Tabler を着色（`amber-600`）
- 空状態のイラスト：シンプルな線画でOK（後回し可、Tablerでも代替可）

### 9.3 ロゴ
- 仮：「FAQ-CMS」テキスト（Noto Sans JP Medium）
- 正式ロゴは別途デザイン

---

## 10. Code側へのハンドオフ情報

### 10.1 技術スタック
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

### 10.2 ディレクトリ構成案
```
faq-cms/
├── CLAUDE.md                            # 本ドキュメント
├── app/
│   ├── (public)/[tenant]/               # 公開サイト
│   │   ├── page.tsx                      # F-01
│   │   ├── search/page.tsx               # F-02
│   │   ├── category/[slug]/page.tsx      # F-03
│   │   └── article/[slug]/page.tsx       # F-04
│   ├── (admin)/                         # 事業者管理画面
│   │   ├── dashboard/page.tsx            # M-02
│   │   ├── articles/
│   │   │   ├── page.tsx                  # M-03
│   │   │   ├── new/page.tsx              # M-04（新規）
│   │   │   └── [id]/edit/page.tsx        # M-04（編集）
│   │   ├── categories/page.tsx           # M-05
│   │   ├── analytics/                    # R系
│   │   └── settings/                     # S系
│   ├── (saas-admin)/tenants/page.tsx    # B-02
│   └── api/                             # Route Handlers
├── components/
│   ├── ui/                              # shadcn コンポーネント
│   ├── public/                          # 公開サイト用
│   ├── admin/                           # 管理画面用
│   └── editor/                          # セクションカードエディタ
├── lib/
│   ├── db/                              # Drizzle schema、queries
│   ├── search/                          # FTSロジック
│   └── auth/                            # Supabase Auth ラッパー
├── public/                              # 静的アセット
├── tailwind.config.ts                   # カラートークン定義
└── package.json
```

### 10.3 命名規則
- ファイル：kebab-case（`article-detail.tsx`）
- コンポーネント：PascalCase（`ArticleDetail`）
- 関数・変数：camelCase
- 定数：UPPER_SNAKE_CASE
- DBテーブル：snake_case 単数形（`article`、`article_section`）
- APIルート：kebab-case（`/api/articles/zero-hit-queries`）

### 10.4 データモデル（主要テーブル）

```typescript
// Drizzle schema （抜粋）
tenant {
  id, slug, name, plan_id, custom_domain, status, created_at
}
user {
  id, tenant_id, email, role (admin/editor/viewer), created_at
}
category {
  id, tenant_id, parent_id, slug, name, icon, order, created_at
}
tag {
  id, tenant_id, slug, name
}
article {
  id, tenant_id, category_id, slug, title, lead,
  status (draft/review/published/unpublished),
  published_at, view_count, helpful_count, unhelpful_count,
  created_at, updated_at, created_by
}
article_section {
  id, article_id, order,
  type (overview/analysis/procedure/troubleshoot/note/media),
  title, subtitle, body_md, media_url, media_provider (youtube/vimeo)
}
article_tag {
  article_id, tag_id  // 多対多
}
feedback {
  id, article_id, is_helpful, comment, session_id, created_at
}
search_query {
  id, tenant_id, query, result_count, clicked_article_id,
  session_id, created_at
}
site_setting {
  tenant_id, key, value  // JSON
}
```

### 10.5 API設計の方向性
- RESTful基本：`/api/articles`、`/api/categories` など
- マルチテナント分離：全APIはテナントスコープ（middleware で `tenant_id` 抽出）
- 認証：Supabase Auth トークンをミドルウェアで検証
- 検索：PostgreSQL FTS の `tsvector` + GIN index を活用。日本語は `pg_bigm` または `pgroonga` の利用検討

### 10.6 環境変数
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

### 10.7 Tailwind カラー設定（抜粋）
```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      amber: {
        50: '#FAEEDA',
        100: '#FAC775',
        200: '#EF9F27',
        400: '#EF9F27',
        600: '#BA7517',
        800: '#854F0B',
        900: '#412402',
      },
      coral: {
        400: '#D85A30',
      },
      gray: {
        50: '#F1EFE8',
        200: '#B4B2A9',
        300: '#D3D1C7',
        600: '#5F5E5A',
        900: '#2C2C2A',
      },
    },
    fontFamily: {
      sans: ['"Noto Sans JP"', 'sans-serif'],
    },
  },
}
```

---

## 11. 制作優先順位

### 11.1 Figma WF（推奨順）
1. デザインシステム整備（カラー、タイポ、コンポーネントライブラリの作成）
2. **F-01 / F-03 / F-04**（公開サイトのコア。3枚で全体像が見える）
3. **M-02 / M-03 / M-04**（管理画面のコア。特にM-04は最重要）
4. F-02（検索結果）
5. M-07（ヒット0クエリ。差別化機能）
6. M-12（サイト設定）
7. 残りの管理画面（M-01, M-05, M-09, M-10, M-11）
8. SaaS運営者画面（B-02）
9. エラー・空状態のバリエーション

### 11.2 Claude Code 実装（推奨順）
1. プロジェクト初期化（Next.js 15 + TypeScript + Tailwind + shadcn/ui）
2. Supabase セットアップ（DB、Auth）
3. Drizzle schema 定義、初期マイグレーション
4. テナント切替の仕組み（サブドメイン or URL パラメータ）
5. 公開サイト3画面（F-01, F-03, F-04）
6. 管理画面の認証＆レイアウト（M-01, サイドナビ）
7. 記事 CRUD（M-03, M-04）
8. セクションカードエディタ（M-04 の中核機能）
9. PostgreSQL FTS検索（F-02 + 検索ログ記録）
10. ダッシュボード（M-02）
11. ヒット0クエリ一覧（M-07）
12. サイト設定、テーマ（M-12, M-13）

---

## 12. 未確定事項・TODO

- [ ] ベンダー権限の追加可否（事業者の上位ロール）
- [ ] 既存FAQの移行機能（CSV/JSONインポート）の優先度
- [ ] 価格プランの詳細設計（Free / Starter / Pro / Enterprise）
- [ ] カスタムドメインのDNS方針
- [ ] 日本語FTSのドライバ選定（`pg_bigm` vs `pgroonga`）
- [ ] テーマカスタマイズの自由度（プリセット5種＋カラー2色変更くらい？）
- [ ] サブドメインかパスベースかのマルチテナント方式の最終決定

---

## 13. 改訂履歴

| 版 | 日付 | 主な変更 |
|---|---|---|
| v0.1 | 2026-05-19 | 初版（Figma WF + Claude Code 用統合コンテキスト） |
