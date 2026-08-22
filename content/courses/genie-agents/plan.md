# Databricks Genie Agents — LMS Course Plan
**From Basics to Advanced · Financial Services · Business-First, Example-Driven**

> Version 3.0 · Planned 2026-08-21
> Grounded in current `docs.databricks.com` (Genie section) **and** the internal *Genie Performance & Issues Playbook & Health Check*.
> Domain: **financial services** — retail banking, cards, lending, fraud, wealth.
> Terminology note: what used to be called **Genie Spaces** is now **Genie Agents**. Use the new naming throughout; mention the old name once (Module 1) so learners recognise older screenshots and blog posts.

---

## Part A — Course Design

### A.1 The one-sentence promise
*"By the end of this course you can build a Genie Agent your business team actually trusts — you can prove it's right, you can explain why it's slow, and you know which problems aren't yours to fix."*

### A.2 Who this course is for

| Persona | What they need | Modules |
|---|---|---|
| **Business consumer** (branch manager, credit risk analyst, product owner) | Ask questions, read answers, know when to trust them | 1–3 (the feedback loop is taught in 2) |
| **Agent author / analyst** (the main audience) | Build, curate, tune, test, measure, own an agent | all |
| **Data steward / platform owner** | Governance, PII, cost, latency, portfolio scaling | 0, 1, 6, 7, 12, 13, 15 |
| **Developer / integrator** | API, embedding, tracing, CI/CD, multi-agent | 0, 1, 4, 13, 14, 16 |

Three published **tracks** from one build:
- **Track 1 — Genie for Business Users** · Modules 1–3 · ~3 hours · no SQL
- **Track 2 — Genie Agent Author** · Modules 0–16 + capstone (17) · ~20 hours
- **Track 3 — Genie for Platform & Integration Teams** · Modules 0, 1, 4, 6, 13, 14, 15, 16 · ~8 hours

### A.3 Prerequisites
- **Track 1:** none.
- **Tracks 2–3:** working SQL (joins, aggregation, window functions), familiarity with the Unity Catalog three-level namespace (`catalog.schema.table`).
- Lab environment: a Databricks workspace with Unity Catalog, a **Pro or serverless SQL warehouse**, and Genie enabled at account **and** workspace level. Module 0 provisions the rest.

### A.4 Format and delivery
- **18 units** — Module 0 (dataset build), Modules 1–16, and the capstone (Module 17).
- Each unit: **concept video (6–10 min) → guided demo → hands-on lab → knowledge check**.
- Every module opens with a real business question and closes with *"what would have gone wrong."*
- Delivery options: 3-day instructor-led · 5-week blended (2 modules per week) · 8-week self-paced.
- Assessment: 17 knowledge checks (auto-graded) + 9 graded labs (2, 6, 7, 8, 9, 10, 11, 13, 16) + 1 capstone (rubric-scored).
- **All build and tune labs are done in Genie Code or the Genie Workbench.** Reading about curation is not curation.

### A.5 Teaching language rules (enforce in every script)
| Say this | Not this |
|---|---|
| "A Genie Agent is a data room you curate for one team" | "a semantic layer abstraction" |
| "Teach it like you'd onboard a new credit analyst" | "prompt engineering" |
| "Show it a worked example" | "few-shot exemplar" |
| "Business rules it must never break" | "system prompt constraints" |
| "Prove it's right with a test set" | "eval harness" |
| "Find out whether it's thinking or querying" | "profile the inference path" |

---

## LEVEL 0 — LAB SETUP

---

## Module 0 — Build the Meridian Dataset
**Level:** Setup · **Duration:** 90 min · **Audience:** Agent Author and Platform tracks

**Deliverable:** a working lab environment for every other module.

Most of the 90 minutes is the warehouse working, not you. `03_facts` alone takes several
minutes to generate 20M transactions. Start it, then read §0.1 and §0.2 while it runs.

> **Why this is a module and not an appendix.** Every later module works on one bank's data. Provisioning it yourself — and spending twenty minutes actually looking at it — is what makes the rest of the course concrete rather than theoretical. Instructors may pre-provision it and assign this module as pre-work.

### Learning outcomes
1. Provision the course dataset in Unity Catalog.
2. Describe what Meridian's business does and which tables record it.
3. Read the data closely enough to notice where a question could have more than one honest answer.

### 0.1 The company — *Meridian Financial Group (MFG)*
A mid-size US bank: **340 branches**, four lines of business — **Deposits**, **Cards & Payments**, **Lending** (mortgage, auto, personal), and **Wealth**. Roughly 2.1M retail customers and a small commercial book that transacts in USD, CAD and GBP.

Financial services is the right domain for this course because it forces every hard lesson naturally: contested metric definitions, a non-calendar fiscal year, regulated PII, snapshot fact tables, and a regulatory hierarchy that competes with the business one.

### 0.2 Schema — one schema, `genie_agent`

| Object | Grain | Key columns | What it powers |
|---|---|---|---|
| `genie_agent.mfg_core_fct_transactions` | one posted/attempted transaction | `txn_id, account_id, txn_date, amount, fee_revenue, interchange, merchant_category, currency, status` | the main fact — fee revenue, volumes |
| `genie_agent.mfg_core_fct_reversals` | one reversal / chargeback | `txn_id, reversal_date, reversal_amount, reason_code` | **gross vs net** revenue |
| `genie_agent.mfg_core_fct_loan_balances` | **account × day (daily snapshot)** | `account_id, snapshot_date, principal_balance, interest_accrued, days_past_due, dpd_bucket, loan_status` | delinquency and balances over time |
| `genie_agent.mfg_core_fct_applications` | one credit application | `app_id, customer_id, product_id, submitted_ts, decision_ts, funded_ts, decision, channel` | approval rate, funnel, cycle time |
| `genie_agent.mfg_core_fct_fraud_cases` | one fraud case | `case_id, account_id, opened_date, closed_date, loss_amount, fraud_type, status` | fraud rate, loss rate |
| `genie_agent.mfg_core_dim_customer` | customer | `customer_id, segment, tenure_months, home_branch_id, ssn_last4, email, dob, annual_income` | segmentation — **and the PII lesson** |
| `genie_agent.mfg_core_dim_account` | account | `account_id, customer_id, product_id, branch_id, opened_date, closed_date, status` | the join hub |
| `genie_agent.mfg_core_dim_product` | product | `product_id, product_name, product_category, regulatory_product_class` | **two competing hierarchies** |
| `genie_agent.mfg_core_dim_branch` | branch | `branch_id, branch_name, region, state, channel, opened_date` | region/state rollups, row-level security |
| `genie_agent.mfg_core_dim_date` | day | `date_key, fiscal_year, fiscal_quarter, fiscal_month, calendar_year, is_business_day` | **fiscal vs calendar** |
| `genie_agent.mfg_core_dim_fx_rate` | currency × day | `currency, rate_date, usd_rate` | multi-currency conversion |
| `genie_agent.mfg_ref_documents` *(volume)* | PDFs | credit committee memos, branch manager notes, customer complaint letters | Agent mode over unstructured files; Knowledge Assistant |

### 0.3 Provisioning — one pip install

The lab is installed by a package, not assembled by hand. In a Databricks notebook:

```python
%pip install databricks360
dbutils.library.restartPython()
```

Then in a **new cell** — `restartPython()` clears everything, so the import cannot share a
cell with the install:

```python
import databricks360 as academy

academy.list_courses()
academy.install('genie-agents')
```

That writes the lab notebooks into your workspace and prints the run order:

```
Installed 'genie-agents' → /Workspace/Users/you@company.com/databricks360/genie-agents
  catalog: mfg    tier: small

  Run these in order:
    1. 01_catalog_and_schemas
    2. 02_dimensions
    3. 03_facts   (slow)
```

Because it runs *inside* a notebook, it authenticates as you — there is no host, token or CLI
profile to configure.

**It does not run the notebooks for you.** Watching a warehouse work through 20M
transactions is part of the point, and nothing should spend compute without being asked.

#### The notebooks

| # | Notebook | What it builds | Status |
|---|---|---|---|
| 01 | `catalog_and_schemas` | the catalog, `core` / `ref` / `staging` schemas, the documents volume | shipped |
| 02 | `dimensions` | dates, branches, products, customers, accounts, FX rates | shipped |
| 03 | `facts` | transactions, reversals, the daily loan book, applications, fraud cases. Slow: several minutes | shipped |
| 04 | `staging` | a 380-column raw landing table and a superseded revenue extract | shipped |
| 05 | `governance` | row filter on branch region, column masks on the customer identifiers, certification tags | shipped |
| 06 | `curated` | net-revenue and month-end views, a customer view without identifiers, three UC functions | shipped |
| 07 | `metric_view` | `mfg_core_mv_banking_metrics` — one definition of each headline metric | shipped |
| 99 | `validate` | twelve checks that the dataset is complete — run last | shipped |

Only **01 → 03** are required; after those you have a working dataset. Run `99` to confirm
it. The rest are needed when the course reaches them, and `install()` prints which is which.

#### Options

```python
academy.install(
    'genie-agents',
    path='/Workspace/Shared/labs',   # default: your home folder
    catalog='training_v2',           # default: mfg
    tier='large',                    # default: small
    overwrite=True,                  # replace notebooks from a previous install
)
```

**Two data tiers.** **Small** (20M transactions) is the default and covers every module except
13. **Large** (900M) exists only for Module 13, where query time has to be long enough to
measure. Start small.

#### Confirming the install

`99_validate` runs twelve checks over the finished dataset — grain, referential integrity,
row counts, currency coverage, calendar correctness. Every row should read **PASS**.

```
check_name              value_1              value_2                detail                    verdict
fiscal calendar         730                  2                      first day 2024-10-01      PASS
referential integrity   0 orphan transactions expected 0            every txn reaches account PASS
row counts              20.0M transactions   36.0M loan snapshots   2.1M customers            PASS
```

It prints numbers as well as verdicts. Read them — you will be asked about several of them
later, and a figure that surprises you now is worth writing down.

#### Why the data is deterministic

Every generated value derives from `hash()` of the row key rather than `rand()`, and ages and
tenures anchor to a fixed 2026-09-30 rather than `current_date`. Two consequences worth
understanding, because they explain a design choice you will meet again in Module 11:

- Your data is **byte-identical** to every other learner's, so a benchmark's ground-truth SQL
  returns the same answer for everyone. Random seeding would silently invalidate the entire
  benchmark set — and you would only notice when scores stopped making sense.
- Re-running a notebook reproduces the same rows instead of a fresh random draw.

### 0.4 The three personas (used from Module 5 onward)
| Persona | Role | Access |
|---|---|---|
| **Priya Raman** | Regional Manager, Northeast | row filter: `region = 'NE'`; PII masked |
| **Marcus Chen** | Regional Manager, West | row filter: `region = 'WEST'`; PII masked |
| **Elena Okafor** | CFO | unrestricted; PII masked except `annual_income` |

### Lab 0 (60 min)
1. `%pip install databricks360`, then `academy.install('genie-agents')`.
2. Run `01_catalog_and_schemas`. Note which catalog the first cell reports — that is where
   your lab lives.
3. Run `02_dimensions`, then `03_facts`. Check the row counts each prints at the end.
4. Run `99_validate`. All twelve checks should read PASS.
5. Now **read the data for twenty minutes.** Open each table, look at the column comments,
   and run whatever occurs to you. Then write down:
   - three questions a business user might ask that this data could answer **two different
     ways**, and why
   - any column whose meaning you had to guess
   - the total value of the loan book, and how you decided which number that was

   Keep the sheet. You return to it in Module 4, and the gap between what you noticed now
   and what you know then is the most useful thing you will produce today.

> Step 5 is the module. Steps 1–4 are typing.

### Knowledge check
5 questions on the schema, the fiscal calendar, and the grain of each fact table.

---

### LEVEL 1 — FOUNDATIONS (business users, no SQL)

---

## Module 1 — What Is Genie, and Which Genie Do You Need?
**Level:** Beginner · **Duration:** 45 min · **Audience:** everyone

### A question in a Monday meeting

It's the first Monday after quarter-end at **Meridian Financial Group**. The Head of Wealth
is looking at a slide that doesn't quite match what she remembers, and she asks the obvious
question:

> *"What was our Wealth AUM at the end of last quarter?"*

Somebody says they'll find out. And in most organisations, that's where the interesting part
stops — because the answer arrives on Thursday, in a spreadsheet, by which point the meeting
has moved on.

But notice what she would have asked next, if the answer had arrived in ten seconds:

> *"How did that compare with the previous quarter?"*
>
> *"What drove the change?"*
>
> *"Which portfolios contributed the most?"*
>
> *"Break that down by asset class."*
>
> *"Show me the trend over the last twelve months."*

That's not five requests. **That's one train of thought.** Each question only exists because
the previous one was answered, and the useful insight — the one that changes a decision — is
somewhere around question four.

Three days of latency doesn't slow that conversation down. It ends it.

### Two mental models

Here's how the answer usually travels:

```
Traditional analytics
  Question → Analyst → SQL → Dashboard → Answer
```

Every arrow is a handoff, and every handoff costs time and loses a little intent. It works
well for questions you knew you'd need to ask — which is what dashboards are for. It works
badly for the fourth follow-up nobody anticipated.

Now the other shape:

```
Genie
  Question → Answer → Follow-up → Deeper insight
```

Fewer arrows, and crucially it's a **loop**. The value isn't the first answer arriving faster.
It's that the second, third and fourth questions get asked at all.

That's what people mean by *having a conversation with your data*. Not a chatbot with a
friendly tone — a short enough feedback loop that curiosity survives.

### "Genie" is not one thing

This is where most people get confused, so let's settle it early. Genie is a **family** of
experiences, and they're aimed at genuinely different people doing genuinely different work.

The easiest way to tell them apart is by the sentence the person would say.

---

### 1. Genie One — *"I have a question about my data."*

This is where the Head of Wealth lives. She isn't picking tables or thinking about joins. She
opens one place, asks in plain language, and follows her own train of thought:

- *"What is our current Wealth AUM?"*
- *"Which portfolios had the largest AUM growth?"*
- *"What percentage of AUM is in equities?"*
- *"How did AUM change from last quarter?"*

She also sees dashboards and applications in the same place, so she doesn't have to know
which kind of thing will answer her question before she asks it.

**Mental model: Ask → Explore → Understand**

Nobody *builds* Genie One. It's the front door.

---

### 2. Genie Agents — *"I want Genie to understand my business."*

This is where the data team lives, and it's what most of this course is about.

A **Genie Agent** is a focused, governed conversational experience built around one business
domain. Someone on the Wealth analytics team decides: *this agent answers questions about AUM,
portfolios, flows and performance — and nothing else.*

Here's the part that surprises people. Building one is **not** mostly about connecting tables.
Point an agent at Meridian's warehouse and it can already read every column. What it can't do
is know any of this:

- What **AUM** actually means here — and which of the three definitions in circulation is the
  authoritative one
- What **"quarter-end"** means, given Meridian's fiscal calendar doesn't start in January
- Which **portfolios** belong in the number — discretionary only, or advisory too? Closed
  accounts? Held-away assets?
- How **asset classes** are defined, and which hierarchy to use when two exist
- How an **AUM change** is calculated — market movement, or net flows, or both
- Which **source** is trusted, when two tables both look like they hold the answer

None of that is in the data. All of it is in people's heads. Your job when you build an agent
is to move it out of their heads and into something the agent can use.

**Mental model: Curate → Teach → Govern → Ask**

---

### 3. Genie Code — *"Help me build with data."*

This is where engineers and analysts-who-write-SQL live. It sits in the workspace alongside
the work:

- *"Write SQL to calculate quarter-end AUM by portfolio."*
- *"Why is this query producing duplicate portfolios?"*
- *"Optimise this Spark transformation."*
- *"Explain what this SQL is doing."*

It's also where you'll do the hands-on work of tuning an agent later in this course — seeing
what an agent actually did with a question, and fixing it in place. (The **Genie Workbench**
is the other surface for that same work.)

**Mental model: Build → Code → Analyze → Develop**

---

### Which one do you need?

| What you're trying to do | Where you go |
|---|---|
| Get an answer to a business question | **Genie One** |
| Build a trusted conversational experience over your domain | **Genie Agent** |
| Write, debug or explain code | **Genie Code** |

That's the whole map. If you remember one thing from this module, remember that the middle
row is a **build** activity — and that this course is about doing it well.

> One naming note so older material makes sense: Genie Agents used to be called **Genie
> Spaces**. Same thing, renamed. You'll see the old term in blog posts and screenshots.

### Genie isn't magic

Let's go back to the original question and take it seriously:

> *"What was Meridian's Wealth AUM at the end of Q2?"*

To a person, that's one question. To anything trying to answer it, it's **six**:

| The question sounds like | But first you must answer |
|---|---|
| "Wealth" | Which lines of business count? Does Private Client sit inside Wealth or beside it? |
| "AUM" | Assets under management, advisement, or administration? Do held-away assets count? |
| "at the end of" | The last calendar day, the last business day, or the last reporting date? |
| "Q2" | Fiscal or calendar? Meridian's fiscal year doesn't start in January. |
| implied: which portfolios | Discretionary only? Closed accounts? Accounts funded mid-quarter? |
| implied: from where | Two tables look authoritative. Which one is? |

Answer those six differently and you get six defensible numbers. **All of them are "right".
Only one of them is the number the Head of Wealth meant.**

So here's the principle this whole course rests on:

> **Genie doesn't just need access to your data. Genie needs to understand what your data
> means.**

Access is a permissions problem, and it's mostly solved. Meaning is a curation problem, and
it's mostly not.

### Think of it like a new analyst

Imagine a strong analyst joins Meridian on Monday. Sharp, good with SQL, knows finance.

You would not hand her credentials to four thousand tables and say *"figure out our AUM."*
You'd sit down and tell her:

- what the business words mean here
- which sources are trusted, and which are old
- how the important metrics are actually calculated
- how the tables relate to each other
- the exceptions — the fund that's reported differently, the accounts that don't count
- the questions she'll be asked most often

You'd expect that to take a few weeks. You wouldn't consider it wasted time; you'd consider
it onboarding.

**Building a Genie Agent is the same job.** You are onboarding something that reads
extraordinarily fast and knows nothing about your company. Everything you'd teach the analyst
is exactly what the agent needs — and the parts you'd forget to mention are exactly where it
will go wrong.

### A demo and a product are different things

This distinction is worth being blunt about, because it's where most Genie projects quietly
fail.

A **demo** asks:

> *Can Genie answer a question?*

Yes. Almost always, on the first try, impressively. Demos are easy.

A **production-quality agent** asks:

> *Can Genie consistently answer the questions this business actually cares about, using
> trusted data and trusted definitions — and can I prove it?*

Those are not the same bar. The gap between them is measured in curation, and closing it is
what the rest of this course teaches.

### Four ingredients

Everything you'll build rests on four things. Miss any one and the agent is a demo.

**AI** — the reasoning that turns a sentence into a query. This part you get for free, and it
is not your differentiator.

**Data** — the tables, views and metrics themselves. Necessary, and nowhere near sufficient.

**Business context** — the definitions, synonyms, rules and worked examples that tell the AI
what your words mean. **This is the work.** It's also the part most teams skip, then wonder
why the answers drift.

**Governance** — who may see what, which sources are authoritative, and how you know an
answer is right. In financial services this isn't an afterthought; it's often the reason the
project is allowed to exist.

### Where this course goes

You'll work with Meridian Financial Group throughout — its deposits, cards, lending and wealth
businesses — and build up to answering exactly the kind of chain the Head of Wealth started
with:

> *"What was Wealth AUM at the end of Q2?"*
>
> *"How did AUM change?"*
>
> *"Which asset classes drove the change?"*
>
> *"Which portfolios contributed most?"*
>
> *"How does that compare with the same period last year?"*

Not as a demo. As something a real business could rely on.

### The question to carry with you

Every module from here answers a version of one question. It's worth writing down now,
because you'll come back to it constantly:

> **If I were the business user asking this, what would Genie need to know to answer it
> correctly?**

Not *"could it produce an answer"* — it almost always can. **Correctly.** For your business,
by your definitions, from data you'd defend in a meeting.

Here's the arc of what's coming, and each step is one part of that answer:

```
Data → Context → Instructions → Relationships → Logic → Testing → Governance
```

- **Data** — choosing the few objects worth exposing, and shaping them
- **Context** — teaching the agent your vocabulary and your metrics
- **Instructions** — the rules and worked examples that pin down intent
- **Relationships** — how things join, and what happens when you get it wrong
- **Logic** — turning contested definitions into one agreed calculation
- **Testing** — proving accuracy instead of asserting it
- **Governance** — who sees what, and which numbers are official

### Lab 1 (15 min)

You're given twelve real questions from a Meridian shared inbox. Sort each into one of four
buckets:

- **Genie One** — a business question over existing data
- **Genie Agent** — needs a curated domain built first
- **Genie Code** — someone needs help writing or fixing code
- **Not a data question at all**

Then pick the single hardest one and list every business definition that would have to be
settled before any tool could answer it correctly. Compare your list with a colleague's — the
disagreements are the interesting part, and they're a preview of Module 5.

### Knowledge check

## Module 2 — Asking Questions That Actually Work
**Level:** Beginner · **Duration:** 60 min · **Audience:** business consumers — the whole of the Business User track

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

---

## Module 3 — Chat Mode vs Agent Mode (Answers vs Research)
**Level:** Beginner–Intermediate · **Duration:** 45 min

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

---

### LEVEL 2 — HOW IT WORKS

---

## Module 4 — Under the Hood: The Compound AI System
**Level:** Intermediate · **Duration:** 60 min

### Learning outcomes
1. Name the inputs Genie uses, ranked by influence.
2. Explain to a stakeholder *why* an answer was wrong, in terms of a missing input.
3. Set honest expectations about consistency.

### Key concept — Genie is **not one LLM**
It's a **compound AI system**: multiple interacting components. When it answers it assembles context from:
1. **Unity Catalog metadata** — tables, columns, comments, relationships
2. **Knowledge store** — agent-scoped semantics: descriptions, synonyms, joins, SQL expressions
3. **Instructions** — plain-text business rules from the author
4. **Example SQL queries** — worked answers Genie selects from by matching the user's phrasing
5. **Trusted assets** — author-verified parameterised queries and Unity Catalog functions
6. **Chat history** — the current thread, subject to token limits

### The vocabulary table (learners will be quizzed on this)
| Term | Plain-English definition | Where it lives |
|---|---|---|
| **Knowledge store** | The agent's private dictionary of your business: what each table/column means, synonyms, how tables join, and reusable metric/filter/field definitions. Scoped to **one** agent. | Configure → Knowledge |
| **Instructions** | Written rules: terminology, fiscal calendar, date formats, formatting. Applied **globally**, not to a subset. | Configure → Instructions |
| **Example SQL query** | A question phrased the way users phrase it, paired with SQL that answers it correctly. | Configure → Instructions |
| **Trusted asset** | A parameterised query or UC function whose logic the author has **verified**. Used as-is. | Configure → Instructions |
| **Benchmark** | A test question with a known-correct answer. **Measures** quality only — never improves answers. | Monitor → Benchmarks |
| **Agent mode** | Multi-step research: sub-tasks, multiple queries, report output. | Chat toggle |
| **Knowledge mining** | Genie proposing new joins/expressions by reading UC schemas and watching author behaviour (thumbs-up, query downloads). | suggestions in Configure |

> **Drill this distinction:** instructions and examples **change** answers. Benchmarks **grade** them. Learners confuse these constantly.

### The influence hierarchy (the course's central mental model)
```
STRONGEST  ┌─ Trusted assets (verified query / UC function)     "use this exact logic"
           ├─ Example SQL queries                              "here's a worked answer"
           ├─ Knowledge store SQL expressions                   "this is what 'net fee revenue' means"
           ├─ Knowledge store metadata (descriptions, synonyms) "this is what this column means"
           ├─ Unity Catalog comments                            "generic table docs"
WEAKEST    └─ Plain-text instructions                           "please remember to..."
```
**Teaching line:** *"Text instructions are the last resort, not the first tool."* Databricks' best-practice guidance says to prioritise SQL expressions and example SQL **over** text instructions. This inverts what most learners instinctively do.

### The honest caveat: this is guidance, not a guarantee
Genie has **built-in randomness**. A well-curated agent still varies between runs. Everything in the hierarchy makes the right answer far more *likely* — none of it *forces* it. The **only** layer that guarantees behaviour is **Unity Catalog**: row filters, column masks, grants. Everything above UC is guidance.

Say this out loud here, and again in Module 12. The alternative is a CFO discovering it the night before an earnings call.

Practical consequences learners must internalise now:
- Judge quality over a **benchmark set**, never two side-by-side runs (Module 10).
- Compare **like-for-like**: same mode, fresh chat, same agent version.
- Earlier turns in a thread are context — a "different answer" is often a different *conversation*, not a different agent.
- The more a rule lives in **prose** rather than **SQL**, the more room Genie has to vary. Pinning logic to SQL expressions and metric views removes the decision entirely.

### Lab 4 (20 min) — diagnostic
Learners get 9 wrong answers from the deliberately uncurated MFG agent — one per planted flaw. For each, identify **which input was missing** (e.g. *"summed a daily snapshot → no join cardinality declared"*; *"returned zero for California → no entity matching on `state`"*). Diagnosis only, no fixing. Then compare against their Lab 0 prediction sheet.

**Docs:** `/genie-agents/concepts`, `/genie/best-practices`

---

## Module 5 — Fiscal Calendars, Metric Definitions, and Why Business Language Is the Hard Part
**Level:** Intermediate · **Duration:** 45 min

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
IMPLEMENTED AS    measure expression + metric view mfg_core_mv_banking_metrics
SIGNED OFF        2026-08-14
```

### Lab 5 (25 min)
In pairs, build a 10-term glossary for the MFG lending domain using the template. Every term needs a named owner and an implementation route. Disagreements are the point of the exercise.

### Teaching line
> *"Genie didn't get the answer wrong. Your company has three answers and never picked one."*

**Docs:** `/genie/best-practices`, `/metric-views/`

---

## Module 6 — Governance: Who Sees What, and Why It's Safe
**Level:** Intermediate · **Duration:** 75 min · **Audience:** authors + stewards

### Learning outcomes
1. Explain the two credential types and their security implications.
2. Predict what three different users see from the same question.
3. Handle PII in a regulated dataset.
4. Assign the right sharing level and pass the permissions checklist.

### Key concepts
**Two credential types** — the most important governance idea in the course:
- **Compute credentials** — embedded by the agent author (which warehouse runs the query)
- **Data credentials** — **the asking user's own identity**

Consequence: Unity Catalog **row filters and column masks are enforced per user**. Two people ask the identical question and correctly get different numbers.

**Required permissions to author:** Databricks SQL workspace entitlement · `CAN USE` on a **Pro or serverless** SQL warehouse · `SELECT` on every object in the agent · `CAN EDIT` on the agent. An account admin must first enable partner-powered AI features at **account and workspace** level.

**Sharing levels:** `CAN MANAGE` · `CAN EDIT` · `CAN RUN` · `CAN VIEW` — set via folder permissions or direct share.

**Also cover:** cloning an agent; **exporting an agent's context as a metric view** (promotes curated semantics into a governed UC object); assigning **certification** to an agent; and **certify/deprecate on the underlying data** so Genie prefers `fct_transactions` over `fct_txn_legacy`.

### Business example — the row-filter demo (run this live)
```
Question (identical for all three): "What was net fee revenue last fiscal quarter?"

Priya  (Regional Manager, Northeast) → $41.2M
Marcus (Regional Manager, West)      → $28.7M
Elena  (CFO, unrestricted)           → $186.4M
```
Same agent. Same question. Three correct answers. **Genie leaked nothing.**

### Business example — PII in a regulated dataset (flaw 8)
```
Question: "Give me the contact details for our top 20 depositors"

Priya  → names and account IDs; email masked, ssn_last4 masked, dob masked
Elena  → same masking; annual_income visible (CFO exception)
Neither → can retrieve a usable PII export from Genie at all
```
**Teaching point:** the right answer to "can Genie leak PII?" is *"only what Unity Catalog already lets that person see."* Curating an agent is not a security control — masks and filters are. Authors who try to prevent PII exposure with a **text instruction** ("never show email addresses") have built nothing. Demonstrate that instruction failing.

### Business example — sharing levels at MFG
| Person | Level | Rationale |
|---|---|---|
| Retail analytics lead (owner) | CAN MANAGE | owns definitions, manages sharing |
| Two analysts on the team | CAN EDIT | add examples, fix bad SQL, see source queries |
| 340 branch managers | CAN RUN | ask questions, give feedback, can't change logic |
| Exec assistant | CAN VIEW | read shared threads only |

### Lab 6 (25 min) — GRADED
Given the MFG access matrix (3 personas × 11 objects, one row filter, four column masks), predict for 8 questions whether each user gets an answer, a masked answer, a partial answer, or a permission error. Then verify in the workspace.

### Common mistakes
- Assuming the author's permissions apply to consumers (they don't).
- Granting `CAN EDIT` broadly "so people can help" — editors change business logic for everyone.
- **Trying to enforce PII rules with instructions instead of column masks.**
- Building on a table the consumer group has no `SELECT` on, then debugging the agent instead of the grant.

**Docs:** `/genie-agents/concepts` (permissions), `/genie-agents/set-up`

---

### LEVEL 3 — BUILDING

---

## Module 7 — Prepare the Data (The 80% That Decides Quality)
**Level:** Intermediate · **Duration:** 90 min

### Learning outcomes
1. Scope an agent to a single audience and topic.
2. Get under the 30-object limit using pre-joined views.
3. Write column descriptions and hide noise.
4. Decide when to build a **metric view** instead of curating in the agent.

### Key concepts and hard limits
| Limit | Value |
|---|---|
| Tables/views per agent | **30 max** |
| Recommended starting size | **≤ 5** |
| Conversations per agent | 10,000 (10,000 messages each) |

**Databricks' framing:** *treat Genie like a new analyst joining your company.* You'd give a new credit analyst a clean, documented, narrow dataset — not the whole lakehouse.

**Start small.** Minimal instructions, a limited question set, then expand from feedback. Do not try to be complete on day one.

**Define purpose.** One audience, one topic. An agent covering deposits *and* lending *and* fraud covers all three badly.

**Pre-join.** Beyond 30 objects, build views that pre-join related tables. Fewer, richer objects beat many thin ones — and pre-joining is where you bake in flaws 1, 4 and 6 permanently.

**Narrow is *faster*, not just more accurate.** Every table and column is context Genie must read before writing SQL, so a bloated agent is slow **and** wrong. Wide tables are the worst offenders — replace the 380-column `fct_transactions_raw` with a slim view holding only what anyone asks about. Module 13 puts a stopwatch on this.

**Certify and deprecate in Unity Catalog.** Certify `fct_transactions`, deprecate `fct_txn_legacy`. "We have two revenue tables" then stops being the agent's problem and becomes a governance decision made once.

**Metric views** — Unity Catalog semantics that separate **measures** from **dimensions**, defined in YAML, so a metric is defined once and grouped/filtered any way at runtime. They carry **agent metadata** (synonyms, display names, formatting rules) that directly improves accuracy and keeps formatting consistent across tools.

| Situation | Build |
|---|---|
| One team, a handful of metrics, moving fast | curate inside the agent |
| "Net fee revenue" must mean one thing across 5 agents, 3 dashboards and the regulatory pack | **metric view**, then point agents at it |
| You already curated an agent and want to promote its semantics | **export the agent as a metric view** |

### Business example — scoping the MFG "Retail Banking & Deposits" agent
**Before (bad):** 22 objects including `fct_transactions_raw` (380 columns), `fct_txn_legacy`, `dim_employee`, `hr_headcount`, both product hierarchies, and `_tmp_reversal_backfill`.

**After (good):** 7 objects
```
mfg_core_vw_transactions_net   -- fct_transactions LEFT JOIN fct_reversals; PENDING/DECLINED/REVERSED
                      -- excluded; exposes gross_fee_revenue, net_fee_revenue, txn_count   [flaws 1, 4]
mfg_core_vw_loan_book_eop      -- fct_loan_balances filtered to end-of-period snapshots only         [flaw 6]
dim_account           -- the join hub
mfg_core_dim_customer_safe     -- PII columns dropped; segment, tenure_band                          [flaw 8]
dim_product           -- regulatory_product_class hidden; product_category renamed          [flaw 5]
dim_branch            -- region, state, channel
dim_date              -- fiscal (Oct 1 start) + calendar columns                            [flaw 2]
mfg_core_mv_banking_metrics    -- metric view: net_fee_revenue, delinquency_rate_30/90,
                      -- approval_rate, fraud_loss_rate                                     [flaws 1, 7]
```
> **Note what happened:** five of the nine planted flaws were fixed *in the data layer*, before a single instruction was written. That is the module's whole point.

### Business example — column descriptions that earn their keep
| Column | ❌ Weak | ✅ Strong |
|---|---|---|
| `fee_revenue` | "the fee amount" | "**Gross** fee revenue in USD for this transaction, before reversals and chargebacks. For net revenue use the `net_fee_revenue` measure — do not sum this column alone." |
| `status` | "status" | "Transaction status: POSTED, PENDING, DECLINED, REVERSED. **Only POSTED counts as revenue.** DECLINED rows exist and will inflate transaction counts if not excluded." |
| `region` | "region code" | "Branch region. Values: NE, SE, MW, WEST. Users may say 'Northeast' (NE), 'West Coast' or 'the West' (WEST), 'Midwest' (MW)." |
| `principal_balance` | "loan balance" | "Principal balance **as of `snapshot_date`** — this table has one row per account per day. **Never SUM across dates**; use end-of-period or average-balance measures." |
| `dpd_bucket` | "days past due bucket" | "Delinquency bucket: CURRENT, 1-29, 30-59, 60-89, 90+. 'Delinquent' = 30+; 'seriously delinquent' = 90+." |

### Demo (15 min)
Ask an under-prepared agent *"What was revenue for California last year?"* → it returns **gross** revenue, **calendar** year, and **zero rows** for California (flaws 1, 2, 3 firing at once). Then ask the prepared 7-object agent. Same question, right answer, no prompt tricks.

### Lab 7 (30 min) — GRADED
From the 22 raw MFG objects: choose ≤ 8, write the `mfg_core_vw_transactions_net` and `mfg_core_vw_loan_book_eop` view SQL, write descriptions for 10 columns, and list 6 columns to hide with reasons.

### Anti-patterns to name explicitly
- Adding every table "just in case."
- Accepting **AI-generated column descriptions without verifying them** — the docs call this out, and in this dataset the AI suggestions get flaws 1 and 5 wrong on purpose.
- Leaving both product hierarchies visible.
- Exposing a daily-snapshot table without a warning in its description.

**Docs:** `/genie/best-practices`, `/metric-views/`, `/genie-agents/set-up`

---

## Module 8 — Create Your First Genie Agent
**Level:** Intermediate · **Duration:** 75 min

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

---

## Module 9 — The Knowledge Store: Teach It Your Business
**Level:** Intermediate–Advanced · **Duration:** 90 min · **Audience:** authors

> **The highest-value module in the course.** Everything before it prepares for this, and
> everything after it measures or operates what you build here.

### Learning outcomes
1. Build agent-scoped metadata and synonyms.
2. Configure **entity matching / value dictionaries** for categorical columns.
3. Declare join relationships with the right cardinality.
4. Write the three kinds of **SQL expressions** — filters, measures, fields.
5. Evaluate **knowledge mining** suggestions.

### Key concepts and limits
| Element | What it does | Limit |
|---|---|---|
| Table / column descriptions | agent-scoped meaning — **does not overwrite** Unity Catalog metadata | part of the 200-snippet budget |
| Synonyms | maps business vocabulary onto column names | " |
| Hidden columns | removes noise and duplicate hierarchies | — |
| **Prompt matching — format assistance** | supplies representative values automatically; fixes spelling/format drift | automatic |
| **Prompt matching — entity matching** (also called **example values** / **value dictionaries**) | curated lists of distinct values, so Genie filters on the *real* value (`'CA'`) instead of inventing one (`'California'`) | **120 columns**, **1,024 values** each |
| Join relationships | explicit PK–FK links; Many-to-One / One-to-Many / One-to-One; complex conditions via SQL expression | part of 200 |
| **SQL expressions** | filters, measures, fields | part of 200 |
| **Knowledge store snippets total** | descriptions + joins + SQL expressions | **200 per agent** |

### The three SQL expression types — MFG examples
| Type | Purpose | Example |
|---|---|---|
| **Filter** | a reusable condition | `Posted transactions only` → `status = 'POSTED'` [flaw 4] · `Latest snapshot` → `snapshot_date = (SELECT MAX(snapshot_date) FROM mfg_core_vw_loan_book_eop)` [flaw 6] · `Commercial book` → `segment = 'COMMERCIAL'` |
| **Measure** | a KPI | `net_fee_revenue` → `SUM(fee_revenue) - SUM(COALESCE(reversal_amount,0))` [flaw 1] · `delinquency_rate_90` → `SUM(CASE WHEN days_past_due >= 90 THEN principal_balance ELSE 0 END) / NULLIF(SUM(principal_balance),0)` [flaw 7] · `approval_rate` → `COUNT_IF(decision='APPROVED') / NULLIF(COUNT(*),0)` · `fraud_loss_rate` → `SUM(loss_amount) / NULLIF(SUM(fee_revenue),0)` |
| **Field** | a derived attribute | `tenure_band` → `CASE WHEN tenure_months < 12 THEN 'New' WHEN tenure_months < 60 THEN 'Established' ELSE 'Long-tenured' END` · `is_high_risk` → `days_past_due >= 30 OR fraud_flag` |

### Business example — synonyms that unblock real users
| Users actually say | Column / value | Fix |
|---|---|---|
| "Northeast", "the East" | `region = 'NE'` | synonym + entity matching |
| "West Coast", "out west" | `region = 'WEST'` | synonym |
| "California" | `state = 'CA'` | **entity matching** |
| "top line", "fee income", "revenue" | `net_fee_revenue` measure | synonyms on the measure |
| "delinquent" / "seriously delinquent" | `days_past_due >= 30` / `>= 90` | two distinct measures + a clarification instruction |
| "chargeback", "dispute", "refund" | `fct_reversals` | synonyms on the table |
| "charged off", "written off" | `status = 'CHARGED_OFF'` | filter expression |

### Business example — entity matching in action (flaw 3)
Without it: *"How did California branches do last quarter?"* → Genie writes `WHERE state = 'California'`, the table holds `'CA'`, and the answer is a confident **zero** — or the filter is silently dropped and you get the national number labelled as California.

With entity matching on `dim_branch.state` (50 values curated) and `region` (4 values): Genie matches the phrasing to the real value, and handles "Californa" too.

**Teaching rule:** turn on entity matching for every low-cardinality categorical column users name out loud — region, state, merchant_category, dpd_bucket, decision, channel, product_category.

### Business example — the fan-out trap (flaw 6) — spend real time here
`fct_loan_balances` has one row per account per day. Ask *"What's our total loan book?"* against the raw table with no cardinality declared, and Genie writes `SUM(principal_balance)` across a month of snapshots: **$1.4 trillion** instead of $47 billion. Roughly 30× too high.

The number *looks* like a number. The chart *looks* like a chart. Nobody notices until the regulatory pack disagrees.

Fix at three layers, in order:
1. **Data:** `mfg_core_vw_loan_book_eop` exposes end-of-period snapshots only (Module 7).
2. **Knowledge store:** declare `mfg_core_vw_loan_book_eop.account_id → dim_account.account_id (Many-to-One)`, and a `Latest snapshot` filter expression.
3. **Description:** "one row per account per day — never SUM across dates."

> **This is the scariest failure mode in the course: a plausible wrong number.** A missing join or wrong cardinality between `fct_transactions` and `dim_account` produces the same class of error on the revenue side.

### Knowledge mining
Genie proposes new joins and SQL expressions by reading Unity Catalog schemas and observing author behaviour — thumbs-up on responses and downloaded queries. Teach authors that **their own upvotes are training signal**, and to review suggestions rather than accept blindly.

### Lab 9 (40 min) — GRADED, hardest lab
On the MFG agent: add synonyms for 10 business terms, enable entity matching on 4 categorical columns, declare all 6 join relationships with correct cardinality, and author 8 SQL expressions (3 filters, 4 measures, 1 field). Then re-run the 9 broken questions from Lab 4 and show which now pass.

### Common mistakes
- Adding synonyms to the column but not the values (or vice versa).
- Wrong cardinality (One-to-Many where it's Many-to-One) → fan-out and inflated totals.
- Encoding a metric in a **text instruction** instead of a **measure expression**.
- Exposing a snapshot table with no `Latest snapshot` filter.
- Burning the 200-snippet budget on low-value descriptions.

**Docs:** `/genie-agents/tune-quality`, `/genie/best-practices`

---

## Module 10 — Instructions, Example SQL, and Trusted Assets
**Level:** Advanced · **Duration:** 90 min

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
FROM   genie_agent.mfg_core_vw_transactions_net t
JOIN   genie_agent.mfg_core_dim_account         a ON t.account_id = a.account_id
JOIN   genie_agent.mfg_core_dim_branch          b ON a.branch_id  = b.branch_id
JOIN   genie_agent.mfg_core_dim_date            d ON t.txn_date   = d.date_key
WHERE  d.fiscal_quarter = :fiscal_quarter  -- Format 'FY2026-Q3'. MFG fiscal year starts Oct 1.
  AND  t.status = 'POSTED'                 -- excludes PENDING, DECLINED, REVERSED
GROUP BY b.region
ORDER BY net_fee_revenue DESC
```
Four lessons in one artifact: the title is the user's sentence; the parameter comment explains the format *and* the fiscal quirk; the status filter is baked in; and the join path is demonstrated rather than described.

### Business example — a UC function as a trusted asset
```sql
CREATE OR REPLACE FUNCTION genie_agent.mfg_core_delinquency_rate(
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

---

### LEVEL 4 — QUALITY AND OPERATIONS

---

## Module 11 — Test, Benchmark, and Prove It's Right
**Level:** Advanced · **Duration:** 90 min

### Learning outcomes
1. Build a benchmark set with ground-truth answers.
2. Interpret Chat-mode vs Agent-mode scoring.
3. Fix a wrong answer by editing and saving the query.
4. Use **Genie Code** to debug a response and analyse a benchmark run.

### Key concepts and limits
- **Benchmarks: up to 500 questions per agent.** They **measure** accuracy — explicitly *not* context, and they never improve answers.
- **Chat-mode scoring:** each question needs a **SQL query whose result set is the correct answer**; scoring compares result sets automatically.
- **Agent-mode scoring:** uses **LLM judges** (the output is a report, not a comparable result set).
- **Access benchmark evaluations**, review individual evaluations, and **analyse a whole run with Genie Code**.
- **The fix loop:** view the generated query → correct it → **save it as an example query**. A bug fix becomes permanent training. The single most efficient curation move in the product.
- **Debug with Genie Code** when you can't see why a response went wrong.

### Why benchmarks and not spot checks
Because Genie varies by design (Module 4), a single before/after comparison proves nothing — you cannot separate a real improvement from noise. A 30-question set run before and after a change is the only honest evidence. Rules for a fair run:
- **Same mode.** Chat scores (result-set comparison) and Agent scores (LLM judge) are not comparable. Never average them.
- **Fresh chat.** Prior turns are context; a stale thread contaminates the result.
- **Same agent version.** Change one thing, re-run, record.
- **Never judge on too few runs.** Two side-by-side questions is an anecdote, not a measurement.

### The three-tier test set (course artifact)
| Tier | Count | Content | Bar |
|---|---|---|---|
| **Tier 1 — Smoke** | 10 | the common questions + top asks | **100%** before any release |
| **Tier 2 — Coverage** | 60 | every measure × every major dimension | ≥ 90% |
| **Tier 3 — Traps** | 30 | **one per planted flaw, minimum** — fiscal vs calendar, gross vs net, declined transactions, snapshot summing, delinquency ambiguity, state/region phrasing, currency mixing, both product hierarchies | ≥ 80%, and every failure gets a ticket |

### Business example — three Tier-3 trap benchmarks
```
Q: "What was revenue last year?"                                            [flaws 1, 2]
Expected: asks which fiscal period and which revenue definition, OR returns
          net fee revenue for FY2025 and says so explicitly.
Fails if:  returns gross, or uses calendar 2025.

Q: "What's our total loan book?"                                            [flaw 6]
Ground truth: SELECT SUM(principal_balance) FROM genie_agent.mfg_core_vw_loan_book_eop
              WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM ...)
Fails if:  the result is more than 2× the ground truth (it summed snapshots).

Q: "How many delinquent loans do we have?"                                  [flaw 7]
Expected: asks 30+ or 90+ DPD before answering.
Fails if:  it silently picks one threshold without saying which.
```

### Business example — the fix loop
```
1. Branch manager asks "deposit growth for my branch last month" → wrong (includes DECLINED)
2. She clicks "Fix it"
3. Author opens the response, clicks Show code, sees the missing status filter
4. Author edits the SQL, verifies the number, and SAVES IT AS AN EXAMPLE QUERY
5. Adds it to the Tier-3 benchmark set
6. Re-runs benchmarks → confirms no regression elsewhere
```
**Teaching line:** *every "Fix it" is a free curation task with the answer already attached.*

### Lab 11 (40 min) — GRADED
Build a 30-question benchmark set (10 smoke, 12 coverage, 8 traps — at least one per planted flaw) with ground-truth SQL. Run it, record the score, fix the top 3 failures via the edit-and-save loop, re-run, report before/after.

**Docs:** `/genie-agents/monitor`

---

## Module 12 — Monitor, Triage, and Keep It Accurate Over Time
**Level:** Advanced · **Duration:** 60 min

### Learning outcomes
1. Use the Monitor tab to find quality problems before users complain.
2. Run a feedback triage process.
3. Route each symptom to the correct fix *layer*.
4. Operate a curation cadence with clear ownership.

### Key concepts
- **Monitor tab** — usage and trends, conversation history, quality review of conversations, delete a conversation, and a **weekly digest**.
- **Feedback signals** — **Yes** / **Fix it** / **Request review**, plus comments on flagged responses for async back-and-forth between consumer and author.
- **Curation is iterative and never "done."** Data changes, vocabulary changes, questions change.

### Business example — the MFG weekly triage (30 min, every Monday)
```
1. Open Monitor → last 7 days
2. Every "Fix it"          → diagnose the missing input (Module 4 hierarchy) → fix at the RIGHT layer
3. Every "Request review"  → answer in comments so the user sees a human responded
4. Top 10 questions by volume not in the benchmark set → add them
5. Questions returning zero rows → usually a missing synonym or entity value
6. Review knowledge-mining suggestions → accept the good ones
7. Re-run Tier-1 smoke set → must stay at 100%
8. Log: instructions used / 100, snippets used / 200
```

### The fix-routing table (course artifact — laminate this)
| Symptom | Wrong fix | Right fix |
|---|---|---|
| "California" returns nothing | tell users to say "CA" | **entity matching** on `state` (Module 9) |
| Revenue is gross, not net | text instruction "use net revenue" | `net_fee_revenue` **measure expression** + fix the view (Modules 7, 9) |
| Loan book is 30× too high | re-ask the question | **join cardinality** + `Latest snapshot` filter + EOP view (Modules 7, 9) |
| Wrong year | a note in the description | **fiscal calendar instruction** + `dim_date` fiscal columns (Modules 7, 10) |
| Transaction counts too high | ignore it | **`status = 'POSTED'` filter expression** (Module 9) |
| "Delinquent" answered inconsistently | more prose | **two named measures** + a **clarification instruction** (Modules 9, 10) |
| A complex recurring question is always slightly off | more text instructions | **example query** or **UC function** as a trusted asset (Module 10) |
| Genie asserts a *cause* ("delinquency rose because of the new channel") | forward it to the CRO | it's an **unsupported claim** — tighten context, remove overlapping tables, diagnose with Genie Code. Genie retrieves; it does not diagnose (Module 2). |
| Answers pull from `fct_txn_legacy` | delete the table and break downstream | **certify** `fct_transactions`, **deprecate** the legacy table in UC (Modules 6, 7) |
| PII appeared in an answer | add "never show PII" to instructions | **column masks** in Unity Catalog (Module 6) |
| Answers are correct but slow | add instructions | measure thinking vs query time first (Module 13) |
| Routing is getting worse workspace-wide | tune this agent harder | **delete old and unused agents** — too many hurts routing for everyone |
| Agent mode drops a filter Chat mode applies | tell users to avoid Agent mode | that's a **product bug** — report it (Module 14), and meanwhile bake the filter into a **view or metric view** so both modes inherit it |

### Ownership model
| Role | Owns | Cadence |
|---|---|---|
| Agent owner (retail analytics lead) | definitions, triage, benchmark health | weekly |
| Data steward | UC metadata, metric views, grants, certify/deprecate | monthly |
| Business sponsor (CFO / CRO) | which questions matter, sign-off on definitions | quarterly |
| Platform admin | enablement, warehouse, **budgets**, latency | quarterly |

### Lab 12 (25 min)
Given a Monitor export of 40 MFG conversations with feedback, produce a triage sheet: root cause, correct fix **layer**, owner, priority. Fix the top 5.

**Docs:** `/genie-agents/monitor`, `/genie/best-practices`

---

## Module 13 — Performance: Why Genie Feels Slow, and What Actually Fixes It
**Level:** Advanced · **Duration:** 90 min · **Audience:** authors + platform owners

> Sourced from the *Genie Performance & Issues Playbook*. This module needs the **Large** data tier from Module 0 — you cannot teach latency on a toy dataset.

### Learning outcomes
1. Split a slow response into **thinking time** vs **query time** before changing anything.
2. Measure both halves with `system.query.history` and the Conversation API.
3. Apply the right fix to the right half.
4. Recognise the hard limits that masquerade as bugs.

### The core insight
```
total response time  =  THINKING  +  QUERY EXECUTION
                        (routing + reading      (SQL run
                         context + writing SQL)  + fetch)
typical observed:        ~20+ seconds            ~3–10 seconds
```
**Most slowness is in the thinking half — context, not the database.** So the instinct "make the warehouse bigger" usually fixes nothing. Measure first; the two halves are fixed in completely different places.

### Limits to know before you tune
*Many "problems" are really a limit being hit.*

| Limit | Value | What happens at the limit |
|---|---|---|
| Tables per agent | **≤ 30 (aim ≤ 5)** | worse routing, slower thinking |
| Text instructions | warning at **~5,000–7,000 chars**; **~100** max | Genie may **silently ignore** parts of long instructions |
| Knowledge store snippets | **~200** | extra context stops being used |
| **SQL query time** | **90 sec — cannot be raised** | query returns a timeout error |
| **Backend response** | **~597 sec (~10 min)** | "runaway" answer — **billed but never shown** |
| Ontology snippets (good coverage) | ~1,000+ (non-CMK workspace) | too few = little learned context |
| **AI model requests** | **200/sec shared** · 300,000/sec dedicated | heavy sequential use hits **429 / rate limit** |

### Step 1 — find out where the time goes (never tune blind)
- **Compare total response time vs SQL run time.** Query fast but total 30 s+ → it's **thinking** (Step 2). Query slow → **warehouse/tables** (Step 3).
- **Read the query timing breakdown.** Big *wait* = warehouse; big *run* = table tuning.
- **`system.query.history` columns (ms):** `execution_duration_ms` (pure SQL — your baseline), `compilation_duration_ms`, `waiting_for_compute_duration_ms` (cold start), `waiting_at_capacity_duration_ms` (queue/overload), `result_fetch_duration_ms`. Filter to Genie's warehouse and window; use `client_application` to exclude BI and notebook traffic.
- **Conversation API status transitions:** `submit → EXECUTING_QUERY` = the thinking half; `EXECUTING_QUERY → COMPLETED` = SQL run + fetch. Timestamp them yourself.
- **Correlation gotcha:** there is **no `statement_id`** in the API response — match on `statement_text` + warehouse + a narrow time window.
- **MLflow tracing:** inside an MLflow agent (`GenieAgent`), `mlflow.langchain.autolog()` captures the Genie call as one timed span. Calling the API yourself, wrap it in `@mlflow.trace` and open a span per status phase for a first-class thinking-vs-query split. **On serverless, autolog is off by default.**

**Three measurement traps to teach explicitly:**
1. **Don't time Genie from system-table timestamps** — `last_updated_timestamp` moves and isn't reliable.
2. **Instrument your own poll loop as a separate span** — a naive loop has been measured adding **6–8 s of self-inflicted delay**, which then gets blamed on Genie.
3. **Genie doesn't expose internal sub-steps** — you get thinking-vs-query, not a finer breakdown. Don't promise stakeholders more resolution than exists.

### Step 2 — if the *thinking* is slow (most common)
| Check | Fix |
|---|---|
| Too much context to read? | cut to **≤ 5 objects**, shorten examples, hide unused columns |
| Very wide tables in the agent? | replace with **slim views** holding only needed columns |
| Same query generated over and over, or a "token budget" error? | an older model **looping** (~60 s wasted) — switch to a newer model |
| Long or stale chat session? | **start a fresh chat** |
| Instruction blocks over ~5,000–7,000 chars? | move the logic into SQL expressions and metric views |

### Step 3 — if the *query* is slow (warehouse & tables)
| Check | Fix |
|---|---|
| Warehouse overloaded / queuing? | scale up or add a dedicated warehouse; turn on Genie's **"auto" compute mode** |
| Using Serverless with sensible autoscaling? | Serverless with a real **min/max**, not one fixed large warehouse |
| Hitting the **90-second** query limit? | keep the warehouse warm; filter and cluster big tables. **The limit cannot be raised.** |
| Managed tables with **Predictive Optimization** on *and running*? | enable PO and confirm it is actually running |
| **Liquid Clustering** on filter/join columns? | cluster `fct_transactions` on `txn_date`, `account_id`; `fct_loan_balances` on `snapshot_date` |
| **External tables** maintained? | schedule `VACUUM` + `OPTIMIZE` + `ANALYZE` — external tables get no auto-upkeep |
| Slow joins to an **outside database** (federation)? | prefer catalog federation, or copy hot data into a Databricks table. **Escalate to the perf/federation team — not a Genie fix.** |

### Diagnosis → fix
| Where the time is | Fix |
|---|---|
| High `execution_duration_ms` | optimise SQL, add filters, pre-join into views, define keys (Step 3) |
| High `waiting_at_capacity_duration_ms` | auto mode / bigger / dedicated warehouse |
| High `waiting_for_compute_duration_ms` | keep the warehouse warm / serverless |
| Big gap **before** `EXECUTING_QUERY`, small SQL | **thinking dominates** — trim context, fewer tables, newer model; escalate to the latency team with the evidence |

### Business example — the MFG "Genie is too slow" complaint
```
Complaint: branch managers say it takes 40 seconds.

Measurement:
  execution_duration_ms                 4,100 ms   ← the SQL is fine
  gap before EXECUTING_QUERY           31,000 ms   ← thinking dominates
  poll-loop overhead (own code)         3,200 ms   ← self-inflicted
Verdict: a thinking problem, plus 3 seconds we added ourselves.

What the agent actually looked like:
  22 objects, including fct_transactions_raw (380 columns) and fct_txn_legacy
  9,400 characters of prose instructions  ← over the ~5–7k warning threshold
  no join specs declared

Fixes applied:
  → 22 objects down to 7 (Module 7)
  → 380-column raw table replaced with a slim view
  → 6,000 chars of prose converted to 4 SQL expressions + 3 example queries
  → poll interval fixed at 2 s with a proper backoff
Result: ~14 seconds total.

The warehouse was never the problem — and the platform team had already
doubled it. Twice. For nothing.
```
**Teaching line:** *"Doubling the warehouse when the thinking is slow is like buying a faster car to fix a traffic jam."*

### Lab 13 (40 min) — GRADED
Given the deliberately slow MFG agent on the Large tier: measure both halves using `system.query.history` and the Conversation API, produce a written diagnosis, apply **at least three fixes at the correct layer**, re-measure, and report before/after with evidence. **Grading rewards a correct diagnosis over a large speedup** — a learner who correctly identifies a thinking-bound problem and improves it 20% scores higher than one who doubles the warehouse and gets lucky.

### Common mistakes
- Scaling the warehouse for a thinking-bound problem.
- Timing Genie from system-table timestamps.
- Blaming Genie for latency your own poll loop added.
- Treating the 90-second SQL limit as a configuration knob.
- Tuning before measuring.

**Docs:** query history · MLflow Tracing · SQL warehouses · Predictive Optimization · Liquid Clustering · OPTIMIZE · `/genie/best-practices`

---

## Module 14 — Errors, Known Issues, and Escalation
**Level:** Advanced · **Duration:** 60 min

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

---

## Module 15 — Cost, Budgets, and Scaling to Many Domains
**Level:** Advanced · **Duration:** 60 min · **Audience:** authors + platform owners

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

---

### LEVEL 5 — ADVANCED / EXTEND

---

## Module 16 — Extend Genie: API, Embedding, Multi-Agent, CI/CD
**Level:** Advanced · **Duration:** 90 min · **Audience:** authors + developers

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

---

## Module 17 — Capstone: Ship a Business-Ready Genie Agent
**Level:** Advanced · **Duration:** 4–6 hours (or a 1-week project)

### The brief
Learners pick a domain — their own real one if available, otherwise a provided financial-services profile (retail bank, commercial lender, insurer, asset manager, payments processor) — and deliver an agent a business team could use on Monday.

### Deliverables
1. **Charter (1 page)** — audience, top 15 questions, business sponsor, owner, success metric
2. **Business glossary** — ≥ 8 terms using the Module 5 template, each with a named owner and an implementation route
3. **Data design** — ≤ 8 objects with justification, pre-join view SQL, hidden columns, PII handling, and either a metric view or a documented reason not to use one
4. **Knowledge store** — ≥ 8 synonym sets, entity matching on ≥ 4 categorical columns, all join relationships with cardinality, ≥ 6 SQL expressions (filters, measures, fields)
5. **Instructions** — ≥ 10 example queries (≥ 3 parameterised), ≥ 1 UC function as a trusted asset, ≥ 4 text instruction blocks including one four-part clarification rule, plus a budget table (used / 100 and / 200, and total instruction characters)
6. **Benchmark set** — ≥ 25 questions with ground-truth SQL across the three tiers, with a run score before and after tuning
7. **Performance baseline** — measured thinking vs query split, with one applied fix and its measured effect
8. **Governance plan** — sharing levels by group, row filters and column masks for PII, certification and deprecation decisions
9. **Operations plan** — triage cadence, owners, weekly digest routing, budget thresholds, escalation path with the evidence checklist
10. **Business readout (5 slides)** — the problem, a live demo of 3 questions, the accuracy number, the latency number, what it saves, and **what it cannot do**

### Rubric (100 points)
| Criterion | Pts | What earns full marks |
|---|---|---|
| Scope & purpose | 8 | one audience, one topic, lean object set, clear justification |
| Definitions & glossary | 10 | contested terms resolved with named owners, not deferred |
| Data preparation | 12 | pre-joins, verified descriptions, noise hidden, PII handled at the UC layer, metric-view decision reasoned |
| Knowledge store depth | 18 | synonyms match real user vocabulary; **all** joins declared with correct cardinality; metrics as expressions, not prose |
| Instructions quality | 12 | examples titled in users' words; parameters typed and commented; specific, non-conflicting, budgeted, under the char ceiling |
| Measured accuracy | 18 | real benchmark run, honest before/after, Tier-1 at 100%, failures triaged not hidden |
| Performance & operations | 12 | thinking-vs-query measured before tuning; correct fix layer; real cadence, owners, budget, escalation path |
| Business communication | 10 | a non-technical sponsor understands the value **and the limits** in 5 minutes |

### Pass bar
≥ 70 points, **and** Tier-1 smoke tests at 100%, **and** the readout explicitly states what the agent should *not* be asked *and* that consistency is guidance rather than guarantee above the Unity Catalog layer. (Stating limits is a graded requirement — it is what makes an agent trustworthy in production.)

---

## Part B — Course Assets to Produce

| Asset | Count | Notes |
|---|---|---|
| **Meridian dataset: DDL + seed notebook** | 1 | **build this first — everything depends on it.** Small (20M) and Large (900M) tiers; nine planted flaws; 12-statement validation script |
| **Synthetic document set for the volume** | 40 PDFs | credit committee memos, branch notes, complaint letters |
| **Governance objects** | 1 set | one row filter, four column masks, three personas |
| Reference agent (fully curated, 7 objects) | 1 | the instructors' answer key |
| Broken agent (uncurated, 22 objects, 9,400-char prose) | 1 | Lab 4 diagnosis, Module 7 demo, **Module 13 latency lab** |
| Concept videos | 18 | 6–10 min each, business language per §A.5 |
| Guided demo recordings | 18 | all on the Meridian dataset |
| Lab guides + solution keys | 17 (Lab 0–16) | graded: Labs 2, 6, 7, 8, 9, 10, 11, 13, 16, plus the capstone |
| Knowledge checks | 17 | 4–6 questions each, auto-graded (Modules 0–16) |
| **Cheat sheet: limits & what happens at the limit** | 1 | 30 objects · 100 instructions (~5–7k char warning) · 200 snippets · 500 benchmarks · 120 cols × 1,024 values · **90 s SQL** · **~597 s backend** · **200 req/sec** · ~1,000+ ontology snippets |
| **Cheat sheet: fix-routing table** | 1 | Module 12's symptom → right-layer table |
| **Cheat sheet: error signatures + evidence checklist** | 1 | Module 14 — the laminated card; message ID first |
| **Cheat sheet: latency triage flow** | 1 | Module 13 — thinking vs query, with the `system.query.history` columns |
| Cheat sheet: question quality ladder | 1 | Module 2 — distribute to all business consumers |
| Glossary template | 1 | Module 5 |
| Health-check checklist | 1 | a one-page audit an author runs monthly, folding Modules 7–14 into ~30 checkboxes |
| Capstone brief + rubric | 1 | |
| Instructor guide | 1 | timing, common learner errors, discussion prompts |

### Build order
1. **Module 0 dataset + the two reference agents** — hard dependency for everything else
2. Modules 1–3 (Track 1 ships independently and early)
3. Modules 5, 7–10 (the core author value; longest to build)
4. Modules 4, 6, 11, 12
5. Modules 13, 14 (need the Large data tier and scripted error scenarios)
6. Modules 15, 16, capstone

---

## Part C — Currency and Maintenance

Genie ships fast and the docs were reorganised recently (Spaces → Agents; the Genie One / Agents / Code split). Build the course to survive that:

- **Quote every limit from the single cheat-sheet asset**, never inline in a video script. Limits change; re-recording video is expensive. This applies especially to the operational limits (90 s, ~597 s, 200 req/sec, character ceilings) which are the most likely to move.
- **Never put pricing numbers in a video.** Keep billing details in Module 15's handout with a "verify at `docs.databricks.com/aws/en/genie/budgets`" line. The free-usage window (through Jan 31, 2027) expires during this course's life.
- **Treat the error-signature table as perishable.** Several entries are active bugs, not permanent behaviour. Keep it in a handout with a review date, and re-check each entry quarterly.
- **Review against the AI/BI and Genie release notes quarterly.**
- **Screenshots will drift.** Prefer short screen recordings of *flows* over annotated stills; keep a screenshot inventory for refresh sprints.
- **Flag regional dependencies** (Agent mode availability, cross-Geo processing) as "check your workspace" rather than a fixed answer.
- **Re-verify the latency baseline annually.** There is an active Databricks latency workstream; the ~20 s thinking figure is a current observation, not a specification. Teach the *method* (measure both halves) so the module survives the numbers changing.

---

## Part D — Coverage map: *Genie Performance & Issues Playbook* → this course

| Playbook section | Course coverage |
|---|---|
| Start here — Genie Code / Genie Workbench | Module 1 (named + course rule), Modules 7–14 (used in every lab) |
| Foundation — metric views | Modules 7, 15 |
| Foundation — knowledge store, ~200 snippets | Module 9 |
| Foundation — example values / value dictionaries | Module 9 (entity matching; `'CA'` vs `'California'`) |
| Foundation — plain-English UC comments | Module 7 |
| Foundation — keys / joins defined | Module 9 (cardinality + the fan-out trap) |
| Foundation — certify / deprecate | Modules 6, 7, 12 |
| Clean & focused — ≤ 30 tables, ideally ≤ 5 | Module 7 |
| Clean & focused — instructions short, non-conflicting | Module 10 |
| Clean & focused — example queries, no duplicates | Module 10 |
| Clean & focused — benchmarks | Module 11 |
| Clean & focused — delete unused spaces | Modules 12, 15 (portfolio hygiene) |
| Limits table | Module 13 + the limits cheat sheet |
| §1 Speed — measure first, thinking vs query | Module 13 |
| §1 Step 2 — thinking-side fixes | Module 13 |
| §1 Step 3 — warehouse & table fixes (PO, Liquid Clustering, OPTIMIZE, federation) | Module 13 |
| §2 Wrong answers | Modules 4, 9, 12 (fix-routing table) |
| §2 Unsupported causal claims | Modules 2, 12 |
| §3 Inconsistency — variation by design | Modules 4, 11, 14 |
| §3 Guidance vs guarantee (UC is the only guarantee) | Modules 4, 6, 14, capstone pass bar |
| §3 Agent mode drops a filter | Modules 12, 14 |
| §4 Errors & unexplained behaviour | Module 14 |
| §4 Capture the message ID | Module 14 (evidence checklist) |
| Appendix A — measuring latency, `system.query.history` | Module 13 |
| Appendix A — MLflow tracing | Modules 13, 16 |
| Appendix A — traps (timestamps, poll-loop overhead, no sub-steps) | Modules 13, 16 |
| Appendix B — Genie directly vs supervisor | Module 16.4 |
| Appendix B — supervisor non-negotiables (timeout, capacity, identity) | Module 16.4 |

**Not covered on purpose:** specific internal ticket IDs and named internal teams — these belong in a living internal runbook, not in LMS content with a 12-month shelf life. Module 14 teaches learners to *file with evidence*; the routing table stays with support.

---

## Part E — Sources

Databricks docs (`docs.databricks.com`, AWS paths; GCP/Azure equivalents exist):

| Topic | Path |
|---|---|
| Genie family overview | `/aws/en/genie/` |
| Genie One | `/aws/en/genie-one/`, `/aws/en/genie-one/chat` |
| Genie Agents overview | `/aws/en/genie-agents/` |
| Genie Agents concepts | `/aws/en/genie-agents/concepts` |
| Create and manage an agent | `/aws/en/genie-agents/set-up` |
| Tune agent quality | `/aws/en/genie-agents/tune-quality` |
| Test and monitor an agent | `/aws/en/genie-agents/monitor` |
| Curate an effective agent (best practices) | `/aws/en/genie/best-practices` |
| Business user guide | `/aws/en/genie-agents/talk-to-genie` |
| Agent mode | `/aws/en/genie/agent-mode` |
| Genie Agents API | `/aws/en/genie-agents/conversation-api` |
| Budgets and cost controls | `/aws/en/genie/budgets` |
| Genie Code | `/aws/en/genie-code/` |
| Metric views | `/aws/en/metric-views/` |
| Supervisor Agent (multi-agent) | `/aws/en/generative-ai/agent-bricks/multi-agent-supervisor` |
| Knowledge Assistant | `/aws/en/generative-ai/agent-bricks/knowledge-assistant` |
| Release notes | `/aws/en/ai-bi/release-notes/` |

Internal: *Genie Performance & Issues Playbook & Health Check* — source for Modules 13 and 14, the limits table, and the supervisor stance in 16.4.

---

## Part F — Dataset design (instructor reference)

> **This page contains the answers.** It catalogues what is wrong with the Meridian dataset
> and which module each problem serves. Module 0 deliberately does not mention any of it, and
> Lab 0 asks learners to notice things for themselves. If you are taking the course rather
> than teaching it, stop here and come back after Module 4.

Measured on a live warehouse rather than estimated: revenue overstated by **3.6%**, the loan
book summing to **$6.0T against a real $7.9B** (757×), and delinquency reading **7.9% at 30+
DPD against 1.9% at 90+** — a 4.2× spread between two defensible answers.

### F.1 The nine planted flaws

| # | Planted flaw | What breaks without a fix | Taught in |
|---|---|---|---|
| **1** | `fct_transactions.fee_revenue` is **gross**; net requires subtracting `fct_reversals` | revenue is overstated by **3.6%** — measured, not estimated — and nobody notices | 7, 9, 11 |
| **2** | Fiscal year starts **Oct 1** (FY2026 = 2025-10-01 → 2026-09-30) | "last year" silently means calendar year | 5, 10, 11 |
| **3** | `dim_branch.region` ∈ `NE, SE, MW, WEST`; `state` ∈ `CA, NY, TX…` — users say "Northeast", "West Coast", "California" | confident **zero rows**, or a silently dropped filter | 9, 12 |
| **4** | `fct_transactions.status` ∈ `POSTED, PENDING, DECLINED, REVERSED` — only `POSTED` is revenue, but `DECLINED` inflates *counts* | 88% posted, **6% declined**: revenue and volume both wrong, in opposite directions | 7, 9, 11 |
| **5** | `dim_product` carries **two hierarchies**: `product_category` (business) vs `regulatory_product_class` (Basel reporting) | rollups mix reporting frames; two answers to one question | 7, 9 |
| **6** | `fct_loan_balances` is a **daily snapshot** — summing it returns **$6.0T against a real book of $7.9B**, 757× | **a plausible wrong number.** The scariest failure in the course | 9, 11, 12 |
| **7** | "Delinquent" / "seriously delinquent" / "default" / "charge-off" are four different things business users use interchangeably | **7.9% at 30+ DPD against 1.9% at 90+** — a 4.2× spread, both defensible | 9, 10, 11 |
| **8** | `dim_customer` holds real **PII**: `ssn_last4`, `email`, `dob`, `annual_income` | a governance incident, not a data-quality one | 6, 17 |
| **9** | Commercial transactions in **CAD/GBP** need `dim_fx_rate` joined *as of the transaction date* | currency mixing; totals that don't tie to finance | 9, 10 |

Two more flaws are added to the *agent*, not the data, in Module 8: a bloated 22-object agent and 9,000 characters of prose instructions — the raw material for Module 13's latency lab.

### F.2 Use-case coverage matrix

| Course topic | Module | Data that makes it demonstrable |
|---|---|---|
| Good vs bad questions | 2 | wide question surface across 5 fact tables |
| Chat vs Agent mode | 3 | `fct_loan_balances` + `fct_fraud_cases` + `genie_agent.mfg_ref_documents` volume |
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
