# Close a complete, reviewed reporting period

Read CLAUDE.md. Start with current records. Run:

```sh
npm run results -- close-period --period=PERIOD --note="RECONCILIATION AND LIMITATIONS" --actor="REVIEWER"
```

Replace capitalised placeholders with the operator's actual records, never invented values. All commands accept --json. If a name or ID is ambiguous, show the candidates and ask which one. Read reporting-desk, compliance and actions first. The command refuses incomplete returns, unresolved checks or open actions. Confirm that every expected reporting obligation is registered. Closure cannot prove that an unregistered obligation does not exist.

Report the result and its source records. Do not send, publish or delete anything.
