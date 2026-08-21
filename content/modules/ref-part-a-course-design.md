---
kind: reference
slug: ref-part-a-course-design
title: "Course Design"
part: "Part A"
summary: "Three published tracks from one build:"
---
### A.1 The one-sentence promise
*"By the end of this course you can build a Genie Agent your business team actually trusts — you can prove it's right, you can explain why it's slow, and you know which problems aren't yours to fix."*

### A.2 Who this course is for

| Persona | What they need | Modules |
|---|---|---|
| **Business consumer** (branch manager, credit risk analyst, product owner) | Ask questions, read answers, know when to trust them | 1–3 (the feedback loop is taught in 2) |
| **Agent author / analyst** (the main audience) | Build, curate, tune, test, measure, own an agent | all |
| **Data steward / platform owner** | Governance, PII, cost, latency, portfolio scaling | 0, 1, 6, 7, 12, 13, 15 |
| **Developer / integrator** | API, embedding, tracing, CI/CD, multi-agent | 0, 1, 4, 13, 14, 16 |

Three published **tracks** from one build:
- **Track 1 — Genie for Business Users** · Modules 1–3 · ~3 hours · no SQL
- **Track 2 — Genie Agent Author** · Modules 0–16 + capstone (17) · ~20 hours
- **Track 3 — Genie for Platform & Integration Teams** · Modules 0, 1, 4, 6, 13, 14, 15, 16 · ~8 hours

### A.3 Prerequisites
- **Track 1:** none.
- **Tracks 2–3:** working SQL (joins, aggregation, window functions), familiarity with the Unity Catalog three-level namespace (`catalog.schema.table`).
- Lab environment: a Databricks workspace with Unity Catalog, a **Pro or serverless SQL warehouse**, and Genie enabled at account **and** workspace level. Module 0 provisions the rest.

### A.4 Format and delivery
- **18 units** — Module 0 (dataset build), Modules 1–16, and the capstone (Module 17).
- Each unit: **concept video (6–10 min) → guided demo → hands-on lab → knowledge check**.
- Every module opens with a real business question and closes with *"what would have gone wrong."*
- Delivery options: 3-day instructor-led · 5-week blended (2 modules per week) · 8-week self-paced.
- Assessment: 17 knowledge checks (auto-graded) + 9 graded labs (2, 6, 7, 8, 9, 10, 11, 13, 16) + 1 capstone (rubric-scored).
- **All build and tune labs are done in Genie Code or the Genie Workbench.** Reading about curation is not curation.

### A.5 Teaching language rules (enforce in every script)
| Say this | Not this |
|---|---|
| "A Genie Agent is a data room you curate for one team" | "a semantic layer abstraction" |
| "Teach it like you'd onboard a new credit analyst" | "prompt engineering" |
| "Show it a worked example" | "few-shot exemplar" |
| "Business rules it must never break" | "system prompt constraints" |
| "Prove it's right with a test set" | "eval harness" |
| "Find out whether it's thinking or querying" | "profile the inference path" |

---

## LEVEL 0 — LAB SETUP
