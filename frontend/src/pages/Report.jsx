import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CandidateProfile from '../components/CandidateProfile.jsx'
import ScoreChart from '../components/ScoreChart.jsx'
import { fetchReport } from '../lib/api.js'
import { getActiveSessionId } from '../lib/sessionStore.js'

function Report({ sessionId }) {
  const activeSessionId = sessionId || getActiveSessionId()
  const [resource, setResource] = useState({ requestKey: '', report: null, error: '' })
  const [reloadCount, setReloadCount] = useState(0)
  const requestKey = activeSessionId ? `${activeSessionId}:${reloadCount}` : ''

  useEffect(() => {
    if (!activeSessionId) return undefined

    let active = true
    fetchReport(activeSessionId)
      .then((response) => {
        if (!Array.isArray(response.answers)) {
          throw new Error('The backend report is missing its answer history.')
        }
        if (active) setResource({ requestKey, report: response, error: '' })
      })
      .catch((requestError) => {
        if (active) {
          setResource({
            requestKey,
            report: null,
            error: requestError.message || 'Could not load the interview report.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [activeSessionId, reloadCount, requestKey])

  const resourceMatches = resource.requestKey === requestKey
  const report = resourceMatches ? resource.report : null
  const error = resourceMatches ? resource.error : ''
  const loading = Boolean(activeSessionId) && !resourceMatches

  if (loading) {
    return <section className="empty-state"><p className="eyebrow">INTERVIEW REPORT</p><h1>Loading your report...</h1></section>
  }

  if (error) {
    return (
      <section className="empty-state">
        <p className="eyebrow">INTERVIEW REPORT</p>
        <h1>Could not load your report.</h1>
        <p>{error}</p>
        <button className="secondary-button" onClick={() => setReloadCount((count) => count + 1)} type="button">Retry</button>
      </section>
    )
  }

  if (!report) {
    return (
      <section className="empty-state">
        <p className="eyebrow">INTERVIEW REPORT</p>
        <h1>Your report will appear here.</h1>
        <p>Set up an interview first to create a FastAPI session and report.</p>
        <Link className="primary-button button-link" to="/">Go to setup</Link>
      </section>
    )
  }

  const topicScores = Array.isArray(report.topic_performance)
    ? report.topic_performance.filter((topic) => Number.isFinite(topic.score))
    : []

  function downloadReport() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const downloadUrl = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = downloadUrl
    downloadLink.download = 'screenwise-interview-report.json'
    downloadLink.click()
    URL.revokeObjectURL(downloadUrl)
  }

  return (
    <div className="content-page report-page">
      <div className="page-heading report-heading">
        <div>
          <p className="eyebrow">INTERVIEW SUMMARY · FASTAPI</p>
          <h1>Your interview, at a glance.</h1>
          <p>
            {report.evaluation_available
              ? 'Interview feedback returned by the backend.'
              : 'Your answers are from FastAPI. Scores, AI evaluation, and RAG sources are not available yet.'}
          </p>
        </div>
        <button className="secondary-button" onClick={downloadReport} type="button">
          Download JSON
        </button>
      </div>

      <section className="report-overview">
        <div className="score-summary">
          <span className="summary-label">OVERALL SCORE</span>
          <strong>{Number.isFinite(report.overall_score) ? `${report.overall_score}` : '—'}<small>{Number.isFinite(report.overall_score) ? '/100' : 'Not evaluated'}</small></strong>
          <span>{report.answers.length} answers saved</span>
        </div>
        <div className="report-context">
          <span className="summary-label">ROLE</span>
          <strong>{report.role}</strong>
          <p>{report.completed ? 'Interview completed' : 'Interview in progress'}</p>
        </div>
      </section>

      <div className="report-grid">
        <section className="report-panel">
          <h2>Topic performance</h2>
          {topicScores.length ? (
            <ScoreChart topics={topicScores} />
          ) : (
            <p className="muted-copy">Topic scores are not available because answer evaluation has not been implemented.</p>
          )}
        </section>
        <section className="report-panel">
          <h2>Feedback and recommendations</h2>
          {report.evaluation_available ? (
            <ul className="reflection-list">
              {renderReportItems('Strengths', report.strengths)}
              {renderReportItems('Areas to improve', report.weaknesses)}
              {renderReportItems('Recommendations', report.recommendations)}
            </ul>
          ) : (
            <p className="muted-copy">Strengths, weaknesses, and recommendations will appear when backend evaluation is available.</p>
          )}
        </section>
      </div>

      <section className="report-panel history-panel">
        <div className="section-title-row">
          <div>
            <h2>Question and answer history</h2>
            <p>Answers below were retrieved from your FastAPI session.</p>
          </div>
          {!report.completed && (
            <Link className="secondary-button button-link" to={`/interview/${report.id}`}>
              Continue interview
            </Link>
          )}
        </div>
        {report.answers.length ? (
          <div className="history-list">
            {report.answers.map((item) => (
              <article className="history-item" key={`${report.id}-${item.question_index}`}>
                <div className="history-question">
                  <span className="question-count">QUESTION {item.question_index + 1} · {item.topic}</span>
                  <h3>{item.question}</h3>
                  <p className="history-answer">
                    <strong>Your answer</strong>
                    {item.answer}
                  </p>
                  <p className="history-feedback">
                    {item.evaluation
                      ? `${item.evaluation.score}/100 · ${item.evaluation.feedback}`
                      : 'No evaluation returned by the backend.'}
                  </p>
                </div>
                <details className="why-question">
                  <summary>Why this question?</summary>
                  <div className="why-content">
                    <p><strong>Retrieval query</strong>{item.retrieval_query || 'Not provided by the backend.'}</p>
                    <p><strong>Retrieved chunks</strong>{formatChunks(item.retrieved_chunks)}</p>
                    <p><strong>Source chunk IDs</strong>{formatChunks(item.source_chunk_ids)}</p>
                    <p><strong>Explanation</strong>{item.generation_reason || 'Question generation rationale is not available from the backend.'}</p>
                  </div>
                </details>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted-copy">No answers have been submitted yet.</p>
        )}
      </section>

      <section className="report-profile">
        <h2>Resume details</h2>
        <CandidateProfile session={report} />
      </section>
    </div>
  )
}

function renderReportItems(title, items) {
  if (!Array.isArray(items) || items.length === 0) return null
  return items.map((item, index) => (
    <li key={`${title}-${index}`}>
      <strong>{title}</strong>
      <span>{item}</span>
    </li>
  ))
}

function formatChunks(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) return 'Not provided by the backend.'
  return chunks.map((chunk) => typeof chunk === 'string' ? chunk : JSON.stringify(chunk)).join('\n')
}

export default Report
