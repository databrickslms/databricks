---
kind: module
slug: 09-the-knowledge-store-teach-it-your-business
title: "The Knowledge Store: Teach It Your Business"
num: 9
stage: "Building"
tracks: ["author"]
level: "Intermediate–Advanced"
duration: "90 min"
audience: ""
summary: "1. Build agent-scoped metadata and synonyms."
---
### Learning outcomes
1. Build agent-scoped metadata and synonyms.
2. Configure **entity matching / value dictionaries** for categorical columns.
3. Declare join relationships with the right cardinality.
4. Write the three kinds of **SQL expressions** — filters, measures, fields.
5. Evaluate **knowledge mining** suggestions.

### Key concepts and limits
| Element | What it does | Limit |
|---|---|---|
| Table / column descriptions | agent-scoped meaning — **does not overwrite** Unity Catalog metadata | part of the 200-snippet budget |
| Synonyms | maps business vocabulary onto column names | " |
| Hidden columns | removes noise and duplicate hierarchies | — |
| **Prompt matching — format assistance** | supplies representative values automatically; fixes spelling/format drift | automatic |
| **Prompt matching — entity matching** (also called **example values** / **value dictionaries**) | curated lists of distinct values, so Genie filters on the *real* value (`'CA'`) instead of inventing one (`'California'`) | **120 columns**, **1,024 values** each |
| Join relationships | explicit PK–FK links; Many-to-One / One-to-Many / One-to-One; complex conditions via SQL expression | part of 200 |
| **SQL expressions** | filters, measures, fields | part of 200 |
| **Knowledge store snippets total** | descriptions + joins + SQL expressions | **200 per agent** |

### The three SQL expression types — MFG examples
| Type | Purpose | Example |
|---|---|---|
| **Filter** | a reusable condition | `Posted transactions only` → `status = 'POSTED'` [flaw 4] · `Latest snapshot` → `snapshot_date = (SELECT MAX(snapshot_date) FROM vw_loan_book_eop)` [flaw 6] · `Commercial book` → `segment = 'COMMERCIAL'` |
| **Measure** | a KPI | `net_fee_revenue` → `SUM(fee_revenue) - SUM(COALESCE(reversal_amount,0))` [flaw 1] · `delinquency_rate_90` → `SUM(CASE WHEN days_past_due >= 90 THEN principal_balance ELSE 0 END) / NULLIF(SUM(principal_balance),0)` [flaw 7] · `approval_rate` → `COUNT_IF(decision='APPROVED') / NULLIF(COUNT(*),0)` · `fraud_loss_rate` → `SUM(loss_amount) / NULLIF(SUM(fee_revenue),0)` |
| **Field** | a derived attribute | `tenure_band` → `CASE WHEN tenure_months < 12 THEN 'New' WHEN tenure_months < 60 THEN 'Established' ELSE 'Long-tenured' END` · `is_high_risk` → `days_past_due >= 30 OR fraud_flag` |

### Business example — synonyms that unblock real users
| Users actually say | Column / value | Fix |
|---|---|---|
| "Northeast", "the East" | `region = 'NE'` | synonym + entity matching |
| "West Coast", "out west" | `region = 'WEST'` | synonym |
| "California" | `state = 'CA'` | **entity matching** |
| "top line", "fee income", "revenue" | `net_fee_revenue` measure | synonyms on the measure |
| "delinquent" / "seriously delinquent" | `days_past_due >= 30` / `>= 90` | two distinct measures + a clarification instruction |
| "chargeback", "dispute", "refund" | `fct_reversals` | synonyms on the table |
| "charged off", "written off" | `status = 'CHARGED_OFF'` | filter expression |

### Business example — entity matching in action (flaw 3)
Without it: *"How did California branches do last quarter?"* → Genie writes `WHERE state = 'California'`, the table holds `'CA'`, and the answer is a confident **zero** — or the filter is silently dropped and you get the national number labelled as California.

With entity matching on `dim_branch.state` (50 values curated) and `region` (4 values): Genie matches the phrasing to the real value, and handles "Californa" too.

**Teaching rule:** turn on entity matching for every low-cardinality categorical column users name out loud — region, state, merchant_category, dpd_bucket, decision, channel, product_category.

### Business example — the fan-out trap (flaw 6) — spend real time here
`fct_loan_balances` has one row per account per day. Ask *"What's our total loan book?"* against the raw table with no cardinality declared, and Genie writes `SUM(principal_balance)` across a month of snapshots: **$1.4 trillion** instead of $47 billion. Roughly 30× too high.

The number *looks* like a number. The chart *looks* like a chart. Nobody notices until the regulatory pack disagrees.

Fix at three layers, in order:
1. **Data:** `vw_loan_book_eop` exposes end-of-period snapshots only (Module 7).
2. **Knowledge store:** declare `vw_loan_book_eop.account_id → dim_account.account_id (Many-to-One)`, and a `Latest snapshot` filter expression.
3. **Description:** "one row per account per day — never SUM across dates."

> **This is the scariest failure mode in the course: a plausible wrong number.** A missing join or wrong cardinality between `fct_transactions` and `dim_account` produces the same class of error on the revenue side.

### Knowledge mining
Genie proposes new joins and SQL expressions by reading Unity Catalog schemas and observing author behaviour — thumbs-up on responses and downloaded queries. Teach authors that **their own upvotes are training signal**, and to review suggestions rather than accept blindly.

### Lab 9 (40 min) — GRADED, hardest lab
On the MFG agent: add synonyms for 10 business terms, enable entity matching on 4 categorical columns, declare all 6 join relationships with correct cardinality, and author 8 SQL expressions (3 filters, 4 measures, 1 field). Then re-run the 9 broken questions from Lab 4 and show which now pass.

### Common mistakes
- Adding synonyms to the column but not the values (or vice versa).
- Wrong cardinality (One-to-Many where it's Many-to-One) → fan-out and inflated totals.
- Encoding a metric in a **text instruction** instead of a **measure expression**.
- Exposing a snapshot table with no `Latest snapshot` filter.
- Burning the 200-snippet budget on low-value descriptions.

**Docs:** `/genie-agents/tune-quality`, `/genie/best-practices`
