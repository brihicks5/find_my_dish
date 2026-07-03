import { FormEvent, useEffect, useRef, useState } from 'react'

function loadUser(): { name: string; token: string } | null {
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name')
  if (token && name) return { token, name }
  return null
}

function saveUser(user: { name: string; token: string }) {
  localStorage.setItem('token', user.token)
  localStorage.setItem('name', user.name)
}

function clearUser() {
  localStorage.removeItem('token')
  localStorage.removeItem('name')
}

function App() {
  const [mode, setMode] = useState<'signup' | 'login'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(loadUser)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function loginUser(data: { name: string; token: string }) {
    saveUser(data)
    setUser(data)
  }

  function logout() {
    clearUser()
    setUser(null)
    setMenuOpen(false)
    setEmail('')
    setPassword('')
    setName('')
    setMode('login')
  }

  async function handleSubmit(e: FormEvent, endpoint: 'signup' | 'login') {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body = endpoint === 'signup'
      ? { name, email, password }
      : { email, password }

    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (typeof data.detail === 'string') {
          setError(data.detail)
        } else if (Array.isArray(data.detail)) {
          setError(data.detail[0]?.msg ?? 'Validation error')
        } else {
          setError('Something went wrong')
        }
        return
      }

      loginUser({ name: data.name, token: data.token })
    } catch {
      setError('Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div style={{ fontFamily: 'system-ui' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem' }}>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '1.2rem' }}
              aria-label="Settings"
            >
              ⚙
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: '0.25rem',
                background: 'white', border: '1px solid #ccc', borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: '120px', zIndex: 10,
              }}>
                <button
                  onClick={logout}
                  style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit', fontSize: '0.9rem' }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>Welcome, {user.name}!</h1>
          <p>You're logged in.</p>
        </div>
      </div>
    )
  }

  const inputStyle = { display: 'block', width: '100%', padding: '0.5rem', marginBottom: '0.75rem', boxSizing: 'border-box' as const }

  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ lineHeight: 1.3 }}>Looking for a dish?</h1>
      <p style={{ marginBottom: '1.5rem' }}>You've come to the right place. Welcome to Liztit.</p>
      {mode === 'signup' && (
        <>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={(e) => handleSubmit(e, 'signup')}>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            {password.length > 0 && password.length < 8 && (
              <p style={{ color: 'red', fontSize: '0.85rem', margin: '-0.5rem 0 0.75rem' }}>
                Password must be at least 8 characters
              </p>
            )}
            <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#666' }}>
            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setError(null) }} style={{ color: '#0066cc' }}>Log in</a>
          </p>
        </>
      )}
      {mode === 'login' && (
        <>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={(e) => handleSubmit(e, 'login')}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#666' }}>
            Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); setError(null) }} style={{ color: '#0066cc' }}>Sign up</a>
          </p>
        </>
      )}
    </div>
  )
}

export default App
