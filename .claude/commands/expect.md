# Record who owes a return and its target

Read CLAUDE.md. Start with current records. Run:

```sh
npm run results -- expect --project=PROJECT --indicator=INDICATOR --period=PERIOD --owner="OWNER" --target=100 --actor="OPERATOR"
```

Replace capitalised placeholders with the operator's actual records, never invented values. All commands accept --json. If a name or ID is ambiguous, show the candidates and ask which one. 

Report the result and its source records. Do not send, publish or delete anything.
