import './App.css'
import { IncidentTable } from './components/IncidentTable'
import { KpiStrip } from './components/KpiStrip'
import { RiskDomainChart } from './components/RiskDomainChart'
import { TrendChart } from './components/TrendChart'
import { WhatsNewFeed } from './components/WhatsNewFeed'
import { useAiidData } from './lib/useAiidData'

function App() {
  const { status, incidents, meta, whatsNew, error } = useAiidData()

  return (
    <main className="app-shell">
      <header>
        <h1>AI Incident Database: Visualization</h1>
        <p>
          Incident trends and categories from the{' '}
          <a href="https://incidentdatabase.ai" target="_blank" rel="noreferrer">
            AI Incident Database
          </a>
          , refreshed weekly.
        </p>
      </header>

      {status === 'loading' && <p>Loading the latest snapshot...</p>}
      {status === 'error' && <p role="alert">Could not load incident data: {error.message}</p>}

      {status === 'ready' && (
        <>
          <KpiStrip meta={meta} newCount={whatsNew.newIncidents.length} />
          <TrendChart incidents={incidents} />
          <RiskDomainChart incidents={incidents} coveragePct={meta.coverage.riskDomain} />
          <WhatsNewFeed whatsNew={whatsNew} />
          <IncidentTable incidents={incidents} />
        </>
      )}
    </main>
  )
}

export default App
