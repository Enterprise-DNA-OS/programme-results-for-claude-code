# Measurement rules

Each expected return binds one project, one indicator and one reporting period. Its cells distinguish locations and explicit dimension values. Every correction is a new pending version of the same cell. The latest version controls reporting, including when rejected, so an old accepted result cannot silently remain in a headline.

Sum applies only to additive, mutually exclusive observations within a period. It does not deduplicate people hidden inside partner aggregates. The method text must identify what is counted and how overlapping populations are excluded.

Weighted-rate requires a numerator and positive denominator for every cell. The numerator cannot exceed the denominator. The rate is 100 times the sum of numerators divided by the sum of denominators. Do not load already calculated percentages as counts. Snapshot means exactly one portfolio-level figure. Multiple snapshot cells stay unknown until the operator resolves the reporting design.

All current cells must be accepted before an actual is shown. Missing cells that were never registered cannot be detected: maintain expected returns and validate source coverage. Observation dates must be in the reporting period. Targets stay separate from actuals. No total is calculated across unlike measures or reporting periods. Trend reports show each period separately with the preceding period's actual. A changed definition gets a new indicator code.

Example: North reports 9 passes from 10 attempts; South reports 40 from 80. The pooled rate is 49/90 = 54.44%. Averaging the two percentages gives 70%, which is the wrong answer for this population. The smoke test checks the pooled figure independently.
