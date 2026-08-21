---
kind: module
slug: 10-instructions-example-sql-and-trusted-assets
title: "Instructions, Example SQL, and Trusted Assets"
num: 10
stage: "Building"
tracks: ["author"]
level: "Advanced"
duration: "90 min"
audience: ""
summary: "1. Write example SQL queries titled the way users actually ask."
---
### Learning outcomes
1. Write example SQL queries titled the way users actually ask.
2. Parameterise queries correctly with types and comments.
3. Register Unity Catalog functions as trusted assets.
4. Write text instructions specific enough to be followed.
5. Structure clarification-question instructions.
6. Budget within 100 instructions.

### Key concepts and limits
- **Budget: 100 instructions per agent.** Every **example query**, every **function**, and every **text block** counts as **1**. (Separate from the 200 knowledge-store snippets.)
- **Text instructions also have a *length* ceiling.** A warning appears around **5,000–7,000 characters**, and beyond it Genie may **silently ignore parts** of long instructions. This is the strongest argument for the influence hierarchy: prose doesn't just rank lowest — past a certain length it can be dropped without telling you. Long prose blocks also lengthen the "thinking" step (Module 13).
- **Example SQL queries** — the highest-leverage tool after trusted assets. Title each with the **user's phrasing**, because the title drives prompt matching. Static or parameterised. Users with CAN EDIT can view source queries, which makes them a debugging tool too.
- **Parameters** — colon syntax `:parameter_name`. Types: String, Date, Date and Time, Decimal, Integer. **Always comment valid values and constraints** — that's how Genie picks a sensible value.
- **SQL functions (Unity Catalog)** — for logic too complex for a static query. Shareable across teams, and they **hide implementation detail** from users. Register as trusted assets so the verified logic is used as-is.
- **Text instructions** — organise by topic; cover terminology, fiscal calendars, formatting standards. Applied **globally**, not to a subset. Use only where natural language is genuinely required.
- **Summary formatting** — add a dedicated *"Instructions you must follow when providing summaries"* section for language, citation style and structure.

### Business example — example query done right
❌ **Title:** `q_netrev_region_fq`
✅ **Title:** `What was net fee revenue by region last fiscal quarter?`
```sql
SELECT b.region,
       SUM(t.fee_revenue) - SUM(COALESCE(t.reversal_amount, 0)) AS net_fee_revenue
FROM   mfg.core.vw_transactions_net t
JOIN   mfg.core.dim_account         a ON t.account_id = a.account_id
JOIN   mfg.core.dim_branch          b ON a.branch_id  = b.branch_id
JOIN   mfg.core.dim_date            d ON t.txn_date   = d.date_key
WHERE  d.fiscal_quarter = :fiscal_quarter  -- Format 'FY2026-Q3'. MFG fiscal year starts Oct 1.
  AND  t.status = 'POSTED'                 -- excludes PENDING, DECLINED, REVERSED
GROUP BY b.region
ORDER BY net_fee_revenue DESC
```
Four lessons in one artifact: the title is the user's sentence; the parameter comment explains the format *and* the fiscal quirk; the status filter is baked in; and the join path is demonstrated rather than described.

### Business example — a UC function as a trusted asset
```sql
CREATE OR REPLACE FUNCTION mfg.core.delinquency_rate(
  p_dpd_threshold INT COMMENT 'Days past due. Use 30 for delinquent, 90 for seriously delinquent.',
  p_as_of DATE     COMMENT 'Snapshot date. Defaults to latest available.'
) RETURNS TABLE (product_category STRING, delinquency_rate DOUBLE)
COMMENT 'MFG-approved delinquency rate: balance-weighted, latest snapshot only.
         Owner: Credit Risk. Do not recompute by hand.'
RETURN ...
```
This resolves flaws 6 and 7 permanently and hides the snapshot logic from users entirely.

### Business example — instruction quality ladder
| ❌ Vague (the docs call this out) | ✅ Specific |
|---|---|
| "Ask clarification questions about delinquency" | "**When** a user says 'delinquent' without a threshold, **ask** which definition they mean **before** running any query. **Example:** 'Do you mean 30+ days past due (delinquent) or 90+ (seriously delinquent)?'" |
| "Use the right calendar" | "MFG's fiscal year starts October 1. FY2026 = 2025-10-01 to 2026-09-30. 'Last year' always means the prior **fiscal** year unless the user says 'calendar year'." |
| "Revenue should be accurate" | "'Revenue' with no qualifier means **net fee revenue** (gross minus reversals), POSTED transactions only. Say 'gross' explicitly if the user asks for gross." |
| "Never show PII" | *(delete this — it does nothing.* Use column masks, Module 6.*)* |
| "Be helpful in summaries" | "In summaries: report USD with thousands separators, state the fiscal period in every headline number, and cite the branch or account count behind any rate or average." |

### The clarification-question template (four required parts)
```
TRIGGER      — when does this apply?
MISSING      — what detail is absent?
ACTION       — ask before querying
EXAMPLE      — the exact question to ask
```

### Business example — budgeting 100 instructions at MFG
```
40  example SQL queries      the top 40 recurring business questions
 8  UC functions             delinquency_rate, fx_convert, approval_funnel, fiscal_period_resolver,
                             fraud_loss_rate, deposit_growth, vintage_curve, eop_balance
12  text instruction blocks  fiscal calendar, revenue terminology, delinquency clarification,
                             status filtering, currency handling, summary formatting,
                             data freshness, escalation language, ...
── 60 used, 40 held in reserve for what monitoring reveals
```
**Teaching point:** deliberately leaving headroom is professional practice. Monitoring *will* surface questions you didn't predict.

### Lab 10 (40 min) — GRADED
Add 10 example queries (≥3 parameterised with typed, commented parameters), register 2 UC functions as trusted assets (one must resolve flaw 6 or 7), and write 4 text instruction blocks including one clarification rule using the four-part template. Submit an instruction budget table.

### Common mistakes
- Generic SQL patterns as examples (Genie already knows `GROUP BY`) instead of **organisation-specific logic**.
- Conflicting guidance between a text instruction and a SQL expression → nondeterministic answers. The docs are explicit: *"a key task is to review and resolve any inconsistencies."*
- Parameters with no comment → Genie guesses the format.
- Reaching for text instructions first.
- Using instructions to attempt a security control.

**Docs:** `/genie-agents/tune-quality`, `/genie/best-practices`
