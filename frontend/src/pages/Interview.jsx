import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AnswerInput from '../components/AnswerInput.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import { completeSession as completeBackendSession, submitAnswer } from '../lib/api.js'
import { demoQuestions } from '../data/mockData.js'
import useSession from '../lib/useSession.js'

function Interview({ sessionId }) {
  const navigate = useNavigate()
  const { session, setSession, loading, error: loadError, reload } = useSession(sessionId)
  const [answer, setAnswer] = useState('')
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
    return <section className="empty-state"><p className="eyebrow">TECHNICAL INTERVIEW</p><h1>Loading your interview...</h1></section>
  }

  if (loadError) {
    return (
      <section className="empty-state">
        <p className="eyebrow">TECHNICAL INTERVIEW</p>
        <h1>Could not load this session.</h1>
        <p>{loadError}</p>
        <button className="secondary-button" onClick={reload} type="button">Retry</button>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="empty-state">
        <p className="eyebrow">TECHNICAL INTERVIEW</p>
        <h1>No active interview yet</h1>
        <p>Upload a PDF and choose a role to create a FastAPI interview session.</p>
        <Link className="primary-button button-link" to="/">Go to setup</Link>
      </section>
    )
  }

  const questions = demoQuestions[session.role] ?? []
  const questionIndex = justSubmitted ? session.question_index - 1 : session.question_index

  if (session.completed || questionIndex >= questions.length) {
    return (
      <section className="empty-state">
        <p className="eyebrow">INTERVIEW COMPLETE</p>
        <h1>Your answers are saved.</h1>
        <p>FastAPI stores your answers, but question generation and evaluation are not implemented yet.</p>
        <Link className="primary-button button-link" to={`/report/${session.id}`}>
          View interview report <span aria-hidden="true">→</span>
        </Link>
      </section>
    )
  }

  const question = questions[questionIndex]

  async function submitCurrentAnswer(event) {
    event.preventDefault()
    if (!answer.trim()) {
      setError('Write an answer before submitting.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const updatedSession = await submitAnswer(session.id, {
        question_index: session.question_index,
        question: question.text,
        topic: question.topic,
        answer: answer.trim(),
      })
      setSession(updatedSession)
      setAnswer('')
      setJustSubmitted(true)
    } catch (requestError) {
      setError(requestError.message || 'Could not save your answer.')
    } finally {
      setSubmitting(false)
    }
  }

  async function moveForward() {
    setError('')
    if (session.question_index >= questions.length) {
      setSubmitting(true)
      try {
        const completed = await completeBackendSession(session.id)
        setSession(completed)
        navigate(`/report/${session.id}`)
      } catch (requestError) {
        setError(requestError.message || 'Could not complete the interview.')
      } finally {
        setSubmitting(false)
      }
      return
    }
    setJustSubmitted(false)
  }

  return (
    <div className="content-page interview-page">
      <div className="interview-heading">
        <div>
          <p className="eyebrow">TECHNICAL INTERVIEW</p>
          <h1>{session.role}</h1>
        </div>
        <span className="session-chip">FastAPI session</span>
      </div>
      <div className="sample-question-notice">
        Sample question · Interview question generation and answer evaluation are not implemented by the backend.
      </div>
      <ProgressBar current={session.answers.length} total={questions.length} />
      {justSubmitted ? (
        <div className="interview-feedback">
          <section className="answer-saved-card" aria-live="polite">
            <span className="answer-saved-icon" aria-hidden="true">✓</span>
            <div>
              <h2>Answer saved</h2>
              <p>Your answer was stored by FastAPI. No AI evaluation or score was generated.</p>
            </div>
          </section>
          <button className="primary-button" disabled={submitting} onClick={moveForward} type="button">
            {submitting ? 'Saving...' : session.question_index >= questions.length ? 'Finish interview' : 'Next question'}
            <span aria-hidden="true">→</span>
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      ) : (
        <form className="answer-form" onSubmit={submitCurrentAnswer}>
          <QuestionCard
            question={question}
            questionNumber={questionIndex + 1}
            total={questions.length}
          />
          <AnswerInput disabled={submitting} onChange={setAnswer} value={answer} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="answer-actions">
            <p>Your answer is submitted to FastAPI and saved with this session.</p>
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? 'Saving answer...' : 'Submit answer'}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Interview
