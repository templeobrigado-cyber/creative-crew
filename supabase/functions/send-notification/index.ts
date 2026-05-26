import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

type NotificationType = 'article_published' | 'new_contact' | 'new_feedback' | 'zero_hit'

const SETTING_KEY: Record<NotificationType, string> = {
  article_published: 'notify_article_published',
  new_contact:       'notify_new_contact',
  new_feedback:      'notify_new_feedback',
  zero_hit:          'notify_zero_hit',
}

function buildSubject(type: NotificationType, payload: Record<string, string>): string {
  switch (type) {
    case 'article_published': return `[FAQ-CMS] 記事が公開されました: ${payload.title}`
    case 'new_contact':       return `[FAQ-CMS] 新しいお問い合わせ: ${payload.subject}`
    case 'new_feedback':      return `[FAQ-CMS] フィードバックが届きました: ${payload.article_title}`
    case 'zero_hit':          return `[FAQ-CMS] ヒット0クエリ通知: "${payload.query}"`
  }
}

function buildHtml(type: NotificationType, payload: Record<string, string>): string {
  const base = `font-family: sans-serif; color: #2C2C2A; line-height: 1.7;`
  const badge = `display: inline-block; background: #FF9D1A; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 12px; margin-bottom: 16px;`
  const label = `font-size: 13px; color: #6B6961; margin: 0 0 2px;`
  const value = `font-size: 15px; margin: 0 0 12px;`
  const box = `background: #FFF8E7; border: 1px solid #FFB84D; border-radius: 8px; padding: 16px 20px; margin-top: 16px;`

  switch (type) {
    case 'article_published':
      return `<div style="${base}">
        <span style="${badge}">記事公開</span>
        <p style="${label}">タイトル</p><p style="${value}">${payload.title}</p>
        ${payload.url ? `<p style="${label}">スラッグ</p><p style="${value}">${payload.url}</p>` : ''}
      </div>`

    case 'new_contact':
      return `<div style="${base}">
        <span style="${badge}">お問い合わせ</span>
        <p style="${label}">送信者</p><p style="${value}">${payload.name}（${payload.email}）</p>
        <p style="${label}">件名</p><p style="${value}">${payload.subject}</p>
        <div style="${box}">
          <p style="${label}">内容</p>
          <p style="margin:0; white-space: pre-wrap;">${payload.message}</p>
        </div>
      </div>`

    case 'new_feedback':
      return `<div style="${base}">
        <span style="${badge}">フィードバック</span>
        <p style="${label}">記事</p><p style="${value}">${payload.article_title}</p>
        <p style="${label}">評価</p><p style="${value}">役に立たなかった</p>
        ${payload.comment ? `<div style="${box}"><p style="${label}">コメント</p><p style="margin:0;">${payload.comment}</p></div>` : ''}
      </div>`

    case 'zero_hit':
      return `<div style="${base}">
        <span style="${badge}">ヒット0クエリ</span>
        <p style="${label}">検索クエリ</p><p style="${value}">"${payload.query}"</p>
        <p style="color:#6B6961; font-size:13px;">このキーワードで記事作成を検討してください。</p>
      </div>`
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { type, payload } = await req.json() as { type: NotificationType; payload: Record<string, string> }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: rows } = await supabase
      .from('site_setting')
      .select('key, value')
      .in('key', ['notify_email', SETTING_KEY[type]])

    const settings: Record<string, string> = {}
    rows?.forEach(r => { settings[r.key] = r.value })

    const toEmail = settings['notify_email']?.trim()
    const enabled = settings[SETTING_KEY[type]] === 'true'

    if (!toEmail || !enabled) {
      return new Response(JSON.stringify({ skipped: true }), { headers: { 'Content-Type': 'application/json' } })
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FAQ-CMS <onboarding@resend.dev>',
        to: toEmail.split(',').map((e: string) => e.trim()),
        subject: buildSubject(type, payload),
        html: buildHtml(type, payload),
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
