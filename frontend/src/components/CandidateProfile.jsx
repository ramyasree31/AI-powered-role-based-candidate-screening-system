function CandidateProfile({ session }) {
  const profile = session.candidate_profile
  const details = [
    ['Skills', listOrUnavailable(profile?.skills)],
    ['Technologies', listOrUnavailable(profile?.technologies)],
    ['Projects', listOrUnavailable(profile?.projects)],
    ['Education', profile?.education || 'Not available from backend'],
    ['Experience', profile?.experience_level || 'Not available from backend'],
  ]

  return (
    <section className="profile-card">
      <div className="profile-file">
        <span className="file-icon" aria-hidden="true">PDF</span>
        <div className="uploaded-file-copy">
          <strong>{session.resume.name}</strong>
          <span>{formatFileSize(session.resume.size)}</span>
        </div>
        <span className="profile-role">{session.role}</span>
      </div>
      <div className="profile-notice">
        <span aria-hidden="true">i</span>
        {session.analysis_status === 'complete'
          ? 'Resume details below were returned by the backend.'
          : 'FastAPI has not implemented resume analysis yet. The PDF itself is not retained; no candidate details have been inferred.'}
      </div>
      <dl className="profile-details">
        {details.map(([label, value]) => (
          <div className="profile-detail" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function listOrUnavailable(value) {
  return Array.isArray(value) && value.length ? value.join(', ') : 'Not available from backend'
}

function formatFileSize(size) {
  if (size < 1024) return `${size} bytes`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default CandidateProfile
