---
kind: module
slug: 02-asking-questions-that-actually-work
title: "Asking Questions That Actually Work"
num: 2
stage: "Foundations"
tracks: ["business","author"]
level: "Beginner"
duration: "60 min"
audience: "business consumers (Track 1 core)"
summary: "1. Write questions Genie can answer, and recognise questions it can't."
---
### Learning outcomes
1. Write questions Genie can answer, and recognise questions it can't.
2. Use follow-ups and threads instead of re-asking.
3. Read the **Analysis** panel to sanity-check an answer before acting on it.
4. Give feedback that improves the agent.

### Key concepts
- Genie uses **chain-of-thought reasoning**: it breaks the question into steps, picks columns, plans SQL, runs it.
- The **Analysis / thinking steps** panel shows how the question was interpreted, which sources were used, and a **Show code** button for the generated SQL.
- **Threads carry context; separate chats do not.**
- Outputs: auto-generated chart (editable, savable to a dashboard, downloadable as PNG), CSV download (~1 GB), copy to clipboard.
- **Feedback is a product feature.** Rate a response **Yes** / **Fix it** / **Request review**. A thumbs-up on an answer that joins tables or uses a SQL expression can prompt Genie to *suggest a new reusable snippet* to the author. Rating is not a formality — it trains the agent.

### The question quality ladder (core artifact — distribute widely)
| ❌ Genie will struggle | ✅ Rewrite | Why |
|---|---|---|
| "Why did delinquency go up?" | "What was the 90-day delinquency rate by product, by month, for the last 8 months?" | Genie retrieves and computes; it does not diagnose causes. |
| "How do we reduce fraud losses?" | "Which fraud types had the highest loss per case last fiscal quarter?" | No recommendations — ask for the evidence, decide yourself. |
| "Tell me about the Northeast and also compare branches and what about chargebacks" | three questions in one thread | One question at a time. |
| "Show me our best products" | "Show the top 10 products by net fee revenue for FY2026 Q3" | "Best" is undefined; no metric, no period, no ranking size. |
| "Revenue last year" | "Net fee revenue for fiscal year 2025" | At MFG both "revenue" and "last year" are ambiguous (flaws 1 and 2). |
| "How many delinquent loans?" | "How many loans are 90+ days past due as of the latest snapshot?" | "Delinquent" has four meanings at MFG (flaw 7). |

### Business example — the follow-up pattern
```
Q1: "Show net fee revenue by product category for FY2026 Q3"
Q2: "Only for the Northeast"          ← follow-up, inherits Q1 context
Q3: "Now split that by branch"         ← keeps narrowing
Q4: "Compare to the same quarter last fiscal year"
```
Anti-pattern: four separate chats, four different answers.

### Lab 2 (20 min) — GRADED
Rewrite 8 badly-written questions from MFG stakeholders, run each against a pre-built Retail Banking agent, and paste the generated SQL. Graded on rewrite quality, not SQL.

**Docs:** `/genie-agents/talk-to-genie`, `/genie-one/chat`
