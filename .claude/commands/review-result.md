# Accept or reject the current result version

Read CLAUDE.md. Start with current records. Run:

```sh
npm run results -- review-result --result=RESULT_ID --decision=accepted --note="REVIEW EVIDENCE" --actor="REVIEWER"
```

Replace capitalised placeholders with the operator's actual records, never invented values. All commands accept --json. If a name or ID is ambiguous, show the candidates and ask which one. Read disaggregation and history --cell=CELL first. Check evidence manually. Acceptance requires a reviewed definition, valid reporting dates and evidence. A named actor is an audit label, not authenticated identity. Do not treat a successful check as certification.

Report the result and its source records. Do not send, publish or delete anything.
