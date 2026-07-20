import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { openAuthModal } from '../lib/authModal'

export default function AuthButton() {
  const { user, signOut } = useAuth()
  const [error, setError] = useState('')
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0]
  if (!user) return <button className="auth-button" onClick={openAuthModal}>Sign in</button>
  return <div className="auth-menu"><button className="auth-button" onClick={() => signOut().catch((err) => setError(err.message))}>Sign out</button>{error && <span className="auth-error">{error}</span>}</div>
}
