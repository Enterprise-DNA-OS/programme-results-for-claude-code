# Programme Results for Claude Code

Know which partner returns are missing, which figures have evidence, and what the accepted results say. Keep programme reporting in a database you own.

## Three ways to own it

- **Do it yourself:** the MIT-licensed base is free. Use Claude Code, Codex, OpenCode or Cursor. Hosting, your agent subscription and operating time are separate.
- **We customise it:** Enterprise DNA brings your DevResults records across, checks measurement definitions, changes fields and rules, connects your systems and builds staff screens or another stack when needed. One setup fee, then a retainer for ongoing work.
- **We run it for you:** Omni by Enterprise DNA installs, connects and maintains your version, with backups, access controls and regular reporting reviews. One setup fee, then a retainer.

[Book a 30-minute call with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=devresults).

## Start with the synthetic demo

Node 20 or newer. No cloud account is needed.

```sh
npm install
npm test
npm run demo
npm run results -- reporting-desk --period=CURRENT
npm run results -- partner-chase
npm run results -- compliance
npm run view
npm run docs
```

Then ask your coding agent for `/weekly-review`. The invented demo includes a missing water-point return, an unverified attendance return, an overdue action and unequal assessment cohorts. The weighted pass rate is 49 / 90, or 54.44%, not the average of 90% and 50%. Repeated seeding preserves edits. Use a new DATA_DIR without demo seed for real work.

## Instead of DevResults

The [vendor pricing table](https://www.devresults.com/plans) lists US$28,000 per year for the entry programme band. Setup and training are separate. The FAQ on that same page contains older, inconsistent example figures. We use the table, checked 5 November 2026, and make no claim about a particular NZ or Australian customer's invoice.

This is the internal monitoring and evaluation desk: projects, indicator reference sheets, reporting periods, expected partner returns, disaggregated results, review decisions and follow-up work. It is distinct from grant administration and frontline service delivery. You can maintain the desk entirely through the database and agent commands.

DevResults also supplies mapping, collection integrations, partner access, document storage and broader project-management features. This base does not reproduce those services. Plan and test their replacement before cancelling a live subscription. No payment, filing, email, collection portal or publication happens here. The system does not certify reporting compliance or prove that a programme caused an outcome.

## Recurring jobs

| Command | What it does |
|---|---|
| /help | List supported jobs |
| /projects | Read project owners and intended outcomes |
| /indicators | Read the measurement definitions |
| /periods | Check the reporting calendar |
| /reporting-desk | Check accepted results and missing submissions |
| /partner-chase | Prepare partner follow-up |
| /review-queue | Read pending figures and their evidence |
| /target-gaps | Find complete results below their targets |
| /disaggregation | Inspect figures by location and subgroup |
| /trend | Compare the same indicator over time |
| /compliance | Check evidence and reporting controls |
| /actions | Read outstanding follow-up work |
| /stale | Find projects without a note in fourteen days |
| /history | Read change history or every version of one cell |
| /add-project | Register a project |
| /define-indicator | Define exactly what a measure means |
| /set-period | Record approved reporting dates |
| /expect | Record who owes a return and its target |
| /record-result | Record a result or a traceable correction |
| /review-result | Accept or reject the current result version |
| /add-action | Assign a reporting follow-up |
| /complete-action | Record completed work with evidence |
| /log-note | Record programme context |
| /close-period | Close a complete, reviewed reporting period |
| /import | Test and import a DevResults reporting-period export |
| /export | Write an owned snapshot without overwriting files |
| /weekly-review | Draft Monday reporting review from three current reports |
| /draft-partner | Draft a partner follow-up sheet |
| /draft-funder | Draft a funder reporting working sheet |
| /customise | Change fields or rules through a tested migration |
| /new-view | Add a branded read-only report |

29 CLI commands and 31 slash commands. Every CLI command accepts --json. Mutations need --actor="NAME". Actor names are operational records, not authenticated identities. Commands use --key=value. Read the matching recipe under .claude/commands for complete examples.

## Ten questions your records answer

1. Which partners owe a return for a period that has already closed for data collection? (`partner-chase`)
2. Which reported numbers still lack evidence? (`compliance`)
3. Which accepted results fall below their agreed targets? (`target-gaps`)
4. What is the pass rate when each site has a different number of assessments? (`reporting-desk`)
5. Which corrections changed an earlier reported figure? (`history --cell=ATTEND-SOUTH`)
6. Which locations have a figure waiting for review? (`review-queue`)
7. Which projects have gone fourteen days without a recorded note? (`stale`)
8. How does this period compare with the prior period using the same definition? (`trend`)
9. Which imported measures still have no approved aggregation rule? (`compliance`)
10. Which follow-ups must finish before this period can close? (`actions`)

These are implemented questions, not an unsupported claim that DevResults cannot answer them. Your own database lets you join reporting evidence with the records your organisation chooses to add.

## Your first hour: ten things to ask for

1. Put our name, logo and colours in brand.json.
2. Show late and missing partner returns.
3. Show figures without a source reference.
4. Explain the weighted pass-rate calculation.
5. Draft the weekly reporting review.
6. Read a cell's complete correction history.
7. Test our reporting-period export without writing it.
8. Reconcile imported rows, locations and dimensions.
9. Add our funding-stream code with a tested migration.
10. Save a complete private snapshot before changing rules.

## Bring your history across

[Replace guide](docs/replace-devresults.md): export reporting-period results from DevResults, then run one import command. CSV and XLSX are supported. Original bytes and every source row are retained. Identical reimports do nothing. Changed or overlapping cells are rejected rather than overwriting your working record. Extra columns remain dimensions until a person reconciles them. The fixture is synthetic and follows the vendor's published headings, not a captured customer export.

Imported results remain pending. Confirm definitions, reporting dates, targets and source evidence before accepting them. Formula rules, maps, attachments, permissions, dashboards, narrative responses and complete instance archives need separate mapping.

## Measurement rules

Only complete accepted submissions produce a headline actual. Missing, pending and rejected values produce unknown, not zero. Sum only mutually exclusive rows. Weighted rates pool numerators and denominators. A snapshot requires exactly one portfolio cell. Periods are compared, never summed automatically. The system cannot discover overlapping populations hidden inside a partner's aggregate. Your reviewer checks that evidence.

Corrections create new versions and require reasons. Reviewed result versions, imported files, notes and audit entries cannot be rewritten. Used indicator definitions and established targets cannot be silently replaced. A period closes only when all registered returns are accepted, evidence checks pass and actions are complete. Unregistered obligations are outside that gate.

## Documents and read-only views

`npm run docs` renders period briefs, indicator reference sheets and partner reporting returns. `npm run view` renders the reporting desk, partner follow-up and evidence checks. All use brand.json and escape record text. Generated files are private local HTML. They are working papers, not audited financial or service-performance statements.

## Operations

With no DATABASE_URL, the shared template adapter uses embedded PGlite under DATA_DIR (default .data/db). With DATABASE_URL it uses PostgreSQL. Use a trusted owner connection and restrict OS and database access. Domain tables enable row-level security and remove PUBLIC privileges. This base is not a hosted multi-tenant service and provides no identity provider or partner access layer.

Exports include original imports and private operational records. Store them with your backups, not in Git. `export` writes a new snapshot and refuses to overwrite an existing file. Restore is reviewed maintenance, not an automatic command. Use native database backups too.

`npm test` uses a disposable database and output directory. It checks every command, weighted rates, actual zeros, incomplete results, history, calendar gates, duplicate imports, rollback, CSV/XLSX imports and escaped HTML. CI covers Ubuntu and Windows on Node 20 and 22, and PostgreSQL 16. TEST_DATABASE_URL must point to an empty disposable database.

Read [compliance controls](docs/compliance.md), [measurement design](docs/measurement.md), [research](docs/research.md) and [why no front end](docs/why-no-front-end.md).

MIT licence. Copyright 2026 Enterprise DNA. DevResults is its owner's trademark. This independent implementation contains no vendor code or assets.
