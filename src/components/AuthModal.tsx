import { FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { AUTH_MODAL_EVENT } from '../lib/authModal'
import { useAuth } from '../hooks/useAuth'

export default function AuthModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { configured, signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth()

  useEffect(() => {
    const show = () => { setError(''); setMessage(''); setOpen(true) }
    window.addEventListener(AUTH_MODAL_EVENT, show)
    return () => window.removeEventListener(AUTH_MODAL_EVENT, show)
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setMessage('')
    try {
      if (mode === 'signIn') await signInWithPassword(email, password)
      else { await signUpWithPassword(email, password); setMessage('Check your email to confirm your account, then sign in.') }
      if (mode === 'signIn') setOpen(false)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to continue.') }
  }
  const google = async () => { try { setError(''); await signInWithGoogle() } catch (err) { setError(err instanceof Error ? err.message : 'Unable to start Google sign-in.') } }
  if (!open) return null

  return <div className="modal-wrap" role="dialog" aria-modal="true" aria-labelledby="auth-title"><div className="modal auth-modal">
    <button className="modal-close" aria-label="Close sign in" onClick={() => setOpen(false)}><X size={18} /></button>
    <p className="eyebrow">AI enhancement</p><h2 id="auth-title">Sign in to use Gemini AI</h2>
    <p>Your CV builder remains private in this browser. Sign-in is only needed for the AI feature.</p>
    {!configured ? <p className="auth-error">Supabase is not configured yet. Add the public environment variables and reload.</p> : <>
      <button className="google-button" onClick={google}>Continue with Google</button><div className="auth-divider"><span>or</span></div>
      <form onSubmit={submit} className="auth-form"><label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label><button className="primary" type="submit">{mode === 'signIn' ? 'Sign in' : 'Create account'}</button></form>
      {error && <p className="auth-error">{error}</p>}{message && <p className="auth-message">{message}</p>}
      <button className="auth-switch" onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}>{mode === 'signIn' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button>
    </>}
  </div></div>
}
