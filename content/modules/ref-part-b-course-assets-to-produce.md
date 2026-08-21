---
kind: reference
slug: ref-part-b-course-assets-to-produce
title: "Course Assets to Produce"
part: "Part B"
summary: "1. Module 0 dataset + the two reference agents — hard dependency for everything else"
---
| Asset | Count | Notes |
|---|---|---|
| **Meridian dataset: DDL + seed notebook** | 1 | **build this first — everything depends on it.** Small (20M) and Large (900M) tiers; nine planted flaws; 12-statement validation script |
| **Synthetic document set for the volume** | 40 PDFs | credit committee memos, branch notes, complaint letters |
| **Governance objects** | 1 set | one row filter, four column masks, three personas |
| Reference agent (fully curated, 7 objects) | 1 | the instructors' answer key |
| Broken agent (uncurated, 22 objects, 9,400-char prose) | 1 | Lab 4 diagnosis, Module 7 demo, **Module 13 latency lab** |
| Concept videos | 18 | 6–10 min each, business language per §A.5 |
| Guided demo recordings | 18 | all on the Meridian dataset |
| Lab guides + solution keys | 17 (Lab 0–16) | graded: Labs 2, 6, 7, 8, 9, 10, 11, 13, 16, plus the capstone |
| Knowledge checks | 17 | 4–6 questions each, auto-graded (Modules 0–16) |
| **Cheat sheet: limits & what happens at the limit** | 1 | 30 objects · 100 instructions (~5–7k char warning) · 200 snippets · 500 benchmarks · 120 cols × 1,024 values · **90 s SQL** · **~597 s backend** · **200 req/sec** · ~1,000+ ontology snippets |
| **Cheat sheet: fix-routing table** | 1 | Module 12's symptom → right-layer table |
| **Cheat sheet: error signatures + evidence checklist** | 1 | Module 14 — the laminated card; message ID first |
| **Cheat sheet: latency triage flow** | 1 | Module 13 — thinking vs query, with the `system.query.history` columns |
| Cheat sheet: question quality ladder | 1 | Module 2 — distribute to all business consumers |
| Glossary template | 1 | Module 5 |
| Health-check checklist | 1 | a one-page audit an author runs monthly, folding Modules 7–14 into ~30 checkboxes |
| Capstone brief + rubric | 1 | |
| Instructor guide | 1 | timing, common learner errors, discussion prompts |

### Build order
1. **Module 0 dataset + the two reference agents** — hard dependency for everything else
2. Modules 1–3 (Track 1 ships independently and early)
3. Modules 5, 7–10 (the core author value; longest to build)
4. Modules 4, 6, 11, 12
5. Modules 13, 14 (need the Large data tier and scripted error scenarios)
6. Modules 15, 16, capstone
