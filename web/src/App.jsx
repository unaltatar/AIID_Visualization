import './App.css'
import { CoveragePanel } from './components/CoveragePanel'
import { DomainBreakdownChart } from './components/DomainBreakdownChart'
import { GeographyChart } from './components/GeographyChart'
import { IncidentTable } from './components/IncidentTable'
import { KpiStrip } from './components/KpiStrip'
import { RiskDomainSection } from './components/RiskDomainSection'
import { TopOrganizationsSection } from './components/TopOrganizationsSection'
import { TrendChart } from './components/TrendChart'
import { WhatsNewFeed } from './components/WhatsNewFeed'
import { useAiidData } from './lib/useAiidData'

const SECTIONS = [
  ['overview', 'Overview'],
  ['trend', 'Trend'],
  ['risk-domain', 'Risk domain'],
  ['breakdown', 'Breakdown'],
  ['organizations', 'Organizations'],
  ['geography', 'Geography'],
  ['whats-new', "What's new"],
  ['browse', 'Browse'],
  ['about', 'About this data'],
]

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
        {status === 'ready' && (
          <nav className="section-nav">
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {status === 'loading' && <p>Loading the latest snapshot...</p>}
      {status === 'error' && <p role="alert">Could not load incident data: {error.message}</p>}

      {status === 'ready' && (
        <>
          <KpiStrip meta={meta} newCount={whatsNew.newIncidents.length} />
          <TrendChart incidents={incidents} />
          <RiskDomainSection incidents={incidents} coveragePct={meta.coverage.riskDomain} />
          <DomainBreakdownChart incidents={incidents} />
          <TopOrganizationsSection incidents={incidents} />
          <GeographyChart incidents={incidents} coveragePct={meta.coverage.locationRegion} />
          <WhatsNewFeed whatsNew={whatsNew} />
          <IncidentTable incidents={incidents} />
          <CoveragePanel meta={meta} />
          <footer className="app-footer">
            Built from the{' '}
            <a href="https://incidentdatabase.ai" target="_blank" rel="noreferrer">
              AI Incident Database
            </a>
            , an independent project tracking real-world harms from AI systems.{' '}
            <a href="https://github.com/unaltatar/AIID_Visualization" target="_blank" rel="noreferrer">
              Source on GitHub
            </a>
            .
          </footer>
        </>
      )}
    </main>
  )
}

export default App
