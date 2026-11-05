# Record approved reporting dates

Read CLAUDE.md. Start with current records. Run:

```sh
npm run results -- set-period --code=CODE --start=YYYY-MM-DD --end=YYYY-MM-DD --due=YYYY-MM-DD --actor="OPERATOR"
```

Replace capitalised placeholders with the operator's actual records, never invented values. All commands accept --json. If a name or ID is ambiguous, show the candidates and ask which one. 

Report the result and its source records. Do not send, publish or delete anything.
