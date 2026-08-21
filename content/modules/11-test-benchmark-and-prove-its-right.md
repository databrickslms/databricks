---
kind: module
slug: 11-test-benchmark-and-prove-its-right
title: "Test, Benchmark, and Prove It's Right"
num: 11
stage: "Quality & Operations"
tracks: ["author"]
level: "Advanced"
duration: "90 min"
audience: ""
summary: "1. Build a benchmark set with ground-truth answers."
---
### Learning outcomes
1. Build a benchmark set with ground-truth answers.
2. Interpret Chat-mode vs Agent-mode scoring.
3. Fix a wrong answer by editing and saving the query.
4. Use **Genie Code** to debug a response and analyse a benchmark run.

### Key concepts and limits
- **Benchmarks: up to 500 questions per agent.** They **measure** accuracy — explicitly *not* context, and they never improve answers.
- **Chat-mode scoring:** each question needs a **SQL query whose result set is the correct answer**; scoring compares result sets automatically.
- **Agent-mode scoring:** uses **LLM judges** (the output is a report, not a comparable result set).
- **Access benchmark evaluations**, review individual evaluations, and **analyse a whole run with Genie Code**.
- **The fix loop:** view the generated query → correct it → **save it as an example query**. A bug fix becomes permanent training. The single most efficient curation move in the product.
- **Debug with Genie Code** when you can't see why a response went wrong.

### Why benchmarks and not spot checks
Because Genie varies by design (Module 4), a single before/after comparison proves nothing — you cannot separate a real improvement from noise. A 30-question set run before and after a change is the only honest evidence. Rules for a fair run:
- **Same mode.** Chat scores (result-set comparison) and Agent scores (LLM judge) are not comparable. Never average them.
- **Fresh chat.** Prior turns are context; a stale thread contaminates the result.
- **Same agent version.** Change one thing, re-run, record.
- **Never judge on too few runs.** Two side-by-side questions is an anecdote, not a measurement.

### The three-tier test set (course artifact)
| Tier | Count | Content | Bar |
|---|---|---|---|
| **Tier 1 — Smoke** | 10 | the common questions + top asks | **100%** before any release |
| **Tier 2 — Coverage** | 60 | every measure × every major dimension | ≥ 90% |
| **Tier 3 — Traps** | 30 | **one per planted flaw, minimum** — fiscal vs calendar, gross vs net, declined transactions, snapshot summing, delinquency ambiguity, state/region phrasing, currency mixing, both product hierarchies | ≥ 80%, and every failure gets a ticket |

### Business example — three Tier-3 trap benchmarks
```
Q: "What was revenue last year?"                                            [flaws 1, 2]
Expected: asks which fiscal period and which revenue definition, OR returns
          net fee revenue for FY2025 and says so explicitly.
Fails if:  returns gross, or uses calendar 2025.

Q: "What's our total loan book?"                                            [flaw 6]
Ground truth: SELECT SUM(principal_balance) FROM mfg.core.vw_loan_book_eop
              WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM ...)
Fails if:  the result is more than 2× the ground truth (it summed snapshots).

Q: "How many delinquent loans do we have?"                                  [flaw 7]
Expected: asks 30+ or 90+ DPD before answering.
Fails if:  it silently picks one threshold without saying which.
```

### Business example — the fix loop
```
1. Branch manager asks "deposit growth for my branch last month" → wrong (includes DECLINED)
2. She clicks "Fix it"
3. Author opens the response, clicks Show code, sees the missing status filter
4. Author edits the SQL, verifies the number, and SAVES IT AS AN EXAMPLE QUERY
5. Adds it to the Tier-3 benchmark set
6. Re-runs benchmarks → confirms no regression elsewhere
```
**Teaching line:** *every "Fix it" is a free curation task with the answer already attached.*

### Lab 11 (40 min) — GRADED
Build a 30-question benchmark set (10 smoke, 12 coverage, 8 traps — at least one per planted flaw) with ground-truth SQL. Run it, record the score, fix the top 3 failures via the edit-and-save loop, re-run, report before/after.

**Docs:** `/genie-agents/monitor`
