---
kind: module
slug: 07-prepare-the-data-the-80-that-decides-quality
title: "Prepare the Data (The 80% That Decides Quality)"
num: 7
stage: "Building"
tracks: ["author"]
level: "Intermediate"
duration: "90 min"
audience: ""
summary: "1. Scope an agent to a single audience and topic."
---
### Learning outcomes
1. Scope an agent to a single audience and topic.
2. Get under the 30-object limit using pre-joined views.
3. Write column descriptions and hide noise.
4. Decide when to build a **metric view** instead of curating in the agent.

### Key concepts and hard limits
| Limit | Value |
|---|---|
| Tables/views per agent | **30 max** |
| Recommended starting size | **≤ 5** |
| Conversations per agent | 10,000 (10,000 messages each) |

**Databricks' framing:** *treat Genie like a new analyst joining your company.* You'd give a new credit analyst a clean, documented, narrow dataset — not the whole lakehouse.

**Start small.** Minimal instructions, a limited question set, then expand from feedback. Do not try to be complete on day one.

**Define purpose.** One audience, one topic. An agent covering deposits *and* lending *and* fraud covers all three badly.

**Pre-join.** Beyond 30 objects, build views that pre-join related tables. Fewer, richer objects beat many thin ones — and pre-joining is where you bake in flaws 1, 4 and 6 permanently.

**Narrow is *faster*, not just more accurate.** Every table and column is context Genie must read before writing SQL, so a bloated agent is slow **and** wrong. Wide tables are the worst offenders — replace the 380-column `fct_transactions_raw` with a slim view holding only what anyone asks about. Module 13 puts a stopwatch on this.

**Certify and deprecate in Unity Catalog.** Certify `fct_transactions`, deprecate `fct_txn_legacy`. "We have two revenue tables" then stops being the agent's problem and becomes a governance decision made once.

**Metric views** — Unity Catalog semantics that separate **measures** from **dimensions**, defined in YAML, so a metric is defined once and grouped/filtered any way at runtime. They carry **agent metadata** (synonyms, display names, formatting rules) that directly improves accuracy and keeps formatting consistent across tools.

| Situation | Build |
|---|---|
| One team, a handful of metrics, moving fast | curate inside the agent |
| "Net fee revenue" must mean one thing across 5 agents, 3 dashboards and the regulatory pack | **metric view**, then point agents at it |
| You already curated an agent and want to promote its semantics | **export the agent as a metric view** |

### Business example — scoping the MFG "Retail Banking & Deposits" agent
**Before (bad):** 22 objects including `fct_transactions_raw` (380 columns), `fct_txn_legacy`, `dim_employee`, `hr_headcount`, both product hierarchies, and `_tmp_reversal_backfill`.

**After (good):** 7 objects
```
vw_transactions_net   -- fct_transactions LEFT JOIN fct_reversals; PENDING/DECLINED/REVERSED
                      -- excluded; exposes gross_fee_revenue, net_fee_revenue, txn_count   [flaws 1, 4]
vw_loan_book_eop      -- fct_loan_balances filtered to end-of-period snapshots only         [flaw 6]
dim_account           -- the join hub
dim_customer_safe     -- PII columns dropped; segment, tenure_band                          [flaw 8]
dim_product           -- regulatory_product_class hidden; product_category renamed          [flaw 5]
dim_branch            -- region, state, channel
dim_date              -- fiscal (Oct 1 start) + calendar columns                            [flaw 2]
mv_banking_metrics    -- metric view: net_fee_revenue, delinquency_rate_30/90,
                      -- approval_rate, fraud_loss_rate                                     [flaws 1, 7]
```
> **Note what happened:** five of the nine planted flaws were fixed *in the data layer*, before a single instruction was written. That is the module's whole point.

### Business example — column descriptions that earn their keep
| Column | ❌ Weak | ✅ Strong |
|---|---|---|
| `fee_revenue` | "the fee amount" | "**Gross** fee revenue in USD for this transaction, before reversals and chargebacks. For net revenue use the `net_fee_revenue` measure — do not sum this column alone." |
| `status` | "status" | "Transaction status: POSTED, PENDING, DECLINED, REVERSED. **Only POSTED counts as revenue.** DECLINED rows exist and will inflate transaction counts if not excluded." |
| `region` | "region code" | "Branch region. Values: NE, SE, MW, WEST. Users may say 'Northeast' (NE), 'West Coast' or 'the West' (WEST), 'Midwest' (MW)." |
| `principal_balance` | "loan balance" | "Principal balance **as of `snapshot_date`** — this table has one row per account per day. **Never SUM across dates**; use end-of-period or average-balance measures." |
| `dpd_bucket` | "days past due bucket" | "Delinquency bucket: CURRENT, 1-29, 30-59, 60-89, 90+. 'Delinquent' = 30+; 'seriously delinquent' = 90+." |

### Demo (15 min)
Ask an under-prepared agent *"What was revenue for California last year?"* → it returns **gross** revenue, **calendar** year, and **zero rows** for California (flaws 1, 2, 3 firing at once). Then ask the prepared 7-object agent. Same question, right answer, no prompt tricks.

### Lab 7 (30 min) — GRADED
From the 22 raw MFG objects: choose ≤ 8, write the `vw_transactions_net` and `vw_loan_book_eop` view SQL, write descriptions for 10 columns, and list 6 columns to hide with reasons.

### Anti-patterns to name explicitly
- Adding every table "just in case."
- Accepting **AI-generated column descriptions without verifying them** — the docs call this out, and in this dataset the AI suggestions get flaws 1 and 5 wrong on purpose.
- Leaving both product hierarchies visible.
- Exposing a daily-snapshot table without a warning in its description.

**Docs:** `/genie/best-practices`, `/metric-views/`, `/genie-agents/set-up`
