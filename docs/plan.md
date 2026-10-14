# AIID Visualization: Project Plan

## 1. Goal

A GitHub Pages site that visualizes the [AI Incident Database](https://incidentdatabase.ai) (AIID): incident counts and trends, incident categories, and a "what's new" view that highlights incidents added since the previous weekly snapshot. The underlying data refreshes weekly, so the site needs an automated pipeline, not a one-time import.

## 2. Data source

AIID publishes a weekly Excel export at `https://incidentdatabase.ai/research/snapshots/`, updated every Monday. There is no stable "latest" URL: each file is named with its date, e.g. `AIID_Excel_Export-20261012.xlsx`, hosted on an R2 bucket. `scripts/fetch-snapshot.mjs` scrapes the page's raw HTML (it is server-rendered, no headless browser needed) for every `AIID_Excel_Export-YYYYMMDD.xlsx` link and picks the one with the latest date.

### Workbook structure (confirmed from the 2026-10-12 export)


| Sheet           | Rows  | Notes                                                                                                                      |
| --------------- | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| Incidents       | 1,734 | Main table. Row 1 = title, row 2 = taxonomy group headers, row 3 = real column names, row 4+ = data. 59 columns.           |
| Reports         | 7,920 | News/source reports, link back to incidents via report linkage, not a direct foreign key column in this export.            |
| Entities        | 7,465 | ID to display name lookup for deployers/developers/victims.                                                                |
| Data Dictionary | 60    | Column name, taxonomy group, source, fill rate, description. Worth reusing verbatim for an in-app "about this data" panel. |
| Coverage Map    | 7     | How many incidents are covered by which combination of taxonomies (MIT, GMF, CSETv1).                                      |


A blank cell in this sheet comes through as an empty string, not a missing value, once read with `sheet_to_json({header: 1, raw: false})`. `transform.mjs` normalizes `""` to `null` before computing anything; skip that step and every coverage percentage reads as 100%.

### Key fields and coverage (out of 1,734 incidents, verified against the real export via `npm run update-data`)

- **Identity (100%)**: Incident ID, date, year, title, description, deployer, developer, harmed, report_count.
- **MIT taxonomy (86.3% filled, 1,496 incidents)**: `Risk Domain` (7 values), `Risk Subdomain` (21 values), `Responsible Entity` (AI, Human, Other), `Intent` (Intentional, Unintentional, Other), `Timing` (Pre-deployment, Post-deployment).
- **GMF taxonomy (roughly 1-2% filled)**: AI Goal, AI Technology, Technical Failure. Too sparse to visualize meaningfully on its own.
- **CSETv1 taxonomy (11.5% filled, 200 incidents)**: Harm Domain, Tangible Harm, AI Harm Level, Rights Violation, Sector of Deployment, Location Region/Country/City, Autonomy Level, Lives Lost, Injuries. Useful as a "deep dive" layer, but must be labeled as partial coverage so charts aren't misread as representing the whole database.

Observed value breakdown (for reference while building chart components):

- Risk Domain: Malicious Actors & Misuse (566), AI system safety/failures/limitations (313), Discrimination and Toxicity (243), Misinformation (196), Privacy & Security (112), Human-Computer Interaction (42), Socioeconomic & Environmental Harms (24).
- Responsible Entity: AI (960), Human (525), Other (11).
- Intent: Unintentional (740), Intentional (735), Other (21).
- Timing: Post-deployment (1,460), Pre-deployment (27), Other (9).
- Location Region (of the ~200 tagged): North America (95), Global (57), Europe (26), Asia (14), Oceania (5), Africa (2), South America (1).
- Incidents per year: single digits until 2012, then roughly 8 → 13 → 24 → 41 → 50 → 46 → 45 → 91 → 80 → 109 → 179 → 308 → 457 (2012-2025), with 2026 partial so far. A clear growth story, worth leading the dashboard with.
- `deployer` / `developer` are free text (1,265 / 711 distinct values) with real duplication risk (e.g. "Openai" appears standalone and combined with other tags). Needs a small alias/normalization step before ranking "top organizations."

**Decision:** `Risk Domain` **is the primary "incident type" axis** for the dashboard. It has the best coverage of any categorical field, and the 7 categories are human-readable. `Risk Subdomain` is the drill-down layer under it. `Responsible Entity` and `Intent` are secondary cross-cuts, not top-level categories.

## 3. Visualization catalog

1. **KPI strip**: total incidents, total linked reports, incidents added since last snapshot, dataset date range, last-updated date.
2. **Incidents over time**: yearly bar/line chart (the growth trend), with a secondary monthly view for the last 12-24 months.
3. **Risk Domain breakdown**: donut or bar of the 7 top-level categories, clickable to drill into Risk Subdomain (sunburst or treemap).
4. **Responsible Entity & Intent**: two small donuts, optionally combined into a stacked bar against Risk Domain (e.g. "Malicious Actors & Misuse" skews Human+Intentional, "AI safety/failures" skews AI+Unintentional).
5. **Top organizations**: horizontal bar of most frequent deployers/developers, after name normalization.
6. **Geography**: region-level bar chart from `Location Region`, plus an optional country-level map, both explicitly labeled as covering only ~12% of incidents.
7. **What's new this week**: list of incidents newly added since the previous snapshot (title, date, deployer, Risk Domain, report count, link out), driven by `data/whats-new.json`. A second list covers incidents whose `Date Modified` changed.
8. **Browsable incident table**: filterable by Risk Domain, year, Responsible Entity, Intent; opens a detail view per incident.
9. **Data transparency panel**: restates the workbook's own Coverage Map (how much of the data each taxonomy actually covers), so partial-coverage charts aren't misread as complete.



## 4. Tech stack

- **React + Vite**, deployed to GitHub Pages via GitHub Actions (Pages source set to "GitHub Actions", not a branch, so no `gh-pages` branch is needed).
- **ECharts** (via `echarts-for-react`) as the charting library: it natively supports the sunburst/treemap drill-down in item 3, plus bar/line/map types, without needing multiple libraries.
- Plain JSON files as the data layer (no backend/database), see §5.
- **xlsx** (SheetJS) for reading the workbook in `scripts/transform.mjs`. Installed from `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, not the `xlsx` npm registry package: the last registry release has two open high-severity advisories (prototype pollution, ReDoS) with no fix published to npm, while SheetJS's own CDN carries the patched build. Parse with `XLSX.read(buffer, {type: 'buffer'})` after reading the file with Node's `fs`, not `XLSX.readFile`: this build's Node/fs auto-detection does not work under native ESM and throws "Cannot access file" even when the file exists.



## 5. Data pipeline

Implemented in `scripts/`, each file runnable on its own and covered by `scripts/transform.test.mjs`:

```
scripts/fetch-snapshot.mjs     find this week's .xlsx link on /research/snapshots/, download it to .cache/snapshot.xlsx
scripts/transform.mjs          parse the workbook (mind the 3-row header offset and the blank-cell normalization), write .cache/incidents.next.json + .cache/meta.next.json
scripts/diff-whats-new.mjs     compare .cache/incidents.next.json against data/incidents.json, write data/whats-new.json, then promote the .cache files into data/
```

`npm run update-data` runs all three in order. `.cache/` is gitignored scratch space, never committed. Staging the new snapshot there before touching `data/` means the "previous snapshot" for diffing is always just whatever is still on disk in `data/`, no extra archive folder needed, and each script can be tested independently without the others having run first.

Output committed to `data/`:

- `incidents.json`: trimmed incident records (only the fields the dashboard uses, not all 59 columns).
- `meta.json`: totals, date range, last-fetch timestamp, source filename, per-taxonomy coverage percentages.
- `whats-new.json`: incidents newly seen this snapshot, and incidents whose `Date Modified` changed, plus the two snapshot timestamps being compared.

`Date Modified` is only ~70% filled, so an edit to an incident without that field set will not surface as "updated." That is a data limitation, not a pipeline bug.

## 6. GitHub Actions workflows

- `update-data.yml`: scheduled Tuesday 06:00 UTC (a day after AIID's "every Monday" refresh, as a buffer) plus manual `workflow_dispatch`. Runs the three scripts above, and if `git diff --quiet -- data` finds a change, commits it as `github-actions[bot]` and pushes to `main`.
- `deploy.yml`: builds `web/` and publishes it to GitHub Pages. Triggered by `push` to `main` (ordinary code changes) and `workflow_dispatch`, and also declares `workflow_call` as a trigger.

A push made with the repository's default `GITHUB_TOKEN` does not trigger other workflows (GitHub's loop-prevention rule), so `update-data.yml` committing to `main` would not, by itself, fire `deploy.yml`. Instead, after a successful data commit, `update-data.yml` calls `deploy.yml` directly as a reusable workflow (`uses: ./.github/workflows/deploy.yml`). This avoids needing a personal access token secret just to chain the two workflows.

## 7. Repo structure

```
package.json            pipeline dependency (xlsx) and the update-data / test scripts
.github/workflows/
  update-data.yml
  deploy.yml
scripts/
  fetch-snapshot.mjs
  transform.mjs
  transform.test.mjs
  diff-whats-new.mjs
data/
  incidents.json
  meta.json
  whats-new.json
web/                     React + Vite app, its own package.json
  src/ 
    components/          KpiStrip, TrendChart, RiskDomainChart, EntityIntentCharts,
                          TopOrgsChart, GeographyChart, WhatsNewFeed, IncidentTable
    lib/                 data loading + taxonomy color mapping
  public/
docs/
  plan.md                this file
```



## 8. Phased build order

- **Phase 1 (MVP)**: data pipeline (done: fetch, transform, diff, weekly workflow), KPI strip, incidents-over-time chart, Risk Domain breakdown, What's New feed, basic incident table.
- **Phase 2**: Risk Domain to Subdomain drill-down, Entity/Intent cross-tabs, top organizations (with name normalization), geography charts with explicit coverage caveats.
- **Phase 3**: incident detail view, richer table filtering/search, data transparency panel, visual polish.



## 9. Open questions for later

- Exact alias list for normalizing deployer/developer names (OpenAI, Google, Meta, etc.): build iteratively as duplicates are noticed.
- Whether the country-level map is worth building at ~12% coverage, or whether the region bar chart alone is enough for v1.
- `data/incidents.json` is currently about 2.1MB uncompressed. Fine for a single fetch-on-load today; revisit (e.g. split full descriptions out of the fields used for charts) if it keeps growing or load time becomes noticeable.

