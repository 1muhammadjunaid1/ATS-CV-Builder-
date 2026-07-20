const LIMIT = 5
const geminiModel = 'gemini-2.5-flash'

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
  const summary = typeof req.body?.summary === 'string' ? req.body.summary.trim() : ''
  const targetRole = typeof req.body?.targetRole === 'string' ? req.body.targetRole.trim() : ''
  if (!summary) return res.status(400).json({ error: 'Add a professional summary before enhancing it.' })
  if (summary.length > 4000 || targetRole.length > 300) return res.status(400).json({ error: 'Request is too large.' })
  if (count >= LIMIT) return res.status(429).json({ error: 'Daily limit reached — resets at midnight.', usesLeft: 0, limit: LIMIT })

  // The database function increments only when the count is below LIMIT, making the cap atomic across concurrent requests.
  const usageResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_usage_limit`, { method: 'POST', headers, body: JSON.stringify({ p_user_id: user.id, p_date: date }) })
  if (!usageResponse.ok) return res.status(500).json({ error: 'Unable to reserve an AI use.' })
  const newCount = await usageResponse.json() as number
  if (newCount > LIMIT) return res.status(429).json({ error: 'Daily limit reached — resets at midnight.', usesLeft: 0, limit: LIMIT })

  const prompt = `Improve this professional CV summary${targetRole ? ` for a ${targetRole} role` : ''}. Keep it truthful: do not invent experience, metrics, employers, or skills. Return only the improved summary in 3-5 concise, ATS-friendly sentences.\n\nSummary:\n${summary}`
  const gemini = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(geminiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 450 } }) })
  if (!gemini.ok) return res.status(502).json({ error: 'Gemini could not generate an enhancement. Your daily use was reserved; please try again tomorrow.', usesLeft: Math.max(0, LIMIT - newCount), limit: LIMIT })
  const result = await gemini.json()
  const text = result?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim()
  if (!text) return res.status(502).json({ error: 'Gemini returned an empty response.', usesLeft: Math.max(0, LIMIT - newCount), limit: LIMIT })
  return res.status(200).json({ text, usesLeft: Math.max(0, LIMIT - newCount), limit: LIMIT })
}
