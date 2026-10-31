function FeedbackCard({ feedback }) {
  return (
    <section className="feedback-card" aria-live="polite">
      <div className="feedback-score">{feedback.score}</div>
      <div>
        <p className="feedback-eyebrow">ILLUSTRATIVE DEMO FEEDBACK</p>
        <h3>{feedback.title}</h3>
        <p>{feedback.detail}</p>
      </div>
    </section>
  )
}

export default FeedbackCard
