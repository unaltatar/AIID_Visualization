# AIID Visualization — Project Plan

## 1. Goal

A GitHub Pages site that visualizes the [AI Incident Database](https://incidentdatabase.ai) (AIID): incident counts and trends, incident categories, and a "what's new" view that highlights incidents added since the previous weekly snapshot. The underlying data refreshes weekly, so the site needs an automated pipeline, not a one-time import.

## 2. Data source

AIID publishes a weekly Excel export at `https://incidentdatabase.ai/research/snapshots/`, updated every Monday. There is no stable "latest" URL: each file is named with its date, e.g. `AIID_Excel_Export-20261012.xlsx`, hosted on an R2 bucket. The weekly fetch job has to scrape the snapshots page for the current link before downloading.

A copy of the current export (`docs/AIID_Excel_Export-20261012.xlsx`) is in the repo for reference while building the pipeline. It should not stay committed long-term (see §7).

### Workbook structure (confirmed from the current export)

| Sheet | Rows | Notes |
|---|---|---|
| Incidents | 1,734 | Main table. Row 1 = title, row 2 = taxonomy group headers, row 3 = real column names, row 4+ = data. 59 columns. |
| Reports | 7,920 | News/source reports, link back to incidents via report linkage, not a direct foreign key column in this export. |
| Entities | 7,465 | ID → display name lookup for deployers/developers/victims. |
| Data Dictionary | 60 | Column name, taxonomy group, source, fill rate, description. Worth reusing verbatim for an in-app "about this data" panel. |
| Coverage Map | 7 | How many incidents are covered by which combination of taxonomies (MIT / GMF / CSETv1). |

### Key fields and coverage (out of 1,734 incidents)

- **Identity (100%)**: Incident ID, date, year, title, description, deployer, developer, harmed, report_count.
- **MIT taxonomy (86% filled, 1,496 incidents)**: `Risk Domain` (7 values), `Risk Subdomain` (21 values), `Responsible Entity` (AI / Human / Other), `Intent` (Intentional / Unintentional / Other), `Timing` (Pre- / Post-deployment).
- **GMF taxonomy (~1-2% filled)**: AI Goal, AI Technology, Technical Failure. Too sparse to visualize meaningfully on its own.
- **CSETv1 taxonomy (~12% filled, ~200 incidents)**: Harm Domain, Tangible Harm, AI Harm Level, Rights Violation, Sector of Deployment, Location Region/Country/City, Autonomy Level, Lives Lost, Injuries. Useful as a "deep dive" layer, but must be labeled as partial coverage so charts aren't misread as representing the whole database.

Observed value breakdown (for reference while building chart components):

- Risk Domain: Malicious Actors & Misuse (566), AI system safety/failures/limitations (313), Discrimination and Toxicity (243), Misinformation (196), Privacy & Security (112), Human-Computer Interaction (42), Socioeconomic & Environmental Harms (24).
- Responsible Entity: AI (960), Human (525), Other (11).
- Intent: Unintentional (740), Intentional (735), Other (21).
- Timing: Post-deployment (1,460), Pre-deployment (27), Other (9).
- Location Region (of the ~200 tagged): North America (95), Global (57), Europe (26), Asia (14), Oceania (5), Africa (2), South America (1).
- Incidents per year: single digits until 2012, then roughly 8 → 13 → 24 → 41 → 50 → 46 → 45 → 91 → 80 → 109 → 179 → 308 → 457 (2012-2025), with 2026 partial so far — a clear growth story worth leading the dashboard with.
- `deployer` / `developer` are free text (1,265 / 711 distinct values) with real duplication risk (e.g. "Openai" appears standalone and combined with other tags). Needs a small alias/normalization step before ranking "top organizations."

**Decision: `Risk Domain` is the primary "incident type" axis** for the dashboard — it has the best coverage of any categorical field and the 7 categories are human-readable. `Risk Subdomain` is the drill-down layer under it. `Responsible Entity` and `Intent` are secondary cross-cuts, not top-level categories.

## 3. Visualization catalog

1. **KPI strip** — total incidents, total linked reports, incidents added since last snapshot, dataset date range, last-updated date.
2. **Incidents over time** — yearly bar/line chart (the growth trend), with a secondary monthly view for the last 12-24 months.
3. **Risk Domain breakdown** — donut or bar of the 7 top-level categories, clickable to drill into Risk Subdomain (sunburst or treemap).
4. **Responsible Entity & Intent** — two small donuts, optionally combined into a stacked bar against Risk Domain (e.g. "Malicious Actors & Misuse" skews Human+Intentional, "AI safety/failures" skews AI+Unintentional).
5. **Top organizations** — horizontal bar of most frequent deployers/developers, after name normalization.
6. **Geography** — region-level bar chart from `Location Region`, plus an optional country-level map, both explicitly labeled as covering only ~12% of incidents.
7. **What's new this week** — list of incidents newly added since the previous snapshot (title, date, deployer, Risk Domain, report count, link out), driven by `whats-new.json` from the data pipeline. Optionally a second list for incidents whose `Date Modified` changed.
8. **Browsable incident table** — filterable by Risk Domain, year, Responsible Entity, Intent; opens a detail view per incident.
9. **Data transparency panel** — restates the workbook's own Coverage Map (how much of the data each taxonomy actually covers), so partial-coverage charts aren't misread as complete.

## 4. Tech stack

- **React + Vite**, deployed to GitHub Pages via GitHub Actions (Pages source set to "GitHub Actions", not a branch — no `gh-pages` branch needed).
- **ECharts** (via `echarts-for-react`) as the charting library: it natively supports the sunburst/treemap drill-down in item 3, plus bar/line/map types, without needing multiple libraries.
- Plain JSON files as the data layer (no backend/database) — see §5.

## 5. Data pipeline

```
scripts/fetch-snapshot.mjs     scrape /research/snapshots/, resolve this week's .xlsx URL, download it
scripts/transform.mjs          parse the workbook (mind the 3-row header offset), emit clean JSON
scripts/diff-whats-new.mjs     compare new incidents.json against the previous committed version
```

Output committed to `data/`:

- `incidents.json` — trimmed incident records (only the fields the dashboard uses, not all 59 columns).
- `meta.json` — totals, date range, last-fetch timestamp, source filename, per-taxonomy coverage percentages.
- `whats-new.json` — new incident IDs and (optionally) modified ones since the prior snapshot, plus the two snapshot dates being compared.

The "previous snapshot" for diffing is just the `data/incidents.json` already on `main` before the job overwrites it — git history is the archive, no separate backup folder needed for the MVP.

## 6. GitHub Actions workflows

- **`update-data.yml`** — scheduled (weekly, after AIID's Monday refresh) + manual `workflow_dispatch`. Runs the three scripts above, commits changes under `data/` with a bot commit, pushes to `main` if anything changed.
- **`deploy.yml`** — triggered on push to `main` (covers both code changes and the data-update commit). Runs `npm ci && npm run build` in the app directory, publishes `dist/` via `actions/upload-pages-artifact` + `actions/deploy-pages`.

## 7. Repo structure (proposed)

```
.github/workflows/
  update-data.yml
  deploy.yml
scripts/
  fetch-snapshot.mjs
  transform.mjs
  diff-whats-new.mjs
data/
  incidents.json
  meta.json
  whats-new.json
web/                  React + Vite app
  src/
    components/       KpiStrip, TrendChart, RiskDomainChart, EntityIntentCharts,
                       TopOrgsChart, GeographyChart, WhatsNewFeed, IncidentTable
    lib/               data loading + taxonomy color mapping
  public/
docs/
  plan.md             this file
```

**Open item:** the raw `.xlsx` snapshot currently sitting in `docs/` should not be committed long-term — a 2-3MB file changing weekly will bloat repo history fast. Plan is to keep it out of git (`.gitignore`) once the fetch script exists and can pull it on demand instead.

## 8. Phased build order

- **Phase 1 (MVP)**: data pipeline (fetch → transform → diff), KPI strip, incidents-over-time chart, Risk Domain breakdown, What's New feed, basic incident table. Enough to deploy something real and see the automation work end to end.
- **Phase 2**: Risk Domain → Subdomain drill-down, Entity/Intent cross-tabs, top organizations (with name normalization), geography charts with explicit coverage caveats.
- **Phase 3**: incident detail view, richer table filtering/search, data transparency panel, visual polish.

## 9. Open questions for later

- Exact alias list for normalizing deployer/developer names (OpenAI, Google, Meta, etc.) — build iteratively as duplicates are noticed.
- Whether "what's new" should also surface incidents with a changed `Date Modified`, or only brand-new Incident IDs, once we see how often edits happen week to week.
- Whether the country-level map is worth building at ~12% coverage, or whether the region bar chart alone is enough for v1.
