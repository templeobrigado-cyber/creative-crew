import { supabase, isSupabaseConfigured } from '../supabase'

type NotificationType = 'article_published' | 'new_contact' | 'new_feedback' | 'zero_hit'

export async function sendNotification(
  type: NotificationType,
  payload: Record<string, string>,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  try {
    await supabase.functions.invoke('send-notification', { body: { type, payload } })
  } catch (err) {
    console.error('[notification] failed:', err)
  }
}
