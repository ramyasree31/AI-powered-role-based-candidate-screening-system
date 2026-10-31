import { useEffect, useState } from 'react'
import { fetchSession } from './api.js'

function useSession(sessionId) {
  const [resource, setResource] = useState({
    requestKey: '',
    session: null,
    error: '',
  })
  const [reloadCount, setReloadCount] = useState(0)
  const requestKey = sessionId ? `${sessionId}:${reloadCount}` : ''

  useEffect(() => {
    if (!sessionId) return undefined

    let active = true
    fetchSession(sessionId)
      .then((response) => {
        if (active) setResource({ requestKey, session: response, error: '' })
      })
      .catch((requestError) => {
        if (active) {
          setResource({ requestKey, session: null, error: requestError.message })
        }
      })

    return () => {
      active = false
    }
  }, [sessionId, reloadCount, requestKey])

  const resourceMatches = resource.requestKey === requestKey
  const session = resourceMatches ? resource.session : null
  const setSession = (updatedSession) => {
    setResource({ requestKey, session: updatedSession, error: '' })
  }

  return {
    session,
    setSession,
    loading: Boolean(sessionId) && (!resourceMatches || (!session && !resource.error)),
    error: resourceMatches ? resource.error : '',
    reload: () => setReloadCount((count) => count + 1),
  }
}

export default useSession
