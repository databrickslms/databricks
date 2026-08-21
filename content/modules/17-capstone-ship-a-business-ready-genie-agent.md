---
kind: module
slug: 17-capstone-ship-a-business-ready-genie-agent
title: "Capstone: Ship a Business-Ready Genie Agent"
num: 17
stage: "Capstone"
tracks: ["author"]
level: "Advanced"
duration: "4–6 hours (or a 1-week project)"
audience: ""
summary: "Learners pick a domain — their own real one if available, otherwise a provided financial-services profile (retail bank, commercial lender, insurer, asset manager, payments processor) — and deliver an agent a business team could use on Monday."
---
### The brief
Learners pick a domain — their own real one if available, otherwise a provided financial-services profile (retail bank, commercial lender, insurer, asset manager, payments processor) — and deliver an agent a business team could use on Monday.

### Deliverables
1. **Charter (1 page)** — audience, top 15 questions, business sponsor, owner, success metric
2. **Business glossary** — ≥ 8 terms using the Module 5 template, each with a named owner and an implementation route
3. **Data design** — ≤ 8 objects with justification, pre-join view SQL, hidden columns, PII handling, and either a metric view or a documented reason not to use one
4. **Knowledge store** — ≥ 8 synonym sets, entity matching on ≥ 4 categorical columns, all join relationships with cardinality, ≥ 6 SQL expressions (filters, measures, fields)
5. **Instructions** — ≥ 10 example queries (≥ 3 parameterised), ≥ 1 UC function as a trusted asset, ≥ 4 text instruction blocks including one four-part clarification rule, plus a budget table (used / 100 and / 200, and total instruction characters)
6. **Benchmark set** — ≥ 25 questions with ground-truth SQL across the three tiers, with a run score before and after tuning
7. **Performance baseline** — measured thinking vs query split, with one applied fix and its measured effect
8. **Governance plan** — sharing levels by group, row filters and column masks for PII, certification and deprecation decisions
9. **Operations plan** — triage cadence, owners, weekly digest routing, budget thresholds, escalation path with the evidence checklist
10. **Business readout (5 slides)** — the problem, a live demo of 3 questions, the accuracy number, the latency number, what it saves, and **what it cannot do**

### Rubric (100 points)
| Criterion | Pts | What earns full marks |
|---|---|---|
| Scope & purpose | 8 | one audience, one topic, lean object set, clear justification |
| Definitions & glossary | 10 | contested terms resolved with named owners, not deferred |
| Data preparation | 12 | pre-joins, verified descriptions, noise hidden, PII handled at the UC layer, metric-view decision reasoned |
| Knowledge store depth | 18 | synonyms match real user vocabulary; **all** joins declared with correct cardinality; metrics as expressions, not prose |
| Instructions quality | 12 | examples titled in users' words; parameters typed and commented; specific, non-conflicting, budgeted, under the char ceiling |
| Measured accuracy | 18 | real benchmark run, honest before/after, Tier-1 at 100%, failures triaged not hidden |
| Performance & operations | 12 | thinking-vs-query measured before tuning; correct fix layer; real cadence, owners, budget, escalation path |
| Business communication | 10 | a non-technical sponsor understands the value **and the limits** in 5 minutes |

### Pass bar
≥ 70 points, **and** Tier-1 smoke tests at 100%, **and** the readout explicitly states what the agent should *not* be asked *and* that consistency is guidance rather than guarantee above the Unity Catalog layer. (Stating limits is a graded requirement — it is what makes an agent trustworthy in production.)
