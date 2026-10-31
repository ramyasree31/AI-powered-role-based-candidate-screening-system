const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, statusCode = null) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch {
    throw new ApiError('Could not reach the FastAPI server. Check that the backend is running.')
  }

  const contentType = response.headers.get('content-type') ?? ''
  let payload = null
  if (contentType.includes('application/json')) {
    try {
      payload = await response.json()
    } catch {
      throw new ApiError('The backend returned an invalid JSON response.', response.status)
    }
  }

  if (!response.ok) {
    const detail = payload?.detail
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => item.msg).filter(Boolean).join(' ')
        : `The backend request failed (${response.status}).`
    throw new ApiError(message, response.status)
  }

  if (payload === null || typeof payload !== 'object') {
    throw new ApiError('The backend response was empty or had an unexpected format.', response.status)
  }
  return payload
}

export function checkHealth() {
  return request('/health')
}

export async function fetchRoles() {
  const payload = await request('/api/roles')
  if (!Array.isArray(payload.roles) || payload.roles.some((role) => typeof role !== 'string')) {
    throw new ApiError('The backend returned an invalid role list.')
  }
  return payload.roles
}

export function createSession(file, role) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('role', role)
  return request('/api/sessions', { method: 'POST', body: formData })
}

export function fetchSession(sessionId) {
  return request(`/api/sessions/${encodeURIComponent(sessionId)}`)
}

export function submitAnswer(sessionId, submission) {
  return request(`/api/sessions/${encodeURIComponent(sessionId)}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  })
}

export function completeSession(sessionId) {
  return request(`/api/sessions/${encodeURIComponent(sessionId)}/complete`, {
    method: 'POST',
  })
}

export function fetchReport(sessionId) {
  return request(`/api/sessions/${encodeURIComponent(sessionId)}/report`)
}
