// Supabase Edge Function: AI校正
// Anthropic Claude API を経由してテキストを SEO・AIO 最適化する

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, context, apiKey } = await req.json() as {
      text: string
      context: { title?: string; type?: string; fieldType?: string }
      apiKey: string
    }

    if (!text?.trim()) {
      return json({ error: 'テキストが空です' }, 400)
    }
    if (!apiKey?.trim()) {
      return json({ error: 'APIキーが未設定です' }, 400)
    }

    // フィールドタイプに応じたプロンプトを生成
    const fieldDesc = context.fieldType === 'title'
      ? '記事タイトル'
      : context.fieldType === 'lead'
      ? 'リード文（記事の導入文）'
      : context.type
      ? `セクション本文（タイプ: ${context.type}）`
      : '本文'

    const systemPrompt = `あなたはFAQサイト記事のSEO・AIO（AI検索最適化）の専門家です。
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

    const userPrompt = [
      context.title ? `記事タイトル: ${context.title}` : '',
      `対象フィールド: ${fieldDesc}`,
      '',
      '改善対象テキスト:',
      text,
    ].filter(Boolean).join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const msg = (errData as any)?.error?.message ?? `Anthropic API エラー (${response.status})`
      return json({ error: msg }, 400)
    }

    const data = await response.json() as { content?: Array<{ text: string }> }
    const result = data.content?.[0]?.text ?? ''

    return json({ result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
    return json({ error: message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}
