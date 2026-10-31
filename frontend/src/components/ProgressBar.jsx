function ProgressBar({ current, total }) {
  const progress = total ? (current / total) * 100 : 0

  return (
    <div className="progress-wrap">
      <div
        aria-label={`Interview progress: ${current} of ${total} questions`}
        aria-valuemax={total}
        aria-valuemin="0"
        aria-valuenow={current}
        className="progress-track"
        role="progressbar"
      >
        <span className="progress-value" style={{ width: `${progress}%` }} />
      </div>
      <span className="progress-caption">{current} of {total} answered</span>
    </div>
  )
}

export default ProgressBar
