---
kind: module
slug: 15-cost-budgets-and-scaling-to-many-domains
title: "Cost, Budgets, and Scaling to Many Domains"
num: 15
stage: "Quality & Operations"
tracks: ["author","platform"]
level: "Advanced"
duration: "60 min"
audience: "authors + platform owners"
summary: "1. Explain how Genie is billed."
---
### Learning outcomes
1. Explain how Genie is billed.
2. Set account-level budgets with the right thresholds.
3. Design a multi-agent portfolio for a bank.

### Key concepts — billing and budgets
- **Pay-as-you-go**, with a **free monthly LLM allowance per identified user**. Only usage beyond the allowance is billed, in DBUs based on underlying LLM consumption.
- **The free allowance cannot be removed by a budget.**
- **Service principals get no free allowance** — all their usage is charged. Critical for Module 16: an integration running as a service principal is billed from message one.
- Budgets are set by **account admins** in the account console using the **Unity AI Gateway** resource type with the tag **`databricks-product: genie`**.
- Threshold types: **shared** (a combined pool), **per-user** (individual monthly limits), **per-user overrides** (higher limits for named users/groups). If both shared and per-user thresholds have blocking enabled, a user is blocked as soon as the **first** is reached.
- Spend figures on the budget page are **near-real-time approximations** and may differ from the final bill. Use **billing system tables** for real analysis.
- Announced timeline to state plainly (and re-verify): Genie One and Genie Agents usage by users is free **through Jan 31, 2027**; Genie Code moved to pay-as-you-go with a per-user free monthly allowance on **Jul 8, 2026**.
- **Agent mode costs more than chat mode** — many queries per question (Module 3). **Runaway answers past the ~597 s ceiling are billed and never shown** (Module 13).

### Business example — MFG's budget design
```
Shared threshold          $9,000 / month   alert at 50%, 80%; block at 100%
Per-user threshold        $25 / month      alert only — never block a branch
                                           manager during month-end close
Override: Credit Risk      $250 / month    they run agent-mode research
Override: svc-genie-portal (service principal, no free tier)
                           $500 / month    blocking ON
Review: billing system tables, monthly, in the FinOps dashboard
```
**Teaching point:** **block service principals, alert humans.** A runaway integration loop is the real cost risk; a curious branch manager is not.

### Business example — MFG's agent portfolio
| Agent | Audience | Objects | Owner |
|---|---|---|---|
| Retail Banking & Deposits | 340 branch managers, retail leadership | 7 | Retail Analytics |
| Cards & Payments | 30 card product and risk | 7 | Cards Analytics |
| Lending & Credit Risk | 45 credit risk, underwriting | 8 | Credit Risk |
| Fraud & Financial Crime | 20 FinCrime analysts | 6 | FinCrime |
| Wealth & Advisory | 25 advisors and managers | 5 | Wealth Analytics |

Shared foundation so definitions don't diverge: **metric views** for `net_fee_revenue`, `delinquency_rate_30/90`, `approval_rate` · shared **UC functions** (`delinquency_rate`, `fx_convert`, `fiscal_period_resolver`) · one company-wide fiscal-calendar instruction block reused in every agent.

> **The anti-pattern:** five agents each defining "delinquency rate" slightly differently, one of which feeds a regulatory report. In financial services that isn't a trust problem, it's an audit finding. Metric views exist to prevent exactly this.

**Portfolio hygiene:** delete old and unused agents. Too many agents hurts routing for everyone in the workspace.

### Lab 15 (25 min)
Design an agent portfolio for a given financial-services profile (learners pick retail bank, insurer, or asset manager): 4–6 agents with audience, objects and owner, plus the shared metric-view foundation and a budget plan with thresholds and blocking decisions.

**Docs:** `/genie/budgets`, `/metric-views/`, `/genie/best-practices`
