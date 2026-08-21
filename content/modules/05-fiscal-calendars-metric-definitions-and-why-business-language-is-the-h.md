---
kind: module
slug: 05-fiscal-calendars-metric-definitions-and-why-business-language-is-the-h
title: "Fiscal Calendars, Metric Definitions, and Why Business Language Is the Hard Part"
num: 5
stage: "How It Works"
tracks: ["author"]
level: "Intermediate"
duration: "45 min"
audience: ""
summary: "1. Identify the terms in their own domain that carry more than one meaning."
---
### Learning outcomes
1. Identify the terms in their own domain that carry more than one meaning.
2. Produce a signed-off business glossary before building anything.
3. Recognise that most "AI accuracy problems" are unresolved definition problems.

### Key concept
Genie can only be as unambiguous as your organisation. Where the business has never agreed on a definition, no amount of curation fixes it — someone has to decide. This module is a **workshop**, not a demo.

### Business example — four contested terms at MFG
| Term | Meanings in active use | Decision required |
|---|---|---|
| **Revenue** | gross fee revenue · net of reversals · net including interest income | Finance owns it: **"revenue" = net fee revenue** unless qualified |
| **Last year** | calendar 2025 · FY2025 (Oct 2024–Sep 2025) · trailing 12 months | **fiscal**, unless the user says "calendar" |
| **Delinquent** | 30+ DPD · 60+ · 90+ ("seriously delinquent") · in default · charged off | **30+ DPD** = delinquent; **90+** = seriously delinquent; default and charge-off are separate measures |
| **Active customer** | any account open · transacted in 90 days · transacted in 12 months | **transacted in the last 90 days** |

### The glossary template (the module's deliverable)
```
TERM              net fee revenue
OWNER             FP&A (Elena Okafor)
DEFINITION        SUM(fee_revenue) - SUM(reversal_amount), status = 'POSTED'
EXCLUDES          PENDING, DECLINED, REVERSED transactions
GRAIN             transaction line, rolled to any dimension
SYNONYMS          revenue, top line, fee income, net fees
IMPLEMENTED AS    measure expression + metric view mv_banking_metrics
SIGNED OFF        2026-08-14
```

### Lab 5 (25 min)
In pairs, build a 10-term glossary for the MFG lending domain using the template. Every term needs a named owner and an implementation route. Disagreements are the point of the exercise.

### Teaching line
> *"Genie didn't get the answer wrong. Your company has three answers and never picked one."*

**Docs:** `/genie/best-practices`, `/metric-views/`
