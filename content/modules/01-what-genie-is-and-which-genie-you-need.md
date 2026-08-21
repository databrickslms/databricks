---
kind: module
slug: 01-what-genie-is-and-which-genie-you-need
title: "What Genie Is, and Which Genie You Need"
num: 1
stage: "Foundations"
tracks: ["business","author","platform"]
level: "Beginner"
duration: "45 min"
audience: "everyone"
summary: "1. Explain Genie in one sentence to a colleague."
---
### Learning outcomes
1. Explain Genie in one sentence to a colleague.
2. Choose correctly between Genie One, Genie Agents, and Genie Code.
3. Know where hands-on tuning actually happens.

### Key concepts
Genie is the **family of natural-language data experiences** in Databricks:

| Product | Who it's for | What it does | Course coverage |
|---|---|---|---|
| **Genie One** | business users | the simplified Databricks UI — one place to chat with data, open AI/BI dashboards, run Databricks Apps. No notebooks, no compute concepts. | 1, 2 |
| **Genie Agents** | business users, built by data teams | a **domain-specific** chat interface over curated, trusted data. Returns SQL + result table + visualisation. | the rest of the course |
| **Genie Code** | developers / analysts | AI coding & data assistant in the workspace. Also **bootstraps, tunes and debugs Genie Agents**. | 7, 10, 11, 12, 13 |

**The two hands-on tuning surfaces** — name them here, use them in every lab from Module 7 on:
- **Genie Code** — the most powerful option, built into both the workspace *and* the Genie Agent config. Use it to see exactly what Genie is doing, diagnose a bad *or slow* answer, and iterate on context, instructions and SQL in place.
- **Genie Workbench** — the dedicated tuning surface for the same work.

> **Course rule:** reading about curation is not curation. Every build and tune lab happens in Genie Code or the Workbench, never in slides.

Also cover: **Genie One access tiers** — workspace-level vs account-level (unified discovery across all workspaces; involves cross-Geo processing considerations); consumers need at least the Consumer entitlement. And: Genie Agents are built on **Unity Catalog** objects only — managed, external and foreign tables, views, **metric views**, materialised views.

### Business examples
| Who asks | Question | Right tool |
|---|---|---|
| Branch manager | "How did my branch's deposit growth compare to the region last quarter?" | Genie Agent (Retail Banking) |
| Credit risk analyst | "What's the 90-day delinquency rate on personal loans by vintage?" | Genie Agent (Lending) |
| CFO | "Open the fee income dashboard, then ask about the variance to plan" | Genie One |
| Data engineer | "Write me a PySpark job to backfill reversal reason codes" | Genie Code |

### Demo (8 min) — the hook
Ask the same question — *"What was net fee revenue by region last fiscal quarter?"* — in three places: a raw SQL editor (slow, technical), a general-purpose chatbot (confidently wrong, no data access), and a curated MFG Genie Agent (correct, with SQL shown).

### Lab 1 (15 min, no build)
Sort 12 real questions from a shared inbox into four buckets: *Genie Agent* / *dashboard* / *Genie Code* / *not a data question*.

### The misconception to kill on day one
> "Genie is a chatbot that knows our business." **No.** Genie knows exactly what an author taught it. Pointed at MFG's raw tables it will report gross revenue as net, use the calendar year, and sum a daily snapshot 30 times over — confidently. That's why this course exists.

**Docs:** `/genie/`, `/genie-one/`, `/genie-agents/`, `/genie-code/`
