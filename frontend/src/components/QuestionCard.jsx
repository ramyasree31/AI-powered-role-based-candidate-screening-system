function QuestionCard({ question, questionNumber, total }) {
  return (
    <section className="question-card">
      <div className="question-card-top">
        <span className="question-count">QUESTION {questionNumber} OF {total}</span>
        <div className="question-badges">
          <span className="topic-badge">{question.topic}</span>
          <span className={`difficulty-badge difficulty-${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
        </div>
      </div>
      <h2>{question.text}</h2>
    </section>
  )
}

export default QuestionCard
