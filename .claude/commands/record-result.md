# Record a result or a traceable correction

Read CLAUDE.md. Start with current records. Run:

```sh
npm run results -- record-result --project=PROJECT --indicator=INDICATOR --period=PERIOD --location="LOCATION" --value=VALUE --observed=YYYY-MM-DD --evidence="PRIVATE REFERENCE" --actor="REPORTER"
```

Replace capitalised placeholders with the operator's actual records, never invented values. All commands accept --json. If a name or ID is ambiguous, show the candidates and ask which one. A rate requires --denominator=COUNT. Use --dimensions='{"Cohort":"Adults"}' for a disaggregation. A correction matches the same project, indicator, period, location and dimensions and requires --reason="WHY". It creates a new pending version. Never change the meaning of a cell to avoid a correction.

Report the result and its source records. Do not send, publish or delete anything.
