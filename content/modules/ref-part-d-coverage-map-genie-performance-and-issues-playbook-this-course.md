---
kind: reference
slug: ref-part-d-coverage-map-genie-performance-and-issues-playbook-this-course
title: "Coverage map: *Genie Performance & Issues Playbook* → this course"
part: "Part D"
summary: ""
---
| Playbook section | Course coverage |
|---|---|
| Start here — Genie Code / Genie Workbench | Module 1 (named + course rule), Modules 7–14 (used in every lab) |
| Foundation — metric views | Modules 7, 15 |
| Foundation — knowledge store, ~200 snippets | Module 9 |
| Foundation — example values / value dictionaries | Module 9 (entity matching; `'CA'` vs `'California'`) |
| Foundation — plain-English UC comments | Module 7 |
| Foundation — keys / joins defined | Module 9 (cardinality + the fan-out trap) |
| Foundation — certify / deprecate | Modules 6, 7, 12 |
| Clean & focused — ≤ 30 tables, ideally ≤ 5 | Module 7 |
| Clean & focused — instructions short, non-conflicting | Module 10 |
| Clean & focused — example queries, no duplicates | Module 10 |
| Clean & focused — benchmarks | Module 11 |
| Clean & focused — delete unused spaces | Modules 12, 15 (portfolio hygiene) |
| Limits table | Module 13 + the limits cheat sheet |
| §1 Speed — measure first, thinking vs query | Module 13 |
| §1 Step 2 — thinking-side fixes | Module 13 |
| §1 Step 3 — warehouse & table fixes (PO, Liquid Clustering, OPTIMIZE, federation) | Module 13 |
| §2 Wrong answers | Modules 4, 9, 12 (fix-routing table) |
| §2 Unsupported causal claims | Modules 2, 12 |
| §3 Inconsistency — variation by design | Modules 4, 11, 14 |
| §3 Guidance vs guarantee (UC is the only guarantee) | Modules 4, 6, 14, capstone pass bar |
| §3 Agent mode drops a filter | Modules 12, 14 |
| §4 Errors & unexplained behaviour | Module 14 |
| §4 Capture the message ID | Module 14 (evidence checklist) |
| Appendix A — measuring latency, `system.query.history` | Module 13 |
| Appendix A — MLflow tracing | Modules 13, 16 |
| Appendix A — traps (timestamps, poll-loop overhead, no sub-steps) | Modules 13, 16 |
| Appendix B — Genie directly vs supervisor | Module 16.4 |
| Appendix B — supervisor non-negotiables (timeout, capacity, identity) | Module 16.4 |

**Not covered on purpose:** specific internal ticket IDs (e.g. ES-2003513) and named internal teams — these belong in a living internal runbook, not in LMS content with a 12-month shelf life. Module 14 teaches learners to *file with evidence*; the routing table stays with support.
