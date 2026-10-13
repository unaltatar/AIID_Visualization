import { useEffect, useState } from 'react'

const DATA_BASE = `${import.meta.env.BASE_URL}data/`

async function fetchJson(name) {
  const response = await fetch(`${DATA_BASE}${name}`)
  if (!response.ok) throw new Error(`Failed to load ${name}: HTTP ${response.status}`)
  return response.json()
}

export function useAiidData() {
  const [state, setState] = useState({
    status: 'loading',
    incidents: null,
    meta: null,
    whatsNew: null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchJson('incidents.json'), fetchJson('meta.json'), fetchJson('whats-new.json')])
      .then(([incidents, meta, whatsNew]) => {
        if (!cancelled) setState({ status: 'ready', incidents, meta, whatsNew, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', incidents: null, meta: null, whatsNew: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
