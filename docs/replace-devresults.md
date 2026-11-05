# Move the reporting desk from DevResults

Source checked 5 November 2026: [DevResults archive and export options](https://help.devresults.com/help/archive-and-export-options). The vendor's reporting-period example shows Result, Indicator Title, Indicator Code, Activity, Activity Code, Reporting Period and Location. Current sites can call Activity a Project. The importer accepts both pairs. Other customised headings need an explicit mapping.

1. In DevResults, open Program > Reporting Periods and choose a period. Choose Export all reporting period data and select the results framework. Download the workbook once the export arrives. Do not use Export All from the project list, which does not contain results.
2. Keep the original file. The raw worksheet contains the result rows. Use it directly as XLSX, or save it as UTF-8 CSV without totals or added formulas. Run a dry run:

```sh
npm run results -- import devresults --file=imports/period.xlsx --actor="Reporting lead" --dry-run
```

3. Check row counts and the reporting period, project codes, indicator codes, location and every disaggregation. For a differently named sheet add --sheet=NAME. For changed headings add --map=imports/headings.json, such as `{"Activity Code":"Project reference"}`. Formula cells, malformed CSV, duplicate headers and incomplete rows are rejected.
4. Repeat the same command without --dry-run. A repeated identical file is a no-op. An overlapping or changed existing cell aborts the whole import. Split overlapping exports before retrying or use record-result with a correction reason.
5. Review each imported indicator with define-indicator. Enter its unit, definition, aggregation and method. Enter the period dates using set-period. Use expect to assign its owner and first target. Record a corrected version of each imported cell with its actual evidence and observation date, then review-result. Keep locations and dimensions identical so the correction preserves the original cell.
6. Compare accepted numbers with the vendor export, including a true zero, a missing submission and a rate. Complete a reporting cycle in both systems before deciding what services to replace.

## Mapping

| DevResults field | Owned record |
|---|---|
| Activity / Project, Activity Code / Project Code | Project name and stable code |
| Indicator Title, Indicator Code | Indicator name and code, initially unreviewed |
| Reporting Period | Period code and name, with dates awaiting review |
| Location | Cell location |
| Result | Non-negative numeric value in a pending result version |
| Every other heading | Preserved string dimension and full source row |

No calendar dates, definitions, evidence or aggregation rules are guessed. Extra fields, including any source IDs and geographic hierarchy, remain dimensions. Inspect these before adding new observations: the same dimensions must be used to correct a cell. Rows with identical project, indicator, period, location and dimensions are rejected, since treating them as independent can double count. Blanks are rejected; an explicit numeric zero is retained as zero.

The importer supports reporting-period result exports, not MultiMatrix pivot layouts or full instance archives. The vendor warns that raw exports do not carry its aggregation logic. Calculated indicators, cumulative figures, rates, targets, narrative responses, attachments, source-person records, permissions, dashboards, maps and integrations require separate mapping. An imported percentage is not a weighted numerator. Replace it with reviewed numerator and denominator evidence before using weighted-rate.

The fixture under fixtures/ is invented test data based on the documented headings. No real customer export was used. The source file is preserved byte-for-byte as base64 in imports, with a digest, mapping, actor and original rows. This includes every extra column, so treat imports and snapshots as private. No files or messages are sent.
