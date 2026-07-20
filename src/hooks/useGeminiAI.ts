import { useEffect, useState } from 'react'
import type { ThemeId } from '../types/cv'
import { useAuth } from './useAuth'
import { openAuthModal } from '../lib/authModal'

type EnhanceResponse = { text?: string; usesLeft?: number; limit?: number; error?: string }

async function readJsonResponse(response: Response): Promise<EnhanceResponse> {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as EnhanceResponse
  } catch {
    return { error: response.ok ? 'The AI service returned an invalid response.' : text }
  }
}

export function useGeminiAI() {
  const { session } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [usesLeft, setUsesLeft] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) { setUsesLeft(null); return }
    fetch('/api/enhance', { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(async (response) => response.ok ? readJsonResponse(response) : null)
      .then((payload) => { if (typeof payload?.usesLeft === 'number') setUsesLeft(payload.usesLeft) })
      .catch(() => undefined)
  }, [session])

  const enhance = async ({ content, section, instruction, targetRole, template }: { content: string; section: string; instruction: string; targetRole: string; template: ThemeId | null }): Promise<string | null> => {
    if (!session) { openAuthModal(); return null }
    if (usesLeft === 0) return null
    setIsLoading(true); setError(null)
    try {
      // This text is relayed to Gemini for this request only; the app never stores CV data server-side.
      const response = await fetch('/api/enhance', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ content, section, instruction, targetRole, template }) })
      const payload = await readJsonResponse(response)
      if (!response.ok) {
        if (typeof payload.usesLeft === 'number') setUsesLeft(payload.usesLeft)
        throw new Error(payload.error || 'Unable to enhance this section. Make sure the Vercel API route is running.')
      }
      if (typeof payload.usesLeft === 'number') setUsesLeft(payload.usesLeft)
      if (!payload.text) throw new Error(payload.error || 'The AI service returned an empty response.')
      return payload.text
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to enhance this section.'); return null } finally { setIsLoading(false) }
  }

  return { enhance, isLoading, usesLeft, error, limit: 5, isAuthenticated: Boolean(session) }
}
