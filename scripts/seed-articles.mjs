/**
 * テンプレート記事シードスクリプト
 * 実行: node --env-file=.env scripts/seed-articles.mjs
 */
import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL または VITE_SUPABASE_ANON_KEY が未設定です')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ---- カテゴリ別テンプレート記事定義 ----

const TEMPLATES = {
  // 機能説明
  features: [
    {
      title: 'ダッシュボードの使い方',
      slug: 'how-to-use-dashboard',
      lead: 'ダッシュボードでは、サービスの概要・最新情報・よく使う機能へのショートカットを確認できます。各ウィジェットの見方と操作方法を解説します。',
      sections: [
        { order: 1, type: 'overview', title: 'ダッシュボードとは', subtitle: 'サービスのホーム画面', body_md: 'ダッシュボードはログイン後に最初に表示される画面です。以下の情報をまとめて確認できます：\n\n- **統計カード**：主要指標の現在値\n- **最近の更新**：新着情報の一覧\n- **クイックアクション**：よく使う機能へのショートカット' },
        { order: 2, type: 'procedure', title: '各ウィジェットの操作方法', subtitle: 'ダッシュボードのカスタマイズ', body_md: '1. 右上の「設定」アイコンをクリック\n2. 表示するウィジェットを選択\n3. ドラッグ&ドロップで並び順を変更\n4. 「保存」ボタンで設定を反映' },
        { order: 3, type: 'note', title: 'よくあるご質問', body_md: '**Q: ダッシュボードが表示されない場合は？**\nブラウザのキャッシュをクリアして、再度ログインしてください。\n\n**Q: データが更新されない場合は？**\nページを再読み込み（F5）するか、自動更新間隔の設定をご確認ください。' },
      ],
    },
    {
      title: '通知設定の変更方法',
      slug: 'how-to-change-notifications',
      lead: 'メール通知やプッシュ通知の受信設定を変更する方法を説明します。不要な通知をオフにして、必要な情報だけを受け取りましょう。',
      sections: [
        { order: 1, type: 'overview', title: '通知の種類', subtitle: '受け取れる通知一覧', body_md: '以下の通知を個別にオン/オフできます：\n\n| 通知の種類 | 説明 |\n|---|---|\n| システム通知 | メンテナンス・障害情報 |\n| 更新通知 | 新機能・アップデート情報 |\n| アクティビティ通知 | 自分に関連するアクション |' },
        { order: 2, type: 'procedure', title: '通知設定の変更手順', body_md: '1. 右上のアカウントアイコンをクリック\n2. 「設定」→「通知」を選択\n3. 受け取りたい通知の種類をオン/オフ\n4. 通知方法（メール/ブラウザ）を選択\n5. 「保存」をクリック' },
        { order: 3, type: 'note', title: '注意事項', body_md: '- システム障害などの重要な通知はオフにできません\n- メール通知は登録済みのアドレスに送信されます\n- 設定変更は即時反映されます' },
      ],
    },
    {
      title: 'データのエクスポート方法',
      slug: 'how-to-export-data',
      lead: '蓄積されたデータをCSVやExcel形式でエクスポートする方法を解説します。定期的にバックアップすることをおすすめします。',
      sections: [
        { order: 1, type: 'overview', title: 'エクスポート機能について', body_md: 'エクスポートできるデータの形式：\n\n- **CSV形式**：表計算ソフトで開きやすい\n- **Excel形式（.xlsx）**：書式付きで出力\n- **JSON形式**：システム連携向け' },
        { order: 2, type: 'procedure', title: 'エクスポート手順', body_md: '1. エクスポートしたいデータの一覧ページを開く\n2. 右上の「エクスポート」ボタンをクリック\n3. 出力形式を選択\n4. 期間や条件を設定（任意）\n5. 「ダウンロード」をクリック' },
        { order: 3, type: 'note', title: '大量データのエクスポートについて', body_md: '10万件以上のデータをエクスポートする場合は、バックグラウンド処理となります。\n\n処理完了後にメールでダウンロードリンクが送付されます。リンクの有効期限は24時間です。' },
      ],
    },
  ],

  // 契約・支払方法
  billing: [
    {
      title: '支払い方法の変更',
      slug: 'change-payment-method',
      lead: 'クレジットカードや銀行振込など、支払い方法を変更する手順を説明します。',
      sections: [
        { order: 1, type: 'overview', title: '利用できる支払い方法', body_md: '以下の支払い方法に対応しています：\n\n- クレジットカード（Visa / Mastercard / JCB / American Express）\n- 銀行振込\n- 請求書払い（企業向けプランのみ）' },
        { order: 2, type: 'procedure', title: 'クレジットカードの変更手順', body_md: '1. 管理画面の「設定」→「支払い情報」を開く\n2. 「支払い方法を変更」をクリック\n3. 新しいカード情報を入力\n4. 「保存」をクリック\n\n次の請求日から新しいカードに切り替わります。' },
        { order: 3, type: 'note', title: '変更時の注意事項', body_md: '- 変更は翌月の請求から適用されます\n- 変更前のカードへの請求は発生しません\n- カード情報はSSLで暗号化して送信されます' },
      ],
    },
    {
      title: '請求書・領収書の確認方法',
      slug: 'how-to-check-invoice',
      lead: '過去の請求書や領収書をダウンロードする方法を説明します。経費精算や確定申告にご活用ください。',
      sections: [
        { order: 1, type: 'procedure', title: '請求書の確認手順', body_md: '1. 「設定」→「支払い履歴」を開く\n2. 確認したい月の請求を選択\n3. 「PDF ダウンロード」をクリック' },
        { order: 2, type: 'note', title: '領収書の宛名変更について', body_md: '領収書の宛名を変更したい場合は、サポートまでお問い合わせください。\n\n変更できる項目：会社名・部署名・担当者名' },
      ],
    },
    {
      title: '解約・プラン変更の手順',
      slug: 'cancel-or-change-plan',
      lead: 'ご解約やプランのダウングレード・アップグレードの手順を説明します。',
      sections: [
        { order: 1, type: 'overview', title: 'プラン変更・解約の概要', body_md: '変更できる内容：\n\n- **アップグレード**：即時適用、差額を日割り請求\n- **ダウングレード**：次の契約更新日から適用\n- **解約**：当月末で利用終了' },
        { order: 2, type: 'procedure', title: 'プラン変更の手順', body_md: '1. 「設定」→「プラン」を開く\n2. 変更したいプランを選択\n3. 内容を確認して「変更する」をクリック\n4. 確認メールが届きます' },
        { order: 3, type: 'procedure', title: '解約の手順', body_md: '1. 「設定」→「アカウント」→「解約」を開く\n2. 解約理由を選択\n3. 「解約する」をクリック\n4. 確認メールが届きます\n\n※ データは解約後30日間保持されます。' },
      ],
    },
  ],

  // アカウント
  account: [
    {
      title: 'パスワードの変更とリセット',
      slug: 'password-reset',
      lead: 'セキュリティを保つため、定期的なパスワード変更をおすすめします。パスワードを忘れた場合のリセット方法も解説します。',
      sections: [
        { order: 1, type: 'overview', title: '概要', subtitle: 'パスワード管理の基本', body_md: '以下の2つの操作をカバーしています：\n\n- **パスワード変更**：現在のパスワードがわかる場合\n- **パスワードリセット**：パスワードを忘れた場合' },
        { order: 2, type: 'procedure', title: 'パスワードの変更手順', subtitle: '現在のパスワードがわかる場合', body_md: '1. 右上のアカウントアイコンをクリック\n2. 「アカウント設定」を選択\n3. 「セキュリティ」タブをクリック\n4. 「パスワードを変更」ボタンをクリック\n5. 現在のパスワードと新しいパスワードを入力\n6. 「保存」をクリック' },
        { order: 3, type: 'procedure', title: 'パスワードのリセット手順', subtitle: 'パスワードを忘れた場合', body_md: '1. ログイン画面で「パスワードを忘れた方はこちら」をクリック\n2. 登録済みのメールアドレスを入力\n3. 送信されたメールのリンクをクリック\n4. 新しいパスワードを設定' },
        { order: 4, type: 'note', title: '安全なパスワードのガイドライン', body_md: '- 8文字以上\n- 英大文字・小文字・数字・記号を組み合わせる\n- 他のサービスと使い回さない\n- 定期的に変更することを推奨' },
      ],
    },
    {
      title: 'ログインできない場合の対処方法',
      slug: 'cannot-login-solution',
      lead: 'ログインできない場合の一般的な原因と解決方法について説明します。',
      sections: [
        { order: 1, type: 'overview', title: '概要', subtitle: 'ログイン問題の一般的な原因', body_md: '以下のような原因が考えられます：\n\n- パスワードの入力ミス\n- Caps Lockキーがオン\n- ブラウザのキャッシュ問題\n- アカウントのロック' },
        { order: 2, type: 'procedure', title: '解決手順', body_md: '1. パスワードを再確認する\n2. Caps Lockキーを確認する\n3. ブラウザのキャッシュをクリアする\n4. パスワードリセットを試す\n5. サポートに連絡する' },
        { order: 3, type: 'troubleshoot', title: 'それでも解決しない場合', body_md: '上記の手順を試してもログインできない場合は、アカウントがロックされている可能性があります。\n\nサポートへお問い合わせください。' },
      ],
    },
    {
      title: '2段階認証の設定方法',
      slug: 'two-factor-auth-setup',
      lead: 'アカウントのセキュリティを強化するため、2段階認証（2FA）の設定方法を説明します。不正アクセスからアカウントを守りましょう。',
      sections: [
        { order: 1, type: 'overview', title: '2段階認証とは', body_md: '2段階認証を有効にすると、ログイン時にパスワードに加えて認証アプリのコードの入力が必要になります。\n\n万が一パスワードが漏洩しても、不正ログインを防止できます。' },
        { order: 2, type: 'procedure', title: '設定手順', body_md: '1. 「設定」→「セキュリティ」を開く\n2. 「2段階認証を有効にする」をクリック\n3. QRコードをGoogle Authenticator等で読み取る\n4. 表示された6桁コードを入力して確認\n5. バックアップコードを安全な場所に保存' },
        { order: 3, type: 'note', title: '対応している認証アプリ', body_md: '- Google Authenticator\n- Microsoft Authenticator\n- Authy\n- 1Password（TOTP対応版）' },
      ],
    },
  ],

  // トラブルシューティング
  troubleshooting: [
    {
      title: 'ページが表示されない・読み込みが遅い場合',
      slug: 'page-not-loading',
      lead: 'ページが表示されない、または読み込みが著しく遅い場合の原因と対処方法を説明します。',
      sections: [
        { order: 1, type: 'troubleshoot', title: '考えられる原因', body_md: '1. ブラウザのキャッシュが古い\n2. インターネット接続が不安定\n3. ブラウザの拡張機能との競合\n4. システムメンテナンス中' },
        { order: 2, type: 'procedure', title: '対処手順', body_md: '**Step 1: ページを再読み込みする**\n`Ctrl + F5`（Mac: `Cmd + Shift + R`）でキャッシュをクリアして再読み込み\n\n**Step 2: ブラウザのキャッシュを削除する**\n設定 → プライバシー → キャッシュを削除\n\n**Step 3: 別のブラウザで試す**\nChrome / Firefox / Safari / Edge で動作確認\n\n**Step 4: 拡張機能を無効化する**\nシークレットモードで開いて確認' },
        { order: 3, type: 'note', title: 'それでも解決しない場合', body_md: 'サポートにお問い合わせいただく際は、以下の情報をお知らせください：\n\n- ご利用のブラウザとバージョン\n- OS（Windows / macOS）\n- エラーメッセージのスクリーンショット' },
      ],
    },
    {
      title: 'データが保存されない・消えた場合',
      slug: 'data-not-saving',
      lead: '入力したデータが保存されない、または保存したはずのデータが消えてしまった場合の対処方法です。',
      sections: [
        { order: 1, type: 'troubleshoot', title: 'よくある原因', body_md: '- 保存ボタンを押し忘れた\n- ブラウザのタブを閉じてしまった\n- セッションタイムアウト\n- 通信エラーで保存が失敗した' },
        { order: 2, type: 'procedure', title: '対処手順', body_md: '1. ブラウザの「戻る」で前の画面に戻る\n2. 自動保存データが残っている場合は復元を試みる\n3. 入力内容を再度入力して保存\n4. 保存後は確認メッセージが表示されることを確認する' },
        { order: 3, type: 'note', title: '自動保存について', body_md: '本サービスでは30秒ごとに自動保存が行われます。\n\nただし、ブラウザを閉じた場合や通信が切断された場合は、自動保存データが失われることがあります。重要なデータは定期的に保存ボタンをクリックしてください。' },
      ],
    },
    {
      title: 'エラーメッセージが表示される場合',
      slug: 'error-messages-guide',
      lead: 'よく表示されるエラーメッセージの意味と対処方法をまとめました。',
      sections: [
        { order: 1, type: 'analysis', title: '主なエラーメッセージ一覧', body_md: '| エラー | 意味 | 対処方法 |\n|---|---|---|\n| 401 Unauthorized | 認証エラー | 再ログインする |\n| 403 Forbidden | アクセス権限なし | 管理者に権限付与を依頼 |\n| 404 Not Found | ページが存在しない | URLを確認する |\n| 500 Internal Server Error | サーバーエラー | 時間をおいて再試行 |\n| 503 Service Unavailable | メンテナンス中 | 完了まで待つ |' },
        { order: 2, type: 'troubleshoot', title: '解決できない場合', body_md: 'エラーが繰り返し発生する場合は、以下の情報をサポートにお知らせください：\n\n- エラーメッセージの全文\n- 発生した操作の手順\n- 発生日時\n- ブラウザとOS' },
      ],
    },
  ],

  // 料金プラン
  pricing: [
    {
      title: 'プランの種類と料金',
      slug: 'pricing-plans',
      lead: '各料金プランの機能・制限・価格を比較します。ご自身の利用状況に合ったプランをお選びください。',
      sections: [
        { order: 1, type: 'analysis', title: 'プラン比較表', body_md: '| プラン | 月額 | ユーザー数 | ストレージ | サポート |\n|---|---|---|---|---|\n| Free | ¥0 | 1名 | 1GB | ドキュメントのみ |\n| Starter | ¥2,980 | 5名 | 10GB | メール対応 |\n| Pro | ¥9,800 | 20名 | 50GB | 優先サポート |\n| Enterprise | お問い合わせ | 無制限 | 無制限 | 専任担当者 |' },
        { order: 2, type: 'note', title: '年払いの割引について', body_md: '年払いを選択すると、月払いに比べて**2ヶ月分お得**になります。\n\n年払い割引率：約17%オフ' },
      ],
    },
    {
      title: 'プランのアップグレード方法',
      slug: 'plan-upgrade',
      lead: '現在のプランから上位プランへアップグレードする手順を説明します。アップグレードは即時反映されます。',
      sections: [
        { order: 1, type: 'procedure', title: 'アップグレード手順', body_md: '1. 「設定」→「プラン」を開く\n2. アップグレードしたいプランを選択\n3. 料金の確認ページが表示される\n4. 支払い方法を確認して「アップグレードする」\n5. 即時反映され、確認メールが届く' },
        { order: 2, type: 'note', title: '日割り請求について', body_md: '月の途中でアップグレードした場合、残り日数分の差額を日割りで請求します。\n\n例：月額プランで15日にアップグレード → 残り半月分の差額を請求' },
      ],
    },
    {
      title: '無料トライアルについて',
      slug: 'free-trial',
      lead: '有料プランの14日間無料トライアルについて説明します。クレジットカードの登録なしでお試しいただけます。',
      sections: [
        { order: 1, type: 'overview', title: '無料トライアルの概要', body_md: '- **期間**：14日間\n- **対象プラン**：Starter・Pro\n- **カード登録**：不要\n- **利用制限**：なし（本番環境と同等）' },
        { order: 2, type: 'procedure', title: 'トライアル開始方法', body_md: '1. トップページの「無料で試す」をクリック\n2. メールアドレスとパスワードを登録\n3. プランを選択\n4. すぐに全機能をお試しいただけます' },
        { order: 3, type: 'note', title: 'トライアル終了後について', body_md: 'トライアル終了後は自動的に Free プランに移行します。\n\n引き続き有料プランをご利用の場合は、トライアル期間中に支払い方法を登録してください。' },
      ],
    },
  ],

  // その他
  other: [
    {
      title: 'よくある質問（FAQ）の使い方',
      slug: 'how-to-use-faq',
      lead: 'このFAQサイトの効果的な使い方を説明します。キーワード検索やカテゴリ検索で素早く回答を見つけましょう。',
      sections: [
        { order: 1, type: 'procedure', title: '回答の探し方', body_md: '**方法1：キーワード検索**\n画面上部の検索ボックスにキーワードを入力してください。\n\n**方法2：カテゴリから探す**\nトップページのカテゴリ一覧から、お困りの内容に近いカテゴリを選択してください。\n\n**方法3：人気の質問から探す**\nトップページ下部の「よく見られている質問」からよく検索される記事を確認できます。' },
        { order: 2, type: 'note', title: '回答が見つからない場合', body_md: '回答が見つからない場合は、「お問い合わせ」フォームからご質問ください。\n\n通常2営業日以内に回答いたします。' },
      ],
    },
    {
      title: 'お問い合わせ方法',
      slug: 'how-to-contact-us',
      lead: 'サポートへのお問い合わせ方法と、より迅速に回答を得るためのコツを説明します。',
      sections: [
        { order: 1, type: 'overview', title: 'サポート対応時間', body_md: '- **メールサポート**：平日 9:00〜18:00\n- **チャットサポート**（Proプラン以上）：平日 9:00〜21:00\n- **電話サポート**（Enterpriseプランのみ）：平日 9:00〜18:00' },
        { order: 2, type: 'procedure', title: 'お問い合わせの手順', body_md: '1. このページ下部の「お問い合わせ」をクリック\n2. お問い合わせカテゴリを選択\n3. 件名と内容を入力\n4. 必要に応じてスクリーンショットを添付\n5. 送信後、受付確認メールが届きます' },
        { order: 3, type: 'note', title: 'スムーズに解決するために', body_md: 'お問い合わせ時に以下の情報をお知らせいただくと迅速に対応できます：\n\n- ご利用のプラン\n- 発生した操作の手順\n- エラーメッセージ（ある場合）\n- スクリーンショット（可能であれば）' },
      ],
    },
    {
      title: 'プライバシーポリシーと利用規約',
      slug: 'privacy-and-terms',
      lead: '個人情報の取り扱いや、サービス利用規約の概要について説明します。',
      sections: [
        { order: 1, type: 'overview', title: '個人情報の取り扱い', body_md: '収集する情報：\n\n- 登録情報（メールアドレス・氏名）\n- 利用ログ（ページ閲覧履歴・操作ログ）\n- 支払い情報（カード会社を通じて処理）\n\n収集した情報はサービス提供・改善の目的のみに使用し、第三者へ無断提供することはありません。' },
        { order: 2, type: 'note', title: '各種ポリシーの確認方法', body_md: '詳細はフッターのリンクからご確認いただけます：\n\n- [プライバシーポリシー]\n- [利用規約]\n- [Cookie ポリシー]' },
      ],
    },
  ],
}

// ---- メイン処理 ----

async function main() {
  console.log('🚀 テンプレート記事のシードを開始します...\n')

  // カテゴリ一覧を取得
  const { data: categories, error: catError } = await supabase
    .from('category')
    .select('id, slug, name')

  if (catError) {
    console.error('❌ カテゴリ取得エラー:', catError.message)
    process.exit(1)
  }

  if (!categories || categories.length === 0) {
    console.warn('⚠️  カテゴリが見つかりませんでした。先にカテゴリを作成してください。')
    process.exit(0)
  }

  console.log(`📂 取得したカテゴリ (${categories.length}件):`)
  categories.forEach(c => console.log(`   - ${c.name} (${c.slug})`))
  console.log()

  let totalSuccess = 0
  let totalSkipped = 0

  for (const category of categories) {
    const templates = TEMPLATES[category.slug]
    if (!templates) {
      console.log(`⏭  ${category.name} (${category.slug}): テンプレートなし、スキップ`)
      continue
    }

    console.log(`📝 ${category.name} の記事を作成中...`)

    for (const tmpl of templates) {
      // 既存チェック
      const { data: existing } = await supabase
        .from('article')
        .select('id')
        .eq('slug', tmpl.slug)
        .single()

      if (existing) {
        console.log(`   ⏭  "${tmpl.title}" は既に存在するためスキップ`)
        totalSkipped++
        continue
      }

      // 記事を挿入
      const { data: article, error: artError } = await supabase
        .from('article')
        .insert({
          category_id: category.id,
          slug: tmpl.slug,
          title: tmpl.title,
          lead: tmpl.lead,
          status: 'published',
          published_at: new Date().toISOString(),
          view_count: 0,
          helpful_count: 0,
          unhelpful_count: 0,
        })
        .select('id')
        .single()

      if (artError) {
        console.error(`   ❌ "${tmpl.title}" の作成エラー:`, artError.message)
        continue
      }

      // セクションを挿入
      if (tmpl.sections.length > 0) {
        const { error: secError } = await supabase
          .from('article_section')
          .insert(tmpl.sections.map(s => ({ ...s, article_id: article.id })))

        if (secError) {
          console.error(`   ⚠️  "${tmpl.title}" のセクション作成エラー:`, secError.message)
        }
      }

      console.log(`   ✅ "${tmpl.title}" を作成しました (${tmpl.sections.length} セクション)`)
      totalSuccess++
    }
  }

  console.log(`\n🎉 完了！ 作成: ${totalSuccess}件 / スキップ: ${totalSkipped}件`)
}

main().catch(err => {
  console.error('予期しないエラー:', err)
  process.exit(1)
})
