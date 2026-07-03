import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState<string>('checking...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('unreachable'))
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>Find My Dish</h1>
      <p>Backend: {status}</p>
    </div>
  )
}

export default App
