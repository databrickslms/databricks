---
kind: module
slug: 16-extend-genie-api-embedding-multi-agent-ci-cd
title: "Extend Genie: API, Embedding, Multi-Agent, CI/CD"
num: 16
stage: "Advanced / Extend"
tracks: ["author","platform"]
level: "Advanced"
duration: "90 min"
audience: "authors + developers"
summary: "1. Drive a Genie Agent from the Conversation API."
---
### Learning outcomes
1. Drive a Genie Agent from the **Conversation API**.
2. Manage agents as code with the **Management API** and `serialized_space`.
3. Promote agents across environments with bundles.
4. Decide **whether** to add a Supervisor Agent — and build one correctly if so.

### 16.1 Conversation API — Genie inside your own app
```
POST /api/2.0/genie/spaces/{space_id}/start-conversation
GET  /api/2.0/genie/spaces/{space_id}/conversations/{cid}/messages/{mid}
GET  .../messages/{mid}/query-result/{attachment_id}
GET  .../messages/{mid}/attachments/{attachment_id}/download-visualization   # enable_visualization: true
POST .../messages/{mid}/comments
GET  /api/2.0/genie/spaces/{space_id}/conversations                          # include_all=true for managers
DELETE /api/2.0/genie/spaces/{space_id}/conversations/{cid}
```
Behaviour to teach:
- The response is **progressive** — `attachments` fills in during `PENDING_WAREHOUSE` and `EXECUTING_QUERY`, so you can show the SQL before results land. Don't block on `COMPLETED`.
- **Follow-ups reuse the `conversation_id`** — that's how context is preserved.
- **Auth:** OAuth **U2M** when a user is present; OAuth **M2M** with a service principal for automation (needs data access + warehouse permissions, and has **no free LLM allowance**, per Module 15).
- **Documented practices:** retry with exponential backoff; poll every **1–5 s** with a **10-minute** cap; log requests and responses; **start a new conversation per session** to avoid accuracy degradation; stay under the **10,000-conversation** limit by deleting old ones.
- **Your poll loop is part of the user's latency.** Instrument it as its own span — a naive loop has been measured adding **6–8 s of self-inflicted delay** that then gets blamed on Genie (Module 13).
- **Timeouts:** the backend ceiling is **~597 s**. Set your client timeout *below* it, or you pay for answers nobody sees.
- **Rate limits:** **200 req/sec** shared model capacity. Sequential fan-out is the fastest route to a **429**; move heavy automated use to dedicated capacity.
- **Tracing:** `GenieAgent` inside an MLflow agent → `mlflow.langchain.autolog()`. Your own API code → `@mlflow.trace` with a span per status phase. **On serverless, autolog is off by default.**
- **Preserve user identity.** Collapsing to a service principal loses per-user row filters and column masks — in a bank, that's a control failure, not an optimisation.

### 16.2 Management API / agents as code
- `POST /api/2.0/genie/spaces` with an escaped **`serialized_space`** JSON string · `GET /api/2.0/genie/spaces` to list · `GET /api/2.0/genie/spaces/{id}?include_serialized_space=true` to export.
- `serialized_space` structure: `version` (use **2**), `config` (sample questions with **32-char hex IDs**), `data_sources` (tables and **metric views** in three-level namespace), `instructions` (text, example SQL, join specs, reusable SQL snippets), `benchmarks` (ground-truth SQL).
- **Validation rules that bite:** IDs must be **32-character lowercase hex**; collections must be **alphabetically sorted** (tables by `identifier`, items by `id`); `join_specs.sql` needs **exactly two elements** — the join condition and a relationship-type annotation such as `--rt=FROM_RELATIONSHIP_TYPE_MANY_TO_ONE--`.
- **Deploy with Declarative Automation Bundles** for reproducible dev → staging → prod promotion. Also: **export an agent as a metric view** to promote curated semantics into governed UC.

### 16.3 Supervisor Agent — Genie as one specialist among many
A Supervisor coordinates **up to 50 agents/tools**, routing each question and synthesising results. Genie Agents are one subagent type; others include published dashboards, **Knowledge Assistant** endpoints (document Q&A), model serving endpoints, Unity Catalog functions, tables and volumes, AI Search indexes, nested Supervisors, MCP servers, and web search.

Setup: configure (add agents/tools with **detailed descriptions** — the description drives delegation) → test in chat or AI Playground → improve with labelled examples and guidelines → set permissions (Can Query / Can Manage) → query via API, Playground, or your own app.

### Business example — MFG's "Ask Meridian" supervisor
```
User: "Why did Northeast delinquency rise in Q3, and what did the credit
       committee say about it?"

Supervisor routes:
  → Lending & Credit Risk Genie Agent : DPD migration, vintage curves, FY2026 Q3   (structured)
  → Retail Banking Genie Agent        : origination mix, channel shift             (structured)
  → Knowledge Assistant               : Q3 credit committee memos                  (unstructured)
  → Web search                         : regional unemployment prints               (external)

Synthesised answer: 90+ DPD rose 38bps, ~70% concentrated in the FY2026-Q1
personal loan vintage originated through the new digital channel — matching
the committee's own flagged concern, and consistent with regional
unemployment up 40bps.
```
**Teaching point:** Genie Agents answer *"what happened."* A supervisor combining Genie with document and external sources gets closer to *"why."* This is the honest ceiling of Genie alone (Module 2) and the architectural answer to it.

### 16.4 Choosing the pattern — and the default

> **Default: call Genie directly.** Add a supervisor only for something Genie *structurally* lacks. Every extra agent layer multiplies Genie's biggest cost — **thinking time** — and its **rate-limit exposure** (200 req/sec shared). A supervisor is not a substitute for curating the agent properly.

| Business need | Pattern |
|---|---|
| Business users need a chat interface | the Genie Agent UI, or Genie One |
| One analytical domain; want speed + per-user security | **Genie directly** / Genie One |
| Just need tighter table steering or better answers | **a better-curated Genie Agent — not a supervisor** |
| Answers inside an existing internal portal | **embed** the agent, or the **Genie One API / MCP** directly (both preserve user identity) |
| A custom workflow app (approvals, alerts, forms + data) | **Conversation API** in a Databricks App |
| Blend structured + unstructured sources in one answer | **Supervisor Agent** |
| Multi-domain synthesis across several agents | **Supervisor Agent** today (native sub-agents on the roadmap) |
| Custom actions/tools beyond question → answer | **Supervisor Agent** or Databricks Apps |
| Same agent across dev/staging/prod, reviewed in Git | **Management API + bundles** |
| A metric must be identical everywhere | **metric view** first, then agents on top |

**If you do build a supervisor — the five non-negotiables:**
1. **Trace every hop.** Without per-hop timing you cannot tell which subagent is slow.
2. **Set the orchestrator timeout below the ~597 s backend ceiling** — otherwise you pay for answers that never return.
3. **Use dedicated model capacity** for sequential fan-out, or expect 429s under load.
4. **Keep each Genie Agent narrow** (≤ 30 objects, ideally ≤ 5) — a supervisor doesn't excuse a bloated agent, it multiplies its cost.
5. **Preserve user identity — do not collapse to a service principal.** You lose per-user row filters and column masks (Module 6) *and* the free LLM allowance (Module 15). The most common and most damaging shortcut in supervisor builds.

> **Teaching line:** *"A supervisor adds capability, never speed. If the complaint is 'slow' or 'wrong', the fix is upstream in the Genie Agent."*

### Lab 16 (40 min) — GRADED
**(a)** Write a script that starts a conversation against the MFG agent, polls correctly (2 s interval, capped, instrumented as its own span), retrieves the SQL and result set, then asks a follow-up on the same `conversation_id`. Report your poll-loop overhead separately from Genie's time. **(b)** Export the agent's `serialized_space`, change one instruction, re-import as a second agent, and diff the two configs.

**Docs:** `/genie-agents/conversation-api`, `/generative-ai/agent-bricks/multi-agent-supervisor`, `/genie/best-practices` (version control)
