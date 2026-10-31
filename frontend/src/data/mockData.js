export const roles = [
  'AI/ML Engineer',
  'Data Scientist',
  'Python Developer',
]

export const demoQuestions = {
  'AI/ML Engineer': [
    {
      topic: 'Machine Learning',
      difficulty: 'Medium',
      text: 'How would you decide whether a classification problem needs a linear model or a tree-based model?',
    },
    {
      topic: 'Model Evaluation',
      difficulty: 'Medium',
      text: 'When would you choose precision over recall, and how would that choice affect your evaluation?',
    },
    {
      topic: 'Production Systems',
      difficulty: 'Hard',
      text: 'What signals would you monitor to detect model drift after deploying a model?',
    },
  ],
  'Data Scientist': [
    {
      topic: 'Statistics',
      difficulty: 'Medium',
      text: 'How would you explain the difference between correlation and causation to a product team?',
    },
    {
      topic: 'Experimentation',
      difficulty: 'Medium',
      text: 'What would you check before trusting the result of an A/B test?',
    },
    {
      topic: 'Data Quality',
      difficulty: 'Hard',
      text: 'How would you investigate a sudden change in a key business metric?',
    },
  ],
  'Python Developer': [
    {
      topic: 'Python',
      difficulty: 'Easy',
      text: 'What is the difference between a list and a tuple in Python, and when might you use each?',
    },
    {
      topic: 'APIs',
      difficulty: 'Medium',
      text: 'How would you structure error handling in a Python service that calls an external API?',
    },
    {
      topic: 'Testing',
      difficulty: 'Hard',
      text: 'How would you test code that depends on a slow or unreliable third-party service?',
    },
  ],
}

export const demoFeedback = [
  {
    score: 76,
    title: 'Good foundation',
    detail:
      'This is illustrative demo feedback, not an AI evaluation. A production review would consider accuracy, examples, and clarity.',
  },
  {
    score: 82,
    title: 'Clear reasoning',
    detail:
      'This is illustrative demo feedback, not an AI evaluation. A production review would consider accuracy, examples, and clarity.',
  },
  {
    score: 71,
    title: 'Room to elaborate',
    detail:
      'This is illustrative demo feedback, not an AI evaluation. A production review would consider accuracy, examples, and clarity.',
  },
]
