function AnswerInput({ value, onChange, disabled = false }) {
  const characterLimit = 4000

  return (
    <div className="answer-field">
      <label className="form-label" htmlFor="candidate-answer">Your answer</label>
      <textarea
        disabled={disabled}
        id="candidate-answer"
        maxLength={characterLimit}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your answer here. Take a moment to organize your thoughts..."
        rows="8"
        value={value}
      />
      <span className="character-count">{value.length} / {characterLimit}</span>
    </div>
  )
}

export default AnswerInput
