import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { checkHealth } from '../lib/api.js'
import { getActiveSessionId } from '../lib/sessionStore.js'

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M16 3.5 27 9.75v12.5L16 28.5 5 22.25V9.75L16 3.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="m11 16 3.2 3.2 6.8-7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </span>
  )
}

function Navbar() {
  const [backendStatus, setBackendStatus] = useState('checking')
  const sessionId = getActiveSessionId()
  const navigation = [
    { to: '/', label: 'Setup', end: true },
    { to: '/analysis', label: 'Resume preview' },
    { to: '/instructions', label: 'Instructions' },
    { to: sessionId ? `/interview/${sessionId}` : '/interview', label: 'Interview' },
    { to: sessionId ? `/report/${sessionId}` : '/report', label: 'Report' },
  ]

  useEffect(() => {
    let active = true
    checkHealth()
      .then((health) => {
        if (active && health.status === 'healthy') setBackendStatus('connected')
        else if (active) setBackendStatus('unavailable')
      })
      .catch(() => {
        if (active) setBackendStatus('unavailable')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="Screenwise home">
        <BrandMark />
        <span className="brand-name">screenwise</span>
      </NavLink>

      <nav className="header-nav" aria-label="Candidate pages">
        {navigation.map(({ to, label, end }) => (
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
            end={end}
            key={label}
            to={to}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="header-note">
        <span className={`status-dot status-${backendStatus}`} aria-hidden="true" />
        <span>{backendStatus === 'checking' ? 'Connecting to API' : backendStatus === 'connected' ? 'FastAPI connected' : 'Backend unavailable'}</span>
      </div>
    </header>
  )
}

export default Navbar
