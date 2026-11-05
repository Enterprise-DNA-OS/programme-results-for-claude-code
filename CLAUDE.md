# Programme Results for Claude Code: operating instructions

Read records before answering. This is a programme monitoring and evaluation desk for a trusted reporting operator, not a public data collection service.

## Operator context

Business: fill in the organisation name. Operator: fill in the responsible reporting lead. Priorities: complete partner returns, traceable evidence and honest results. Ask for missing business context when it matters.

## Routing

- List supported jobs: /help.
- Read project owners and intended outcomes: /projects.
- Read the measurement definitions: /indicators.
- Check the reporting calendar: /periods.
- Check accepted results and missing submissions: /reporting-desk.
- Prepare partner follow-up: /partner-chase.
- Read pending figures and their evidence: /review-queue.
- Find complete results below their targets: /target-gaps.
- Inspect figures by location and subgroup: /disaggregation.
- Compare the same indicator over time: /trend.
- Check evidence and reporting controls: /compliance.
- Read outstanding follow-up work: /actions.
- Find projects without a note in fourteen days: /stale.
- Read change history or every version of one cell: /history.
- Register a project: /add-project.
- Define exactly what a measure means: /define-indicator.
- Record approved reporting dates: /set-period.
- Record who owes a return and its target: /expect.
- Record a result or a traceable correction: /record-result.
- Accept or reject the current result version: /review-result.
- Assign a reporting follow-up: /add-action.
- Record completed work with evidence: /complete-action.
- Record programme context: /log-note.
- Close a complete, reviewed reporting period: /close-period.
- Test and import a DevResults reporting-period export: /import.
- Write an owned snapshot without overwriting files: /export.
- Draft Monday reporting review from three current reports: /weekly-review.
- Draft a partner follow-up sheet: /draft-partner.
- Draft a funder reporting working sheet: /draft-funder.
- Change a field or rule: /customise.
- Add a read-only report: /new-view.

Open .claude/commands/<job>.md for the exact invocation. One CLI lives at scripts/results.mjs. Run npm run results -- help for discovery. All jobs accept --json. Match codes case-insensitively or use an ID prefix. If there are multiple matches, show the candidates and ask.

## Rules

Never invent data, evidence, dates, identities or a causal claim. Missing is unknown, not zero. Never sum rates, snapshots across periods or overlapping groups. Reconcile the source before reviewing an imported result. A reviewer label is not authentication. Nothing here sends or publishes.

Draft into drafts/ and present the file in chat. Never delete history. Use a new result version for corrections and a new indicator code for a changed used definition. Do not bypass a period closure gate with direct updates. Record every expected obligation before using completeness as an assurance.

Before adding fields or changing rules, export a new private snapshot, add a numbered migration and run npm test. Never alter an applied migration. Templates and scripts work with PostgreSQL or embedded PGlite. Keep commands in .claude/commands and keep AGENTS.md beside this file. No separate command tree for another runtime.

Protect source exports and reports. Keep .env, .data, drafts, exports, imports, views and docs-out out of Git. Configure brand.json for documents and views. See docs/compliance.md for the scope of the checks.
