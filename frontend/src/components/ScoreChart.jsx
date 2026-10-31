function ScoreChart({ topics }) {
  return (
    <div className="score-chart" role="img" aria-label="Illustrative performance by interview topic">
      {topics.map(({ topic, score }) => (
        <div className="chart-row" key={topic}>
          <div className="chart-label">
            <span>{topic}</span>
            <strong>{score}%</strong>
          </div>
          <div className="chart-track">
            <span style={{ width: `${score}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ScoreChart
