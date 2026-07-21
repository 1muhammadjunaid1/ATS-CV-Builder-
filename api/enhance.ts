const LIMIT = 5
const geminiModel = 'gemini-1.5-flash'

async function releaseReservedUse({ supabaseUrl, headers, userId, date, reservedCount }: { supabaseUrl: string; headers: Record<string, string>; userId: string; date: string; reservedCount: number }) {
  const restoredCount = Math.max(0, reservedCount - 1)
  const response = await fetch(`${supabaseUrl}/rest/v1/usage_limits?user_id=eq.${encodeURIComponent(userId)}&date=eq.${date}&count=eq.${reservedCount}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ count: restoredCount })
  })
  return response.ok ? restoredCount : reservedCount
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' })
  const geminiKey = process.env.GEMINI_API_KEY
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!geminiKey || !supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration is incomplete.' })
  const token = typeof req.headers.authorization === 'string' ? req.headers.authorization.replace(/^Bearer\s+/i, '') : ''
  if (!token) return res.status(401).json({ error: 'Sign in to use Gemini AI.' })

  const auth = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: serviceRoleKey } })
  if (!auth.ok) return res.status(401).json({ error: 'Your session is invalid. Please sign in again.' })
  const user = await auth.json() as { id: string }
  const date = new Date().toISOString().slice(0, 10)
  const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }
  const existingResponse = await fetch(`${supabaseUrl}/rest/v1/usage_limits?user_id=eq.${encodeURIComponent(user.id)}&date=eq.${date}&select=count`, { headers })
  if (!existingResponse.ok) return res.status(500).json({ error: 'Unable to check the daily limit.' })
  const existing = await existingResponse.json() as Array<{ count: number }>
  const count = existing[0]?.count ?? 0
  if (req.method === 'GET') return res.status(200).json({ usesLeft: Math.max(0, LIMIT - count), limit: LIMIT })
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : ''
  const section = typeof req.body?.section === 'string' ? req.body.section.trim() : 'CV section'
  const instruction = typeof req.body?.instruction === 'string' ? req.body.instruction.trim() : 'Make it more concise and impactful.'
  const targetRole = typeof req.body?.targetRole === 'string' ? req.body.targetRole.trim() : ''
  const template = typeof req.body?.template === 'string' ? req.body.template.trim() : ''
  if (!content) return res.status(400).json({ error: `Add content to the ${section} section before enhancing it.` })
  if (content.length > 4000 || targetRole.length > 300 || instruction.length > 800) return res.status(400).json({ error: 'Request is too large.' })
  if (count >= LIMIT) return res.status(429).json({ error: 'Daily limit reached — resets at midnight.', usesLeft: 0, limit: LIMIT })

  // The database function increments only when the count is below LIMIT, making the cap atomic across concurrent requests.
  const usageResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_usage_limit`, { method: 'POST', headers, body: JSON.stringify({ p_user_id: user.id, p_date: date }) })
  if (!usageResponse.ok) return res.status(500).json({ error: 'Unable to reserve an AI use.' })
  const newCount = await usageResponse.json() as number
  if (newCount > LIMIT) return res.status(429).json({ error: 'Daily limit reached — resets at midnight.', usesLeft: 0, limit: LIMIT })

  const prompt = `Improve the ${section} section of a professional CV${targetRole ? ` for a ${targetRole} role` : ''}. The user requested: ${instruction}. The selected resume layout is ${template || 'standard'}. Keep it truthful: never invent experience, metrics, employers, education, credentials, or skills. Preserve factual details and return only the ready-to-paste improved section text, with no heading or commentary.\n\nCurrent ${section}:\n${content}`
  const gemini = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(geminiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 450 } }) })
  if (!gemini.ok) {
    const restoredCount = await releaseReservedUse({ supabaseUrl, headers, userId: user.id, date, reservedCount: newCount })
    return res.status(502).json({ error: 'Gemini could not generate an enhancement. Please try again.', usesLeft: Math.max(0, LIMIT - restoredCount), limit: LIMIT })
  }
  const result = await gemini.json()
  const text = result?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim()
  if (!text) {
    const restoredCount = await releaseReservedUse({ supabaseUrl, headers, userId: user.id, date, reservedCount: newCount })
    return res.status(502).json({ error: 'Gemini returned an empty response. Please try again.', usesLeft: Math.max(0, LIMIT - restoredCount), limit: LIMIT })
  }
  return res.status(200).json({ text, usesLeft: Math.max(0, LIMIT - newCount), limit: LIMIT })
}
