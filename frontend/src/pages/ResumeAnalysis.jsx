import { Link } from 'react-router-dom'
import CandidateProfile from '../components/CandidateProfile.jsx'
import useSession from '../lib/useSession.js'
import { getActiveSessionId } from '../lib/sessionStore.js'

function ResumeAnalysis() {
  const sessionId = getActiveSessionId()
  const { session, loading, error, reload } = useSession(sessionId)

  if (loading) {
    return <section className="empty-state"><p className="eyebrow">RESUME PREVIEW</p><h1>Loading your session...</h1></section>
  }

  if (!session) {
    return (
      <section className="empty-state">
        <p className="eyebrow">RESUME PREVIEW</p>
        <h1>{error ? 'Could not load your session.' : 'Start with your resume'}</h1>
        <p>{error || 'Choose a PDF and role on the setup page to open a resume preview.'}</p>
        {error ? (
          <button className="secondary-button" onClick={reload} type="button">Retry</button>
        ) : (
          <Link className="primary-button button-link" to="/">Go to setup</Link>
        )}
      </section>
    )
  }

  return (
    <div className="content-page">
      <div className="page-heading">
        <p className="eyebrow">STEP 01 · RESUME PREVIEW</p>
        <h1>Review your interview setup</h1>
        <p>Check the resume and role associated with this interview session.</p>
      </div>
      <CandidateProfile session={session} />
      <div className="page-actions">
        <Link className="secondary-button button-link" to="/">Edit setup</Link>
        <Link className="primary-button button-link" to="/instructions">
          Continue to instructions <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}

export default ResumeAnalysis
