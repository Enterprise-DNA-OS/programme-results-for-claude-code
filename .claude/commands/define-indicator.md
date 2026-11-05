# Define exactly what a measure means

Read CLAUDE.md. Start with current records. Run:

```sh
npm run results -- define-indicator --code=CODE --name="NAME" --unit="UNIT" --aggregation=sum --definition="WHAT IS COUNTED" --method="HOW TO COMBINE DISJOINT ROWS" --actor="REVIEWER"
```

Replace capitalised placeholders with the operator's actual records, never invented values. All commands accept --json. If a name or ID is ambiguous, show the candidates and ask which one. Use sum only for additive, mutually exclusive observations. Use weighted-rate for numerator and denominator data. Use snapshot for one portfolio figure per period. Used definitions cannot be rewritten. Create a new code for a changed definition and explain comparability.

Report the result and its source records. Do not send, publish or delete anything.
