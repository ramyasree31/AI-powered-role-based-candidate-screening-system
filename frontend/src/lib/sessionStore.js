const ACTIVE_SESSION_KEY = 'screenwise-active-session'

export function saveActiveSessionId(sessionId) {
  window.localStorage.setItem(ACTIVE_SESSION_KEY, sessionId)
}

export function getActiveSessionId() {
  return window.localStorage.getItem(ACTIVE_SESSION_KEY)
}
