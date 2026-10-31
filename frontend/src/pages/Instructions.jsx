import { Link } from 'react-router-dom'
import { demoQuestions } from '../data/mockData.js'
import useSession from '../lib/useSession.js'
import { getActiveSessionId } from '../lib/sessionStore.js'

function Instructions() {
  const sessionId = getActiveSessionId()
  const { session, loading, error, reload } = useSession(sessionId)
  const role = session?.role
  const total = role ? demoQuestions[role]?.length ?? 3 : 3

  if (loading) {
    return <section className="empty-state"><p className="eyebrow">INTERVIEW INSTRUCTIONS</p><h1>Loading your session...</h1></section>
  }

  if (error) {
    return (
      <section className="empty-state">
        <p className="eyebrow">INTERVIEW INSTRUCTIONS</p>
        <h1>Could not load your session.</h1>
        <p>{error}</p>
        <button className="secondary-button" onClick={reload} type="button">Retry</button>
      </section>
    )
  }

  return (
    <div className="content-page instructions-page">
      <div className="page-heading">
        <p className="eyebrow">STEP 02 · BEFORE YOU BEGIN</p>
        <h1>Make yourself comfortable.</h1>
        <p>A few details to help you get the most out of your interview.</p>
      </div>
      <section className="instruction-summary">
        <div>
          <span className="summary-label">SELECTED ROLE</span>
          <strong>{role || 'Choose a role from setup'}</strong>
        </div>
        <div>
          <span className="summary-label">QUESTIONS</span>
          <strong>{total} questions</strong>
        </div>
        <div>
          <span className="summary-label">ESTIMATED TIME</span>
          <strong>About 15 minutes</strong>
        </div>
      </section>
      <section className="guidelines-card">
        <h2>A few helpful guidelines</h2>
        <ul className="guideline-list">
          <li><span>01</span><p>Answer in your own words and explain how you reached your conclusion.</p></li>
          <li><span>02</span><p>Use examples from your work when they help illustrate your thinking.</p></li>
          <li><span>03</span><p>Take your time. You can review your answer before moving on.</p></li>
          <li><span>04</span><p>Questions are currently samples. Answers are saved by FastAPI, but are not AI-evaluated.</p></li>
        </ul>
      </section>
      <div className="page-actions">
        <Link className="secondary-button button-link" to="/analysis">Back to resume</Link>
        {session ? (
          <Link className="primary-button button-link" to={`/interview/${session.id}`}>
            Start interview <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link className="primary-button button-link" to="/">Set up an interview <span aria-hidden="true">→</span></Link>
        )}
      </div>
    </div>
  )
}

export default Instructions
