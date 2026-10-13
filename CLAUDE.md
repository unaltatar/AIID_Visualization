# AIID Visualization

Dashboard that visualizes the AI Incident Database (AIID): incident trends, categories, and a weekly "what's new" view. Full project plan, data model, and visualization catalog: `docs/plan.md`.

## Stack

- `web/`: React + Vite dashboard, charts via ECharts (`echarts` / `echarts-for-react`). No TypeScript.
- `scripts/`: plain Node.js (ESM, `.mjs`) for the weekly data pipeline: fetch the AIID snapshot, transform it to JSON, diff it against the previous snapshot.
- `data/`: generated JSON the pipeline writes and the dashboard reads (`incidents.json`, `meta.json`, `whats-new.json`). Committed to the repo, not hand-edited.
- No Python. Do not add `pyproject.toml`, `uv`, or `pytest` for this project.

## Conventions

- Never use em dashes anywhere you write: code, comments, docs, commit messages, PR descriptions. Use a comma, colon, parentheses, or a full stop instead.
- No code comments unless explicitly asked. Well-named identifiers should carry the meaning.
- No new dependencies unless necessary; check `web/package.json` first. If one is genuinely needed, confirm it exists on npmjs.com before adding it.
- Follow the style of neighboring files (naming, structure, imports) rather than introducing a new pattern.
- Never read, print, or copy `.env`.

## Commands

- `npm --prefix web run dev`: local dev server.
- `npm --prefix web run build`: production build (also the check run by CI before a Pages deploy).
- `npm --prefix web run lint`: oxlint.

## Deployment

GitHub Pages, built by `.github/workflows/deploy.yml` on every push to `main`. The Pages source in the repo's GitHub settings must be set to "GitHub Actions" (one-time manual setup, not something a workflow can do).

`.github/workflows/update-data.yml` (added alongside the data pipeline) refreshes `data/` on a weekly schedule; that commit is what triggers the next deploy.
