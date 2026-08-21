---
kind: module
slug: 06-governance-who-sees-what-and-why-its-safe
title: "Governance: Who Sees What, and Why It's Safe"
num: 6
stage: "How It Works"
tracks: ["author","platform"]
level: "Intermediate"
duration: "75 min"
audience: "authors + stewards"
summary: "1. Explain the two credential types and their security implications."
---
### Learning outcomes
1. Explain the two credential types and their security implications.
2. Predict what three different users see from the same question.
3. Handle PII in a regulated dataset.
4. Assign the right sharing level and pass the permissions checklist.

### Key concepts
**Two credential types** — the most important governance idea in the course:
- **Compute credentials** — embedded by the agent author (which warehouse runs the query)
- **Data credentials** — **the asking user's own identity**

Consequence: Unity Catalog **row filters and column masks are enforced per user**. Two people ask the identical question and correctly get different numbers.

**Required permissions to author:** Databricks SQL workspace entitlement · `CAN USE` on a **Pro or serverless** SQL warehouse · `SELECT` on every object in the agent · `CAN EDIT` on the agent. An account admin must first enable partner-powered AI features at **account and workspace** level.

**Sharing levels:** `CAN MANAGE` · `CAN EDIT` · `CAN RUN` · `CAN VIEW` — set via folder permissions or direct share.

**Also cover:** cloning an agent; **exporting an agent's context as a metric view** (promotes curated semantics into a governed UC object); assigning **certification** to an agent; and **certify/deprecate on the underlying data** so Genie prefers `fct_transactions` over `fct_txn_legacy`.

### Business example — the row-filter demo (run this live)
```
Question (identical for all three): "What was net fee revenue last fiscal quarter?"

Priya  (Regional Manager, Northeast) → $41.2M
Marcus (Regional Manager, West)      → $28.7M
Elena  (CFO, unrestricted)           → $186.4M
```
Same agent. Same question. Three correct answers. **Genie leaked nothing.**

### Business example — PII in a regulated dataset (flaw 8)
```
Question: "Give me the contact details for our top 20 depositors"

Priya  → names and account IDs; email masked, ssn_last4 masked, dob masked
Elena  → same masking; annual_income visible (CFO exception)
Neither → can retrieve a usable PII export from Genie at all
```
**Teaching point:** the right answer to "can Genie leak PII?" is *"only what Unity Catalog already lets that person see."* Curating an agent is not a security control — masks and filters are. Authors who try to prevent PII exposure with a **text instruction** ("never show email addresses") have built nothing. Demonstrate that instruction failing.

### Business example — sharing levels at MFG
| Person | Level | Rationale |
|---|---|---|
| Retail analytics lead (owner) | CAN MANAGE | owns definitions, manages sharing |
| Two analysts on the team | CAN EDIT | add examples, fix bad SQL, see source queries |
| 340 branch managers | CAN RUN | ask questions, give feedback, can't change logic |
| Exec assistant | CAN VIEW | read shared threads only |

### Lab 6 (25 min) — GRADED
Given the MFG access matrix (3 personas × 11 objects, one row filter, four column masks), predict for 8 questions whether each user gets an answer, a masked answer, a partial answer, or a permission error. Then verify in the workspace.

### Common mistakes
- Assuming the author's permissions apply to consumers (they don't).
- Granting `CAN EDIT` broadly "so people can help" — editors change business logic for everyone.
- **Trying to enforce PII rules with instructions instead of column masks.**
- Building on a table the consumer group has no `SELECT` on, then debugging the agent instead of the grant.

**Docs:** `/genie-agents/concepts` (permissions), `/genie-agents/set-up`
