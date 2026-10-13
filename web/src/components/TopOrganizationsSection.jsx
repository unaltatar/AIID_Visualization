import { TopEntitiesChart } from './TopEntitiesChart'

export function TopOrganizationsSection({ incidents }) {
  return (
    <section className="chart-card">
      <h2>Most frequently named organizations</h2>
      <p className="chart-note">
        Counts how often a name appears in the deployer/developer fields, an incident can name several. Includes
        both specific companies and descriptive actor labels AIID uses when no specific entity is identified (e.g.
        "Scammers"). Long-tail names keep AIID's own title-cased spelling.
      </p>
      <div className="top-orgs-grid">
        <TopEntitiesChart incidents={incidents} field="deployer" title="Top deployers" />
        <TopEntitiesChart incidents={incidents} field="developer" title="Top developers" />
      </div>
    </section>
  )
}
