---
kind: module
slug: 13-performance-why-genie-feels-slow-and-what-actually-fixes-it
title: "Performance: Why Genie Feels Slow, and What Actually Fixes It"
num: 13
stage: "Quality & Operations"
tracks: ["author","platform"]
level: "Advanced"
duration: "90 min"
audience: "authors + platform owners"
summary: "1. Split a slow response into thinking time vs query time before changing anything."
---
> Sourced from the *Genie Performance & Issues Playbook*. This module needs the **Large** data tier from Module 0 — you cannot teach latency on a toy dataset.

### Learning outcomes
1. Split a slow response into **thinking time** vs **query time** before changing anything.
2. Measure both halves with `system.query.history` and the Conversation API.
3. Apply the right fix to the right half.
4. Recognise the hard limits that masquerade as bugs.

### The core insight
```
total response time  =  THINKING  +  QUERY EXECUTION
                        (routing + reading      (SQL run
                         context + writing SQL)  + fetch)
typical observed:        ~20+ seconds            ~3–10 seconds
```
**Most slowness is in the thinking half — context, not the database.** So the instinct "make the warehouse bigger" usually fixes nothing. Measure first; the two halves are fixed in completely different places.

### Limits to know before you tune
*Many "problems" are really a limit being hit.*

| Limit | Value | What happens at the limit |
|---|---|---|
| Tables per agent | **≤ 30 (aim ≤ 5)** | worse routing, slower thinking |
| Text instructions | warning at **~5,000–7,000 chars**; **~100** max | Genie may **silently ignore** parts of long instructions |
| Knowledge store snippets | **~200** | extra context stops being used |
| **SQL query time** | **90 sec — cannot be raised** | query returns a timeout error |
| **Backend response** | **~597 sec (~10 min)** | "runaway" answer — **billed but never shown** |
| Ontology snippets (good coverage) | ~1,000+ (non-CMK workspace) | too few = little learned context |
| **AI model requests** | **200/sec shared** · 300,000/sec dedicated | heavy sequential use hits **429 / rate limit** |

### Step 1 — find out where the time goes (never tune blind)
- **Compare total response time vs SQL run time.** Query fast but total 30 s+ → it's **thinking** (Step 2). Query slow → **warehouse/tables** (Step 3).
- **Read the query timing breakdown.** Big *wait* = warehouse; big *run* = table tuning.
- **`system.query.history` columns (ms):** `execution_duration_ms` (pure SQL — your baseline), `compilation_duration_ms`, `waiting_for_compute_duration_ms` (cold start), `waiting_at_capacity_duration_ms` (queue/overload), `result_fetch_duration_ms`. Filter to Genie's warehouse and window; use `client_application` to exclude BI and notebook traffic.
- **Conversation API status transitions:** `submit → EXECUTING_QUERY` = the thinking half; `EXECUTING_QUERY → COMPLETED` = SQL run + fetch. Timestamp them yourself.
- **Correlation gotcha:** there is **no `statement_id`** in the API response — match on `statement_text` + warehouse + a narrow time window.
- **MLflow tracing:** inside an MLflow agent (`GenieAgent`), `mlflow.langchain.autolog()` captures the Genie call as one timed span. Calling the API yourself, wrap it in `@mlflow.trace` and open a span per status phase for a first-class thinking-vs-query split. **On serverless, autolog is off by default.**

**Three measurement traps to teach explicitly:**
1. **Don't time Genie from system-table timestamps** — `last_updated_timestamp` moves and isn't reliable.
2. **Instrument your own poll loop as a separate span** — a naive loop has been measured adding **6–8 s of self-inflicted delay**, which then gets blamed on Genie.
3. **Genie doesn't expose internal sub-steps** — you get thinking-vs-query, not a finer breakdown. Don't promise stakeholders more resolution than exists.

### Step 2 — if the *thinking* is slow (most common)
| Check | Fix |
|---|---|
| Too much context to read? | cut to **≤ 5 objects**, shorten examples, hide unused columns |
| Very wide tables in the agent? | replace with **slim views** holding only needed columns |
| Same query generated over and over, or a "token budget" error? | an older model **looping** (~60 s wasted) — switch to a newer model |
| Long or stale chat session? | **start a fresh chat** |
| Instruction blocks over ~5,000–7,000 chars? | move the logic into SQL expressions and metric views |

### Step 3 — if the *query* is slow (warehouse & tables)
| Check | Fix |
|---|---|
| Warehouse overloaded / queuing? | scale up or add a dedicated warehouse; turn on Genie's **"auto" compute mode** |
| Using Serverless with sensible autoscaling? | Serverless with a real **min/max**, not one fixed large warehouse |
| Hitting the **90-second** query limit? | keep the warehouse warm; filter and cluster big tables. **The limit cannot be raised.** |
| Managed tables with **Predictive Optimization** on *and running*? | enable PO and confirm it is actually running |
| **Liquid Clustering** on filter/join columns? | cluster `fct_transactions` on `txn_date`, `account_id`; `fct_loan_balances` on `snapshot_date` |
| **External tables** maintained? | schedule `VACUUM` + `OPTIMIZE` + `ANALYZE` — external tables get no auto-upkeep |
| Slow joins to an **outside database** (federation)? | prefer catalog federation, or copy hot data into a Databricks table. **Escalate to the perf/federation team — not a Genie fix.** |

### Diagnosis → fix
| Where the time is | Fix |
|---|---|
| High `execution_duration_ms` | optimise SQL, add filters, pre-join into views, define keys (Step 3) |
| High `waiting_at_capacity_duration_ms` | auto mode / bigger / dedicated warehouse |
| High `waiting_for_compute_duration_ms` | keep the warehouse warm / serverless |
| Big gap **before** `EXECUTING_QUERY`, small SQL | **thinking dominates** — trim context, fewer tables, newer model; escalate to the latency team with the evidence |

### Business example — the MFG "Genie is too slow" complaint
```
Complaint: branch managers say it takes 40 seconds.

Measurement:
  execution_duration_ms                 4,100 ms   ← the SQL is fine
  gap before EXECUTING_QUERY           31,000 ms   ← thinking dominates
  poll-loop overhead (own code)         3,200 ms   ← self-inflicted
Verdict: a thinking problem, plus 3 seconds we added ourselves.

What the agent actually looked like:
  22 objects, including fct_transactions_raw (380 columns) and fct_txn_legacy
  9,400 characters of prose instructions  ← over the ~5–7k warning threshold
  no join specs declared

Fixes applied:
  → 22 objects down to 7 (Module 7)
  → 380-column raw table replaced with a slim view
  → 6,000 chars of prose converted to 4 SQL expressions + 3 example queries
  → poll interval fixed at 2 s with a proper backoff
Result: ~14 seconds total.

The warehouse was never the problem — and the platform team had already
doubled it. Twice. For nothing.
```
**Teaching line:** *"Doubling the warehouse when the thinking is slow is like buying a faster car to fix a traffic jam."*

### Lab 13 (40 min) — GRADED
Given the deliberately slow MFG agent on the Large tier: measure both halves using `system.query.history` and the Conversation API, produce a written diagnosis, apply **at least three fixes at the correct layer**, re-measure, and report before/after with evidence. **Grading rewards a correct diagnosis over a large speedup** — a learner who correctly identifies a thinking-bound problem and improves it 20% scores higher than one who doubles the warehouse and gets lucky.

### Common mistakes
- Scaling the warehouse for a thinking-bound problem.
- Timing Genie from system-table timestamps.
- Blaming Genie for latency your own poll loop added.
- Treating the 90-second SQL limit as a configuration knob.
- Tuning before measuring.

**Docs:** query history · MLflow Tracing · SQL warehouses · Predictive Optimization · Liquid Clustering · OPTIMIZE · `/genie/best-practices`
