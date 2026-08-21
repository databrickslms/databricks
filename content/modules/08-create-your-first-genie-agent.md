---
kind: module
slug: 08-create-your-first-genie-agent
title: "Create Your First Genie Agent"
num: 8
stage: "Building"
tracks: ["author"]
level: "Intermediate"
duration: "75 min"
audience: ""
summary: "1. Create an agent end to end and share it."
---
### Learning outcomes
1. Create an agent end to end and share it.
2. Use the **Genie Code** bootstrap and critically review its suggestions.
3. Configure the settings that shape a consumer's first impression.

### The build sequence
1. **Enable access** — account admin turns on partner-powered AI features at account + workspace level.
2. **Create** — Genie Agents → **New** → select Unity Catalog data sources.
3. **Bootstrap with Genie Code** — launches automatically, analyses the selected data, proposes table descriptions and example queries.
4. **Review suggestions** — accept, edit, or reject. *Never bulk-accept.* Each accepted suggestion consumes part of your instruction/snippet budget and, if wrong, teaches the agent something false.
5. **Manage data objects** — Configure → Data. Inspect **Overview** and **Sample data** per table; hide columns.
6. **Configure settings** — title, default warehouse, description, tags, thumbnail, and **common questions**.
7. **Share** — folder permissions or direct share at CAN MANAGE / EDIT / RUN / VIEW.
8. **Monitor** — conversation history and the Monitor tab (Modules 10–12).

### Why "common questions" matter more than they look
The 4–6 starter chips are the entire onboarding experience for a business user. They must be questions the agent answers **perfectly today**.

MFG Retail Banking starters:
- "What was net fee revenue by region last fiscal quarter?"
- "Which 10 branches grew deposits fastest in FY2026?"
- "What is the 90-day delinquency rate by product as of the latest snapshot?"
- "Compare net fee revenue this fiscal quarter to the same quarter last fiscal year"

**Rule:** if a starter question ever returns a wrong answer, it's a P1 bug. It's the first thing every new user clicks.

### Also cover
- **Clone** an agent (a fast way to spin a regional variant without recurating).
- **Assign certification** to signal official status.
- Naming and description conventions — in Genie One the description is how users pick an agent. `"Retail Banking & Deposits — net fee revenue, deposit growth, delinquency for branches and regions. Owner: Retail Analytics. Fiscal calendar (Oct 1)."` beats `"Banking agent"`.

### Lab 8 (35 min) — GRADED, milestone lab
Build the MFG **Retail Banking & Deposits** agent for real: the objects from Lab 7, review the Genie Code suggestions (documenting at least 2 you **rejected** and why — flaws 1 and 5 are planted in those suggestions), configure settings and 5 common questions, share with a peer group at CAN RUN, and confirm all 5 starters return correct answers.

**Docs:** `/genie-agents/set-up`
