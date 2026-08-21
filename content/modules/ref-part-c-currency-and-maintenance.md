---
kind: reference
slug: ref-part-c-currency-and-maintenance
title: "Currency and Maintenance"
part: "Part C"
summary: "Genie ships fast and the docs were reorganised recently (Spaces → Agents; the Genie One / Agents / Code split). Build the course to survive that:"
---
Genie ships fast and the docs were reorganised recently (Spaces → Agents; the Genie One / Agents / Code split). Build the course to survive that:

- **Quote every limit from the single cheat-sheet asset**, never inline in a video script. Limits change; re-recording video is expensive. This applies especially to the operational limits (90 s, ~597 s, 200 req/sec, character ceilings) which are the most likely to move.
- **Never put pricing numbers in a video.** Keep billing details in Module 15's handout with a "verify at `docs.databricks.com/aws/en/genie/budgets`" line. The free-usage window (through Jan 31, 2027) expires during this course's life.
- **Treat the error-signature table as perishable.** Several entries are active bugs, not permanent behaviour. Keep it in a handout with a review date, and re-check each entry quarterly.
- **Review against the AI/BI and Genie release notes quarterly.**
- **Screenshots will drift.** Prefer short screen recordings of *flows* over annotated stills; keep a screenshot inventory for refresh sprints.
- **Flag regional dependencies** (Agent mode availability, cross-Geo processing) as "check your workspace" rather than a fixed answer.
- **Re-verify the latency baseline annually.** There is an active Databricks latency workstream; the ~20 s thinking figure is a current observation, not a specification. Teach the *method* (measure both halves) so the module survives the numbers changing.
