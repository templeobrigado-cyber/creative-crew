const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

type Payload = {
  to_email: string
  creator_name: string
  project_title: string
  project_description: string
  budget_min?: number
  budget_max?: number
  deadline?: string
  required_skills?: string[]
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const payload = await req.json() as Payload

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const budgetText = payload.budget_min && payload.budget_max
      ? `¥${payload.budget_min.toLocaleString()} 〜 ¥${payload.budget_max.toLocaleString()}`
      : payload.budget_max ? `〜¥${payload.budget_max.toLocaleString()}` : '要相談'

    const deadlineText = payload.deadline
      ? new Date(payload.deadline).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
      : '要相談'

    const skillsHtml = payload.required_skills?.length
      ? payload.required_skills.map(s =>
          `<span style="display:inline-block;background:#EEF2FF;color:#4338CA;padding:2px 10px;border-radius:999px;font-size:12px;margin:2px;">${s}</span>`
        ).join('')
      : ''

    const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e1b4b; line-height: 1.7; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 40px; border-radius: 12px 12px 0 0;">
    <p style="color: #c7d2fe; font-size: 13px; margin: 0 0 4px;">CreativeCrew</p>
    <h1 style="color: #fff; font-size: 22px; margin: 0; font-weight: 700;">新しい案件があなたに紹介されました</h1>
  </div>
  <div style="background: #fff; border: 1px solid #e0e7ff; border-top: none; padding: 32px 40px; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 24px;">${payload.creator_name} さん、こんにちは。<br>あなたのスキルにマッチする案件を管理者が選定しました。ぜひご確認ください。</p>

    <div style="background: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; color: #4f46e5; margin: 0 0 12px;">${payload.project_title}</h2>
      <p style="font-size: 14px; color: #374151; margin: 0 0 16px; white-space: pre-wrap;">${payload.project_description}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 4px 0; color: #6b7280; width: 80px;">予算</td>
          <td style="padding: 4px 0; font-weight: 600;">${budgetText}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">納期</td>
          <td style="padding: 4px 0; font-weight: 600;">${deadlineText}</td>
        </tr>
      </table>
      ${skillsHtml ? `<div style="margin-top: 12px;">${skillsHtml}</div>` : ''}
    </div>

    <p style="font-size: 13px; color: #6b7280; margin: 0;">ご興味がある場合は、CreativeCrew のマイページよりご応募ください。</p>
  </div>
  <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px;">© 2026 CreativeCrew</p>
</div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CreativeCrew <onboarding@resend.dev>',
        to: [payload.to_email],
        subject: `【CreativeCrew】案件紹介：${payload.project_title}`,
        html,
      }),
    })
    const result = await res.json()
    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
