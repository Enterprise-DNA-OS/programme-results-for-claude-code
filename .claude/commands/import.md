# Test and import a DevResults reporting-period export

Read CLAUDE.md. Start with current records. Run:

```sh
npm run results -- import devresults --file=PATH.csv --actor="OPERATOR" --dry-run
```

Replace capitalised placeholders with the operator's actual records, never invented values. All commands accept --json. If a name or ID is ambiguous, show the candidates and ask which one. Read docs/replace-devresults.md first. XLSX is supported with the raw sheet by default, or --sheet=NAME. Review the dry-run output, reconcile row counts and source headings, then repeat without --dry-run. Imports create pending data and preserve original files. Never infer missing dates, aggregation methods or evidence.

Report the result and its source records. Do not send, publish or delete anything.
