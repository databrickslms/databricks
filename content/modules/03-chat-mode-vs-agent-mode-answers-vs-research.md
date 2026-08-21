---
kind: module
slug: 03-chat-mode-vs-agent-mode-answers-vs-research
title: "Chat Mode vs Agent Mode (Answers vs Research)"
num: 3
stage: "Foundations"
tracks: ["business","author"]
level: "Beginner–Intermediate"
duration: "45 min"
audience: ""
summary: "1. Choose the right mode for a question."
---
### Learning outcomes
1. Choose the right mode for a question.
2. Set expectations on speed, depth and cost.
3. Know that Agent mode can read **unstructured files** from Unity Catalog volumes.

### Key concepts
| | **Chat mode** | **Agent mode** |
|---|---|---|
| Shape of work | one question → **one SQL query** → answer | builds a **research plan**, forms hypotheses, runs **many queries**, iterates |
| Output | table + chart | a written report: findings, citations, visualisations, supporting tables |
| Data | structured (UC tables/views) | structured **+ unstructured files** in UC volumes the author attached |
| Best for | known metrics, recurring questions | open-ended, exploratory, "what's going on with…" |
| Trade-off | fast, cheap, easy to verify | slower, more LLM spend, more to review |
| Availability | broad | Americas & Europe workspaces; elsewhere needs **cross-Geo processing** enabled |

### Business examples
| Question | Mode | Why |
|---|---|---|
| "What was net fee revenue by region last fiscal quarter?" | Chat | one well-defined metric |
| "Which loan segments are deteriorating, and what's driving it?" | Agent | needs several angles: vintage, DPD migration, channel, income band |
| "Summarise this quarter's credit committee memos alongside the delinquency trend" | Agent | unstructured volume files + structured data |
| "What's the balance on account 8841203?" | Chat | one lookup |

### Demo (10 min)
Ask *"Which MFG loan segments are deteriorating and why?"* in both modes side by side. Chat returns one table; Agent returns a five-section report. Then show the time and cost difference — this frames Modules 13 (latency) and 14 (cost).

### Lab 3 (15 min)
Route 10 MFG questions to Chat or Agent mode with a one-line justification each.

**Docs:** `/genie/agent-mode`, `/genie-agents/concepts`
