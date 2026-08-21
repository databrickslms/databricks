---
kind: module
slug: 04-under-the-hood-the-compound-ai-system
title: "Under the Hood: The Compound AI System"
num: 4
stage: "How It Works"
tracks: ["author","platform"]
level: "Intermediate"
duration: "60 min"
audience: ""
summary: "1. Name the inputs Genie uses, ranked by influence."
---
### Learning outcomes
1. Name the inputs Genie uses, ranked by influence.
2. Explain to a stakeholder *why* an answer was wrong, in terms of a missing input.
3. Set honest expectations about consistency.

### Key concept — Genie is **not one LLM**
It's a **compound AI system**: multiple interacting components. When it answers it assembles context from:
1. **Unity Catalog metadata** — tables, columns, comments, relationships
2. **Knowledge store** — agent-scoped semantics: descriptions, synonyms, joins, SQL expressions
3. **Instructions** — plain-text business rules from the author
4. **Example SQL queries** — worked answers Genie selects from by matching the user's phrasing
5. **Trusted assets** — author-verified parameterised queries and Unity Catalog functions
6. **Chat history** — the current thread, subject to token limits

### The vocabulary table (learners will be quizzed on this)
| Term | Plain-English definition | Where it lives |
|---|---|---|
| **Knowledge store** | The agent's private dictionary of your business: what each table/column means, synonyms, how tables join, and reusable metric/filter/field definitions. Scoped to **one** agent. | Configure → Knowledge |
| **Instructions** | Written rules: terminology, fiscal calendar, date formats, formatting. Applied **globally**, not to a subset. | Configure → Instructions |
| **Example SQL query** | A question phrased the way users phrase it, paired with SQL that answers it correctly. | Configure → Instructions |
| **Trusted asset** | A parameterised query or UC function whose logic the author has **verified**. Used as-is. | Configure → Instructions |
| **Benchmark** | A test question with a known-correct answer. **Measures** quality only — never improves answers. | Monitor → Benchmarks |
| **Agent mode** | Multi-step research: sub-tasks, multiple queries, report output. | Chat toggle |
| **Knowledge mining** | Genie proposing new joins/expressions by reading UC schemas and watching author behaviour (thumbs-up, query downloads). | suggestions in Configure |

> **Drill this distinction:** instructions and examples **change** answers. Benchmarks **grade** them. Learners confuse these constantly.

### The influence hierarchy (the course's central mental model)
```
STRONGEST  ┌─ Trusted assets (verified query / UC function)     "use this exact logic"
           ├─ Example SQL queries                              "here's a worked answer"
           ├─ Knowledge store SQL expressions                   "this is what 'net fee revenue' means"
           ├─ Knowledge store metadata (descriptions, synonyms) "this is what this column means"
           ├─ Unity Catalog comments                            "generic table docs"
WEAKEST    └─ Plain-text instructions                           "please remember to..."
```
**Teaching line:** *"Text instructions are the last resort, not the first tool."* Databricks' best-practice guidance says to prioritise SQL expressions and example SQL **over** text instructions. This inverts what most learners instinctively do.

### The honest caveat: this is guidance, not a guarantee
Genie has **built-in randomness**. A well-curated agent still varies between runs. Everything in the hierarchy makes the right answer far more *likely* — none of it *forces* it. The **only** layer that guarantees behaviour is **Unity Catalog**: row filters, column masks, grants. Everything above UC is guidance.

Say this out loud here, and again in Module 12. The alternative is a CFO discovering it the night before an earnings call.

Practical consequences learners must internalise now:
- Judge quality over a **benchmark set**, never two side-by-side runs (Module 10).
- Compare **like-for-like**: same mode, fresh chat, same agent version.
- Earlier turns in a thread are context — a "different answer" is often a different *conversation*, not a different agent.
- The more a rule lives in **prose** rather than **SQL**, the more room Genie has to vary. Pinning logic to SQL expressions and metric views removes the decision entirely.

### Lab 4 (20 min) — diagnostic
Learners get 9 wrong answers from the deliberately uncurated MFG agent — one per planted flaw. For each, identify **which input was missing** (e.g. *"summed a daily snapshot → no join cardinality declared"*; *"returned zero for California → no entity matching on `state`"*). Diagnosis only, no fixing. Then compare against their Lab 0 prediction sheet.

**Docs:** `/genie-agents/concepts`, `/genie/best-practices`
