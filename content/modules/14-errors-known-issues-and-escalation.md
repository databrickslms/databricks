---
kind: module
slug: 14-errors-known-issues-and-escalation
title: "Errors, Known Issues, and Escalation"
num: 14
stage: "Quality & Operations"
tracks: ["author","platform"]
level: "Advanced"
duration: "60 min"
audience: ""
summary: "1. Recognise the common error signatures and what they actually mean."
---
> Also sourced from the *Genie Performance & Issues Playbook*. Its purpose is to stop authors burning days on problems that were never theirs to fix.

### Learning outcomes
1. Recognise the common error signatures and what they actually mean.
2. Capture the right evidence the first time.
3. Distinguish a **curation problem** from a **platform bug** from **expected variation**.
4. Set honest consistency expectations with the business.

### The guidance-vs-guarantee line (this module's spine)
Some variation is **expected and by design**. Genie has built-in randomness even with a perfect setup. Everything in the knowledge store and instructions is **guidance** that makes the right answer far more likely; it is **not a guarantee**. The only layer that guarantees identical behaviour is **Unity Catalog** — row filters, column masks, grants.

Consequences to teach:
- Judge accuracy over a **benchmark set**, not two side-by-side runs.
- Compare **like-for-like**: same mode, fresh chat.
- Earlier turns in a thread are part of the context — "a different answer" may just be a different conversation.
- **The more a definition lives in prose rather than SQL, the more room Genie has to vary.** Pinning logic to SQL expressions and metric views removes the decision.
- If a customer needs *guaranteed* identical answers, that requirement lands on **Unity Catalog**, not on curation.

### Error signature table
| Symptom | What it actually is | What to do |
|---|---|---|
| "Aborted — no updates for a long time" / `DEADLINE_EXCEEDED` | model loop or backend stall | newer model + fresh chat; **save the message ID** |
| "429 / rate limit exceeded" | AI model capacity (**200/sec shared**) | reduce request rate; move heavy or automated use to **dedicated capacity** |
| "AI service did not respond with a valid answer" (the query ran fine) | bug in the **answer-assembly** step | file it with the message ID — no amount of curation fixes this |
| "Failed to send message" / looks like invalid SQL but isn't | a **credentials-delegation** problem in disguise | check the credential path, not the SQL |
| Screen stuck on "Thinking…" forever, even after refresh | known UI gap, **no auto-recovery** | fresh chat; report it |
| Automated / multi-step (supervisor) setup failing under load | each extra agent layer **multiplies latency and rate-limit risk** | flatten the architecture (Module 16); dedicated capacity |
| A runaway answer that never appears but shows up on the bill | you hit the **~597 s** backend ceiling | set the client/orchestrator timeout **below** it |
| Agent mode drops a filter Chat mode applies | a product bug | report it; meanwhile bake the filter into a view or metric view |

### The evidence checklist (make this a laminated card)
1. **The message ID** — the single most important field. **Capture it before starting a fresh chat.**
2. Exact question text, mode (chat/agent), timestamp
3. Agent ID and warehouse ID
4. The generated SQL, if any appeared
5. Whether it reproduces in a fresh chat
6. `execution_duration_ms` from query history, if the query ran

> Without the message ID, support cannot trace the request. Learners lose it constantly by refreshing first. Drill this.

### Triage decision tree
```
Is the generated SQL wrong?                    → curation problem      → Modules 9, 10, 12
Did the SQL run but the answer is absent
  or garbled?                                  → platform bug          → file with message ID
Is it slow but correct?                        → performance           → Module 13
Inconsistent across runs, each defensible?     → expected variation    → benchmarks; UC if a guarantee is needed
Is it a permission or masking error?           → governance            → Module 6, not Genie
Did it hit a documented limit?                 → capacity/design       → Module 13 limits table
```

### Business example — three MFG tickets in one week
```
1. "It says my region has no data"
   → CURATION. Missing entity match on region = 'NE'. Fixed in 10 minutes.

2. "It's been thinking for five minutes and then died"
   → PLATFORM. DEADLINE_EXCEEDED. Message ID captured, filed.
     Workaround: fresh chat on a newer model.

3. "I got a 4.1% delinquency rate yesterday and 4.4% today"
   → EXPECTED VARIATION + a stale thread. Genie had picked 30+ DPD one day
     and 90+ the other, because 'delinquent' was still ambiguous.
     Real fix: two named measures + a clarification instruction, then a
     benchmark run proving 96% accuracy — and one honest conversation
     with the CRO about guidance vs guarantee.
```
**Teaching point:** only one of the three was the author's bug. Knowing which is which is the skill this module sells.

### Lab 14 (30 min)
Given 8 real symptom reports, classify each (curation / platform bug / performance / expected variation / governance), name the evidence to capture, and write the escalation note for the two that are platform bugs.

**Docs:** `/genie-agents/monitor`, `/genie/best-practices`
