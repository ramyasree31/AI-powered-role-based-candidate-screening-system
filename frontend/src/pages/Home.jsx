import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ResumeUpload from '../components/ResumeUpload.jsx'
import { createSession as createBackendSession, fetchRoles } from '../lib/api.js'
import { saveActiveSessionId } from '../lib/sessionStore.js'

function Home() {
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [roles, setRoles] = useState([])
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [rolesLoading, setRolesLoading] = useState(true)
  const [rolesError, setRolesError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    fetchRoles()
      .then((availableRoles) => {
        if (active) setRoles(availableRoles)
      })
      .catch((requestError) => {
        if (active) setRolesError(requestError.message)
      })
      .finally(() => {
        if (active) setRolesLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function startSetup(event) {
    event.preventDefault()
    if (!resume || !role || rolesError) {
      setError(!resume && !role
        ? 'Add a PDF resume and choose a role to continue.'
        : !resume
          ? 'Add a PDF resume to continue.'
          : rolesError
            ? 'The backend role list is unavailable. Check the FastAPI server and try again.'
            : 'Choose a role to continue.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const session = await createBackendSession(resume, role)
      if (typeof session.id !== 'string' || !session.id) {
        throw new Error('The backend created a session but returned no session ID.')
      }
      saveActiveSessionId(session.id)
      navigate('/analysis')
    } catch (requestError) {
      setError(requestError.message || 'Could not create an interview session.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="welcome-section" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            A more thoughtful way to interview
          </p>
          <h1 id="welcome-title">
            Your next opportunity
            <br />
            starts with <span>what you know.</span>
          </h1>
          <p className="welcome-description">
            A personalized technical interview built around your experience
            and the role you want.
          </p>
          <div className="welcome-meta">
            <span className="meta-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v4l2.5 1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </span>
            <span>Flexible pace</span>
            <span className="meta-divider" aria-hidden="true" />
            <span>Role-focused questions</span>
          </div>
          <div className="setup-links">
            <Link to="/analysis">Resume preview</Link>
            <Link to="/instructions">Instructions</Link>
            <Link to="/interview">Interview screen</Link>
            <Link to="/report">Interview report</Link>
          </div>
        </div>

        <form className="preview-card setup-card" onSubmit={startSetup}>
          <div className="preview-topline">
            <div>
              <p className="preview-overline">GET STARTED</p>
              <h2>Set up your interview</h2>
            </div>
            <span className="preview-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3.5 14.6 9l5.9.9-4.25 4.2 1 5.9L12 17.2l-5.25 2.8 1-5.9L3.5 9.9 9.4 9 12 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </span>
          </div>

          <div className="setup-fields">
            <ResumeUpload file={resume} onFileChange={setResume} />
            <div className="form-field">
              <label className="form-label" htmlFor="role-select">Technical role</label>
              <select
                disabled={rolesLoading || Boolean(rolesError)}
                id="role-select"
                onChange={(event) => setRole(event.target.value)}
                value={role}
              >
                <option value="">
                  {rolesLoading ? 'Loading roles...' : rolesError ? 'Roles unavailable' : 'Select a role'}
                </option>
                {roles.map((availableRole) => (
                  <option key={availableRole} value={availableRole}>{availableRole}</option>
                ))}
              </select>
              {rolesError && <p className="field-error" role="alert">{rolesError}</p>}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button setup-submit" disabled={submitting || rolesLoading || Boolean(rolesError)} type="submit">
              {submitting ? 'Creating session...' : 'Continue to resume preview'}
              <span aria-hidden="true">→</span>
            </button>
            <p className="setup-privacy">Your PDF is sent to FastAPI to create a session. Resume analysis is not available yet.</p>
          </div>
        </form>
      </section>

      <section className="principles" aria-label="Interview principles">
        <div className="principle">
          <span className="principle-number">01</span>
          <div>
            <h2>Built around you</h2>
            <p>Questions connected to your skills and experience.</p>
          </div>
        </div>
        <div className="principle">
          <span className="principle-number">02</span>
          <div>
            <h2>Focused on the role</h2>
            <p>Technical conversations that match your goals.</p>
          </div>
        </div>
        <div className="principle">
          <span className="principle-number">03</span>
          <div>
            <h2>Useful feedback</h2>
            <p>A clear summary to guide your next steps.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
