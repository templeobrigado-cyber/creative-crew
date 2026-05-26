// Anthropic API を直接呼び出すAI校正サービス
// ブラウザから直接呼び出すため `anthropic-dangerous-direct-browser-access: true` ヘッダーが必要
// （Anthropic 公式サポート: https://docs.anthropic.com/en/api/getting-started#accessing-the-api）

export type AiProofreadResult =
  | { text: string; error: null }
  | { text: null; error: string }

export interface ProofreadContext {
  apiKey: string
  title?: string
  type?: string
  fieldType?: 'title' | 'lead' | 'body'
}

const SYSTEM_PROMPT = `あなたはFAQサイト記事のSEO・AIO（AI検索最適化）の専門家です。
提供されたテキストを以下の観点で改善してください。

【SEO最適化】
- ユーザーが検索しそうなキーワードを自然に含める
- 検索意図に直接応える明確な表現を使う
- 重要な情報を前半に配置する

【AIO（AI検索最適化）】
- Perplexity・ChatGPT・Geminiなどで引用されやすい、事実ベースで明確な文章にする
- 「〜とは」「〜の方法」など質問に直接答える構造にする
- 具体的で検証可能な情報・手順を含める

【制約】
- 元の意味・トーンを維持する
- 日本語として自然で読みやすい文章を維持する
- 改善後のテキストのみ返す（説明・前置き・補足は不要）
- 文字数は元のテキストの80〜150%程度に収める`

export async function proofreadText(
  text: string,
  context: ProofreadContext
): Promise<AiProofreadResult> {
  if (!text.trim()) {
    return { text: null, error: 'テキストが空です' }
  }

  if (!context.apiKey?.trim()) {
    return {
      text: null,
      error: 'Anthropic APIキーが未設定です。設定 > AI設定 でAPIキーを入力してください。',
    }
  }

  const fieldDesc =
    context.fieldType === 'title' ? '記事タイトル'
    : context.fieldType === 'lead' ? 'リード文（記事の導入文）'
    : context.type ? `セクション本文（タイプ: ${context.type}）`
    : '本文'

  const userPrompt = [
    context.title ? `記事タイトル: ${context.title}` : '',
    `対象フィールド: ${fieldDesc}`,
    '',
    '改善対象テキスト:',
    text,
  ].filter(Boolean).join('\n')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': context.apiKey,
        'anthropic-version': '2023-06-01',
        // ブラウザからの直接アクセスを明示的に許可するヘッダー（Anthropic 仕様）
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const msg =
        (errData as any)?.error?.message ??
        `Anthropic API エラー (HTTP ${response.status})`
      return { text: null, error: msg }
    }

    const data = await response.json() as { content?: Array<{ text: string }> }
    const result = data.content?.[0]?.text ?? ''

    if (!result) {
      return { text: null, error: '結果が取得できませんでした' }
    }

    return { text: result, error: null }
  } catch (err: unknown) {
    console.error('[proofreadText]', err)
    const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
    return { text: null, error: message }
  }
}
