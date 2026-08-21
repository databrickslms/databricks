---
kind: module
slug: 00-build-the-meridian-dataset
title: "Build the Meridian Dataset"
num: 0
stage: "Lab Setup"
tracks: ["author","platform"]
level: "Setup (Tracks 2–3)"
duration: "90 min"
audience: ""
summary: "1. Provision the full course dataset in Unity Catalog."
---
> **Why this is a module and not an appendix.** Designing a dataset Genie can succeed on *is* the skill. This module builds one company's data with **nine deliberate flaws planted on purpose**, so that every later module has a real failure to fix rather than a hypothetical one. Instructors may pre-provision it and assign this module as pre-work; authors should still read §0.3 and §0.5.

### Learning outcomes
1. Provision the full course dataset in Unity Catalog.
2. Explain what each planted flaw teaches and which module uses it.
3. Recognise the same flaws in their own organisation's data.

### 0.1 The company — *Meridian Financial Group (MFG)*
A mid-size US bank: **340 branches**, four lines of business — **Deposits**, **Cards & Payments**, **Lending** (mortgage, auto, personal), and **Wealth**. Roughly 2.1M retail customers and a small commercial book that transacts in USD, CAD and GBP.

Financial services is the right domain for this course because it forces every hard lesson naturally: contested metric definitions, a non-calendar fiscal year, regulated PII, snapshot fact tables, and a regulatory hierarchy that competes with the business one.

### 0.2 Schema — `mfg.core` (10 tables + 1 volume)

| Object | Grain | Key columns | What it powers |
|---|---|---|---|
| `mfg.core.fct_transactions` | one posted/attempted transaction | `txn_id, account_id, txn_date, amount, fee_revenue, interchange, merchant_category, currency, status` | the main fact — fee revenue, volumes |
| `mfg.core.fct_reversals` | one reversal / chargeback | `txn_id, reversal_date, reversal_amount, reason_code` | **gross vs net** revenue |
| `mfg.core.fct_loan_balances` | **account × day (daily snapshot)** | `account_id, snapshot_date, principal_balance, interest_accrued, days_past_due, dpd_bucket` | delinquency, balances — and the fan-out trap |
| `mfg.core.fct_applications` | one credit application | `app_id, customer_id, product_id, submitted_ts, decision_ts, funded_ts, decision, channel` | approval rate, funnel, cycle time |
| `mfg.core.fct_fraud_cases` | one fraud case | `case_id, account_id, opened_date, closed_date, loss_amount, fraud_type, status` | fraud rate, loss rate |
| `mfg.core.dim_customer` | customer | `customer_id, segment, tenure_months, home_branch_id, ssn_last4, email, dob, annual_income` | segmentation — **and the PII lesson** |
| `mfg.core.dim_account` | account | `account_id, customer_id, product_id, branch_id, opened_date, closed_date, status` | the join hub |
| `mfg.core.dim_product` | product | `product_id, product_name, product_category, regulatory_product_class` | **two competing hierarchies** |
| `mfg.core.dim_branch` | branch | `branch_id, branch_name, region, state, channel, opened_date` | region/state rollups, row-level security |
| `mfg.core.dim_date` | day | `date_key, fiscal_year, fiscal_quarter, fiscal_month, calendar_year, is_business_day` | **fiscal vs calendar** |
| `mfg.core.dim_fx_rate` | currency × day | `currency, rate_date, usd_rate` | multi-currency conversion |
| `mfg.ref.documents` *(volume)* | PDFs | credit committee memos, branch manager notes, customer complaint letters | Agent mode over unstructured files; Knowledge Assistant |

### 0.3 The nine planted flaws — the course's teaching engine

| # | Planted flaw | What breaks without a fix | Taught in |
|---|---|---|---|
| **1** | `fct_transactions.fee_revenue` is **gross**; net requires subtracting `fct_reversals` | "revenue" is overstated by 3–6% and nobody notices | 7, 9, 11 |
| **2** | Fiscal year starts **Oct 1** (FY2026 = 2025-10-01 → 2026-09-30) | "last year" silently means calendar year | 5, 10, 11 |
| **3** | `dim_branch.region` ∈ `NE, SE, MW, WEST`; `state` ∈ `CA, NY, TX…` — users say "Northeast", "West Coast", "California" | confident **zero rows**, or a silently dropped filter | 9, 12 |
| **4** | `fct_transactions.status` ∈ `POSTED, PENDING, DECLINED, REVERSED` — only `POSTED` is revenue, but `DECLINED` inflates *counts* | revenue and volume are both wrong, in opposite directions | 7, 9, 11 |
| **5** | `dim_product` carries **two hierarchies**: `product_category` (business) vs `regulatory_product_class` (Basel reporting) | rollups mix reporting frames; two answers to one question | 7, 9 |
| **6** | `fct_loan_balances` is a **daily snapshot** — `SUM(principal_balance)` over a month is ~30× too large | **a plausible wrong number.** The scariest failure in the course | 9, 11, 12 |
| **7** | "Delinquent" / "seriously delinquent" / "default" / "charge-off" are four different things business users use interchangeably | four defensible answers to one question | 9, 10, 11 |
| **8** | `dim_customer` holds real **PII**: `ssn_last4`, `email`, `dob`, `annual_income` | a governance incident, not a data-quality one | 6, 17 |
| **9** | Commercial transactions in **CAD/GBP** need `dim_fx_rate` joined *as of the transaction date* | currency mixing; totals that don't tie to finance | 9, 10 |

Two more flaws are added to the *agent*, not the data, in Module 8: a bloated 22-object agent and 9,000 characters of prose instructions — the raw material for Module 13's latency lab.

### 0.4 Use-case coverage matrix — every course topic has data behind it

| Course topic | Module | Data that makes it demonstrable |
|---|---|---|
| Good vs bad questions | 2 | wide question surface across 5 fact tables |
| Chat vs Agent mode | 3 | `fct_loan_balances` + `fct_fraud_cases` + `mfg.ref.documents` volume |
| Unstructured file analysis | 3, 16 | credit committee memos, complaint letters |
| Compound AI system / diagnosis | 4 | flaws 1–7 each produce a distinct wrong answer |
| Row filters | 5 | `dim_branch.region` — filter by regional manager |
| Column masks | 5 | `dim_customer.ssn_last4`, `email`, `dob`, `annual_income` |
| Per-user credentials | 5 | three personas, three correct answers to one question |
| 30-object limit / pre-joining | 6 | 11 base objects → curated 7 |
| Slim views vs wide tables | 6, 13 | a 380-column `fct_transactions_raw` staging table is included on purpose |
| Metric views | 6, 15 | `net_fee_revenue`, `delinquency_rate_90`, `approval_rate` used by 3+ agents |
| Certify / deprecate | 6, 12 | two revenue tables ship: `fct_transactions` (certify) and `fct_txn_legacy` (deprecate) |
| Genie Code bootstrap review | 7 | AI-suggested descriptions get flaws 1 and 5 wrong — learners must catch it |
| Synonyms | 8 | region, state, "top line", "delinquent", "chargeback" |
| Entity matching / value dictionaries | 8 | `region`, `state`, `merchant_category`, `dpd_bucket`, `decision` |
| Join relationships & cardinality | 8 | `fct_transactions → dim_account → dim_customer/dim_branch/dim_product` |
| The fan-out trap | 8, 13 | flaw 6, the daily snapshot |
| SQL expressions (filter/measure/field) | 8 | flaws 1, 4, 7 all require one |
| Example SQL & parameters | 9 | fiscal-period and region parameters |
| UC functions as trusted assets | 9 | delinquency-rate and FX-conversion functions |
| Clarification instructions | 9, 10 | flaw 7 (delinquency ambiguity) |
| Instruction length ceiling | 9, 13 | the planted 9,000-character prose block |
| Benchmarks & scoring | 10 | ground-truth SQL for all nine flaws |
| Monitoring & feedback triage | 11 | seeded conversation history with feedback |
| Nondeterminism expectation-setting | 4, 11, 12 | flaw 7 produces legitimately varying answers |
| Performance: thinking vs query | 13 | bloated agent + wide staging table + unoptimised external table |
| Warehouse & table tuning | 13 | an unclustered 900M-row `fct_transactions`, one external table with no upkeep |
| Errors & escalation | 12 | scripted error scenarios |
| Cost & budgets | 14 | five-agent portfolio + one service-principal integration |
| API, tracing, CI/CD | 16 | the whole agent, exported as `serialized_space` |
| Supervisor / multi-agent | 16 | 5 agents + document volume + external context |

### 0.5 Build steps
1. **Create the catalog and schemas** — `mfg.core`, `mfg.ref`, plus the `mfg.ref.documents` volume.
2. **Run the seed notebook** — generates 24 months of history: ~900M transactions (or a 20M sampled tier for smaller workspaces), 2.1M customers, 340 branches, 1.4M loan-balance snapshots per month.
3. **Plant the flaws** — the seed script does this deliberately; do not "fix" the data.
4. **Load the volume** — 40 synthetic PDFs (memos, notes, complaints).
5. **Apply governance objects** — one row filter on `dim_branch.region`, column masks on the four PII columns, and three user personas (§0.6).
6. **Certify `fct_transactions`, deprecate `fct_txn_legacy`.**
7. **Verify** — run the 12-statement validation script; each check maps to a planted flaw.

**Two data tiers.** Ship a **Small** tier (20M transactions) so every learner can complete the accuracy modules, and a **Large** tier (900M, unclustered, one unmaintained external table) used only in Module 13 — you cannot teach latency on a toy dataset.

### 0.6 The three personas (used from Module 5 onward)
| Persona | Role | Access |
|---|---|---|
| **Priya Raman** | Regional Manager, Northeast | row filter: `region = 'NE'`; PII masked |
| **Marcus Chen** | Regional Manager, West | row filter: `region = 'WEST'`; PII masked |
| **Elena Okafor** | CFO | unrestricted; PII masked except `annual_income` |

### Lab 0 (60 min)
Provision the dataset, run the validation script, and write a one-line prediction for each of the nine flaws: *what wrong answer will an uncurated agent give?* Learners keep this sheet and check it in Module 4.

### Knowledge check
5 questions on the schema, the fiscal calendar, and which flaw causes which class of error.
