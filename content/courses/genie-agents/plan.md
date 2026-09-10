# Databricks Genie Agents — LMS Course Plan
**From Basics to Advanced · Asset Management · Business-First, Example-Driven**

> Version 3.0 · Planned 2026-08-21
> Grounded in current `docs.databricks.com` (Genie section), plus operating figures observed in
> practice where Databricks publishes none. The two are labelled separately throughout, because
> quoting the second sort as documented is how a client stops trusting the first.
> Domain: **asset and wealth management** — AUM and AUA, net flows, investment performance,
> distribution channels, and the client and advisor relationships behind them.
> Terminology note: what used to be called **Genie Spaces** is now **Genie Agents**. Use the new naming throughout; mention the old name once (Module 1) so learners recognise older screenshots and blog posts.

---

## Part A — Course Design

**Summary:** How the course is put together: three tracks cut from one build, and which modules each audience takes.

### A.1 The one-sentence promise
*"By the end of this course you can build a Genie Agent your business team actually trusts — you can prove it's right, you can explain why it's slow, and you know which problems aren't yours to fix."*

### A.2 Who this course is for

| Persona | What they need | Modules |
|---|---|---|
| **Business consumer** (regional sales lead, portfolio manager, product owner) | Ask questions, read answers, know when to trust them | 1–3 (the feedback loop is taught in 2) |
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

### A.5 Module shape — the pattern every module follows

Module 9 is the reference implementation. Modules written before it read like reference cards:
learning outcomes in jargon, then a table of limits, before a reader knew what the thing was or why
they would want it. That is documentation for someone who already knows.

Every module now follows this order.

**1. Open with a failure, not an agenda.** A named person asks a real question and gets a wrong
answer. Show the answer, show the SQL that produced it, show what was actually in the column. Ana
Reyes asking for her California advisors and getting *No results found* does more work in six lines
than any list of outcomes.

**2. Explain why it happened, in plain language.** Not "entity matching was not configured" —
*"the agent had the column's name and had to guess at its values, and guessing 'California' for a
column called state is a reasonable guess. It is just wrong here."*

**3. Introduce each capability as the answer to a specific failure.** Never as an item in a feature
list. If you cannot name the failure a feature prevents, the feature does not belong in the module.

**4. Say where the thing lives, and what follows from that.** This is the single most common gap for
a reader new to Databricks. Agent-scoped or catalog-scoped? Does a second agent inherit it? Does it
overwrite Unity Catalog? Give the consequence, not just the fact.

**5. Put the reference table at the end**, once the words in it mean something. Limits, budgets and
option lists are for looking up later, not for reading first.

**6. Close with what would have gone wrong** without the module.

**Calibration.** The reader writes SQL competently and has probably never opened Databricks. Do not
explain joins, `GROUP BY` or `CASE WHEN`. Do explain Unity Catalog scoping, what a Genie Agent is as
an object, metric views, volumes, warehouses, trusted assets, and every piece of Genie-specific
vocabulary. The rule of thumb: assume they can read the SQL and cannot place the Databricks concept.

### A.6 Lab shape — the pattern every lab follows

**Numbered actions, not outcomes.** "Put each synonym where the thing it names actually lives" is
meaningless to someone who has not seen the Configure tab. Write the click path:

> 1. Click **Configure**, then **Sources**.
> 2. Click the table name **`dim_advisor`**.
> 3. Click the **pencil icon** next to the column **`region`**.
> 4. In the **Synonyms** field, type: …
> 5. **Save.**

**Do one slowly, then repeat against a table.** Teach the path once with a worked example, then give
the remaining rows as data. This is shorter *and* clearer than describing all five.

**Every step ends with a check.** A question to ask the agent and the answer that means it worked —
ideally the question the module opened with, so the loop closes.

**Ship what the lab references.** A step saying "the nine questions from Lab 4" must give the one
line that prints them. Never send a learner hunting for material.

**Never ask for an argument the lab does not use.** An agent-graded lab does not need a schema.

**Say when partial failure is correct.** If four of nine questions should still fail after the lab,
say so and say why — otherwise the diligent learner keeps going and writes prose to patch a data
problem.

### A.7 Teaching language rules (enforce in every script)
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
**Level:** Setup · **Duration:** 45 min · **Audience:** Agent Author and Platform tracks

**Summary:** Provision the course dataset in your own workspace, then read it closely enough to find the places where one question has more than one honest answer.

**Deliverable:** a working lab environment for every other module.

> **Why this is a module and not an appendix.** Every later module works on this data.
> Provisioning it yourself, and actually looking at it, is what makes the rest of the course
> concrete rather than theoretical.

### Learning outcomes
1. Provision the course dataset in Unity Catalog.
2. Describe what Meridian's business does and which tables record it.
3. Read the data closely enough to notice where a question could have more than one honest answer.

### 0.0 Two sizes, and which one you need

The dataset ships in two tiers, and picking the wrong one costs you either accuracy or an hour.

| Tier | Flow events | Build time | Use it for |
|---|---|---|---|
| **`small`** (default) | 20M | under a minute on a warm serverless warehouse | **everything except Module 13** |
| **`large`** | 900M | tens of minutes, and it is real compute | **Module 13 only** — you cannot measure latency on a toy dataset |

```python
academy.install('genie-agents')                              # small
academy.install('genie-agents', tier='large', schema='large_tier')
```

Build the large tier into **its own schema**, as above. It is not a replacement for the small one —
every other module wants the small dataset, and regenerating it later to get back is an hour you
did not need to spend. Module 13 then points an agent at the large schema:

```python
academy.create_agents('genie-agents', schema='large_tier')
```

Do this the day before Module 13, not during it. Only `03_facts` scales with the tier; the
dimensions are identical either way.

### 0.9 Putting it away afterwards

The course installs a schema, twenty-odd objects, a volume of forty documents, two Genie Agents
and nine notebooks. When the cohort is done, take it back:

```python
academy.cleanup('genie-agents')                # show what would go
academy.cleanup('genie-agents', confirm=True)  # remove it
```

Notebook **`100_cleanup`** does the same, with the destructive line commented out so that running
every cell top to bottom cannot delete a lab someone is still using.

It is a dry run until you confirm, and it removes **only what the course created**. Agents are
matched against the titles the package gives them, so one you renamed or built yourself in Lab 8 is
reported and left alone — as is anything else that ended up in the lab schema. You are told what was
kept and why.

If you installed with arguments, pass the same ones back or nothing is found:

```python
academy.cleanup('genie-agents', catalog='training', confirm=True)
academy.cleanup('genie-agents', schema='large_tier', title_suffix='(large tier)', confirm=True)
```

> **Instructors: do this between cohorts, not just at the end.** The dataset is deterministic, so a
> stale install looks identical to a fresh one right up until someone's Lab 7 answer is graded
> against views a previous learner left behind.

### 0.1 The company: Meridian Financial Group (MFG)

A mid-size US investment manager, close to **$100B** under management across **4,500 portfolios**
and **180 fund share classes**. It sells through four channels:

| Channel | What it is |
|---|---|
| **Intermediary** | advisor-sold funds |
| **Institutional** | mandates and sub-advisory |
| **Retirement** | defined contribution plans |
| **Private Client** | high-net-worth |

Behind those sit 2.1M clients, 3,400 advisor relationships, and portfolios reporting in EUR, GBP
and JPY as well as USD.

Asset management suits this course because it forces every hard lesson naturally. The headline
metric has more than one honest definition, and so does performance. Money moving between your
own products isn't a sale. The reporting date isn't the last day of the month. And the business
is regulated, so who can see which client is not a detail.

### 0.2 Getting a workspace

You need a Databricks workspace with Unity Catalog and a SQL warehouse. If your firm has given
you one, use it and skip to §0.3.

Otherwise **Databricks Free Edition** is enough for this course. Sign up at
`databricks.com/learn/free-edition` with an email address. There is no credit card and no cloud
account to connect, because Databricks hosts the compute. **The video at the end of this module
walks through the signup and the install end to end.**

Three things about Free Edition matter later:

- **The current catalog is `workspace`**, so the lab lands in `workspace.genie_agent` with nothing
  to configure.
- **Compute is serverless**, so there is no cluster to start. Your first statement takes a few
  seconds longer while it warms up.
- **You are the only user.** Unity Catalog's row filters and column masks key off account groups,
  and with none created you belong to none of them, so you see the most restricted view. That is
  not a broken install, and Module 6 explains why it is worth seeing.

Once you can run `SELECT current_catalog()`, you are ready.

### 0.3 Provisioning: one pip install

The lab is installed by a package rather than assembled by hand. In a Databricks notebook:

```python
%pip install databricks360
dbutils.library.restartPython()
```

Then in a **new cell**, because `restartPython()` clears everything and the import cannot share a
cell with the install:

```python
import databricks360 as academy

academy.install('genie-agents')
```

That writes the notebooks into your workspace and prints where everything will land:

```
Installed 'genie-agents' → /Workspace/Users/you@company.com/databricks360/genie-agents
  tier: small
  single schema: current_catalog().genie_agent    table prefix: mfg_<group>_
  e.g. genie_agent.mfg_core_dim_date

  Run these — the dataset is not usable without them:
    1. 01_catalog_and_schemas
    2. 02_dimensions
    3. 03_facts
    99. 99_validate
```

Run those four in order. On Free Edition they take about two and a half minutes in total, most of
it in `02_dimensions`, which builds 2.9M accounts and 2.1M clients.

Because the install runs *inside* a notebook it authenticates as you, so there is no host, token
or CLI profile to configure. It does not run the notebooks for you.

`install()` also lists a few further notebooks. Ignore them for now; the modules that need them
introduce them.

#### Where it lands, and how to change it

By default the lab creates **no catalog**. It lands in whatever `SELECT current_catalog()`
returns, in a schema called `genie_agent`, with tables prefixed by group. That default exists
because most regulated workspaces do not grant `CREATE CATALOG`, and a lab that assumes otherwise
fails on its first statement.

```python
academy.install(
    'genie-agents',
    path='/Workspace/Shared/labs',   # default: your home folder
    catalog='training_v2',           # default: current_catalog()
    schema='my_sandbox',             # default: genie_agent
    overwrite=True,                  # replace notebooks from a previous install
)
```

The schema and the prefix are a pair. Override neither and you get
`genie_agent.mfg_core_dim_date`; name a schema of your own and the prefix drops away, giving
`my_sandbox.dim_date`.

#### What you should see

Open **Catalog** in the sidebar after `03_facts` finishes and expand `workspace` → `genie_agent`.
You should have **12 tables** and **one volume**: nine dimensions, three facts, and
`mfg_ref_documents`, which is empty.

Fewer than 12 means a notebook stopped early. Read the failing cell rather than starting again
from 01, because each notebook is idempotent and will happily rebuild what already worked.

#### Confirming the install

`99_validate` runs fourteen checks over the finished dataset. Every row should read **PASS**.

| Check | Result | Detail |
|---|---|---|
| fiscal calendar | 730 days, 2 fiscal years | first day 2024-10-01 |
| reporting dates | 24 reporting dates, 24 month ends | last business day, not last calendar day |
| asset class hierarchies | 5 investment, 3 regulatory | the two do not align |
| advisor region codes | 4 regions, 16 states | 4 channels |
| discretionary split | 72.0% discretionary, 28.0% advisory only | AUM and AUA differ by this |
| aum snapshot grain | **682× if summed**, real book $98.5B | summed $67.2T |
| held away assets | 20.2% of rows, 5.3% of managed value | the gap between AUM and AUA |
| flow types and status | 6 flow types, 24.0% exchanges | 7.0% not settled |
| return definitions | 2.99% gross, 2.44% net, 2.99% money weighted | three answers, same period |
| client identifiers | 2.1M clients, 10,000 distinct `ssn_last4` | masking has something to protect |
| multi-currency | 4 currencies | conversion needs an as-of-date join |
| referential integrity | 0 orphan snapshots | every snapshot reaches an account |
| determinism | 1 value for `PF000001` | identical for every learner |
| row counts | 20.0M flows, 35.0M snapshots, 2.1M clients | |

It prints numbers as well as verdicts, and the numbers are the point. Three are worth sitting
with:

- **682× if summed.** The AUM table is a daily snapshot, so adding it up across dates turns a
  $98.5B book into $67.2T. Nothing errors. You simply get a confident, catastrophic number.
- **72% discretionary, 28% advisory only.** Whether the advisory portfolios belong in "AUM"
  changes the headline by more than a quarter, and reasonable people answer that differently.
- **2.99% gross against 2.44% net.** Both are the firm's return for the same period.

You will meet all three again.

### 0.4 Schema: one schema, `genie_agent`

Now that the tables exist, here is what each one is for. Twelve tables and one volume, all in a
single schema.

| Object | Grain | What it powers |
|---|---|---|
| `mfg_core_fct_aum_snapshot` | **account × day** | AUM, allocation, growth |
| `mfg_core_fct_flows` | one money movement | sales, redemptions, net flows |
| `mfg_core_fct_performance` | portfolio × date × period | returns against benchmark |
| `mfg_core_dim_portfolio` | portfolio / mandate | discretionary vs advisory, strategy |
| `mfg_core_dim_fund` | fund share class | pooled vehicles, fees |
| `mfg_core_dim_asset_class` | asset class | allocation |
| `mfg_core_dim_benchmark` | benchmark | benchmark-relative reporting |
| `mfg_core_dim_client` | client | segmentation, and the PII |
| `mfg_core_dim_account` | account | the join hub |
| `mfg_core_dim_advisor` | advisor relationship | channel and region rollups |
| `mfg_core_dim_date` | day | fiscal vs calendar, reporting dates |
| `mfg_core_dim_fx_rate` | currency × day | multi-currency conversion |
| `mfg_ref_documents` *(volume)* | files | Agent mode over unstructured files |

Two things to notice as you browse them.

An account holds **either** a separately managed portfolio **or** a pooled fund, never both, so
`portfolio_id` and `fund_id` are each null about two-thirds of the time. That is normal here.

The volume is empty. It holds a document pack the course supplies later, and nothing you do today
depends on it.

**Why the data is deterministic.** Every value derives from `hash()` of the row key rather than
`rand()`, and ages anchor to a fixed date rather than `current_date`. So your data is
byte-identical to every other learner's, which is what lets a benchmark's ground-truth SQL return
the same answer for everyone. Random seeding would silently invalidate an entire benchmark set,
and you would only notice when the scores stopped making sense.

### Lab 0 (60 min)

1. Install the package and run `01`, `02`, `03` and `99` in order.
2. Check that all fourteen validate rows read PASS.
3. Now **read the data for twenty minutes.** Open each table, look at the column comments, and run
   whatever occurs to you. Then write down:
   - three questions a business user might ask that this data could answer **two different ways**,
     and why
   - any column whose meaning you had to guess
   - the total value of assets Meridian manages, and how you decided which number that was

Keep the sheet. You return to it in Module 4, and the gap between what you noticed now and what
you know then is the most useful thing you produce today.

> Step 3 is the module. Steps 1 and 2 are typing.

**Graded by machine.** `academy.check_lab('genie-agents', 0, schema='<your schema>')` runs 8 checks against your work.
### Watch the setup end to end

```video
title: Set up Databricks Free Edition and install the Meridian dataset
duration: to be confirmed
src: tbd
```

## Module 1 — What Is Genie, and Which Genie Do You Need?
**Level:** Beginner · **Duration:** 45 min · **Audience:** everyone

**Summary:** The three Genie experiences, who each one is for, and why an agent has to understand your business rather than merely read it.

### A question in a Monday meeting

It's the first Monday after quarter-end at Meridian Financial Group. The Head of Wealth is
looking at a slide that doesn't quite match what she remembers, and she asks the obvious
question:

> *"What was our Wealth AUM at the end of last quarter?"*

Somebody says they'll find out. In most organisations that's where the interesting part stops,
because the answer arrives on Thursday in a spreadsheet, by which point the meeting has moved on.

It's worth noticing what she would have asked next, if the answer had arrived in ten seconds:

> *"How did that compare with the previous quarter?"*
>
> *"What drove the change?"*
>
> *"Which portfolios contributed the most?"*
>
> *"Break that down by asset class."*
>
> *"Show me the trend over the last twelve months."*

Those aren't five separate requests. They're one train of thought, and each question only exists
because the previous one was answered. The insight worth having, the one that actually changes a
decision, usually turns up around the fourth.

A three-day turnaround doesn't slow that sequence down so much as prevent it, because nobody
files five follow-up requests over a fortnight.

### Two mental models

Consider how the answer usually travels, alongside how it travels with Genie:

```flow numbered
Traditional analytics
Question → Analyst → SQL → Dashboard → Answer

Genie
Question → Answer → Follow-up → Deeper insight → ↻
```

In the first, every arrow is a handoff, and each handoff costs time and loses a little of the
original intent. That works well for questions you knew in advance you'd need to ask, which is
what dashboards are for, and badly for the fourth follow-up nobody anticipated.

The second has fewer steps, and more importantly it forms a loop. The benefit isn't that the
first answer arrives faster. It's that the second, third and fourth questions get asked at all.

This is what people mean when they talk about having a conversation with your data. The point
isn't a friendly tone; it's a feedback loop short enough that curiosity survives it.

### "Genie" is not one thing

Most of the early confusion about Genie comes from treating it as a single product. It's a family
of experiences aimed at different people doing different work, and the quickest way to tell them
apart is by the sentence each person would say.

---

### 1. Genie One: *"I have a question about my data."*

This is where the Head of Wealth works. She isn't choosing tables or thinking about joins. She
opens one place, asks in plain language, and follows her own line of enquiry:

- *"What is our current Wealth AUM?"*
- *"Which portfolios had the largest AUM growth?"*
- *"What percentage of AUM is in equities?"*
- *"How did AUM change from last quarter?"*

Dashboards and applications appear in the same place, so she doesn't need to know what kind of
object will answer her question before she asks it.

Mental model: **Ask → Explore → Understand**

Nobody builds Genie One. It's the front door.

---

### 2. Genie Agents: *"I want Genie to understand my business."*

This is where the data team works, and it's what most of this course covers.

A **Genie Agent** is a focused, governed conversational experience built around one business
domain. Someone on the Wealth analytics team decides that this agent will answer questions about
AUM, portfolios, flows and performance, and nothing else.

The part that surprises people is that building one is mostly not about connecting tables. Point
an agent at Meridian's warehouse and it can already read every column. What it can't do is know
any of the following:

- what AUM means here, and which of the three definitions in circulation is the authoritative one
- what "quarter-end" means, given that Meridian's fiscal year doesn't start in January
- which portfolios belong in the number: discretionary only, or advisory too, and what happens to
  closed accounts and held-away assets
- how asset classes are defined, and which hierarchy to use when there are two of them
- how a change in AUM is calculated, whether from market movement, net flows, or both
- which source is trusted when two tables both appear to hold the answer

None of that is recorded in the data. It's held in people's heads. Building an agent is largely
the work of moving it out of their heads into a form the agent can use.

Mental model: **Curate → Teach → Govern → Ask**

---

### 3. Genie Code: *"Help me build with data."*

This is where engineers and analysts who write SQL work. It sits in the workspace alongside the
work itself:

- *"Write SQL to calculate quarter-end AUM by portfolio."*
- *"Why is this query producing duplicate portfolios?"*
- *"Optimise this Spark transformation."*
- *"Explain what this SQL is doing."*

It's also where you'll do the hands-on tuning later in this course, looking at what an agent did
with a question and correcting it in place. The **Genie Workbench** is the other surface for that
same work.

Mental model: **Build → Code → Analyze → Develop**

---

### Which one do you need?

| What you're trying to do | Where you go |
|---|---|
| Get an answer to a business question | **Genie One** |
| Build a trusted conversational experience over your domain | **Genie Agent** |
| Write, debug or explain code | **Genie Code** |

That's the whole map. The row worth remembering is the middle one, because building a Genie Agent
is an activity rather than a place you visit, and doing it well is what this course is for.

> A naming note, so older material makes sense: Genie Agents were previously called **Genie
> Spaces**. The product is the same one, renamed. You'll see the old term in blog posts and
> screenshots.

### Genie is not magic

Take the original question seriously for a moment:

> *"What was Meridian's Wealth AUM at the end of Q2?"*

To a person that's one question. To anything trying to answer it, it's six:

| The question sounds like | But first you must answer |
|---|---|
| "Wealth" | Which lines of business count? Does Private Client sit inside Wealth or beside it? |
| "AUM" | Assets under management, advisement, or administration? Do held-away assets count? |
| "at the end of" | The last calendar day, the last business day, or the last reporting date? |
| "Q2" | Fiscal or calendar? Meridian's fiscal year doesn't start in January. |
| implied: which portfolios | Discretionary only? Closed accounts? Accounts funded mid-quarter? |
| implied: from where | Two tables look authoritative. Which one is? |

Answer those six differently and you arrive at six defensible numbers. Each one is arguably
right, and only one of them is the number the Head of Wealth had in mind.

Which leads to the principle the rest of the course rests on:

> **Genie doesn't only need access to your data. It needs to understand what your data means.**

Access is a permissions problem, and it's largely solved. Meaning is a curation problem, and it
largely isn't.

### Think of it as onboarding a new analyst

Suppose a strong analyst joins Meridian on Monday: good with SQL, comfortable with the subject
matter, and new to the firm.

You wouldn't hand her credentials to four thousand tables and ask her to work out the firm's AUM.
You'd sit down and explain:

- what the business terms mean in this firm
- which sources are trusted, and which are historical
- how the important metrics are actually calculated
- how the tables relate to one another
- the exceptions, such as the fund that's reported differently or the accounts that don't count
- the questions she'll be asked most often

You'd expect that to take a few weeks, and you wouldn't think of it as wasted time. You'd call it
onboarding.

Building a Genie Agent is the same job. You're onboarding something that reads very quickly and
knows nothing about your company. Everything you'd tell the analyst is what the agent needs, and
the things you'd forget to mention are where it will go wrong.

### A demo and a product are not the same thing

This distinction is where most Genie projects quietly fail, so it's worth stating plainly.

A demo answers the question *can Genie answer a question?* It nearly always can, on the first
attempt, and it looks impressive.

A production-quality agent answers a harder question: *can Genie consistently answer the
questions this business cares about, using trusted data and agreed definitions, and can I
demonstrate that it does?*

The distance between those two bars is measured in curation, and closing it is what the remaining
modules are about.

### Four ingredients

Everything you build rests on four things, and missing any one of them leaves you with a demo.

**AI** is the reasoning that turns a sentence into a query. You get this as part of the platform,
and it isn't where your advantage comes from.

**Data** is the tables, views and metrics themselves. Necessary, and a long way from sufficient.

**Business context** is the definitions, synonyms, rules and worked examples that tell the model
what your words mean. This is where the effort goes, and it's the part most teams underestimate
before wondering why their answers drift.

**Governance** covers who may see what, which sources are authoritative, and how you establish
that an answer is correct. In regulated industries it tends to be the reason a project is
permitted at all, rather than an afterthought.

### Where this course goes

You'll work with Meridian Financial Group throughout: a mid-size US investment manager with just
under $100B across 4,500 portfolios, sold through intermediary, institutional, retirement and
private-client channels. The course builds towards answering the sequence the Head of Wealth began with:

> *"What was Wealth AUM at the end of Q2?"*
>
> *"How did AUM change?"*
>
> *"Which asset classes drove the change?"*
>
> *"Which portfolios contributed most?"*
>
> *"How does that compare with the same period last year?"*

The goal isn't a demonstration, but something a business could reasonably depend on.

### The question to carry with you

Every module from here answers a version of the same question, and it's worth writing down
because you'll return to it constantly:

> **If I were the business user asking this, what would Genie need to know in order to answer it
> correctly?**

The word doing the work is "correctly". Producing an answer is rarely the problem. Producing the
right answer, by your definitions, from data you'd defend in a meeting, is.

The arc of the course follows the parts of that answer:

```flow numbered
Data → Context → Instructions → Relationships → Logic → Testing → Governance
```

- **Data**: choosing the few objects worth exposing, and shaping them
- **Context**: teaching the agent your vocabulary and your metrics
- **Instructions**: the rules and worked examples that pin down intent
- **Relationships**: how things join, and what happens when you get it wrong
- **Logic**: turning contested definitions into one agreed calculation
- **Testing**: proving accuracy instead of asserting it
- **Governance**: who sees what, and which numbers are official

### Lab 1 (15 min)

Twelve questions arrived in a Meridian shared inbox over one week. Your job is to work out which
tool answers each — and to notice that two of them nothing answers.

---

**Step 1 — Get the twelve questions (1 min).**

```python
import databricks360 as academy
academy.lab('genie-agents', 1)
```

That prints all twelve, exactly as they were written. Do not tidy them up in your head; the
sloppiness is part of what you are reading.

---

**Step 2 — Sort each into one of four buckets (7 min).**

Write the number and the bucket. One line each.

| Bucket | It belongs here when |
|---|---|
| **Genie One** | it is a business question over data that already exists, and someone could answer it today |
| **Genie Agent** | it needs a curated domain built first — the data exists but nobody has agreed what the words mean |
| **Genie Code** | somebody needs help writing or fixing code, not an answer about the business |
| **Not a data question** | no amount of data answers it |

Give a reason, not just a label. "Genie Agent" is not an answer; *"Genie Agent — the data is there
but 'net sales' means two different things to Distribution and Finance"* is.

Two are deliberately unfair. Number 7 — *"Which advisors are underperforming?"* — has no definition
of underperforming anywhere in the firm. Number 10 asks whether to open an office in Denver, which
is a judgement no dataset makes for you. Putting either in a tool bucket is the mistake.

---

**Step 3 — Take the hardest one apart (5 min).**

Pick the single hardest question and list **every business definition** that would have to be
settled before any tool could answer it correctly.

Number 11 is the one worth choosing: *"How much do we manage for the Hartmann family?"* It looks
trivial. Work through what has to be true first:

- What is a "family"? Meridian's data has clients and accounts. It has no household.
- Which of the three AUM definitions applies?
- As at which date, on which calendar?
- Does held-away money count as something "we manage"?

Four unsettled definitions inside one apparently simple sentence.

---

**Step 4 — Compare with a colleague (2 min).**

Swap lists. **The disagreements are the finding, not a problem with the exercise.** If two people
who know the business cannot agree what a question means, no agent will do better — and that is the
argument for Module 5.

*You know it worked when:* you can point at a question and say which of the four buckets it belongs
in **and** what would have to be settled before anyone could answer it.


**Reviewed by a person.** No automatic grade: the judgement *is* the exercise. `academy.lab('genie-agents', 1)` prints the brief, the material this lab works on, and what a reviewer looks for.
## Module 2 — Asking Questions That Actually Work
**Level:** Beginner · **Duration:** 60 min · **Audience:** business consumers, and the whole of the Business User track

**Summary:** What separates a question Genie can answer from one it can't, and how to check an answer before you act on it.
### Learning outcomes
1. Write questions Genie can answer, and spot the ones it can't.
2. Name the four things every answerable question needs.
3. Use follow-up questions in one thread instead of starting again.
4. Check an answer before you put it in front of anyone.
5. Give feedback that actually improves the agent.

### Start here: four chats, four numbers

A product manager at Meridian needed AUM for a quarterly review. She asked Genie, got a number,
and wanted it split by asset class — so she opened a new chat and asked for that. Then a new chat
for the channel split. Then a fourth for the year-on-year comparison.

Four chats, four answers, and the four did not reconcile. The asset-class figures summed to more
than the total. The channel split summed to less.

Nothing was broken. Each chat started from nothing and made its own reasonable assumptions: one
used the fiscal year, one the calendar year; one included advisory mandates, one did not. Every
answer was defensible on its own, and together they were nonsense.

She spent the afternoon reconciling four correct answers to a question she had asked four slightly
different ways — which is longer than the analyst would have taken, and is the outcome that makes
people say the tool does not work.

**This module is about asking in a way that does not produce that afternoon.** Two habits do most
of the work: name four things in the question, and stay in one thread.

### What happens when you ask

Genie does not look up a stored answer. Each time you ask, it works out which tables it needs,
writes a query, runs it, and shows you the result. You can see every step of that.

- **The Analysis panel** shows how it read your question and which tables it used.
- **Show code** reveals the query it wrote. You do not need to read it fluently to use it.
- **A thread remembers.** Follow-up questions build on what came before. A brand new chat starts
  from nothing.
- **You can keep the answer.** Charts can be edited and saved to a dashboard, and results
  download as CSV or copy to the clipboard.
- **Rating an answer changes the agent.** Mark it **Yes**, **Fix it**, or **Request review**.
  A positive rating on a good answer can prompt Genie to offer the author a reusable snippet, and
  a **Fix it** goes to the person who can correct it for everyone. It is worth the two seconds.

### The four things a good question names

Nearly every question that fails is missing one of four things. Before you send one, check that
it says:

| | | Example |
|---|---|---|
| **A measure** | the number you want | AUM, net flows, return |
| **A breakdown** | how to split the answer up | by asset class, by channel, by fund |
| **A filter** | what to leave out | discretionary only, settled only |
| **A point in time** | when | as of 30 June 2026, or FY2026 Q3 |

**Breakdown and filter are easy to mix up**, because both of them name a column. The difference
is what they do to the answer. A breakdown splits one number into several. A filter throws rows
away before the number is worked out at all.

> *"AUM by channel"* gives you four numbers, one per channel, and they add back up to the total.
>
> *"AUM for the intermediary channel"* gives you one number, and it is smaller than the total.

The same column can do either job, and often you want both at once. *"AUM by asset class,
intermediary only"* splits the answer by asset class and discards three of the four channels.

The point in time causes the most trouble, because two kinds of number need two kinds of time.

**AUM is a balance.** It is a value at one moment, so it needs a single date. **Net flows and
returns build up over a period**, so they need a range.

This matters more than it sounds. Ask for "AUM in June" and Genie may add up all thirty daily
values and hand you a number thirty times too big, with no error and no warning. Ask for "AUM as
of 30 June" and there is nothing to add up.

### The question quality ladder

| ❌ Genie will struggle | ✅ Ask instead | Why |
|---|---|---|
| "Why did AUM fall last quarter?" | "What was total AUM by asset class at each month-end for the last eight months?" | Genie can fetch numbers and do the maths. It cannot tell you why something happened. Get the shape of the change, then form your own view. |
| "Which funds should we close?" | "Which funds had net outflows in each of the last four quarters, and what is their AUM now?" | Genie does not make recommendations. Ask for the evidence and decide yourself. |
| "Tell me about the Northeast, and compare advisors, and what about outflows" | three separate questions in one thread | Ask one thing at a time. Genie answers the last thing it understood, not all three. |
| "Show me our best funds" | "Show the ten funds with the largest net flows in FY2026 Q3" | "Best" could mean biggest, fastest growing, or best performing. Say which, over what period, and how many you want. |
| "What's our AUM?" | "What was discretionary AUM, excluding held-away assets, as of 30 June 2026?" | Meridian has three honest answers to "what is our AUM". Say which one you mean, and give it a date. |
| "What was our return last year?" | "What was the net-of-fees time-weighted return by strategy, year to date, as of 30 June 2026?" | Gross, net and money-weighted returns all sit in the same table and all differ. And "last year" is unclear when the financial year starts in October. |
| "How much did we sell in Q2?" | "What were gross subscriptions in FY2026 Q3, excluding exchanges, counting settled money only?" | Money moving between our own funds is not a sale. Pending and cancelled orders are not money yet. |
| "AUM for California" | "AUM as of 30 June 2026 for advisors in CA" | The data holds `CA`, not "California". A person reads through that difference. A filter does not. |

Notice what the good column has in common. Every one of them is longer and duller than the
question it replaces. Being that specific can feel like overkill, and it is what gets you a
number you can defend in a meeting.

### Use one thread, not four chats

```
Q1: "Show AUM by asset class as of 30 June 2026"
Q2: "Only the intermediary channel"        ← builds on Q1
Q3: "Now split that by region"             ← keeps narrowing
Q4: "How does that compare with 31 March 2026?"
```

Four questions, one thread, and the same definition of AUM running through all of them.

Start four separate chats instead and you get four answers that each look fine on their own but
do not add up, because nothing carried your "discretionary only" decision from the first chat
into the fourth.

### Three checks before you use an answer

Open **Analysis** and **Show code** on anything you plan to show someone else. You do not need to
read SQL well. You need to check three things.

1. **Which tables did it use?** Meridian has two tables that both look like they hold AUM, and
   only one is the official source. If the answer came from the other one, stop there.
2. **Did your filter survive?** This is the most common quiet failure. If you asked for
   discretionary only, something about discretion should appear in the query. If it does not, you
   were given the whole book.
3. **Was a balance added up?** For AUM, look for one date rather than a range. Adding up many
   dates gives a wrong number that looks perfectly reasonable.

If a check fails, do not simply ask again in different words. Rate the answer **Fix it** and say
what was wrong. That reaches the person who maintains the agent, who can fix it once for
everybody.

### Lab 2 (20 min), graded

Eight questions, as Meridian colleagues actually wrote them. You will rewrite six of them and work
out why the other two cannot be saved.

**You are marked on the rewrites, not on the SQL.**

---

**Step 1 — Get the eight questions (1 min).**

```python
import databricks360 as academy
academy.lab('genie-agents', 2)
```

---

**Step 2 — Run one as written, before you fix anything (3 min).**

1. Open your Wealth agent.
2. Ask question 1 exactly as it is: **"AUM please"**
3. Click **Show code** and read the SQL it wrote.
4. Write down which of the four things it had to guess: the measure, the breakdown, the filter, or
   the point in time.

You will usually find it guessed three of the four. That is the gap you are closing.

---

**Step 3 — Rewrite six of them (8 min).**

For each, produce a version that names all four: **measure, breakdown, filter, point in time.**

Worked example:

| | |
|---|---|
| ❌ As written | "AUM please" |
| ✅ Rewritten | "What was discretionary AUM by asset class as of 30 June 2026, in USD?" |
| What changed | measure pinned to *discretionary* AUM · breakdown by asset class · point in time named · currency stated |

Do the same for questions 2, 3, 4, 5 and 6.

---

**Step 4 — Run each rewrite and keep the SQL (4 min).**

1. Ask your rewritten version.
2. Click **Show code**.
3. Paste the query beside your rewrite.

You are not marked on the SQL. You are reading it to check the agent did what you meant — which is
the habit this module is really teaching.

---

**Step 5 — Find the two that cannot be fixed (4 min).**

Two of the eight cannot be rescued by rewording. Say which, and why.

The reason must be about **the data or an unsettled definition**, not about phrasing. "It is vague"
is not an answer — every question here is vague, and six of them you just fixed.

Ask yourself: is there a version of this sentence that Meridian's data could answer? If the answer
is no, no amount of rewriting helps, and recognising that is the skill being tested.

*You know it worked when:* your six rewrites each name four things, and you can say what is
missing from the world — not from the sentence — for the other two.


---


**Reviewed by a person.** `academy.check_lab('genie-agents', 2)` confirms the 1 prerequisite only — the judgement is what is being assessed. This lab grades your agent, so it needs no schema.

**The material for this lab ships with the package.** `academy.lab('genie-agents', 2)` prints the brief and *the eight questions, exactly as colleagues wrote them* — so you can start without waiting for a handout.
## Module 3 — Chat Mode vs Agent Mode (Answers vs Research)
**Level:** Beginner–Intermediate · **Duration:** 45 min

**Summary:** When a single query is enough, when the question needs research, and what Agent mode costs you in time and spend.
### Learning outcomes
1. Choose the right mode for a question.
2. Set expectations on speed, depth and cost.
3. Know that Agent mode can read **unstructured files** from Unity Catalog volumes.

### Start here: the right answer to the wrong shape of question

Meridian's Head of Distribution asked the agent a reasonable question:

> *"Which funds are losing assets?"*

It came back with a clean table: ten funds, ranked by net outflow, biggest first. Accurate,
fast, nothing wrong with it.

She took it to the product committee and was asked the obvious next question — *why?* — and had
nothing. The table showed which funds, and said nothing about whether the outflows were
redemptions or exchanges into other Meridian products, whether one channel drove all of it, or
whether performance against benchmark explained any of it.

**The answer was correct and useless.** Not because the agent failed, but because she had asked a
research question in a shape that only retrieval could answer, and retrieval answered it.

One query cannot tell you why. It can tell you what. Working out which of those you actually need
is what this module is about, and it is a decision you make *before* you ask, because afterwards
you have a table and a committee waiting.

### Key concepts
| | **Chat mode** | **Agent mode** |
|---|---|---|
| Shape of work | one question → **one SQL query** → answer | builds a **research plan**, forms hypotheses, runs **many queries**, iterates |
| Output | table + chart | a written report: findings, citations, visualisations, supporting tables |
| Data | structured (UC tables/views) | structured **+ unstructured files** in UC volumes the author attached |
| Best for | known metrics, recurring questions | open-ended, exploratory, "what's going on with…" |
| Trade-off | fast, cheap, easy to verify | slower, more LLM spend, more to review |
| Availability | broad | region-dependent. Cross-Geo processing is enabled by default outside the US and EU Geos unless a compliance security profile is on. Tokyo and Seoul workspaces now use in-region models and no longer need it. **Check current regional availability before you promise this to a client** — it has already moved once. |

### How to tell which one you need

Module 2 gave you the four things a good question names: a measure, a breakdown, a filter and a
point in time. That checklist doubles as the mode test.

- **You can name all four → Chat mode.** You already know the shape of the answer; you just need
  the number.
- **You can't name the breakdown → Agent mode.** "Which funds are in trouble" doesn't say what to
  split the answer by, because working out which breakdown matters *is* the job. That's research
  rather than retrieval.

The failure this prevents is asking Chat mode a research question. It will answer — one query,
one table, confidently — and you'll mistake one slice for the whole picture.

### Business examples
| Question | Mode | Why |
|---|---|---|
| "What was AUM by asset class as of 30 June 2026?" | Chat | one balance, one as-of date, one breakdown |
| "Which funds are losing assets, and what's driving it?" | Agent | needs several angles — net flows by channel, redemptions vs exchanges, return against benchmark, share-class mix |
| "Summarise the investment committee memos on emerging-market equity alongside the flow trend for those funds" | Agent | unstructured files in a volume, joined to structured tables |

**What Agent mode can read from a volume.** PDFs, Word documents, slide decks and images. An author
attaches one or more volumes and users ask across a volume, several volumes, and the structured
tables in one conversation. **Files over 10 MB are ignored** — silently, and the agent carries on
answering from the rest, so a missing document does not announce itself.

The forty Meridian documents are written into the course volume by **notebook `08_agents`**, and
the curated agent attaches that volume: committee memos, advisor call notes and complaint
resolutions. Each argues about something the tables also record — whether exchanges are
redemptions, whether held-away belongs in AUM — so a question over them has to reconcile the prose
against the numbers rather than trusting either alone.

> **This needs switching on, and it is not a code problem.** A workspace admin must turn on
> **Analyze Files in Volumes with Genie Agents** from the **Previews** page. Until they do, the
> volume attaches, the files sit there, and the agent answers that it has no document-search tool.
> It falls back to the schema and answers correctly while saying what it could not do, so the
> failure is polite and easy to miss.
>
> This course's documents were tested on two workspaces. On one, with the preview off, the agent
> reported no document-search tool. On the other, with it on, the same question returned:
>
> > *"The investment committee decided, at its meeting recorded in the memo dated **14 October
> > 2025**, that internal exchanges do not count as redemptions… This is consistent with how flows
> > are modeled in the current reporting tables — `vw_net_flows` assigns exchanges an external sign
> > of 0."*
>
> It cited the memo by filename with a link to the file, and then reconciled it against the table.
> That is the whole argument for Agent mode in one answer, and it is worth showing rather than
> describing — but only after you have checked the preview is on.

**What file analysis actually requires** — worth knowing before you promise it:

| | |
|---|---|
| Enablement | workspace admin enables the preview **Analyze Files in Volumes with Genie Agents** |
| Mode | **Agent mode only.** Chat mode declines, correctly — one query cannot search a corpus |
| Without content search | the agent retrieves context from **up to 5 files per question** |
| With content search | files are prepared and indexed, which improves reasoning and lowers latency |
| Limits | **10 volumes** per agent · **500 files** · **10 MB** per file, larger ones ignored silently |
| Permissions | `READ VOLUME` for **every user of the agent**, plus Workspace and Databricks SQL entitlements |
| Not available | AWS GovCloud; consumer-only, SQL-only and account-only users cannot use it |

Note the five-file ceiling against this course's forty documents. A question like *"what has the
committee said about exchanges over the past year"* spans more memos than that, so without content
search the agent answers from whichever five it retrieved and never mentions the rest existed.
That is not a bug; it is the difference between retrieval and search, and it is worth showing.
| "What was the market value of account AC000884120 as of 30 June 2026?" | Chat | one lookup |
| "Show net flows by channel for FY2026 Q3" | Chat | recurring, well-defined, belongs on a dashboard |
| "Why are private-client redemptions up, and is it advisors or clients leaving?" | Agent | the question contains a hypothesis to test, not a metric to fetch |

### Demo (10 min)
Ask *"Which Meridian funds are losing assets, and why?"* in both modes side by side. Chat returns
one table — probably net flows by fund, ranked. Agent returns a multi-section report that also
looks at performance against benchmark, channel concentration and whether the outflows are
redemptions or exchanges.

Then show the clock and the cost. Agent mode did more because it *ran more queries* — and every
one of them was billed. That framing sets up Module 13 (latency) and Module 15 (cost).

The instructive part is not that Agent mode found more. It's that the Chat answer wasn't wrong —
it was one true slice, presented with the same confidence as the full picture.

### Lab 3 (15 min)
Ten questions. Route each one, and find the two that are not what they look like.

---

**Step 1 — Get the ten questions (1 min).**

```python
import databricks360 as academy
academy.lab('genie-agents', 3)
```

---

**Step 2 — Apply the four-part test to each (7 min).**

Module 2 gave you the four things a good question names. That checklist doubles as the mode test:

1. Read the question.
2. Can you name the **measure**, the **breakdown**, the **filter** and the **point in time**?
3. **All four → Chat mode.** You already know the shape of the answer; you just need the number.
4. **Cannot name the breakdown → Agent mode.** Working out which breakdown matters *is* the job,
   and that is research rather than retrieval.

Write one line of justification per question. The justification must say **what the answer needs**,
not which mode sounds more impressive.

---

**Step 3 — Find the two disguised ones (5 min).**

Two of the ten name a single measure and still need several to answer usefully. They read like
metric questions and are not.

Look at numbers 5 and 7. Both mention one thing — growth, performance — and neither can be answered
by one query, because the useful answer is a comparison across several angles the asker has not
specified.

Say for each what the extra angles are. That list is what Agent mode would go and get.

---

**Step 4 — Justify one Chat routing on cost (2 min).**

Pick a question you routed to Chat and say why Agent mode would have been the wrong call — not
because it would fail, but because it costs more for no gain. Agent mode runs many queries per
question. Routing everything there is not a safe default; it is an expensive one.

*You know it worked when:* your ten justifications describe what each answer needs, and you have
named both disguised questions and what makes them research.

> **Setup note for instructors:** the Agent-mode exercises read from the `documents` volume that
> notebook 01 creates. Populate it with the course document pack before running this module.


---

**Reviewed by a person.** No automatic grade: the judgement *is* the exercise. `academy.lab('genie-agents', 3)` prints the brief, the material this lab works on, and what a reviewer looks for.
### LEVEL 2 — HOW IT WORKS

---

## Module 4 — Under the Hood: The Compound AI System
**Level:** Intermediate · **Duration:** 60 min

**Summary:** Genie is several components working together rather than one model. What each one does, which of them can go wrong, and which inputs shape an answer most.

### Learning outcomes
1. Describe the components Genie uses to answer a question, and which of them are AI.
2. Name the inputs that shape an answer, ranked by how strongly each one does it.
3. Explain to a colleague why an answer was wrong, in terms of a specific missing input.
4. Set honest expectations about consistency.

### What a compound AI system is

A single model call is simple: text goes in, text comes out. If it gets something wrong, there is
one place to look.

Genie is not that. It is a **compound AI system**: an architecture that, in Databricks' own
words, combines *"multiple interacting components"*, including several calls to models, plus
retrievers, tools and data sources. Some of those components are AI. Some are ordinary software
that does exactly what it is told, every time.

#### Why not just use a bigger model?

Because some of what you need cannot be got from a model at all, however large.

A model has no notion of who is asking. It cannot enforce a row filter, respect a grant, or
decide that this person may not see a client's date of birth. Those are properties of a
**permission system**, and the only way to have them is to build the model into something that
includes one. The same is true of arithmetic you need to be exactly right every time: a database
guarantees that, and a model does not.

There is a second, more practical reason. Making the model bigger produces diminishing returns,
while improving the system around it, better retrieval, better examples, a governed metric
definition, tends to be both cheaper and more effective. That is the whole premise of this
course. You are not going to improve the model. You are going to improve everything around it.

> Further reading: [What are Compound AI Systems?](https://www.databricks.com/blog/what-are-compound-ai-systems)

#### How a question travels through it

Here is the path your question takes:

```flow numbered
Your question → Gather context → Plan → Write SQL → Run the query → Assemble the answer
```

| Stage | What happens | AI? | What it looks like when it fails |
|---|---|---|---|
| **Gather context** | Picks the tables, examples, instructions and knowledge-store entries that look relevant to this question. It does not send everything it has. | yes | The right example exists but was not chosen, so a question that worked last month does not now |
| **Plan** | Decides which tables to use, how to join them, what to filter, what to group by | yes | Two tables joined at the wrong grain, quietly multiplying the total |
| **Write SQL** | Turns the plan into a query | yes | A filter you asked for never makes it into the query |
| **Run the query** | The SQL warehouse executes it | **no** | A timeout, or a slow answer, but never a wrong number |
| **Assemble the answer** | Turns rows into a sentence and picks a chart | yes | The number is right and the summary overstates it |

Two things follow from this, and both matter more than they first appear.

**"Genie got it wrong" is not one problem.** It is at least four, and they have different owners
and different fixes. A query that ran perfectly but joined the wrong tables is a curation
problem, and yours to fix. A correct query that took ninety seconds is a warehouse problem. A
correct query with an answer that misstates it is a platform problem. Module 14 turns this into a
triage routine; for now, notice that the question "which stage failed?" comes before any fix.

**Context is gathered, not handed over whole.** Genie chooses what to look at each time, which is
why more is not better. Thirty tables of half-relevant material makes that choice harder, not
easier, and every irrelevant column is something the model reads before it can start. This is the
reason behind the object limits in Module 7 and most of the latency work in Module 13.

That last point also explains where time goes. Everything except **Run the query** is thinking
time. When an answer feels slow, the first question is which of the two it was, because the
remedies have nothing in common.

### What Genie assembles context from

When it answers, it draws on six things:

1. **Unity Catalog metadata**: tables, columns, comments, relationships
2. **Knowledge store**: descriptions, synonyms, joins and SQL expressions belonging to this agent
3. **Instructions**: plain-text business rules written by the author
4. **Example SQL queries**: worked answers, chosen by matching the way you phrased the question
5. **Trusted assets**: parameterised queries and Unity Catalog functions the author has verified
6. **Chat history**: the current thread, up to a limit

Those six are the raw material for the rest of the course. Everything you do as an author is
adding to one of them.

### The vocabulary

| Term | What it means | Where it lives |
|---|---|---|
| **Knowledge store** | The agent's private dictionary of your business: what each table and column means, the words your people use, how tables join, and reusable metric definitions. Belongs to **one** agent. | Configure → Knowledge |
| **Instructions** | Written rules: terminology, fiscal calendar, date formats, formatting. Applied to **every** question, not to a subset. | Configure → Instructions |
| **Example SQL query** | A question phrased the way your people phrase it, paired with SQL that answers it correctly. | Configure → Instructions |
| **Trusted asset** | A parameterised query or UC function whose logic the author has **verified**. Used as written. | Configure → Instructions |
| **Benchmark** | A test question with a known-correct answer. It **measures** quality and never improves it. | Monitor → Benchmarks |
| **Agent mode** | Multi-step research: sub-tasks, several queries, a written report. | Chat toggle |
| **Knowledge mining** | Genie proposing new joins and expressions by reading your schemas and watching what authors approve. | suggestions in Configure |

> Instructions and examples **change** answers. Benchmarks **grade** them. These get confused
> constantly, and the difference matters: adding benchmarks will never make an agent better.

### The influence hierarchy

Not every input carries equal weight. Ranked from strongest to weakest:

```ladder
strongest: Trusted assets — a verified query or UC function: *"use this exact logic"*
Example SQL queries — a worked answer to a real question: *"here's how that's done"*
Knowledge store SQL expressions — *"this is what 'net flows' means"*
Knowledge store metadata — descriptions and synonyms: *"this is what this column means"*
Unity Catalog comments — generic table documentation
weakest: Plain-text instructions — *"please remember to..."*
```

**Text instructions are the last resort, not the first tool.** Databricks' own guidance is to
prefer SQL expressions and worked examples over written rules, which is the opposite of what most
people reach for. Writing a sentence is easier than writing a query, so that is what gets tried
first, and it is the weakest thing available.

### Guidance, not guarantee

Genie has built-in randomness. A well-curated agent still varies between runs. Everything in the
hierarchy above makes the right answer far more likely. None of it forces one.

The only layer that guarantees anything is **Unity Catalog**: row filters, column masks and
grants. Those are rules, not suggestions. Everything above them is guidance.

This is not a shortcoming that someone will patch later. It is the reason Genie is built as a
system rather than a model in the first place, as the section above described: the guarantees
live in the components that are not AI, and that is exactly where you should put anything that
has to be true every time.

Say this out loud when you present an agent. The alternative is a CFO discovering it the night
before results.

What follows from it in practice:

- Judge quality over a **benchmark set**, never two runs side by side.
- Compare like for like: same mode, fresh chat, same version of the agent.
- Earlier turns in a thread are context, so a "different answer" is often a different
  conversation rather than a different agent.
- The more a rule lives in prose rather than SQL, the more room Genie has to vary. Pinning logic
  to SQL expressions and metric views removes the decision entirely.

### Lab 4 (20 min), diagnostic

You get nine wrong answers from a deliberately uncurated Meridian agent, one per problem planted
in the dataset. For each, say **which stage failed and which input was missing**, for example
"summed a daily snapshot, because no join cardinality was declared", or "returned nothing for
California, because there is no entity matching on `state`".

Diagnosis only. You fix none of them today. Then compare your answers with the sheet you wrote in
Lab 0, because the gap between what you noticed then and what you can name now is the point of
the exercise.

---


**Reviewed by a person.** `academy.check_lab('genie-agents', 4)` confirms the 1 prerequisite only — the judgement is what is being assessed. This lab grades your agent, so it needs no schema.

**The material for this lab ships with the package.** `academy.lab('genie-agents', 4)` prints the brief and *nine answers from the uncurated agent. every one is wrong.* — so you can start without waiting for a handout.
## Module 5 — Fiscal Calendars, Metric Definitions, and Why Business Language Is the Hard Part
**Level:** Intermediate · **Duration:** 45 min

**Summary:** The words your business argues about are the ones Genie will get wrong. How to find them and settle them.
### Learning outcomes
1. Identify the terms in their own domain that carry more than one meaning.
2. Produce a signed-off business glossary before building anything.
3. Recognise that most "AI accuracy problems" are unresolved definition problems.

### Key concept
Genie can only be as unambiguous as your organisation. Where the business has never agreed on a definition, no amount of curation fixes it — someone has to decide. This module is a **workshop**, not a demo.

### Business example — four contested terms at MFG
| Term | Meanings in active use | Decision required |
|---|---|---|
| **AUM** | discretionary only · all managed assets · managed plus held-away (AUA) | Wealth Analytics owns it: **"AUM" = discretionary managed assets**, USD, excluding held-away. Say "advised" or "AUA" for the wider figure |
| **Return** | time-weighted gross · time-weighted net of fees · money-weighted · which period | **Net of fees, time-weighted** for client reporting. Money-weighted only when the question is about a specific client's experience |
| **Net flows** | subscriptions − redemptions · including transfers · including exchanges | **Subscriptions and transfers in, less redemptions and transfers out. Exchanges excluded** — they move money between our own products |
| **Quarter-end** | last calendar day · last business day · fiscal or calendar quarter | The **last business day of the fiscal quarter**. Meridian's fiscal year starts 1 October |

Notice that three of the four aren't data problems at all. The numbers are sitting there
correctly. What's missing is a decision nobody has written down.

### The glossary template (the module's deliverable)
```
TERM              AUM
OWNER             Wealth Analytics (Head of Investment Reporting)
DEFINITION        SUM(managed_value_usd) WHERE is_discretionary
EXCLUDES          held-away assets; advisory-only mandates; closed accounts
GRAIN             account at a month-end reporting date
SYNONYMS          assets under management, managed assets, discretionary AUM
NOT THE SAME AS   AUA / assets under advisement (adds held-away)
IMPLEMENTED AS    measure expression + metric view mv_wealth_metrics
SIGNED OFF        2026-08-14
```

The `NOT THE SAME AS` line does more work than any other. Most bad answers come from a term
being quietly swapped for its near neighbour.

### Lab 5 (25 min)
In pairs, build a 10-term glossary for the MFG wealth domain using the template — start with AUM, return, net flows, quarter-end, and "client". Every term needs a named owner and an implementation route. Disagreements are the point of the exercise, not a problem with it.

**Reviewed by a person.** No automatic grade: the judgement *is* the exercise. `academy.lab('genie-agents', 5)` prints the brief, the material this lab works on, and what a reviewer looks for.
### Teaching line
> *"Genie didn't get the answer wrong. Your company has three answers and never picked one."*


---

## Module 6 — Governance: Who Sees What, and Why It's Safe
**Level:** Intermediate · **Duration:** 75 min · **Audience:** authors + stewards

**Summary:** Row filters and column masks run as the asking user, so one question has several correct answers. Also where that protection stops.

### Learning outcomes
1. Explain the two credential types and their security implications.
2. Predict what four different users see from the same question.
3. Know **which table** a row filter actually protects — and which it doesn't.
4. Handle PII in a regulated dataset.
5. Assign the right sharing level and pass the permissions checklist.

### Key concepts
**Two credential types** — the most important governance idea in the course:
- **Compute credentials** — embedded by the agent author (which warehouse runs the query)
- **Data credentials** — **the asking user's own identity**

Consequence: Unity Catalog **row filters and column masks are enforced per user**. Two people ask
the identical question and correctly get different numbers.

**Required permissions to author:** Databricks SQL workspace entitlement · `CAN USE` on a **Pro or
serverless** SQL warehouse · `SELECT` on every object in the agent · `CAN EDIT` on the agent. An
account admin must first enable partner-powered AI features at **account and workspace** level.

**Sharing levels:** `CAN MANAGE` · `CAN EDIT` · `CAN RUN` · `CAN VIEW` — set via folder
permissions or direct share.

**Also cover:** cloning an agent; **exporting an agent's context as a metric view** (promotes
curated semantics into a governed UC object); assigning **certification** to an agent; and
**certify/deprecate on the underlying data**. Both are values of one system-governed tag,
`system.certification_status`. `fct_aum_snapshot` ships `certified`; `fct_aum_legacy` ships
`deprecated` with a `superseded_by` note. Be precise about the effect: Databricks documents that
certification helps Genie prioritise the assets your organisation vouches for. It documents no
equivalent ranking effect for `deprecated` — that one warns people and shows a restricted icon.
The thing that reliably keeps the legacy table out of an answer is not adding it to the agent.

A custom tag that merely spells the word `certified` does none of this. It has to be the system
tag key, or it is decoration.

### The Meridian groups
Notebook 05 builds the whole demo on six account groups. Everything below follows from them:

| Group | Who | Effect |
|---|---|---|
| `mfg_region_ne` / `_se` / `_mw` / `_west` | regional sales leads | sees advisors in that region only |
| `mfg_finance` | finance and the CFO's office | the only group that can see `annual_income` |
| `mfg_unrestricted` | data stewards | no row filter, no masking |

### Business example — the row-filter demo (run this live)
```
Question (identical for all four): "Show AUM by advisor region as of 30 June 2026"

Priya   (regional sales lead, mfg_region_ne)   → one row:   NE
Marcus  (regional sales lead, mfg_region_west) → one row:   WEST
Elena   (CFO, mfg_finance)                     → no rows at all
Dev     (data steward, mfg_unrestricted)       → four rows: NE, SE, MW, WEST
```
Same agent. Same question. Four different results, all correct. **Genie leaked nothing.**

Two of those deserve a pause.

**Elena, the CFO, sees nothing.** She is in `mfg_finance`, which the row filter never mentions.
The filter's default branch denies, so she gets **zero rows — not an error**. This is the single
most common governance support ticket in the course, and it is not a bug: an empty answer from a
correctly-configured filter looks exactly like "we have no business in that region". Teach
learners to check group membership *first* when a confident answer comes back empty.

**Roughly 30% of advisors are NE and 30% WEST**, with 20% each in SE and MW. So Priya's and
Marcus's slices are comparable in size, while an SE lead sees a genuinely smaller book. Nobody
can tell from their own answer how much of the firm they're missing.

### The trap: a row filter protects the table it's on

Notebook 05 puts the filter on `dim_advisor`, not on `fct_aum_snapshot`. That means:

| Question | Joins `dim_advisor`? | Priya sees |
|---|---|---|
| "AUM by advisor region as of 30 June 2026" | yes | her region only |
| "Total AUM as of 30 June 2026" | **no** | **the entire firm** |

Nothing is broken. The filter did exactly what it was configured to do — it just wasn't reached.
A regional lead asking a question that never touches the advisor dimension gets the firm-wide
number.

> **The principle:** a row filter constrains *rows of the table it is attached to*. It does not
> follow joins backwards into facts. If regional users must never see firm-wide totals, the
> filter belongs on the fact table too — or the fact must only be reachable through a view that
> forces the join.

This is the most valuable thing in the module, because it is the mistake that survives review.
The demo looks convincing, everyone signs off, and the hole is one question wide.

### Business example — PII in a regulated dataset (flaw 8)
```
Question: "Give me contact details for our top 20 clients by AUM"

Priya (regional lead) → names and IDs; ssn_last4 → '****'
                        email → '***@example.com'   (domain kept)
                        dob   → truncated to 1 January of the birth year
                        annual_income → NULL
Elena (CFO)          → identical, except annual_income is visible
Dev   (steward)      → everything unmasked
```

Note that the masks are **graded, not binary**. The email mask keeps the domain because a domain
supports segmentation and leaks little on its own; the date-of-birth mask truncates to the year
because age analysis is legitimate and a birth date is not. A good mask preserves the analytic
value and removes the identifying detail. Masking everything to `NULL` is easy and quietly
destroys half the questions the business needs to ask.

**Teaching point:** the right answer to "can Genie leak PII?" is *"only what Unity Catalog already
lets that person see."* Curating an agent is not a security control — masks and filters are.
Authors who try to prevent PII exposure with a **text instruction** ("never show email
addresses") have built nothing. Demonstrate that instruction failing.

### Business example — sharing levels at Meridian
| Person | Level | Rationale |
|---|---|---|
| Wealth analytics lead (owner) | CAN MANAGE | owns definitions, manages sharing |
| Two analysts on the team | CAN EDIT | add examples, fix bad SQL, see source queries |
| 340 regional sales leads and relationship managers | CAN RUN | ask questions, give feedback, can't change logic |
| Exec assistant | CAN VIEW | read shared threads only |

### Lab 6 (25 min) — GRADED
Given the Meridian access matrix (4 personas × the core objects, one row filter, four column
masks), predict for 8 questions whether each user gets a full answer, a masked answer, an empty
answer, or a permission error. Then verify in the workspace.

Two of the eight are the cases above: the CFO who correctly sees zero rows, and the regional lead
who correctly sees the firm-wide total. Learners who predict those two have understood the module.

**Reviewed by a person.** `academy.check_lab('genie-agents', 6, schema='<your schema>')` confirms the 2 prerequisites only — the judgement is what is being assessed.

**The material for this lab ships with the package.** `academy.lab('genie-agents', 6)` prints the brief and *the meridian access matrix, and eight questions to predict* — so you can start without waiting for a handout.
### Common mistakes
- Assuming the author's permissions apply to consumers (they don't).
- **Reading an empty answer as an empty business.** Check group membership before believing a zero.
- **Assuming a filter on a dimension protects the facts behind it.** It doesn't — it protects rows
  of that dimension, and only when the query reaches it.
- Granting `CAN EDIT` broadly "so people can help" — editors change business logic for everyone.
- **Trying to enforce PII rules with instructions instead of column masks.**
- Masking a column to `NULL` when a partial mask would have preserved a legitimate use.
- Building on a table the consumer group has no `SELECT` on, then debugging the agent instead of
  the grant.


---

### LEVEL 3 — BUILDING

---

## Module 7 — Prepare the Data (The 80% That Decides Quality)
**Level:** Intermediate · **Duration:** 90 min

**Summary:** Choosing the few objects worth exposing and shaping them properly, which decides more about answer quality than any later tuning.

### Start here: the agent that knew too much

Meridian's first Genie Agent was built by pointing it at the wealth schema and clicking save. All
fourteen tables. It seemed obviously right — why hide data from an agent whose job is answering
questions about data?

The Head of Distribution asked it what the firm managed. It answered **$65 trillion**.

Meridian manages about **$98 billion**. The agent had summed `fct_aum_snapshot` across every day in
the table. That table holds one row per account per day, so each day already carries the whole book;
adding 730 of them multiplies the firm by 730.

Nobody noticed for a fortnight. Not because people are careless — because the *next* answer was
$4.1 billion for one region, which is entirely plausible, and the one after that was a rounding
difference on a fund. The huge number got laughed at. The plausible ones got used.

**Every fix for this is upstream of the agent.** You cannot instruct your way out of it. That is
what this module is about: the shape of the data you expose decides more about answer quality than
anything you do afterwards.

### Why fewer objects is not a tidiness preference

There is a limit — 30 tables or views per agent — and a recommendation, five or fewer. The gap
between those numbers is where most people go wrong, because 30 sounds like the target and it is
the ceiling.

Three separate things go wrong as you add objects.

**The agent has more ways to be wrong.** Two AUM tables means a coin flip on every AUM question.
Two asset-class hierarchies means the same allocation question rolls up two ways on two days. Every
extra object is another chance to pick the wrong one, and it picks silently.

**It gets slower.** Every table and column is context the agent reads before it writes a line of
SQL. A 380-column custodian feed is 380 column names to consider on every question, including
questions that have nothing to do with holdings. Module 13 puts a stopwatch on this.

**Nobody can tell you what it is for.** An agent over fourteen tables has no answer to "what should
I ask this?" — which is the first thing a business user needs and the reason most of them stop
after one attempt.

### What you are actually choosing between

The instinct is to hide columns and hope. The better move is usually to build something new: a view
that answers the question the way your firm has agreed it should be answered.

Compare the two ways of getting to the same number.

**Exposed raw**, the agent must know all of this on its own: that `fct_aum_snapshot` is daily, that
`market_value_local` is in local currency and needs `dim_fx_rate` joined at the snapshot date, that
held-away sits in its own column and is not AUM, and that `dim_portfolio.is_discretionary` decides
which mandates count.

**Exposed as `vw_aum_reporting`**, all four decisions are already made. One row per account per
reporting date, converted to USD, discretionary flag explicit, held-away in a separate column. The
agent cannot get the currency wrong because there is no currency left to get wrong.

That is the trade this module keeps making: **move the decision from the agent, which guesses, to
the view, which is reviewed.**

### Where each kind of fix belongs

Four places to put a rule, and they are not interchangeable. Getting this wrong is the most
expensive mistake in the course, because a rule in the wrong place works once and rots.

| Put it here | When | Who sees it |
|---|---|---|
| **A curated view** | the fix is structural — a grain, a join, a conversion | everyone who queries it |
| **A metric view** | a metric must mean one thing across several agents and dashboards | every agent and BI tool |
| **A Unity Catalog function** | the logic is complex and shared | anyone with EXECUTE |
| **Agent instructions** | genuinely last resort — a phrasing convention, a clarification rule | one agent only |

Read that table bottom-up if it helps: instructions are the weakest tool, and they are the one
everybody reaches for first because they are the easiest to write.

### Metric views, if you have not met one

A metric view is a Unity Catalog object that separates **measures** from **dimensions**. You define
AUM once — the expression, not the answer — and anything that queries the view can group it by
region, quarter, asset class or client segment without redefining anything.

The reason it matters here: a curated view lives inside your agent's world, but a metric view is a
catalog object. Point five agents, three dashboards and the regulatory extract at the same metric
view and all nine of them compute AUM identically. That is not achievable with instructions, no
matter how carefully written.

Metric views also carry **agent metadata** — synonyms, display names and formatting — which is the
same vocabulary work Module 9 does inside an agent, but done once at the catalog level.

Two practical notes, both learned the hard way: synonyms, display names and formatting require YAML
specification **1.1**, and a measure column must be wrapped in `MEASURE()` when you query it.

### Certify what is authoritative, deprecate what is not

Meridian has two AUM tables. `fct_aum_snapshot` is current; `fct_aum_legacy` is superseded and
nobody retired it. Unity Catalog has a system tag for exactly this:

```sql
ALTER TABLE core.fct_aum_snapshot
  SET TAGS ('system.certification_status' = 'certified');
```

Be precise about what that buys you. Databricks documents that certification helps Genie prioritise
the assets your organisation vouches for. It documents **no** equivalent ranking effect for
`deprecated` — that value warns people and shows a restricted icon in Catalog Explorer.

So deprecating the legacy table is worth doing, and it is not what keeps it out of your answers.
**The thing that reliably keeps a table out of an answer is not adding it to the agent.**

One more trap: the tag key must be `system.certification_status`. A custom tag that merely spells
the word `certified` is decoration — it looks right in the catalog and does nothing.

### The limits, now that the words mean something

| Limit | What Databricks documents |
|---|---|
| Tables/views per agent | **30.** *"You can add up to 30 tables or views to a Genie Agent."* |
| Recommended starting size | **≤ 5.** *"Aim for five or fewer tables. The more focused your selection, the better."* |
| Conversations per agent | **10,000**, each up to **10,000 messages** |

**30 is the ceiling; 5 is the advice.** An agent with 28 objects is inside the limit and still badly
built.

Databricks also documents **100 instructions** and **200 knowledge store snippets** per agent, both
covered in Modules 9 and 10. What is *not* documented anywhere is a character limit on instruction
text — Module 10 uses a degradation threshold observed in practice, and labels it as such.

### Business example — scoping the MFG "Wealth Reporting" agent
**Before (bad): all 14 base objects**, which is what pointing an agent at the schema gets you.
```
dim_account        dim_advisor       dim_asset_class    dim_benchmark
dim_client         dim_date          dim_fund           dim_fx_rate
dim_portfolio      fct_aum_snapshot  fct_flows          fct_performance
fct_aum_legacy     fct_holdings_raw
```
Four of those are actively harmful: `fct_holdings_raw` (380 columns of custodian feed),
`fct_aum_legacy` (superseded, sitting beside its replacement), `dim_client` (carries the PII),
and `dim_asset_class` with **both** its hierarchy columns visible — `investment_class` and
`regulatory_class` answer the same allocation question two different ways.

**After (good): 7 objects** — six curated objects plus the metric view.
```
vw_aum_reporting     -- month-end AUM per account, converted to USD, with the
                     -- discretionary split explicit and held-away separated
vw_net_flows         -- settled flows only, exchanges kept out of sales
                     -- and redemptions, trade vs settlement resolved
dim_client_safe      -- identifiers removed; segment, tenure and age bands
dim_portfolio        -- strategy, discretionary flag, benchmark
dim_asset_class      -- regulatory_class hidden; one hierarchy exposed
dim_date             -- fiscal (Oct 1 start), calendar, and reporting dates
mv_wealth_metrics    -- metric view: AUM, AUA, held-away, counts, averages
```
> **Where did `dim_advisor` go?** It is not exposed. `mv_wealth_metrics` joins to it internally and
> surfaces `Region` and `State` as dimensions, so "AUM in California" still answers — through one
> governed object instead of a join the agent has to work out for itself. Pre-joining does not just
> reduce the count; it decides *which* joins are allowed.

**14 → 7 is the honest headline**, and 7 is still above the documented ≤ 5. Say so in the room. The
next cut — folding `dim_portfolio` and `dim_asset_class` into the views — is a real trade-off between
object count and the flexibility to group by things the metric view does not expose.

> **Note what happened.** Most of the hard problems were solved *in the data layer*, before a
> single instruction was written. That is the module's whole point.

### Business example — column descriptions that earn their keep
| Column | ❌ Weak | ✅ Strong |
|---|---|---|
| `fct_aum_snapshot.market_value_local` | "the market value" | "Market value of managed assets in the account's local currency. Convert with `dim_fx_rate` at `snapshot_date` before totalling. Excludes held-away assets — see `held_away_value_local`." |
| `fct_aum_snapshot.held_away_value_local` | "held away value" | "Assets Meridian reports on but does not manage. **Excluded from AUM.** Include only when the question says 'advised' or 'AUA'." |
| `fct_flows.flow_type` | "type of flow" | "SUBSCRIPTION, REDEMPTION, EXCHANGE_IN, EXCHANGE_OUT, TRANSFER_IN, TRANSFER_OUT. **Exchanges move money between Meridian products and are not sales or redemptions.**" |
| `fct_aum_snapshot.snapshot_date` | "snapshot date" | "This table holds **one row per account per day**. Never SUM across dates; filter to a reporting date for a point-in-time figure." |
| `dim_advisor.region` | "region code" | "Advisor coverage region. Values: NE, SE, MW, WEST. Users say 'Northeast', 'the West Coast', 'Midwest'." |
| `fct_performance.twr_net` | "net return" | "Time-weighted return after fees, for the `period_type` on the row. Not the same as `mwr`, which reflects the timing of client cash flows." |

These are descriptions for the **base** columns, which is where the ambiguity lives — the curated views
resolve most of it (`vw_aum_reporting` has already applied `dim_fx_rate` and split out held-away). Write
them anyway: the base tables outlive this agent, and the next author starts from what Unity Catalog says.

### Demo (15 min)
**Setup — both agents are provisioned from code, not built by hand.** Create Genie Space takes the whole
configuration in one call, so the two demo agents ship as `serialized_space` definitions and are created by
**notebook `08_agents`**, run in order after `07_metric_view`:

```python
import databricks360 as academy

academy.create_agents('genie-agents', dry_run=True)   # check, create nothing
academy.create_agents('genie-agents')                 # create both
```

Object names come from the same layout as the notebooks, so the agents follow whichever catalog and schema
you installed into. The dry run refuses to create an agent whose tables are missing — an agent pointed at a
table that does not exist fails on every question, and the failure looks like a Genie problem rather than a
notebook you skipped.

**Requires** `04_staging`, `06_curated` and `07_metric_view` to have been run first.

**The demo.** Ask the uncurated agent *"What was our AUM in California at the end of last year?"* → it sums a
daily snapshot, includes held-away assets, uses the calendar year, and returns nothing for "California". Four
problems in one answer, none of them flagged. Then ask the prepared 7-object agent. Same question, right
answer, no prompt tricks.

> **Worth showing the two definitions side by side.** The uncurated agent carries 14 objects and a
> 10,300-character wall of prose. The prepared one carries 7 objects and 916 characters, because the
> arguments the prose was trying to settle — what AUM means, how exchanges net — were settled in the views
> instead. That ratio *is* the module.

### Lab 7 (30 min) — GRADED
You are going to build the curated layer by hand, then have it graded against the reference.

**Before you start:** run Module 0 notebooks `01`, `02`, `03` and `04_staging`, then `99_validate` —
every row must read PASS. `04_staging` is marked optional in the manifest and is not optional here:
it creates `fct_holdings_raw` and `fct_aum_legacy`, two of the objects this lab is about cutting.

Do **not** run `06_curated` or `07_metric_view` yet. Those are the answer.

---

**Step 1 — Make somewhere to work (2 min).**

1. Open a SQL editor or a notebook.
2. Create your own schema, named so nobody confuses it with the reference:
   ```sql
   CREATE SCHEMA IF NOT EXISTS lab07_yourname;
   ```
3. Everything you build goes in there. Leave `genie_agent` alone.

---

**Step 2 — Look at what you have (5 min).**

1. List the fourteen base objects:
   ```sql
   SHOW TABLES IN genie_agent;
   ```
2. For each one, ask yourself a single question: *would a wealth reporting user ever ask about this?*
3. Write down your keep/drop decision for all fourteen before you build anything.

Four should be obvious drops once you look: `fct_holdings_raw` (380 columns of custodian feed),
`fct_aum_legacy` (superseded), `dim_client` (carries the PII), and one of the two asset-class
hierarchy columns.

---

**Step 3 — Build `vw_aum_reporting` (10 min).**

This is the hard one, and four decisions have to be right. Write a view in your schema that:

1. **Fixes the grain.** Join `dim_date` and filter to `is_reporting_date`, so you get one row per
   account per *month-end* rather than per day.
2. **Converts to USD.** Join `dim_fx_rate` on both currency **and** `snapshot_date` — the rate is
   as-of, not fixed.
3. **Separates held-away.** Keep `managed_value_usd` and `held_away_value_usd` as two columns. Do
   not add them together.
4. **Carries the discretionary flag**, from `dim_portfolio.is_discretionary`.

Check it before moving on:
```sql
SELECT count(*) FROM (
  SELECT account_id, as_of_date FROM lab07_yourname.vw_aum_reporting
  GROUP BY 1,2 HAVING count(*) > 1
);
```
Zero means your grain is right. Anything else means a join is fanning out, and every total you build
on top will be wrong.

---

**Step 4 — Build `vw_net_flows` (7 min).**

1. Start from `fct_flows`, filtered to `status = 'SETTLED'`.
2. Convert `amount_local` to USD using `dim_fx_rate` at the **settlement** date.
3. Add a signed column so netting is unambiguous:
   ```sql
   CASE WHEN flow_type IN ('SUBSCRIPTION','TRANSFER_IN')  THEN 1
        WHEN flow_type IN ('REDEMPTION','TRANSFER_OUT')   THEN -1
        ELSE 0 END AS external_sign
   ```
4. Add `is_internal` for the exchanges, so anyone can see why they net to zero.

The `ELSE 0` is the whole point. Exchanges move money between Meridian products, so they are neither
a sale nor a redemption, and giving them a sign of zero makes that structural rather than something
a user has to remember.

---

**Step 5 — Build `dim_client_safe` (3 min).**

1. Select from `dim_client`.
2. Take `client_id`, `client_segment`, `advisor_id`, and banded versions of tenure and age.
3. Leave behind `ssn_last4`, `email`, `dob` and `annual_income`.

Banding is the point: `tenure_band` answers every question anyone actually asks, and `dob` answers
none of them while being a governance incident waiting to happen.

---

**Step 6 — Write the column comments (5 min).**

At least ten columns, and write them for a stranger. `COMMENT ON COLUMN` is the syntax:

```sql
COMMENT ON COLUMN lab07_yourname.vw_aum_reporting.managed_value_usd IS
  'Assets Meridian manages, in USD. This is what AUM means unless someone says otherwise.';
```

A comment earns its place when it says something the column name does not. Compare:

| ❌ | ✅ |
|---|---|
| "the market value" | "Assets Meridian manages, in USD. Excludes held-away — see `held_away_value_usd`." |
| "snapshot date" | "Month-end reporting date, the last business day of the month. Not the last calendar day." |

---

**Step 7 — Get it graded (2 min).**

```python
academy.check_lab('genie-agents', 7, schema='lab07_yourname')
```

Ten checks. The numeric ones compare your views against the reference at the latest reporting date,
so a view that runs but sums the daily snapshot, folds held-away into AUM, or counts exchanges as
sales will produce a number, pass every syntax check, and still fail. Each failure names the fix.

**Only when you are passing**, run `06_curated.sql` and `07_metric_view.sql` and compare their SQL
with yours. They are the worked answer, and reading them before you have attempted this wastes the
lab.

### Anti-patterns to name explicitly
- Adding every table "just in case."
- Accepting **AI-generated column descriptions without verifying them.** The docs are direct about this: *"Inspect any AI-generated descriptions for accuracy and clarity, and use them only if they align with what you would manually provide."* On this dataset the suggested text gets planted flaws 1 (AUM has three defensible readings) and 5 (the two asset-class hierarchies) wrong.
- Leaving both of `dim_asset_class`'s hierarchy **columns** visible — `investment_class` and `regulatory_class` roll the same assets up two different ways.
- Exposing a daily-snapshot table without a warning in its description.
- Exposing `dim_client` when `dim_client_safe` exists.


---

### Sources for the quoted limits and guidance
Every quotation in this module is verbatim from Databricks documentation. Re-check before each delivery —
Genie ships fast, and "Genie spaces" were renamed "Genie Agents".

| Claim | Page |
|---|---|
| 30 tables/views; 10,000 conversations × 10,000 messages; Export to metric view | *Create and manage a Genie Agent* — `docs.databricks.com/aws/en/genie-agents/set-up` |
| ≤ 5 tables; new-analyst framing; prejoining; hide confusing columns; inspect AI-generated descriptions | *Genie best practices* — `docs.databricks.com/aws/en/genie/best-practices` |
| Metric views: measures vs dimensions, agent metadata (synonyms, display names, formatting rules) | *Unity Catalog metric views* — `docs.databricks.com/aws/en/uc-semantics/metric-views/` |
| `certified` / `deprecated` system tag and its documented effects | *Flag data as certified or deprecated* — `docs.databricks.com/aws/en/data-governance/unity-catalog/certify-deprecate-data` |
| 100 instructions / 200 knowledge store snippets per agent (Module 13) | *Tune Genie Agent quality* — `docs.databricks.com/aws/en/genie-agents/tune-quality` |
| The 14 base objects, the 380-column feed, the nine planted flaws | This course's Module 0 notebooks and Reference Part F |


## Module 8 — Create Your First Genie Agent
**Level:** Intermediate · **Duration:** 75 min

**Summary:** Build and share an agent end to end, review what the Genie Code bootstrap suggests, and choose starter questions that hold up.

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
8. **Monitor** — conversation history and the Monitor tab (Modules 12–14).

### Reviewing what Genie Code suggests

The bootstrap is genuinely useful and it is confidently wrong about exactly the things that
matter. It reads schemas and samples; it cannot read your firm's conventions. On the Meridian
data it reliably proposes two descriptions you must reject:

| Suggestion | Why it's wrong |
|---|---|
| `fct_aum_snapshot` — *"total assets under management"* | It's the **daily** market value of a single account, and it excludes held-away assets, which sit in their own column. Accept this and every learner sums it across dates. |
| `dim_asset_class` — *"asset class of the holding"* | There are **two** hierarchies in that table, `investment_class` and `regulatory_class`, and they disagree. A description naming neither invites Genie to pick either. |

Both readings are defensible from the schema alone. That's the lesson: the bootstrap gives you a
first draft written by something that has never sat in your reporting meeting.

### Why "common questions" matter more than they look

The 4–6 starter chips are the entire onboarding experience for a business user. They must be
questions the agent answers **perfectly today**.

Meridian Wealth & Distribution starters:
- "What was discretionary AUM by asset class as of 30 June 2026?"
- "Which ten funds had the largest net inflows in FY2026 Q3, excluding exchanges?"
- "What were net flows by distribution channel for FY2026 Q3?"
- "What was the net-of-fees time-weighted return by strategy for the YTD period as of 30 June 2026?"
- "Compare discretionary AUM at 30 June 2026 with the same date a year earlier"

Read those again and notice what none of them say. Not one asks *"what's our AUM?"* or *"what was
our return?"* Every starter names which AUM, which return, and which period — because a starter
question is the one question you are certain about.

> **The starters are a contract, not a demo.** They tell the user what this agent is for, and
> they model the phrasing that works. A user whose first click returns a defensible number will
> phrase their second question the same way. A user whose first click returns a plausible wrong
> number learns nothing — and tells three colleagues.

**Rule:** if a starter question ever returns a wrong answer, it's a P1 bug. It's the first thing
every new user clicks.

### Also cover
- **Clone** an agent (a fast way to spin a regional variant without recurating).
- **Assign certification** to signal official status.
- Naming and description conventions — in Genie One the description is how users pick an agent
  from a list, so it has to say what's in scope *and* what the words mean:

  > `"Wealth & Distribution — AUM, net flows and performance by portfolio, fund, channel and`
  > `region. AUM means discretionary market value excluding held-away assets. Fiscal year starts`
  > `1 October. Owner: Wealth Analytics."`

  That beats `"Wealth agent"` on every axis that matters: a user can tell whether their question
  belongs here, and the definition is visible before anyone asks a thing.

### Lab 8 (35 min) — GRADED, milestone lab
This is the milestone lab: the first time the agent exists as a thing other people can open.
Work through the steps in order — each one depends on the last, and step 6 is the one people skip.

**Before you start**, you need Lab 7's curated objects to exist, and a SQL warehouse you can use.

---

**Step 1 — Create the agent (3 min).**
Genie Agents → **New**. Pick your warehouse. Name it so a stranger can tell what it covers:
`Meridian Wealth & Distribution`, not `Wealth agent`.
*You know it worked when:* the agent appears in the list and opens to an empty chat.

**Step 2 — Select the data (5 min).**
Add the objects you kept in Lab 7 — the curated views, the dimensions you exposed, and the metric
view. Nothing else. Not `dim_client`, not `fct_holdings_raw`, not the legacy AUM table.
*You know it worked when:* Configure → Data lists 7 objects or fewer and none of them surprises you.

**Step 3 — Let Genie Code bootstrap it, then argue with it (10 min).**
The bootstrap launches on its own and proposes table descriptions and example queries. Read every
one. **Never bulk-accept.**

Two of its suggestions on this data are wrong, and they are wrong in ways that matter:

| It suggests | Reject it because |
|---|---|
| `fct_aum_snapshot` is *"total assets under management"* | It is the **daily** value of one account, and it excludes held-away. Accept this and every user sums it across dates. |
| `dim_asset_class` is *"the asset class of the holding"* | There are **two** hierarchies in that table and they disagree. A description naming neither invites Genie to pick either. |

Write down the two you rejected and why. That written note is part of what is marked.
*You know it worked when:* you have rejected at least two suggestions and can say what each would
have taught the agent.

**Step 4 — Hide the columns nobody asks about (5 min).**
Configure → Data → per table, open **Overview** and **Sample data**, and hide what is noise.
Every visible column is context Genie reads before writing a line of SQL.
*You know it worked when:* nothing remains visible that you could not explain to a business user.

**Step 5 — Write the description and settings (4 min).**
The description is how a user picks your agent from a list, so it must say what is in scope **and**
what the words mean:

> `Wealth & Distribution — AUM, net flows and performance by portfolio, fund, channel and region.`
> `AUM means discretionary market value excluding held-away assets. Fiscal year starts 1 October.`
> `Owner: Wealth Analytics.`

*You know it worked when:* someone who has never seen the data can tell whether their question belongs here.

**Step 6 — Add 5 starter questions, and check every one (5 min).**
The starters are the whole onboarding experience. Each must name **which** AUM, **which** return,
and **which** period. Then run all five and read the answers.

This is the step people skip, and it is the one that matters: a starter question that returns a
wrong answer is a P1 bug, because it is the first thing every new user clicks.
*You know it worked when:* all five return numbers you can defend, not just numbers.

**Step 7 — Share it (2 min).**
Share with a peer group at **CAN RUN**. Not CAN EDIT — you want them using it, not fixing it.
*You know it worked when:* a colleague can open it and ask a question without asking you for access.

**Step 8 — Break it on purpose (1 min).**
Add a sixth starter that *is* ambiguous: **"What was our AUM?"** Run it. Keep the answer.

It will return something confident. Note which of the three defensible AUM definitions it picked,
and whether it told you. Module 10 comes back to this exact result when you write the
clarification instruction that fixes it.

---

**Grade your work:**

```python
academy.check_lab('genie-agents', 8, schema='<your schema>')
```

Four checks: the agent exists, it carries 5 starter questions, it has instructions, and it has at
least one example query. The rejected-suggestion notes from step 3 and the ambiguous starter from
step 8 are read by a person — a checker cannot tell whether your reasoning was any good.


---

## Module 9 — The Knowledge Store: Teach It Your Business
**Level:** Intermediate–Advanced · **Duration:** 90 min · **Audience:** authors

**Summary:** Teach the agent your vocabulary: the descriptions, synonyms, joins and SQL expressions that turn column names into meaning.

### Start here: a question that came back empty

Ana Reyes runs the West region for Meridian. On the first Monday of the quarter she opens the
agent you built in Module 8 and types the question she has typed into a spreadsheet every quarter
for six years:

> *"How did our California advisors do last quarter?"*

The agent thinks for a few seconds and answers:

> *No results found.*

Ana knows this is wrong. She has 340 advisors in California. She closes the tab, and the next time
someone suggests she use the agent, she says she tried it and it does not have her data.

**Nothing was broken.** The warehouse was up, the tables were full, the SQL was valid. Here is what
Genie wrote:

```sql
WHERE state = 'California'
```

And here is what is in the column:

```
CA    NY    TX    FL    IL    ...
```

`'California'` never equals `'CA'`, so the filter matched nothing and the query returned zero rows —
correctly, and confidently, and with no warning that it had understood the question and then failed
to find the words.

This module is about the gap between how your people talk and how your columns are spelled. Closing
it is the single highest-leverage thing you will do as an agent author. Everything before this module
prepared the data; everything after it measures or operates what you build here.

### Why the agent could not work it out

It is tempting to think the agent should have known. It read `dim_advisor`, it saw a column called
`state`, and a person asking about California is obviously asking about the state.

The agent got that part right. What it could not know is **which spelling is in the column**. It has
the column's name and type, and unless you tell it otherwise, it has to guess at the values. Guessing
"California" for a column called `state` is a reasonable guess. It is just wrong here.

That is the shape of almost every failure in this module: the agent understood the question and did
not know your conventions. Your conventions are not in the schema. They are in your head, in a
spreadsheet somewhere, and in the way your team has always talked. **The knowledge store is where
you write them down so the agent can read them.**

### The four things you can teach it

There are four, and they answer four different questions. Learn which is which, because using the
wrong one is the most common mistake in this module and it fails quietly.

| You want to fix | Use | Because |
|---|---|---|
| "People call it something else" | **synonyms** | maps their word onto your column |
| "People say a value that isn't in the column" | **entity matching** | gives the agent the real list of values |
| "It joins the tables wrong, or not at all" | **join relationships** | tells it how the tables connect |
| "It computes our number differently each time" | **SQL expressions** | defines the calculation once |

Take them one at a time.

---

### 1. Synonyms — when people use a different word

Your column is called `net_flows_usd`. Nobody in your building says that. Distribution says **net new
money**. Finance says **net flows**. The board pack says **net sales**. All three mean the same
number, and a new hire will say whichever one they learned first.

A synonym tells the agent that these words point at the same thing:

```
net_flows_usd   ←  "net new money", "net sales", "flows", "net inflows"
```

Now all four questions land on the same measure, and the answer does not depend on who is asking.

**Put the synonym where the thing lives.** A synonym for `AUM` goes on the measure. A synonym for
"equities" goes on the dimension that holds asset classes. Putting it in the wrong place is like
filing a document under the wrong client — it exists, and nobody finds it.

**One trap, and it is expensive.** *"Total assets"* is not a synonym for AUM. It is a synonym for
**AUA**, which includes held-away assets Meridian reports on but does not manage. Attach it to AUM
and every question about total assets quietly inflates your headline number by the held-away amount.
The query runs, the number looks plausible, and it is wrong in the direction that flatters you —
which is the direction nobody checks.

Ten synonyms is a sensible start. Begin with the five that break most often here: **AUM**, **AUA**,
**net new money**, **equities**, **cash**.

---

### 2. Entity matching — when people say a value that isn't there

This is Ana's problem, and it needs a different tool. A synonym maps a *word to a column*. Ana's
question was not about the wrong column — it found `state` correctly. It was about the wrong
**value**.

Entity matching hands the agent the actual list of values in a column. Give it the fifty states
that live in `dim_advisor.state`, and when someone says "California" it can see that the column
holds `CA` and match the two. It also handles "Californa", because it is matching against a real
list rather than spelling from memory.

**What it looks like before and after:**

| Ana asks | Without entity matching | With it |
|---|---|---|
| "our California advisors" | `WHERE state = 'California'` → zero rows | `WHERE state = 'CA'` → 340 advisors |
| "the Northeast" | `WHERE region = 'Northeast'` → zero rows | `WHERE region = 'NE'` |
| "cash holdings" | `WHERE asset_class = 'cash'` → zero rows | `WHERE asset_class_code = 'MM_CASH'` |

Notice the failure is always the same: **a confident zero**. Not an error. Not "I could not find
that". A number, and the number is nought, and nought is a perfectly ordinary answer to a question
about a small region on a quiet quarter. That is why this one is worth the effort — the failure is
invisible unless you already know the answer.

**Turn it on for every low-cardinality column your people name out loud.** Region, state, asset
class, flow type, channel, strategy, period. If someone might say the value in a meeting, curate it.

The limits, once you need them: **120 columns** per agent, **1,024 distinct values** each, each value
up to **127 characters**, string columns only.

---

### 3. Join relationships — when it connects the tables wrong

Ask *"what do we manage?"* against an agent that has not been told how the tables join, and you can
get a number roughly **682 times too large**.

Here is how. `fct_aum_snapshot` holds one row per account per day. `dim_account` holds one row per
account. Join them correctly and you still have one row per account per day. Join them wrongly — or
let the agent guess and guess badly — and rows multiply. Sum the result and you are adding the same
book of business over and over.

The number that comes back is not obviously absurd. It is large, and large numbers in asset
management are normal. In this dataset the real book is about **$98.5 billion** and the fanned-out
sum is about **$67.2 trillion**, which is visibly wrong. But sum a week instead of two years and you
get roughly seven times the truth, and seven times looks like a very good quarter.

You know how to write this join. That is not the problem. The problem is that **Genie will not use
your join unless you declare it in the agent** — it works from the schema, and a foreign key you hold
in your head is not in the schema.

Declaring a relationship means naming the two columns and the cardinality Genie should assume:
`Many to one`, `One to many`, or `One to one`. For `fct_aum_snapshot.account_id → dim_account.account_id`
that is Many to one.

Declare all of them, including the ones that look obvious. An undeclared join is where a plausible
wrong number comes from, and a plausible wrong number is the worst thing this course can produce.

---

### 4. SQL expressions — when the number is computed differently each time

The last one is the most valuable and the least obvious.

Ask the agent for AUM three times and you can get three different numbers — not because it is
unreliable, but because "AUM" genuinely has three defensible readings in this data, and it picks one
each time without telling you. Discretionary only. All managed. Managed plus held-away.

A SQL expression settles it. You write the calculation once, name it, and the agent uses your
definition instead of inventing one. There are three kinds, and the difference is what they produce:

| Kind | What it is | Meridian example |
|---|---|---|
| **Filter** | a reusable condition | `Settled only` → `status = 'SETTLED'` |
| **Measure** | a number you aggregate | `net_flows_usd` → `SUM(external_sign * amount_usd)` |
| **Field** | a derived attribute you group by | `account_size_band` → Retail / Affluent / Institutional |

A measure defined once here cannot drift. The same measure retyped into five dashboards always does
— and it drifts silently, because each version is correct in isolation and nobody compares them
until a client does.

**Write these for the arguments your firm actually has.** In Meridian's case that means: which AUM,
whether exchanges count, settled or instructed, discretionary or advised. Every one of those is a
disagreement between two teams that a SQL expression ends permanently.

---

### Where this actually lives, and why that matters

This is the part that trips up everyone new to Databricks, so it is worth being explicit.

Everything in this module is **agent-scoped**. The synonyms, the join declarations, the SQL
expressions belong to this Genie Agent and live with it. They write nothing to Unity Catalog, and
they do not overwrite the table and column comments already there.

Two consequences follow, and both bite in practice:

- **A second agent over the same tables inherits none of it.** Build one for Institutional next
  quarter and you start from nothing. If a definition has to hold across several agents, it belongs
  in a metric view or a Unity Catalog function instead (Module 7) — those are catalog-scoped, and
  every agent sees them.
- **Unity Catalog column comments are still read.** They are a separate, lower-priority input. Good
  comments on the base tables make every agent better; the knowledge store is for what is true of
  *this* audience.

The rough rule: if it is true about the data, put it in Unity Catalog. If it is true about how
*these people* talk, put it here.

### The reference, once you know what the words mean

| Element | What it does | Counts toward |
|---|---|---|
| Table / column descriptions | agent-scoped meaning; **does not overwrite** Unity Catalog metadata | the 200 |
| Synonyms | maps business vocabulary onto your columns | the 200 |
| Hidden columns | removes noise and duplicate hierarchies | — |
| **Prompt matching — format assistance** | supplies representative values automatically; fixes spelling drift | automatic |
| **Prompt matching — entity matching** | curated value lists, so it filters on `CA` not `California` | **120 columns**, **1,024 values** each |
| Join relationships | explicit links, with cardinality | the 200 |
| **SQL expressions** | filters, measures, fields | the 200 |
| **Knowledge store total** | descriptions + joins + SQL expressions share one budget | **200 per agent** |

Text instructions, example queries, SQL functions and column descriptions do **not** count toward
the 200. They have their own budget, and that is Module 10.

### Knowledge mining
Genie proposes new joins and SQL expressions by reading Unity Catalog schemas and observing author behaviour — thumbs-up on responses and downloaded queries. Teach authors that **their own upvotes are training signal**, and to review suggestions rather than accept blindly.

### Lab 9 (40 min) — GRADED, hardest lab
This is the hardest lab in the course, and the one that moves the number most. Work in order —
each step feeds the next, and step 6 is where you find out whether any of it worked.

**Before you start:** your agent from Lab 8, and the nine wrong answers you diagnosed in Lab 4.

---

**Step 1 — Add column synonyms (8 min).**

Do this for one column first, so you learn the path. Then repeat it for the rest.

1. Open your agent.
2. Click **Configure**, then **Sources**.
3. Click the table name **`dim_advisor`**.
4. Find the row for the column **`region`**. Click the **pencil icon** next to it.
5. In the **Synonyms** field, type: `Northeast, the East, Southeast, Midwest, West Coast, out west`
6. **Save.**

That is one column done. Now repeat steps 3–6 for these four:

| Click this table | Pencil next to this column | Type these synonyms |
|---|---|---|
| `dim_asset_class` | `investment_class` | equities, stocks, fixed income, bonds, credit |
| `dim_asset_class` | `asset_class_code` | cash, money market |
| `dim_client_safe` | `client_segment` | segment, channel, tier |
| `vw_aum_reporting` | `held_away_value_usd` | held away, unmanaged, assets we do not manage |

Then add five more of your own, using words you have actually heard someone say out loud.

> **Do not add AUM, AUA or "net new money" here.** Those name *measures*, not columns, and the
> measures do not exist yet — you create them in Step 4, and that form has its own Synonyms field.
> Putting them on a column is the usual way this step goes wrong.

**Check it worked:** ask the agent *"what is our exposure to equities?"* You should get rows back,
not an empty table.

---

**Step 2 — Turn on entity matching for 4 columns (7 min).**

Same screen as Step 1, one level deeper. Again, do the first one slowly.

1. Click **Configure**, then **Sources**.
2. Click the table **`dim_advisor`**.
3. Click the **pencil icon** next to the column **`state`**.
4. Click **Advanced**.
5. Toggle **Entity matching** on.
6. A **value dictionary** button appears on the right. Click it.
7. Confirm the values it found are the real ones — `CA`, `NY`, `TX` and so on.
8. **Save.**

Now repeat steps 2–8 for these three:

| Table | Column | What should be in the dictionary |
|---|---|---|
| `dim_advisor` | `region` | `NE`, `SE`, `MW`, `WEST` |
| `dim_asset_class` | `asset_class_code` | `EQ_US`, `FI_CORP`, `MM_CASH`, and the rest |
| `vw_net_flows` | `flow_type` | the six flow types |

*Limits, if you go further:* 120 columns per agent, 1,024 values each, string columns only.

**Check it worked:** ask *"how did our California advisors do last quarter?"* — the question from the
start of this module. You should now get advisors back instead of nothing. Try "Californa" too.

---

**Step 3 — Declare the join relationships (6 min).**

Different screen this time.

1. Click **Configure**, then **Examples**.
2. Click **Add**, then choose **Joins**.
3. In **left table**, pick `vw_aum_reporting`.
4. In **right table**, pick `dim_client_safe`.
5. In **Join condition**, enter `client_id = client_id`.
6. In **Relationship Type**, choose **Many to one**.
7. **Save.**

Repeat steps 2–7 five more times:

| Left table | Right table | Join condition | Relationship Type |
|---|---|---|---|
| `vw_aum_reporting` | `dim_asset_class` | `asset_class_code = asset_class_code` | Many to one |
| `vw_aum_reporting` | `dim_portfolio` | `portfolio_id = portfolio_id` | Many to one |
| `vw_aum_reporting` | `dim_date` | `as_of_date = date_key` | Many to one |
| `vw_net_flows` | `dim_date` | `as_of_date = date_key` | Many to one |
| `dim_client_safe` | `dim_advisor` | `advisor_id = advisor_id` | Many to one |

All six are Many to one — a fact table joining to its dimensions. Declare them even though they look
obvious. Genie does not read a foreign key you never told it about.

**Check it worked:** ask *"how many accounts do we have?"* and compare with
`SELECT count(*) FROM dim_account`. The two should match. If the agent's number is a multiple of the
real one, a join is still fanning out.

---

**Step 4 — Author 8 SQL expressions (12 min).**

Same screen as Step 3. Start with one filter.

1. Click **Configure**, then **Examples**.
2. Click **Add**, then choose **Filter**.
3. **Name:** `Settled only`
4. **Code:** `status = 'SETTLED'`
5. **Save.**

Now add the other two filters the same way:

| Name | Code |
|---|---|
| `Discretionary` | `is_discretionary` |
| `External money` | `NOT is_internal` |

Next the measures. Same path, but choose **Measure** at step 2 — and this form has a **Synonyms**
field, which is where the AUM and AUA synonyms belong:

| Name | Code | Synonyms |
|---|---|---|
| `aum_usd` | `SUM(CASE WHEN is_discretionary THEN managed_value_usd ELSE 0 END)` | AUM, managed assets, book of business |
| `aua_usd` | `SUM(total_advised_value_usd)` | AUA, advised assets, total assets |
| `net_flows_usd` | `SUM(external_sign * amount_usd)` | net new money, net sales, flows |
| `avg_account_value` | `SUM(managed_value_usd) / NULLIF(COUNT(DISTINCT account_id), 0)` | average account size |

Finally one field. Same path, choose **Field**:

| Name | Code |
|---|---|
| `account_size_band` | `CASE WHEN managed_value_usd < 250000 THEN 'Retail' WHEN managed_value_usd < 5000000 THEN 'Affluent' ELSE 'Institutional' END` |

> **Look carefully at the two AUM rows.** "Total assets" sits on `aua_usd`, not `aum_usd`. Put it on
> AUM instead and every question about total assets silently adds the held-away money to your
> headline figure. It will look like a good quarter.

**Check it worked:** ask for *"net new money last quarter"*, then ask for *"net flows last quarter"*.
Same number both times, because both now resolve to `net_flows_usd`.

---

**Step 5 — Check your snippet budget (2 min).**
Table descriptions, join relationships and SQL expressions **share one ceiling of 200 per agent**.
Text instructions, example queries, SQL functions and column descriptions do **not** count.
*You know it worked when:* you can state your number, not guess it.

**Step 6 — Re-run the nine broken answers from Lab 4 (5 min).**

This is the point of the lab. Everything above was setup.

1. Print the nine questions again — they ship with the course, so you do not need your notes:
   ```python
   academy.lab('genie-agents', 4)
   ```
2. Ask your agent each one, in order.
3. Fill in this table as you go:

   | # | The question | Passes now? | If not, which layer owns the fix? |
   |---|---|---|---|
   | 1 | "What do we manage?" | | |
   | 2 | "AUM at the end of last year" | | |
   | 3 | "How did our California advisors do?" | | |
   | 4 | "Net sales in FY2026 Q3" | | |
   | 5 | "Allocation by asset class" | | |
   | 6 | "What is our AUM?" | | |
   | 7 | "What was our return last year?" | | |
   | 8 | "Which clients have the largest balances?" | | |
   | 9 | "Total flows in March" | | |

4. For every row you marked as still failing, name the layer: **data**, **knowledge store**,
   **example query**, **instruction**, or **not a defect**.

**Some will still fail, and that is the exercise.** Not all nine are knowledge-store problems.

Number 7 is the clearest case. *"What was our return last year?"* stays ambiguous however many
synonyms you add, because the ambiguity is real — gross, net and money-weighted are all defensible
answers and the agent cannot know which you meant. No synonym fixes that. It needs an instruction
that makes the agent **ask**, and that is Module 10.

Number 8 is a different kind again: if identifiers are still reaching the answer, that is a
governance fix in Unity Catalog, not anything you do in this screen.

**Check it worked:** you can say, for each of the nine, which layer owns the fix. Not that all nine
pass — they will not, and an author who thinks they should is the one who ends up writing prose to
patch a data problem.

**Graded by machine.** `academy.check_lab('genie-agents', 9)` runs 6 checks against your work. This lab grades your agent, so it needs no schema.
### Common mistakes
- Adding synonyms to the column but not the values (or vice versa).
- Wrong cardinality (One-to-Many where it's Many-to-One) → fan-out and inflated totals.
- Encoding a metric in a **text instruction** instead of a **measure expression**.
- Exposing a snapshot table with no `Reporting dates only` filter.
- Adding "return" as a synonym for one of the return columns, instead of asking which one is meant.
- Burning the 200-snippet budget on low-value descriptions.


---

## Module 10 — Instructions, Example SQL, and Trusted Assets
**Level:** Advanced · **Duration:** 90 min

**Summary:** Prefer SQL to prose. Worked examples, parameterised queries and UC functions pin intent down where instructions only suggest it.

### Start here: the starter question you planted

At the end of Module 8 you did something deliberately wrong. You added a sixth starter question that
you knew was ambiguous — **"What was our AUM?"** — ran it, and kept the answer.

Go and look at that answer now.

It returned a number. A confident, formatted, defensible number. And it did not tell you which of
the three AUM definitions it used: discretionary only, all managed, or managed plus held-away. In
this dataset those differ by about eleven percent, which is more growth than most quarters produce.

Nothing you have built so far fixes this. The data is clean — Module 7 made it so. The vocabulary is
taught — Module 9 did that. But the question is genuinely ambiguous, and **the honest response is not
an answer at all.** It is a question back.

This module is about the last layer: what you tell the agent to *do* when the data cannot decide.

### Everything here spends from one budget of 100

Before the tools, the constraint, because it shapes every choice you make.

An agent holds **100 instructions**. And the accounting is not what people expect:

- every **example SQL query** counts as one
- every **SQL function** registered as a trusted asset counts as one
- the **entire General instructions text block** counts as one

So ten example queries, two functions and your whole prose block is thirteen — not twelve plus
however many paragraphs. That is a generous budget if you spend it on examples and a wasted one if
you spend it on prose.

This budget is separate from the 200 knowledge store snippets in Module 9. Different pool, different
purpose.

Here is how a mature Meridian agent actually spends it:

```
40  example SQL queries      the top 40 recurring business questions
 8  UC functions             aum_by_asset_class, net_flows, to_usd, fiscal_period,
                             benchmark_relative, flows_by_channel, account_growth,
                             reporting_date_resolver
12  text instruction blocks  fiscal calendar, AUM terminology, return clarification,
                             flow netting, settled-only rule, currency handling,
                             summary formatting, data freshness, ...
── 60 used, 40 held in reserve
```

**Leaving headroom is professional practice, not laziness.** Monitoring will surface questions you
did not predict — Module 12 is about exactly that — and an agent with no budget left cannot absorb
what it learns.

### Four tools, weakest last

They are not interchangeable, and the order matters because people reach for them in exactly the
wrong sequence.

| Tool | Use it when | Strength |
|---|---|---|
| **Trusted asset** (UC function) | the logic is settled and must never be re-derived | strongest |
| **Example query** | there is a shape of question you want answered a specific way | strong |
| **Parameterised example** | that shape recurs with a different period or filter | strong |
| **Text instruction** | it genuinely cannot be expressed as SQL — a convention, a clarification rule | weakest |

The rule of thumb: **if you can show it, do not describe it.** One worked query teaches more per
instruction than a paragraph, and unlike a paragraph it cannot be misread.

### Example queries — the title is the feature

This is the part people get wrong, and it is not obvious.

The **title** of an example query is what Genie matches a user's question against. So the title must
be the user's sentence, not a query name:

❌ `q_aum_ac_fq`
✅ `What was our AUM by asset class at the end of last fiscal quarter?`

Write titles you could paste into the chat box and have them read naturally. If a title needs a
glossary to understand, it will never match anything a user types.

Here is one example carrying five lessons at once:

```sql
-- Title: What was our AUM by asset class at the end of last fiscal quarter?
SELECT ac.asset_class_name,
       SUM(v.managed_value_usd) AS aum_usd
FROM   genie_agent.mfg_core_vw_aum_reporting v
JOIN   genie_agent.mfg_core_dim_asset_class  ac ON ac.asset_class_code = v.asset_class_code
WHERE  v.fiscal_quarter = :fiscal_quarter   -- Format 'FY2026-Q3'. Fiscal year starts Oct 1.
  AND  v.as_of_date = (                     -- the quarter's last reporting date
         SELECT max(as_of_date) FROM genie_agent.mfg_core_vw_aum_reporting
         WHERE fiscal_quarter = :fiscal_quarter)
  AND  v.is_discretionary                   -- AUM excludes advisory-only mandates
GROUP BY ac.asset_class_name
ORDER BY aum_usd DESC
```

The title is the user's sentence. The parameter comment explains the format *and* the fiscal quirk.
The view has already handled currency and the snapshot grain, so neither appears here. The
discretionary filter pins down which AUM this is. And the join path is demonstrated rather than
described — which is worth more than a paragraph saying "join asset class on the code".

### Parameters, and why the comment matters more than the type

A parameterised query handles a whole family of questions. The syntax is a colon:

```sql
WHERE v.fiscal_quarter = :fiscal_quarter  -- Format 'FY2026-Q3'. Fiscal year starts 1 October.
```

Types available: String, Date, Date and Time, Decimal, Integer.

**Always comment the valid values and the business quirk.** That comment is how Genie picks a
sensible value — it is not documentation for humans, it is an input. A parameter named
`:fiscal_quarter` with no comment invites `Q3`, `2026-Q3`, `FY26Q3` and three other guesses.

### Trusted assets — logic that cannot be re-derived

A Unity Catalog function registered as a trusted asset is the strongest thing in this module. Genie
calls it rather than writing its own SQL for that calculation.

Module 7's `06_curated` already created four you can use:

| Function | What it settles |
|---|---|
| `aum_by_asset_class(as_of)` | which AUM, at a reporting date, excluding held-away |
| `net_flows(from, to)` | flow netting, with exchanges excluded |
| `to_usd(amount, ccy, date)` | conversion at the as-of rate |
| `fiscal_period(label)` | what 'FY2026-Q3' actually means in dates |

Two things a trusted asset buys you that an instruction cannot. The logic is **verified once** and
used as-is. And it **hides the implementation** — nobody asking for net flows has to know that
exchanges are excluded, because they cannot get a version where they are not.

What one looks like:

```sql
CREATE OR REPLACE FUNCTION genie_agent.mfg_core_net_flows(
  from_date DATE COMMENT 'Inclusive start, on settlement date.',
  to_date   DATE COMMENT 'Inclusive end, on settlement date.'
) RETURNS TABLE (gross_sales_usd DECIMAL(20,2), redemptions_usd DECIMAL(20,2), net_flows_usd DECIMAL(20,2))
COMMENT 'Net new money between two settlement dates. Excludes exchanges between Meridian
         products and anything not settled. Owner: Wealth Analytics. Do not recompute by hand.'
RETURN ...
```

Note the comments on the parameters and the function. They are how a reader — and Genie — knows that
`from_date` means settlement date rather than trade date, which is a distinction that has caused at
least one restatement at this firm.

### Text instructions — the last resort, written well

Sometimes prose is genuinely the only option: a naming convention, a formatting standard, or a rule
about when to ask rather than answer.

Specificity is everything. The docs call out vague instructions as a common failure, and the
difference looks like this:

| ❌ Vague | ✅ Specific |
|---|---|
| "Use the right calendar" | "The fiscal year starts 1 October. FY2026 is 2025-10-01 to 2026-09-30. 'Last quarter' means the prior **fiscal** quarter unless the user says calendar. A quarter-end figure uses the last **business** day." |
| "AUM should be accurate" | "'AUM' with no qualifier means **discretionary managed assets in USD**, excluding held-away. Use 'AUA' for the wider figure, and say which you used." |
| "Handle flows carefully" | "Net flows = subscriptions and transfers in, **less** redemptions and transfers out. **Exclude exchanges** — they move money between Meridian products. Settled instructions only." |
| "Be helpful in summaries" | "In summaries: report USD in millions with thousands separators, state the reporting date in every headline number, and say which AUM definition you used." |
| "Never show PII" | **Delete this one.** It does nothing. An instruction cannot enforce access — column masks can, and that is Module 6. |

That last row is the one worth pausing on. A written rule about PII feels like a control and is not
one. It survives exactly as long as the model chooses to follow it, which is not a guarantee you can
give a regulator.

**Keep it short.** Databricks documents the count limit — 100 instructions — and publishes no
character limit at all. What is observed in practice is degradation from around 5,000–7,000
characters, past which parts of a long block may be silently ignored. Treat that as an operating
heuristic, not a published limit, and do not quote it to a client as documented.

Either way it argues for the same discipline: prose ranks lowest, and past some length it can be
dropped without telling you.

### The clarification rule — how to make it ask

This is what fixes your planted starter, and it has a shape worth copying — four parts, all required:

```
TRIGGER   — when does this apply?
MISSING   — what detail is absent?
ACTION    — ask before querying
EXAMPLE   — the exact question to ask
```

Written out, for return:

> **When** a user asks about return or performance without saying which measure, **ask** before
> running any query. **Example:** "Do you mean time-weighted net of fees, which is what we report to
> clients, or money-weighted, which reflects that client's own cash-flow timing?"

Note what it does not do. It does not pick a default and mention the choice in a footnote. A
footnote on a number nobody reads is not a clarification — it is cover.

An agent that asks a good question is more useful than one that answers a bad one, and this is the
only tool in the course that produces that behaviour.

### Lab 10 (40 min) — GRADED
Everything here spends from one budget of **100 instructions**. Spend it deliberately.

**Before you start:** your agent from Lab 9, and the ambiguous "What was our AUM?" starter you kept
from Lab 8 step 8.

All of this lives in **Configure → Examples**, the same screen as Lab 9's joins and expressions.

---

**Step 1 — Add your first example query (5 min).**

Do one slowly.

1. Click **Configure**, then **Examples**.
2. Click **Add**, then choose **Example SQL query**.
3. In **Title**, type the user's sentence — not a query name:
   `What was our AUM by asset class at the end of last fiscal quarter?`
4. In the SQL box, paste:
   ```sql
   SELECT ac.asset_class_name, SUM(v.managed_value_usd) AS aum_usd
   FROM   genie_agent.mfg_core_vw_aum_reporting v
   JOIN   genie_agent.mfg_core_dim_asset_class  ac
     ON   ac.asset_class_code = v.asset_class_code
   WHERE  v.is_discretionary
     AND  v.as_of_date = (SELECT max(as_of_date)
                          FROM genie_agent.mfg_core_vw_aum_reporting)
   GROUP BY ac.asset_class_name
   ORDER BY aum_usd DESC
   ```
5. **Save.**

**Check it worked:** ask the agent that exact question. You should get the same shape of answer the
example produces.

---

**Step 2 — Add nine more (10 min).**

Repeat Step 1 for nine further questions. Take them from what people actually ask — the starters you
wrote in Lab 8 are a good source, and so is Lab 4's list.

Cover at least these shapes:

| Shape | Example title |
|---|---|
| A total | "What is our total AUM right now?" |
| A breakdown | "AUM by region" |
| A comparison | "AUA versus AUM" |
| A period | "Net flows by fiscal quarter" |
| A count | "How many funded accounts do we have?" |

Write every title as a sentence you could paste into the chat box.

---

**Step 3 — Parameterise three of them (8 min).**

1. Open one of your period-based examples.
2. Replace the hard-coded period with a parameter:
   ```sql
   WHERE v.fiscal_quarter = :fiscal_quarter  -- Format 'FY2026-Q3'. Fiscal year starts 1 October.
   ```
3. Set the parameter **type** — `String` here, `Date` for a date.
4. **Save.**
5. Repeat for two more.

The comment is not decoration. It is how Genie chooses a sensible value, and without it you will get
`Q3` and `2026-Q3` and three other guesses.

**Check it worked:** ask the same question for two different quarters. Both should answer, and the
numbers should differ.

---

**Step 4 — Register two trusted assets (6 min).**

1. In **Configure → Examples**, click **Add**, then **SQL function**.
2. Select `genie_agent.mfg_core_aum_by_asset_class` — this one settles the AUM definition.
3. **Save.**
4. Repeat for `genie_agent.mfg_core_net_flows`, which settles the flow netting.

Both were created for you by `06_curated` in Module 7. Registering them means Genie calls the
verified logic instead of rewriting it, and nobody asking for net flows has to remember that
exchanges are excluded.

**Check it worked:** ask for net flows over a date range and confirm the answer uses the function
rather than a fresh `SUM`.

---

**Step 5 — Write four instruction blocks (8 min).**

1. Go to **Configure → Instructions**.
2. Write four sections, organised by topic: **terminology**, **fiscal calendar**, **formatting**,
   **summaries**.
3. Keep the whole thing short — it counts as one instruction no matter how long, and long blocks
   degrade.

Be specific enough to follow. "Use the right calendar" is not an instruction; the fiscal-calendar
example in this module is.

---

**Step 6 — Write the clarification rule that fixes Lab 8 (5 min).**

This is the one that matters.

1. In the same instructions area, add a section for **return**.
2. Use the four-part shape — when, ask, example, then:

   > **When** a user asks about return or performance without saying which measure, **ask** before
   > running any query. **Example:** "Do you mean time-weighted net of fees, which is what we report
   > to clients, or money-weighted, which reflects that client's own cash-flow timing?"

3. **Save.**
4. Now re-run **"What was our AUM?"** — the starter you planted in Lab 8.

**Check it worked:** the agent asks which AUM you mean instead of picking one. Compare its response
with the answer you kept from Lab 8. That difference is what this module bought you.

---

**Step 7 — Submit your instruction budget (3 min).**

Count what you spent and write it down:

| | Count |
|---|---|
| Example queries | 10 |
| SQL functions | 2 |
| General instructions block | 1 |
| **Total, against 100** | **13** |

Then get graded:

```python
academy.check_lab('genie-agents', 10)
```

Four checks. Whether your clarification rule is any good is read by a person — a checker can count
instructions and cannot tell whether the question you wrote is one a user would understand.

### Common mistakes
- Generic SQL patterns as examples (Genie already knows `GROUP BY`) instead of **organisation-specific logic**.
- Conflicting guidance between a text instruction and a SQL expression → nondeterministic answers. The docs are explicit: *"a key task is to review and resolve any inconsistencies."*
- Parameters with no comment → Genie guesses the format.
- Reaching for text instructions first.
- Using instructions to attempt a security control.


---

### LEVEL 4 — QUALITY AND OPERATIONS

---

## Module 11 — Test, Benchmark, and Prove It's Right
**Level:** Advanced · **Duration:** 90 min

**Summary:** Build a benchmark set with known-correct answers, so you can state accuracy as a number instead of asserting it.

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
| **Tier 3 — Traps** | 30 | **one per planted flaw, minimum** — fiscal vs calendar, reporting vs calendar month end, AUM vs AUA, snapshot summing, exchanges in net flows, unsettled instructions, gross vs net vs money-weighted return, portfolio return vs benchmark return, state/region phrasing, currency mixing, both asset-class hierarchies | ≥ 80%, and every failure gets a ticket |

### Business example — three Tier-3 trap benchmarks
```
Q: "What was our AUM last quarter?"                                    [flaws 1, 2]
Expected: asks which AUM definition and which quarter, OR returns discretionary
          managed AUM at the last reporting date of the prior FISCAL quarter and
          says so explicitly.
Fails if:  it includes held-away assets, or uses the calendar quarter.

Q: "What do we manage in total?"                                       [flaw 6]
Ground truth: SELECT sum(managed_value_usd) FROM ..vw_aum_reporting
              WHERE as_of_date = (SELECT max(as_of_date) FROM ..vw_aum_reporting)
                AND is_discretionary
Fails if:  the result is more than 2x the ground truth (it summed snapshots).

Q: "What were net flows in Q2?"                                        [flaw 4]
Ground truth: SELECT * FROM ..net_flows('2026-01-01','2026-03-31')
Fails if:  gross sales exceed ground truth by more than 5% — it counted
           exchanges as subscriptions.

Q: "What was our return last year?"                                    [flaw 7]
Expected: asks whether time-weighted net of fees or money-weighted.
Fails if:  it silently picks one without saying which.
```

### Business example — the fix loop
```
1. Sales lead asks "net flows for my region last month" → wrong (counts CANCELLED)
2. She clicks "Fix it"
3. Author opens the response, clicks Show code, sees the missing status filter
4. Author edits the SQL, verifies the number, and SAVES IT AS AN EXAMPLE QUERY
5. Adds it to the Tier-3 benchmark set
6. Re-runs benchmarks → confirms no regression elsewhere
```
**Teaching line:** *every "Fix it" is a free curation task with the answer already attached.*

### Lab 11 (40 min) — GRADED
An agent nobody measured is an agent nobody should trust. This lab produces the evidence.

**Before you start:** your agent from Lab 10.

---

A Genie Agent holds up to **500 benchmark questions**, so 30 is a starting set, not a ceiling.

**Step 1 — Write 10 smoke questions (6 min).**
Questions that must **always** work: total AUM, AUA, account count, client count, average account
value. If a smoke question fails, the agent is broken, not merely imperfect.
*You know it worked when:* every one has a single unambiguous right answer.

**Step 2 — Write 12 coverage questions (10 min).**
One per topic the agent claims to answer. Walk your own description from Lab 8 and turn each clause
into a question: AUM by asset class, by region, by state, by segment, by strategy; net flows by
quarter, by type.
*You know it worked when:* anything your description promises has a question testing it.

**Step 3 — Write 8 trap questions, at least one per planted flaw (12 min).**
This is where the marks are. One per flaw:

| Trap | The flaw it catches |
|---|---|
| "AUM last year" | fiscal vs calendar year |
| "Total AUM across the month" | summing a daily snapshot |
| "AUM in California" | value matching — the column holds `CA` |
| "Net new money" | exchanges double-counted |
| "Gross sales" | `EXCHANGE_IN` wrongly included |
| "What we advise on" | held-away vs managed |

**Two of the eight must be questions where the correct behaviour is to ASK, not answer.**
"What was our return last year?" is one — gross, net and money-weighted are all defensible.
"How much do we manage for a client?" is another — household, relationship or account.

Those two have **no ground-truth SQL**, and that is deliberate. Answering them at all is the failure.

**Step 4 — Write ground-truth SQL for the other 28 (10 min).**
Every question needs the answer you believe is right, as SQL. Run each one yourself first — a
benchmark whose expected answers were never executed measures nothing.
*You know it worked when:* all 28 execute clean and you have read the numbers.

**Step 5 — Run the benchmark and record the score (5 min).**
Write the number down before you change anything. You cannot report an improvement you did not
baseline.

**Step 6 — Fix the top 3 failures, then re-run (12 min).**
Use the edit-and-save loop. For each fix, name the **layer** you fixed it in — data, knowledge store,
example query, or instruction. Fixing in the wrong layer works once and rots.

Report before and after, with the layer for each fix. **The layer is what is marked**, not the delta.


---


**Graded by machine.** `academy.check_lab('genie-agents', 11)` runs 3 checks against your work. This lab grades your agent, so it needs no schema.
## Module 12 — Monitor, Triage, and Keep It Accurate Over Time
**Level:** Advanced · **Duration:** 60 min

**Summary:** Find quality problems before users report them, and turn each piece of feedback into a curation change that lasts.
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
| AUM includes held-away | text instruction "exclude held-away" | an `aum_usd` **measure expression** that excludes it, and a view that splits the two columns (Modules 7, 9) |
| AUM is 30× too high | re-ask the question | **join cardinality** + `Latest snapshot` filter + EOP view (Modules 7, 9) |
| Wrong year | a note in the description | **fiscal calendar instruction** + `dim_date` fiscal columns (Modules 7, 10) |
| Flow totals too high | ignore it | a **`status = 'SETTLED'` filter expression**, and exclude exchanges (Module 9) |
| "Net flows" answered inconsistently | more prose | **two named measures** + a **clarification instruction** (Modules 9, 10) |
| A complex recurring question is always slightly off | more text instructions | **example query** or **UC function** as a trusted asset (Module 10) |
| Genie asserts a *cause* ("outflows rose because of the fee change") | forward it to the CIO | it's an **unsupported claim** — tighten context, remove overlapping tables, diagnose with Genie Code. Genie retrieves; it does not diagnose (Module 2). |
| Answers pull from `fct_aum_legacy` | delete the table and break downstream | **certify** `fct_aum_snapshot` and **deprecate** the legacy table with `system.certification_status`, then stop exposing it to the agent (Modules 6, 7) |
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


---


**Reviewed by a person.** No automatic grade: the judgement *is* the exercise. `academy.lab('genie-agents', 12)` prints the brief, the material this lab works on, and what a reviewer looks for.
## Module 13 — Performance: Why Genie Feels Slow, and What Actually Fixes It
**Level:** Advanced · **Duration:** 90 min · **Audience:** authors + platform owners

**Summary:** Split a slow answer into thinking time and query time first, because the fixes for the two are entirely different.

> This module needs the **large** data
> tier — see Module 0 section 0.0. Build it into its own schema *before* the session, not during
> it: 900M flow events takes tens of minutes of real compute, and only `03_facts` scales.
>
> ```python
> academy.install('genie-agents', tier='large', schema='large_tier')
> # then run 01, 02, 03 and 04 from that folder, and:
> academy.create_agents('genie-agents', schema='large_tier',
>                       title_suffix='(large tier)')
> ```
>
> The suffix matters: without it the large-tier agent collides with the one you
> already built, and you want both — the small-tier agent is what every other
> module uses.
>
> **What this actually produces**, measured on a Free Edition serverless warehouse:
> 900,000,000 flow events, 35.2M daily snapshots, and a first question answered in
> **26 seconds**. The answer was also wrong, which is the point — the agent wrote
> `flow_type ILIKE '%transfer in%'` against a column holding `TRANSFER_IN`, matched
> nothing, and reported null without flagging it. One response gives you both the
> latency to diagnose and the failure to explain.
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

**Documented by Databricks** — quote these freely:

| Limit | Value | What happens at the limit |
|---|---|---|
| Tables/views per agent | **30** (docs advise **≤ 5**) | worse routing, slower thinking |
| **Instructions** | **100 per agent** — each example SQL query, each SQL function, and the *entire* General instructions block each count as **one** | no room for the instruction that would have fixed the answer |
| **Knowledge store snippets** | **200 per agent** — table descriptions, join relationships and SQL expressions (measures, filters, dimensions) share this limit; text instructions, example queries, SQL functions, column descriptions and prompt matching do **not** count | extra context stops being used |
| Entity matching | string columns only; up to **120 columns**; **1,024 distinct values** per column, each **≤ 127 characters** | values beyond the cap are not matched |
| Conversations | **10,000 per agent**, each up to **10,000 messages** | — |

**Observed in practice, not published by Databricks** — useful, and worth planning for, but
label them as such in front of a client:

| Heuristic | Observed value | What happens |
|---|---|---|
| General instructions length | degrades around **~5,000–7,000 chars** | Genie may **silently ignore** parts of long instructions |
| SQL query time | **~90 sec** | query returns a timeout error |
| Backend response | **~597 sec (~10 min)** | "runaway" answer — **billed but never shown.** The docs' own API guidance is to stop polling after 10 minutes and return a timeout |
| Ontology snippets for good coverage | ~1,000+ (non-CMK workspace) | too few = little learned context |
| AI model requests | 200/sec shared · 300,000/sec dedicated | heavy sequential use hits **429 / rate limit** |

The split matters. The first table is what you promise; the second is what you plan for.

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
| Hitting the **~90-second** query ceiling? | keep the warehouse warm; filter and cluster big tables. Field-observed, not a published limit, and not a config knob. |
| Managed tables with **Predictive Optimization** on *and running*? | enable PO and confirm it is actually running |
| **Liquid Clustering** on filter/join columns? | cluster `fct_flows` on `settlement_date`, `account_id`; `fct_aum_snapshot` on `snapshot_date`, `account_id` |
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
Complaint: regional sales leads say it takes 40 seconds.

Measurement:
  execution_duration_ms                 4,100 ms   ← the SQL is fine
  gap before EXECUTING_QUERY           31,000 ms   ← thinking dominates
  poll-loop overhead (own code)         3,200 ms   ← self-inflicted
Verdict: a thinking problem, plus 3 seconds we added ourselves.

What the agent actually looked like:
  all 14 base objects, including fct_holdings_raw (380 columns) and fct_aum_legacy
  10,300 characters of prose instructions ← well over the ~5–7k degradation threshold
  no join specs declared

Fixes applied:
  → 14 objects down to 7 (Module 7)
  → 380-column raw table replaced with a slim view
  → prose cut to 916 chars; the rest became SQL snippets + 3 example queries
  → poll interval fixed at 2 s with a proper backoff
Result: ~14 seconds total.

The warehouse was never the problem — and the platform team had already
doubled it. Twice. For nothing.
```
**Teaching line:** *"Doubling the warehouse when the thinking is slow is like buying a faster car to fix a traffic jam."*

### Lab 13 (40 min) — GRADED
Given the deliberately slow MFG agent on the Large tier: measure both halves using `system.query.history` and the Conversation API, produce a written diagnosis, apply **at least three fixes at the correct layer**, re-measure, and report before/after with evidence. **Grading rewards a correct diagnosis over a large speedup** — a learner who correctly identifies a thinking-bound problem and improves it 20% scores higher than one who doubles the warehouse and gets lucky.

**Reviewed by a person.** `academy.check_lab('genie-agents', 13)` confirms the 3 prerequisites only — the judgement is what is being assessed. This lab grades your agent, so it needs no schema.

**The material for this lab ships with the package.** `academy.lab('genie-agents', 13)` prints the brief and *measurement worksheet — fill this in before you change anything* — so you can start without waiting for a handout.
### Common mistakes
- Scaling the warehouse for a thinking-bound problem.
- Timing Genie from system-table timestamps.
- Blaming Genie for latency your own poll loop added.
- Treating the 90-second SQL limit as a configuration knob.
- Tuning before measuring.


---

## Module 14 — Errors, Known Issues, and Escalation
**Level:** Advanced · **Duration:** 60 min

**Summary:** Read the common error signatures, gather the evidence support actually needs, and tell apart the problems that are yours to fix.

> The purpose of this module is to stop authors burning days on problems that were never theirs to fix.

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

3. "I got a 7.4% return yesterday and 6.9% today"
   → EXPECTED VARIATION + a stale thread. Genie had picked twr_gross one day
     and twr_net the other, because 'return' was still ambiguous.
     Real fix: two named measures + a clarification instruction, then a
     benchmark run proving 96% accuracy — and one honest conversation
     with the CRO about guidance vs guarantee.
```
**Teaching point:** only one of the three was the author's bug. Knowing which is which is the skill this module sells.

### Lab 14 (30 min)
Given 8 real symptom reports, classify each (curation / platform bug / performance / expected variation / governance), name the evidence to capture, and write the escalation note for the two that are platform bugs.


---


**Reviewed by a person.** No automatic grade: the judgement *is* the exercise. `academy.lab('genie-agents', 14)` prints the brief, the material this lab works on, and what a reviewer looks for.
## Module 15 — Cost, Budgets, and Scaling to Many Domains
**Level:** Advanced · **Duration:** 60 min · **Audience:** authors + platform owners

**Summary:** How Genie is billed, where budgets bite, and how to run several agents without their definitions drifting apart.
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
Per-user threshold        $25 / month      alert only — never block a regional
                                           sales lead during quarter-end review
Override: Performance team $250 / month    they run agent-mode research
Override: svc-genie-portal (service principal, no free tier)
                           $500 / month    blocking ON
Review: billing system tables, monthly, in the FinOps dashboard
```
**Teaching point:** **block service principals, alert humans.** A runaway integration loop is the real cost risk; a curious sales lead is not.

### Business example — MFG's agent portfolio
| Agent | Audience | Objects | Owner |
|---|---|---|---|
| Wealth & Distribution | 340 regional sales leads, distribution leadership | 6 | Wealth Analytics |
| Investment Performance | 45 portfolio managers, CIO office | 6 | Performance & Attribution |
| Institutional & Consultant Relations | 30 institutional sales, the RFP desk | 5 | Institutional Analytics |
| Product & Fund Operations | 25 product managers, fund accounting | 7 | Product Analytics |
| Client & Advisor Insight | 20 relationship managers | 5 | Client Analytics |

Shared foundation so definitions don't diverge: the **`mv_wealth_metrics` metric view**, which
declares `AUM`, `Assets Under Advisement` and `Held Away Assets` once · shared **UC functions**
(`aum_by_asset_class`, `net_flows`, `to_usd`, `fiscal_period`) · one company-wide fiscal-calendar
instruction block reused in every agent.

> **The anti-pattern:** five agents each defining "net flows" slightly differently, one of which
> feeds a client report or a composite that has been GIPS-verified. In asset management that
> isn't a trust problem — a number that doesn't tie is a finding. Metric views exist to prevent
> exactly this: `AUM` is defined in one place, and every agent that asks for it gets the same
> arithmetic.

**Portfolio hygiene:** delete old and unused agents. Too many agents hurts routing for everyone in the workspace.

### Lab 15 (25 min)
Design an agent portfolio for an asset manager (or, if learners prefer, their own firm's shape):
4–6 agents with audience, objects and owner, plus the shared metric-view foundation and a budget
plan with thresholds and blocking decisions. Name at least one metric that must be defined once
and shared, and say which agent would cause the most damage by redefining it.


---

**Reviewed by a person.** No automatic grade: the judgement *is* the exercise. `academy.lab('genie-agents', 15)` lists what a reviewer looks for.
### LEVEL 5 — ADVANCED / EXTEND

---

## Module 16 — Extend Genie: API, Embedding, Multi-Agent, CI/CD
**Level:** Advanced · **Duration:** 90 min · **Audience:** authors + developers

**Summary:** Drive an agent from the Conversation API, embed it, combine it with other sources, and put its configuration under version control.

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
User: "Why did emerging-market equity outflows accelerate in Q3, and what did
       the investment committee say about it?"

Supervisor routes:
  → Wealth & Distribution Genie Agent   : net flows by channel, FY2026 Q3        (structured)
  → Investment Performance Genie Agent  : return vs benchmark, EQ_EM portfolios  (structured)
  → Knowledge Assistant                 : Q3 investment committee memos          (unstructured)
  → Web search                          : EM index drawdown, peer fund flows     (external)

Synthesised answer: EQ_EM net outflows were driven by the intermediary
channel, concentrated in two share classes that had trailed their benchmark
for three consecutive quarters — matching the committee's own flagged
concern, and in line with sector-wide EM redemptions over the period.
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


---


**Reviewed by a person.** `academy.check_lab('genie-agents', 16)` confirms the 2 prerequisites only — the judgement is what is being assessed. This lab grades your agent, so it needs no schema.
## Module 17 — Capstone: Ship a Business-Ready Genie Agent
**Level:** Advanced · **Duration:** 4–6 hours (or a 1-week project)

**Summary:** Ship an agent a business team could use on Monday, with a charter, a measured benchmark score and a governance review.
### The brief
Learners pick a domain — their own real one if available, otherwise one of the provided
asset-management profiles (distribution, investment performance, institutional relations, product
and fund operations) — and deliver an agent a business team could use on Monday.

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

### When you are finished with the workspace
Module 0 section 0.9 covers this, and notebook `100_cleanup` does it:

```python
academy.cleanup('genie-agents')                # dry run
academy.cleanup('genie-agents', confirm=True)  # remove it
```

Do it once the capstone is assessed, not before — the checks in this module read the agent you
built, and cleanup deletes it.

### Checking your own work first
Before you submit, run the checks the earlier labs used. The capstone re-checks them in one pass:

```python
academy.check_lab('genie-agents', 17, schema='<your schema>')
```

Five checks: the agent exists and is narrow, starter questions are set, the knowledge store has
its SQL expressions, example queries are present, and a benchmark exists with ground truth — the
work of Labs 7 through 11, assembled. The handover document is read by a person.

### Pass bar
≥ 70 points, **and** Tier-1 smoke tests at 100%, **and** the readout explicitly states what the agent should *not* be asked *and* that consistency is guidance rather than guarantee above the Unity Catalog layer. (Stating limits is a graded requirement — it is what makes an agent trustworthy in production.)

---

## Part B — Course Assets to Produce

**Summary:** Everything that has to be built or written before the course can run, with the dependencies between them.

| Asset | Count | Notes |
|---|---|---|
| **Meridian dataset: DDL + seed notebook** | 1 | **build this first — everything depends on it.** Small (20M) and Large (900M) tiers; nine planted flaws; 12-statement validation script |
| **Synthetic document set for the volume** | 40 PDFs | investment committee memos, advisor call notes, client complaint letters |
| **Governance objects** | 1 set | one row filter, four column masks, three personas |
| Reference agent (fully curated, 7 objects) | 1 | the instructors' answer key |
| Broken agent (uncurated, all 14 base objects, 10,300-char prose) | 1 | Lab 4 diagnosis, Module 7 demo, **Module 13 latency lab** |
| Concept videos | 18 | 6–10 min each, business language per §A.5 |
| Guided demo recordings | 18 | all on the Meridian dataset |
| Lab guides + solution keys | 17 (Lab 0–16) | graded: Labs 2, 6, 7, 8, 9, 10, 11, 13, 16, plus the capstone |
| Knowledge checks | 17 | 4–6 questions each, auto-graded (Modules 0–16) |
| **Cheat sheet: limits & what happens at the limit** | 1 | Two columns, and keep them apart. **Documented:** 30 tables/views · 100 instructions · 200 knowledge store snippets · 500 benchmarks · 120 entity-matching columns × 1,024 values × 127 chars · 10,000 conversations × 10,000 messages. **Observed, not documented:** ~5–7k char instruction degradation · ~90 s SQL · ~597 s backend · 200 req/sec · ~1,000+ ontology snippets. Quoting the second column as documented is how a client loses trust in the first. |
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

**Summary:** What changes fastest in Genie, and what to re-verify before each delivery.

Genie ships fast and the docs were reorganised recently (Spaces → Agents; the Genie One / Agents / Code split). Build the course to survive that:

- **Quote every limit from the single cheat-sheet asset**, never inline in a video script. Limits change; re-recording video is expensive. This applies especially to the operational limits (90 s, ~597 s, 200 req/sec, character ceilings) which are the most likely to move.
- **Never put pricing numbers in a video.** Keep billing details in Module 15's handout with a "verify at `docs.databricks.com/aws/en/genie/budgets`" line. The free-usage window (through Jan 31, 2027) expires during this course's life.
- **Treat the error-signature table as perishable.** Several entries are active bugs, not permanent behaviour. Keep it in a handout with a review date, and re-check each entry quarterly.
- **Review against the AI/BI and Genie release notes quarterly.**
- **Screenshots will drift.** Prefer short screen recordings of *flows* over annotated stills; keep a screenshot inventory for refresh sprints.
- **Flag regional dependencies** (Agent mode availability, cross-Geo processing) as "check your workspace" rather than a fixed answer.
- **Re-verify the latency baseline annually.** There is an active Databricks latency workstream; the ~20 s thinking figure is a current observation, not a specification. Teach the *method* (measure both halves) so the module survives the numbers changing.

---

## Part D — Coverage map: performance and operational issues → this course

**Summary:** Which module covers each known Genie performance and operational issue.

| Topic | Course coverage |
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

**Summary:** The Databricks documentation and internal material this course is grounded in.

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
| What are Compound AI Systems? (blog) | `databricks.com/blog/what-are-compound-ai-systems` |
| Budgets and cost controls | `/aws/en/genie/budgets` |
| Genie Code | `/aws/en/genie-code/` |
| Metric views | `/aws/en/metric-views/` |
| Supervisor Agent (multi-agent) | `/aws/en/generative-ai/agent-bricks/multi-agent-supervisor` |
| Knowledge Assistant | `/aws/en/generative-ai/agent-bricks/knowledge-assistant` |
| Release notes | `/aws/en/ai-bi/release-notes/` |


---

## Part F — Dataset design (instructor reference)

**Summary:** Instructor reference: the flaws planted in the Meridian dataset and the module each one serves. Contains the answers.

> **This page contains the answers.** It catalogues what is wrong with the Meridian dataset
> and which module each problem serves. Module 0 deliberately does not mention any of it, and
> Lab 0 asks learners to notice things for themselves. If you are taking the course rather
> than teaching it, stop here and come back after Module 4.

Every figure the modules quote is measured from a real provisioning run rather than estimated.
Re-run `99_validate` after any change to the generators and update them if they move: a course
that quotes stale numbers teaches learners to distrust it.

**Measured on Databricks Free Edition, small tier.** Provisioning: `01` 21s, `02` 1m 21s, `03`
34s, 2m 16s in total. All fourteen checks PASS.

| Property | Measured |
|---|---|
| Total managed book, latest snapshot | **$98.5B** |
| Summing the snapshot across all dates | **$67.2T, or 682×** the real book |
| Discretionary vs advisory-only | 72.0% / 28.0% |
| Held-away assets | 20.2% of rows, but only 5.3% of managed value |
| Exchanges as a share of flows | 24.0% |
| Flows not settled (pending or cancelled) | 7.0% |
| Average return, gross vs net | 2.99% vs 2.44% |
| Asset-class hierarchies | 5 investment classes vs 3 regulatory |
| Regions / states / channels | 4 / 16 / 4 |
| Rows | 20.0M flows, 35.0M snapshots, 2.1M clients |

Two of these are worth lifting straight into teaching. **682×** is the cost of summing a daily
snapshot, and it is a far more arresting number than "too high". And held-away assets being 20.2%
of rows but 5.3% of value is why the AUM-versus-AUA argument is worth having at all: the choice
changes the headline by a few percent, not by a factor, which is exactly why nobody notices it is
being made.

### F.1 The nine planted flaws

| # | Planted flaw | What breaks without a fix | Taught in |
|---|---|---|---|
| **1** | **AUM has three defensible readings** — discretionary only, all managed, or managed plus held-away. `fct_aum_snapshot` carries `market_value_local` and `held_away_value_local`; `dim_portfolio.is_discretionary` splits the rest | three different headline numbers, each defensible, and no way to tell which one you were given | 5, 7, 9, 11 |
| **2** | Fiscal year starts **Oct 1** (FY2026 = 2025-10-01 → 2026-09-30), and a **reporting date is the last *business* day**, not the last calendar day | "end of Q2" silently means calendar quarter; month-end totals land on a day the market was shut | 5, 10, 11 |
| **3** | `dim_advisor.region` ∈ `NE, SE, MW, WEST`; `state` ∈ `CA, NY, TX…`; `dim_asset_class.asset_class_code` ∈ `EQ_US, FI_CORP, MM_CASH…` — users say "Northeast", "California", "equities", "cash" | confident **zero rows**, or a silently dropped filter | 9, 12 |
| **4** | **Net flows counted naively double-count exchanges.** `fct_flows.flow_type` includes `EXCHANGE_IN`/`EXCHANGE_OUT` — money moving between Meridian products, which should net to zero. `status` also includes `PENDING` and `CANCELLED` | gross sales and redemptions both inflated; net flows unchanged, so the error hides | 7, 9, 11 |
| **5** | `dim_asset_class` carries **two hierarchies**: `investment_class` (how PMs think) vs `regulatory_class` (how reporting rolls up). An ETF of bonds is `FIXED_INCOME` in one and `POOLED_VEHICLE` in the other | rollups mix reporting frames; two answers to one allocation question | 7, 9 |
| **6** | `fct_aum_snapshot` is a **daily snapshot** — summing it across dates multiplies the book by the number of days it has been carried, measured at **682×** | **a plausible wrong number.** The scariest failure in the course, and the most natural mistake here, because AUM is inherently a point-in-time figure | 9, 11, 12 |
| **7** | **Return has three defensible readings** — `twr_gross`, `twr_net` (after fees) and `mwr` (money weighted) — each across six `period_type` values. `fct_performance` also carries `benchmark_return`, which is *not* the portfolio's return at all | several honest answers to "what was our return?" — the reason GIPS exists — plus a fourth column that silently answers a different question | 5, 9, 10, 11 |
| **8** | `dim_client` holds real **PII**: `ssn_last4`, `email`, `dob`, `annual_income` | a governance incident, not a data-quality one | 6, 17 |
| **9** | International portfolios report in **EUR, GBP and JPY**, needing `dim_fx_rate` joined *as of the reporting date*. `fct_flows` also separates `trade_date` from `settlement_date` | currency mixing; totals that don't tie to finance; flows landing in the wrong period | 9, 10 |

Two more flaws are added to the *agent*, not the data, in Module 8: a bloated agent pointed at
all 14 base objects, and 10,300 characters of prose instructions — the raw material for Module 13's latency lab.

**Why this set is stronger than a retail-banking one.** Every ambiguity above is an argument
asset managers genuinely have. AUM versus AUA appears in regulatory filings. The distinction
between time-weighted and money-weighted return is why performance standards exist at all.
Exchanges being counted as sales is a real reporting error with a real name. And AUM is
point-in-time by nature, so the snapshot-summing trap is not a contrived mistake — it is the
one people actually make.

### F.2 Use-case coverage matrix

| Course topic | Module | Data that makes it demonstrable |
|---|---|---|
| Good vs bad questions | 2 | wide question surface across AUM, flows and performance |
| Chat vs Agent mode | 3 | `fct_aum_snapshot` + `fct_performance` + the `mfg_ref_documents` volume |
| Unstructured file analysis | 3, 16 | investment committee memos, advisor notes, complaint letters |
| Compound AI system / diagnosis | 4 | flaws 1–7 each produce a distinct wrong answer |
| Row filters | 6 | `dim_advisor.region` — filter by regional sales lead |
| Column masks | 6 | `dim_client.ssn_last4`, `email`, `dob`, `annual_income` |
| Per-user credentials | 6 | three personas, three correct answers to one question |
| 30-object limit / pre-joining | 7 | 14 base objects → 7 curated (6 objects + 1 metric view) |
| Slim views vs wide tables | 7, 13 | a 380-column `fct_holdings_raw` custodian feed is included |
| Metric views | 7, 15 | `AUM`, `Assets Under Advisement`, `Held Away Assets` used by 3+ agents |
| Certify / deprecate | 6, 12 | two AUM tables ship: `fct_aum_snapshot` (certify) and `fct_aum_legacy` (deprecate) |
| Genie Code bootstrap review | 8 | AI-suggested descriptions get flaws 1 and 5 wrong — learners must catch it |
| Synonyms | 9 | region, state, "equities", "cash", "net new money", "AUA" |
| Entity matching / value dictionaries | 9 | `region`, `state`, `asset_class_code`, `flow_type`, `period_type` |
| Join relationships & cardinality | 9 | `fct_aum_snapshot → dim_account → dim_client → dim_advisor`, plus portfolio/fund |
| The fan-out trap | 9, 13 | flaw 6, the daily AUM snapshot |
| SQL expressions (filter/measure/field) | 9 | flaws 1, 4, 7 all require one |
| Example SQL & parameters | 10 | fiscal-period and asset-class parameters |
| UC functions as trusted assets | 10 | `aum_by_asset_class`, `net_flows`, `to_usd`, `fiscal_period` |
| Clarification instructions | 10 | flaws 1 and 7 — which AUM, and which return |
| Instruction length ceiling | 10, 13 | the planted 10,300-character prose block |
| Benchmarks & scoring | 11 | ground-truth SQL for all nine flaws |
| Monitoring & feedback triage | 12 | seeded conversation history with feedback |
| Nondeterminism expectation-setting | 4, 11, 12 | flaw 7 produces legitimately varying answers |
| Performance: thinking vs query | 13 | bloated agent + the 380-column feed + an unclustered fact table |
| Warehouse & table tuning | 13 | an unclustered 900M-row `fct_flows`, plus the 380-column feed |
| Errors & escalation | 14 | scripted error scenarios |
| Cost & budgets | 15 | five-agent portfolio + one service-principal integration |
| API, tracing, CI/CD | 16 | the whole agent, exported as `serialized_space` |
| Supervisor / multi-agent | 16 | 5 agents + document volume + external context |
