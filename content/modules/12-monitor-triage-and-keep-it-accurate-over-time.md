---
kind: module
slug: 12-monitor-triage-and-keep-it-accurate-over-time
title: "Monitor, Triage, and Keep It Accurate Over Time"
num: 12
stage: "Quality & Operations"
tracks: ["author"]
level: "Advanced"
duration: "60 min"
audience: ""
summary: "1. Use the Monitor tab to find quality problems before users complain."
---
### Learning outcomes
1. Use the Monitor tab to find quality problems before users complain.
2. Run a feedback triage process.
3. Route each symptom to the correct fix *layer*.
4. Operate a curation cadence with clear ownership.

### Key concepts
- **Monitor tab** — usage and trends, conversation history, quality review of conversations, delete a conversation, and a **weekly digest**.
- **Feedback signals** — **Yes** / **Fix it** / **Request review**, plus comments on flagged responses for async back-and-forth between consumer and author.
- **Curation is iterative and never "done."** Data changes, vocabulary changes, questions change.

### Business example — the MFG weekly triage (30 min, every Monday)
```
1. Open Monitor → last 7 days
2. Every "Fix it"          → diagnose the missing input (Module 4 hierarchy) → fix at the RIGHT layer
3. Every "Request review"  → answer in comments so the user sees a human responded
4. Top 10 questions by volume not in the benchmark set → add them
5. Questions returning zero rows → usually a missing synonym or entity value
6. Review knowledge-mining suggestions → accept the good ones
7. Re-run Tier-1 smoke set → must stay at 100%
8. Log: instructions used / 100, snippets used / 200
```

### The fix-routing table (course artifact — laminate this)
| Symptom | Wrong fix | Right fix |
|---|---|---|
| "California" returns nothing | tell users to say "CA" | **entity matching** on `state` (Module 9) |
| Revenue is gross, not net | text instruction "use net revenue" | `net_fee_revenue` **measure expression** + fix the view (Modules 7, 9) |
| Loan book is 30× too high | re-ask the question | **join cardinality** + `Latest snapshot` filter + EOP view (Modules 7, 9) |
| Wrong year | a note in the description | **fiscal calendar instruction** + `dim_date` fiscal columns (Modules 7, 10) |
| Transaction counts too high | ignore it | **`status = 'POSTED'` filter expression** (Module 9) |
| "Delinquent" answered inconsistently | more prose | **two named measures** + a **clarification instruction** (Modules 9, 10) |
| A complex recurring question is always slightly off | more text instructions | **example query** or **UC function** as a trusted asset (Module 10) |
| Genie asserts a *cause* ("delinquency rose because of the new channel") | forward it to the CRO | it's an **unsupported claim** — tighten context, remove overlapping tables, diagnose with Genie Code. Genie retrieves; it does not diagnose (Module 2). |
| Answers pull from `fct_txn_legacy` | delete the table and break downstream | **certify** `fct_transactions`, **deprecate** the legacy table in UC (Modules 6, 7) |
| PII appeared in an answer | add "never show PII" to instructions | **column masks** in Unity Catalog (Module 6) |
| Answers are correct but slow | add instructions | measure thinking vs query time first (Module 13) |
| Routing is getting worse workspace-wide | tune this agent harder | **delete old and unused agents** — too many hurts routing for everyone |
| Agent mode drops a filter Chat mode applies | tell users to avoid Agent mode | that's a **product bug** — report it (Module 14), and meanwhile bake the filter into a **view or metric view** so both modes inherit it |

### Ownership model
| Role | Owns | Cadence |
|---|---|---|
| Agent owner (retail analytics lead) | definitions, triage, benchmark health | weekly |
| Data steward | UC metadata, metric views, grants, certify/deprecate | monthly |
| Business sponsor (CFO / CRO) | which questions matter, sign-off on definitions | quarterly |
| Platform admin | enablement, warehouse, **budgets**, latency | quarterly |

### Lab 12 (25 min)
Given a Monitor export of 40 MFG conversations with feedback, produce a triage sheet: root cause, correct fix **layer**, owner, priority. Fix the top 5.

**Docs:** `/genie-agents/monitor`, `/genie/best-practices`
