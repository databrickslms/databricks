# Databricks Genie Agents — LMS Course Plan
**From Basics to Advanced · Asset Management · Business-First, Example-Driven**

> Version 3.0 · Planned 2026-08-21
> Grounded in current `docs.databricks.com` (Genie section) **and** the internal *Genie Performance & Issues Playbook & Health Check*.
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
**Level:** Setup · **Duration:** 45 min · **Audience:** Agent Author and Platform tracks

**Summary:** Provision the course dataset in your own workspace, then read it closely enough to find the places where one question has more than one honest answer.

**Deliverable:** a working lab environment for every other module.

Provisioning is quick. On a Databricks Free Edition warehouse the three required notebooks took
**2 minutes 16 seconds** end to end, so start them and read §0.1 and §0.2 while they run. Most of
this module is the twenty minutes you spend reading the data afterwards, which is the part that
matters.

If you would rather watch than read, the walkthrough covers both halves of the setup: creating a
free Databricks workspace from scratch, and installing the dataset into it.

```video
title: Set up Databricks Free Edition and install the Meridian dataset
duration: to be confirmed
src: tbd
```

Everything in the video is written out below, so you can follow either one.

> **Why this is a module and not an appendix.** Every later module works on one firm's data.
> Provisioning it yourself, and spending twenty minutes actually looking at it, is what makes the
> rest of the course concrete rather than theoretical. Instructors may pre-provision it and
> assign this module as pre-work.

### Learning outcomes
1. Provision the course dataset in Unity Catalog.
2. Describe what Meridian's business does and which tables record it.
3. Read the data closely enough to notice where a question could have more than one honest answer.

### 0.1 The company: Meridian Financial Group (MFG)

A mid-size US investment manager. Roughly **$430B** under management across **4,500 portfolios**
and **180 fund share classes**, sold through four channels: **Intermediary** (advisor-sold
funds), **Institutional** (mandates and sub-advisory), **Retirement** (defined contribution
plans), and **Private Client** (high-net-worth). Behind those sit about 2.1M clients, 3,400
advisor relationships, and international portfolios reporting in EUR, GBP and JPY as well as USD.

Asset management suits this course because it forces every hard lesson naturally. The headline
metric has more than one honest definition, and so does performance. Money moving between your
own products isn't a sale. The reporting date isn't the last day of the month. And the business
is regulated, so who can see which client is not a detail.

### 0.2 Schema: one schema, `genie_agent`

| Object | Grain | Key columns | What it powers |
|---|---|---|---|
| `mfg_core_fct_aum_snapshot` | **account × day (daily snapshot)** | `account_id, portfolio_id, fund_id, snapshot_date, local_currency, market_value_local, held_away_value_local, units` | AUM, allocation, growth |
| `mfg_core_fct_flows` | one money-movement event | `flow_id, account_id, trade_date, settlement_date, flow_type, amount_local, local_currency, status` | gross sales, redemptions, net flows |
| `mfg_core_fct_performance` | portfolio × reporting date × period | `portfolio_id, benchmark_id, as_of_date, period_type, twr_gross, twr_net, mwr, benchmark_return` | returns, benchmark-relative performance |
| `mfg_core_dim_portfolio` | portfolio / mandate | `portfolio_id, asset_class_code, benchmark_id, strategy, is_discretionary, base_currency, inception_date, status` | discretionary vs advisory, strategy rollups |
| `mfg_core_dim_fund` | fund share class | `fund_id, fund_name, share_class, asset_class_code, vehicle_type, expense_ratio` | pooled vehicles, fee analysis |
| `mfg_core_dim_asset_class` | asset class | `asset_class_code, asset_class_name, investment_class, regulatory_class` | allocation, and two hierarchies |
| `mfg_core_dim_benchmark` | benchmark | `benchmark_id, benchmark_name, asset_class_code` | benchmark-relative reporting |
| `mfg_core_dim_client` | client | `client_id, client_segment, advisor_id, domicile, tenure_months, ssn_last4, email, dob, annual_income` | segmentation, and the PII |
| `mfg_core_dim_account` | account | `account_id, client_id, portfolio_id, fund_id, opened_date, closed_date, status` | the join hub |
| `mfg_core_dim_advisor` | advisor relationship | `advisor_id, advisor_name, region, state, channel, onboarded_date` | channel and region rollups, row-level security |
| `mfg_core_dim_date` | day | `date_key, fiscal_year, fiscal_quarter, calendar_quarter, is_business_day, is_month_end, is_reporting_date` | fiscal vs calendar, reporting dates |
| `mfg_core_dim_fx_rate` | currency × day | `currency, rate_date, usd_rate` | multi-currency conversion |
| `mfg_staging_fct_holdings_raw` | position × month end | 380 columns from the custodian feed | scoping and latency exercises |
| `mfg_staging_fct_aum_legacy` | account × month end | `account_id, report_date, aum, currency` | certify and deprecate |
| `mfg_ref_documents` *(volume)* | files | investment committee memos, advisor notes, client complaint letters | Agent mode over unstructured files |

An account holds **either** a separately managed portfolio **or** a pooled fund, never both, so
`portfolio_id` and `fund_id` are each null about two-thirds of the time. That is normal in this
business and worth noticing early.

The volume is created empty. Your instructor supplies the document pack that Modules 3 and 16
use; nothing before those modules depends on it.

### 0.3 Getting a workspace

You need a Databricks workspace with Unity Catalog and a SQL warehouse. If your firm has already
given you one, use it and skip to §0.4.

If not, **Databricks Free Edition** is enough for this entire course apart from Module 13. Sign
up at `databricks.com/learn/free-edition` with an email address; there is no credit card and no
cloud account to connect, because Databricks hosts the compute. What you get is a workspace with
Unity Catalog switched on, serverless compute, and a catalog called `workspace` that you own.

Three things about Free Edition worth knowing before you start:

- **The current catalog is `workspace`.** The lab reads `current_catalog()` rather than assuming
  a name, so everything lands in `workspace.genie_agent.mfg_core_*` without any configuration.
- **Compute is serverless**, so there is no cluster to size or start. The first statement you run
  takes a few seconds longer while it warms up.
- **You are the only user**, which changes what Module 6 shows you. §0.4 explains why, and it is
  a useful thing to see rather than a limitation.

Once you can open a notebook and run `SELECT current_catalog()`, you are ready.

### 0.4 Provisioning: one pip install

The lab is installed by a package rather than assembled by hand. In a Databricks notebook:

```python
%pip install databricks360
dbutils.library.restartPython()
```

Then in a **new cell**, because `restartPython()` clears everything and the import cannot share a
cell with the install:

```python
import databricks360 as academy

academy.list_courses()
academy.install('genie-agents')
```

That writes the lab notebooks into your workspace and prints where everything will land:

```
Installed 'genie-agents' → /Workspace/Users/you@company.com/databricks360/genie-agents
  tier: small
  single schema: current_catalog().genie_agent    table prefix: mfg_<group>_
  e.g. genie_agent.mfg_core_dim_date

  Run these — the dataset is not usable without them:
    1. 01_catalog_and_schemas
    2. 02_dimensions
    3. 03_facts   (slow)

  Then, as the course needs them:
    4. 04_staging  — Modules 6, 7, 12, 13
    5. 05_governance   (needs admin)  — Module 6
    6. 06_curated  — Modules 7, 15
    7. 07_metric_view   (after 06_curated)  — Modules 7, 15
    99. 99_validate  — checking your install
```

Read the third and fourth lines before you run anything. They tell you exactly where your tables
will be created, and `e.g.` shows a fully qualified name you can paste straight into a query.

Because the install runs *inside* a notebook, it authenticates as you. There is no host, token or
CLI profile to configure.

**It does not run the notebooks for you.** Nothing should spend compute without being asked.

#### Built for restricted workspaces

By default the lab creates **no catalog**. It lands in whatever `SELECT current_catalog()`
returns, in a single schema called `genie_agent`, with table names prefixed by group:
`genie_agent.mfg_core_dim_date`, `genie_agent.mfg_staging_fct_aum_legacy`, and so on.

That default exists because most regulated workspaces do not grant `CREATE CATALOG`, and a lab
that assumes otherwise fails on its first statement. If you do hold the privilege, or you have
been given a catalog, you can say so. On Free Edition it means the tables land in
`workspace.genie_agent.mfg_core_*` and there is nothing to configure.

One consequence to expect in Module 6, whichever workspace you are on. Notebook 05's row filter
and column masks key off account groups such as `mfg_region_ne`, and if those groups do not
exist you belong to none of them. The statements still run; you simply land in the most
restricted view, seeing no advisor rows and fully masked client identifiers. That is not a broken
install. It is precisely the case Module 6 is built around, and it is worth meeting from the
inside first.

#### The notebooks

| # | Notebook | What it builds | Measured | Required |
|---|---|---|---|---|
| 01 | `catalog_and_schemas` | the schema, and the documents volume | 21s | yes |
| 02 | `dimensions` | dates, asset classes, benchmarks, portfolios, funds, advisors, clients, accounts, FX rates | 1m 21s | yes |
| 03 | `facts` | daily AUM snapshots, client flows, portfolio returns | 34s | yes |
| 04 | `staging` | a 380-column custodian position feed and a superseded AUM extract | | Modules 6, 7, 12, 13 |
| 05 | `governance` | row filter on advisor region, column masks on the client identifiers, certification tags | | Module 6 |
| 06 | `curated` | month-end AUM and settled-flow views, a client view without identifiers, four UC functions | | Modules 7, 15 |
| 07 | `metric_view` | `mfg_core_mv_wealth_metrics`, one definition of each headline metric | | Modules 7, 15 |
| 99 | `validate` | fourteen checks that the dataset is complete. Run last | | recommended |

Timings are from a single run on Databricks Free Edition, which is serverless. A warehouse that
has gone cold will be slower on the first notebook. Notice that `02_dimensions` is the long pole
rather than `03_facts`, even though `03` generates far more rows: `02` builds 2.9M accounts and
2.1M clients, and by the time `03` runs the warehouse is warm.

Only **01 to 03** are required. After those you have a working dataset; run `99` to confirm it.
The rest are needed when the course reaches them, and `install()` prints which is which so you do
not have to remember.

Notebook 05 needs workspace admin rights, because row filters and column masks are account-level
objects. If you do not have them, skip it and read Module 6 rather than running it.

#### Options

```python
academy.install(
    'genie-agents',
    path='/Workspace/Shared/labs',   # default: your home folder
    catalog='training_v2',           # default: current_catalog(), whatever that is for you
    schema='my_sandbox',             # default: genie_agent
    tier='large',                    # default: small
    create_catalog=True,             # default: False, and rarely permitted
    overwrite=True,                  # replace notebooks from a previous install
)
```

The schema and the table prefix are a pair. Override neither and you get
`genie_agent.mfg_core_dim_date`; name a schema of your own and the prefix drops away, giving
`my_sandbox.dim_date`. That is deliberate, because the prefix only exists to keep three groups of
tables apart inside one shared schema, and it is redundant once the schema is yours.

**Two data tiers.** **Small** (20M flow events) is the default and covers every module except 13.
**Large** (900M) exists only for Module 13, where query time has to be long enough to measure.
Start small; you can install the large tier later into a different schema.

#### Confirming the install

`99_validate` runs fourteen checks over the finished dataset, covering grain, referential
integrity, row counts, currency coverage, and calendar and reporting-date correctness. Every row
should read **PASS**.

```
check_name              value_1               value_2         detail                              verdict
fiscal calendar         730                   2               first day 2024-10-01                PASS
reporting dates         24 reporting dates    24 month ends   last business day, not last cal…    PASS
referential integrity   0 orphan snapshots    expected 0      every snapshot reaches an account   PASS
determinism             1 value for PF000001  hash-derived    identical for every learner         PASS
row counts              20M flows             36M snapshots   2.1M clients                        PASS
```

It prints numbers as well as verdicts. Read them, because you will be asked about several of them
later, and a figure that surprises you now is worth writing down.

#### Why the data is deterministic

Every generated value derives from `hash()` of the row key rather than `rand()`, and ages and
tenures anchor to a fixed 2026-09-30 rather than `current_date`. There are two consequences worth
understanding, because they explain a design choice you meet again in Module 11:

- Your data is **byte-identical** to every other learner's, so a benchmark's ground-truth SQL
  returns the same answer for everyone. Random seeding would silently invalidate the entire
  benchmark set, and you would only notice when scores stopped making sense.
- Re-running a notebook reproduces the same rows instead of a fresh random draw.

### 0.5 The personas (used from Module 6 onward)

Notebook 05 creates the account groups these personas belong to. The point of having four is that
one question produces four different correct answers.

| Persona | Role | Group | What they see |
|---|---|---|---|
| **Priya Raman** | Regional sales lead, Northeast | `mfg_region_ne` | advisors in NE only; client identifiers masked |
| **Marcus Chen** | Regional sales lead, West | `mfg_region_west` | advisors in WEST only; client identifiers masked |
| **Elena Okafor** | CFO | `mfg_finance` | no advisor rows at all, but `annual_income` is visible |
| **Dev Anand** | Data steward | `mfg_unrestricted` | everything, unmasked |

Elena's row is the interesting one, and Module 6 explains it: the region filter never mentions
`mfg_finance`, so a question that joins the advisor dimension returns her nothing. An empty
answer from a correctly configured filter looks exactly like a business with no activity.

### Lab 0 (60 min)
1. `%pip install databricks360`, then `academy.install('genie-agents')`.
2. Run `01_catalog_and_schemas`. Note the catalog and schema the first cell reports, because that
   is where your lab lives for the rest of the course.
3. Run `02_dimensions`, then `03_facts`. Check the row counts each prints at the end.
4. Run `99_validate`. All fourteen checks should read PASS.
5. Now **read the data for twenty minutes.** Open each table, look at the column comments, and run
   whatever occurs to you. Then write down:
   - three questions a business user might ask that this data could answer **two different ways**,
     and why
   - any column whose meaning you had to guess
   - the total value of assets Meridian manages, and how you decided which number that was

   Keep the sheet. You return to it in Module 4, and the gap between what you noticed now and what
   you know then is the most useful thing you produce today.

> Step 5 is the module. Steps 1 to 4 are typing.

### Knowledge check
5 questions on the schema, the fiscal calendar, and the grain of each fact table.

---

### LEVEL 1 — FOUNDATIONS (business users, no SQL)

---

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

You'll work with Meridian Financial Group throughout: a mid-size US investment manager with $430B
across 4,500 portfolios, sold through intermediary, institutional, retirement and private-client
channels. The course builds towards answering the sequence the Head of Wealth began with:

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

You're given twelve real questions from a Meridian shared inbox. Sort each into one of four
buckets:

- **Genie One**: a business question over existing data
- **Genie Agent**: needs a curated domain built first
- **Genie Code**: someone needs help writing or fixing code
- **Not a data question at all**

Then pick the single hardest one and list every business definition that would have to be settled
before any tool could answer it correctly. Compare your list with a colleague's. The
disagreements are the interesting part, and they preview Module 5.

### Knowledge check

## Module 2 — Asking Questions That Actually Work
**Level:** Beginner · **Duration:** 60 min · **Audience:** business consumers — the whole of the Business User track

**Summary:** What separates a question Genie can answer from one it can't, and how to sanity-check an answer before you act on it.

### Learning outcomes
1. Write questions Genie can answer, and recognise the ones it can't.
2. Name the four things every answerable question needs.
3. Use follow-ups and threads instead of re-asking.
4. Read the **Analysis** panel to sanity-check an answer before you act on it.
5. Give feedback that actually improves the agent.

### Key concepts
- Genie uses **chain-of-thought reasoning**: it breaks the question into steps, picks columns, plans SQL, runs it.
- The **Analysis / thinking steps** panel shows how the question was interpreted, which sources were used, and a **Show code** button for the generated SQL.
- **Threads carry context; separate chats do not.**
- Outputs: an auto-generated chart (editable, savable to a dashboard, downloadable as PNG), CSV download (~1 GB), copy to clipboard.
- **Feedback is a product feature.** Rate a response **Yes** / **Fix it** / **Request review**. A thumbs-up on an answer that joins tables or uses a SQL expression can prompt Genie to *suggest a new reusable snippet* to the author. Rating is not a formality — it trains the agent.

### The four things a good question names

Most questions that fail are missing one of four things. Before you send a question, check that
it names:

| | | Example |
|---|---|---|
| **A measure** | the number you want | AUM, net flows, time-weighted return |
| **A cut** | how to break it up | by asset class, by channel, by fund |
| **A filter** | which slice counts | discretionary only, settled flows only |
| **A point in time** | when | as of 30 June 2026, or FY2026 Q3 |

The last one trips people up most, because two different kinds of number need two different
kinds of time. **AUM is a balance** — it exists at a moment, so it needs an *as-of date*.
**Flows and returns are periods** — they accumulate, so they need a *date range*. Asking for
"AUM in June" invites Genie to add up thirty daily snapshots and hand you a number thirty
times too large. Ask for "AUM as of 30 June" and there is nothing to add up.

### The question quality ladder (core artifact — distribute widely)

| ❌ Genie will struggle | ✅ Rewrite | Why |
|---|---|---|
| "Why did AUM fall last quarter?" | "What was total AUM by asset class at each month-end for the last eight months?" | Genie retrieves and computes; it does not diagnose causes. Get the shape of the movement, then form your own hypothesis and test *that*. |
| "Which funds should we close?" | "Which funds had net outflows in each of the last four quarters, and what is their AUM as of the latest reporting date?" | Genie doesn't make recommendations. Ask for the evidence and decide yourself. |
| "Tell me about the Northeast, and compare advisors, and what about outflows" | three questions, one thread | One question at a time. Genie answers the last thing it understood, not all three. |
| "Show me our best funds" | "Show the ten funds with the largest net flows in FY2026 Q3" | "Best" is undefined — largest by AUM, by net flows, by return? And which return? No metric, no period, no ranking size. |
| "What's our AUM?" | "What was discretionary AUM, excluding held-away assets, as of 30 June 2026?" | AUM has three defensible readings at Meridian, and it's a point-in-time balance — it needs an as-of date, not a period. |
| "What was our return last year?" | "What was the net-of-fees time-weighted return by strategy for the YTD period as of 30 June 2026?" | Three ways to measure your own return sit in one table — plus a fourth column holding the *benchmark's* return, which is not yours — each across six period types. And "last year" is ambiguous when the fiscal year starts 1 October. |
| "How much did we sell in Q2?" | "What were gross subscriptions, excluding exchanges, for settled flows with a trade date in FY2026 Q3?" | Exchanges between Meridian funds are not sales. Pending and cancelled flows are not money. And trade date is not settlement date. |
| "AUM for California" | "AUM as of 30 June 2026 for advisors in CA" | The data stores `CA`, not "California". A human reads through it; a filter doesn't. |

Note what the good column has in common: it is *longer*, and it is *boring*. Precision reads as
pedantic and produces answers you can defend in a meeting. That trade is always worth it.

### Business example — the follow-up pattern

```
Q1: "Show AUM by asset class as of 30 June 2026"
Q2: "Only the intermediary channel"        ← follow-up, inherits Q1's context
Q3: "Now split that by region"             ← keeps narrowing
Q4: "How does that compare with 31 March 2026?"
```

Four questions, one thread, one consistent definition of AUM running through all of them.

The anti-pattern is four separate chats. You will get four answers that each look reasonable and
don't reconcile, because nothing carried the "discretionary only" decision from the first chat
into the fourth.

### Reading the Analysis panel — three checks before you act

Open **Analysis** and **Show code** on any answer you plan to put in front of someone. You do not
need to read SQL fluently. You need to check three things:

1. **Which tables did it use?** Meridian ships two tables that both look like they hold AUM. If
   the answer came from the wrong one, nothing downstream is worth anything. The certified table
   is the one to expect.
2. **Did the filter you asked for actually appear?** A dropped filter is the most common silent
   failure. If you said "discretionary only" and no condition on discretion appears in the code,
   you got the whole book.
3. **Was a balance summed instead of filtered?** For AUM, look for a single date, not a range. A
   `SUM` over many dates is the wrong-number-that-looks-right failure.

If any check fails, don't re-ask the same question louder. Rate it **Fix it** and say what was
wrong — that routes to the agent's author, who can fix it once for everyone.

### Lab 2 (20 min) — GRADED
Rewrite 8 badly-written questions from Meridian stakeholders, run each against the pre-built
Wealth agent, and paste the generated SQL. Graded on rewrite quality, not SQL. Two of the eight
cannot be rescued by rewriting at all — say so and explain why. Recognising an unanswerable
question is the skill being tested.

**Docs:** `/genie-agents/talk-to-genie`, `/genie-one/chat`

---

## Module 3 — Chat Mode vs Agent Mode (Answers vs Research)
**Level:** Beginner–Intermediate · **Duration:** 45 min

**Summary:** When a single query is enough, when the question needs research, and what Agent mode costs you in time and spend.

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

### How to tell which one you need

Module 2 gave you four things a good question names — a measure, a cut, a filter and a point in
time. That checklist doubles as the mode test:

- **You can name all four → Chat mode.** You already know the shape of the answer; you just need
  the number.
- **You can't name the cut → Agent mode.** "Which funds are in trouble" doesn't specify a cut
  because *finding* the right cut is the actual work. That's research, not retrieval.

The failure this prevents is asking Chat mode a research question. It will answer — one query,
one table, confidently — and you'll mistake one slice for the whole picture.

### Business examples
| Question | Mode | Why |
|---|---|---|
| "What was AUM by asset class as of 30 June 2026?" | Chat | one balance, one as-of date, one cut |
| "Which funds are losing assets, and what's driving it?" | Agent | needs several angles — net flows by channel, redemptions vs exchanges, return against benchmark, share-class mix |
| "Summarise the investment committee memos on emerging-market equity alongside the flow trend for those funds" | Agent | unstructured files in a volume, joined to structured tables |
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
Route 10 Meridian questions to Chat or Agent mode with a one-line justification each. Two of the
ten are research questions disguised as metric questions — the phrasing names a measure, but
answering usefully needs several. Spotting those is the point of the lab.

> **Setup note for instructors:** the Agent-mode exercises read from the `documents` volume that
> notebook 01 creates. Populate it with the course document pack before running this module.

**Docs:** `/genie/agent-mode`, `/genie-agents/concepts`

---

### LEVEL 2 — HOW IT WORKS

---

## Module 4 — Under the Hood: The Compound AI System
**Level:** Intermediate · **Duration:** 60 min

**Summary:** Genie is several components rather than one model. Which inputs shape an answer, ranked by how strongly each one does it.

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
```ladder
strongest: Trusted assets — a verified query or UC function: *"use this exact logic"*
Example SQL queries — a worked answer to a real question: *"here's how that's done"*
Knowledge store SQL expressions — *"this is what 'net flows' means"*
Knowledge store metadata — descriptions and synonyms: *"this is what this column means"*
Unity Catalog comments — generic table documentation
weakest: Plain-text instructions — *"please remember to..."*
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

### Teaching line
> *"Genie didn't get the answer wrong. Your company has three answers and never picked one."*

**Docs:** `/genie/best-practices`, `/metric-views/`

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
**certify/deprecate on the underlying data**, so Genie prefers the certified `fct_aum_snapshot`
over `fct_aum_legacy`, which ships tagged `deprecated = true` and
`superseded_by = fct_aum_snapshot`.

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

**Docs:** `/genie-agents/concepts` (permissions), `/genie-agents/set-up`

---

### LEVEL 3 — BUILDING

---

## Module 7 — Prepare the Data (The 80% That Decides Quality)
**Level:** Intermediate · **Duration:** 90 min

**Summary:** Choosing the few objects worth exposing and shaping them properly, which decides more about answer quality than any later tuning.

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

**Define purpose.** One audience, one topic. An agent covering AUM reporting *and* trade operations *and* fee billing covers all three badly.

**Pre-join.** Beyond 30 objects, build views that pre-join related tables. Fewer, richer objects beat many thin ones — and pre-joining is where the AUM definition, the flow netting and the snapshot grain get settled permanently.

**Narrow is *faster*, not just more accurate.** Every table and column is context Genie must read before writing SQL, so a bloated agent is slow **and** wrong. Wide tables are the worst offenders — replace the 380-column `fct_holdings_raw` with a slim view holding only what anyone asks about. Module 13 puts a stopwatch on this.

**Certify and deprecate in Unity Catalog.** Certify `fct_aum_snapshot`, deprecate `fct_aum_legacy`. "We have two AUM tables" then stops being the agent's problem and becomes a governance decision made once.

**Metric views** — Unity Catalog semantics that separate **measures** from **dimensions**, defined in YAML, so a metric is defined once and grouped/filtered any way at runtime. They carry **agent metadata** (synonyms, display names, formatting rules) that directly improves accuracy and keeps formatting consistent across tools.

| Situation | Build |
|---|---|
| One team, a handful of metrics, moving fast | curate inside the agent |
| "AUM" must mean one thing across 5 agents, 3 dashboards and the regulatory filing | **metric view**, then point agents at it |
| You already curated an agent and want to promote its semantics | **export the agent as a metric view** |

### Business example — scoping the MFG "Wealth Reporting" agent
**Before (bad):** 22 objects including `fct_holdings_raw` (380 columns), `fct_aum_legacy`,
`dim_client` with its identifiers, both asset-class hierarchies, staff and headcount tables,
and `_tmp_flow_backfill`.

**After (good):** 6 objects
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
> **Note what happened.** Most of the hard problems were solved *in the data layer*, before a
> single instruction was written. That is the module's whole point.

### Business example — column descriptions that earn their keep
| Column | ❌ Weak | ✅ Strong |
|---|---|---|
| `market_value_local` | "the market value" | "Market value of managed assets in the account's local currency. Convert with `dim_fx_rate` at `snapshot_date` before totalling. Excludes held-away assets — see `held_away_value_local`." |
| `held_away_value_local` | "held away value" | "Assets Meridian reports on but does not manage. **Excluded from AUM.** Include only when the question says 'advised' or 'AUA'." |
| `flow_type` | "type of flow" | "SUBSCRIPTION, REDEMPTION, EXCHANGE_IN, EXCHANGE_OUT, TRANSFER_IN, TRANSFER_OUT. **Exchanges move money between Meridian products and are not sales or redemptions.**" |
| `snapshot_date` | "snapshot date" | "This table holds **one row per account per day**. Never SUM across dates; filter to a reporting date for a point-in-time figure." |
| `region` | "region code" | "Advisor coverage region. Values: NE, SE, MW, WEST. Users say 'Northeast', 'the West Coast', 'Midwest'." |
| `twr_net` | "net return" | "Time-weighted return after fees, for the `period_type` on the row. Not the same as `mwr`, which reflects the timing of client cash flows." |

### Demo (15 min)
Ask an under-prepared agent *"What was our AUM in California at the end of last year?"* → it sums a daily snapshot, includes held-away assets, uses the calendar year, and returns nothing for "California". Four problems in one answer, none of them flagged. Then ask the prepared 6-object agent. Same question, right answer, no prompt tricks.

### Lab 7 (30 min) — GRADED
From the 22 raw MFG objects: choose ≤ 8, write the `mfg_core_vw_aum_reporting` and `mfg_core_vw_net_flows` view SQL, write descriptions for 10 columns, and list 6 columns to hide with reasons.

### Anti-patterns to name explicitly
- Adding every table "just in case."
- Accepting **AI-generated column descriptions without verifying them** — the docs call this out, and here the suggested text gets AUM and the asset-class hierarchy wrong.
- Leaving both asset-class hierarchies visible.
- Exposing a daily-snapshot table without a warning in its description.
- Exposing `dim_client` when `dim_client_safe` exists.

**Docs:** `/genie/best-practices`, `/metric-views/`, `/genie-agents/set-up`

---

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
Build the Meridian **Wealth & Distribution** agent for real: the objects from Lab 7, review the
Genie Code suggestions (documenting at least 2 you **rejected** and why — flaws 1 and 5 are
planted in those suggestions), configure settings and 5 common questions, share with a peer group
at CAN RUN, and confirm all 5 starters return correct answers.

Then deliberately add a sixth starter that *is* ambiguous — "What was our AUM?" — run it, and keep
the result. Module 10 comes back to it when you write the clarification instruction that fixes it.

**Docs:** `/genie-agents/set-up`

---

## Module 9 — The Knowledge Store: Teach It Your Business
**Level:** Intermediate–Advanced · **Duration:** 90 min · **Audience:** authors

**Summary:** Teach the agent your vocabulary: the descriptions, synonyms, joins and SQL expressions that turn column names into meaning.

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
| **Prompt matching — entity matching** (also called **example values** / **value dictionaries**) | curated lists of distinct values, so Genie filters on the *real* value (`'CA'`, `'MM_CASH'`) instead of inventing one (`'California'`, `'cash'`) | **120 columns**, **1,024 values** each |
| Join relationships | explicit PK–FK links; Many-to-One / One-to-Many / One-to-One; complex conditions via SQL expression | part of 200 |
| **SQL expressions** | filters, measures, fields | part of 200 |
| **Knowledge store snippets total** | descriptions + joins + SQL expressions | **200 per agent** |

### The three SQL expression types — MFG examples
| Type | Purpose | Example |
|---|---|---|
| **Filter** | a reusable condition | `Settled only` → `status = 'SETTLED'` · `Reporting dates only` → `is_reporting_date` · `Discretionary` → `is_discretionary` · `External money` → `flow_type NOT IN ('EXCHANGE_IN','EXCHANGE_OUT')` |
| **Measure** | a KPI | `aum_usd` → `SUM(CASE WHEN is_discretionary THEN managed_value_usd ELSE 0 END)` · `aua_usd` → `SUM(total_advised_value_usd)` · `net_flows_usd` → `SUM(external_sign * amount_usd)` · `avg_account_value` → `SUM(managed_value_usd)/NULLIF(COUNT(DISTINCT account_id),0)` |
| **Field** | a derived attribute | `account_size_band` → `CASE WHEN managed_value_usd < 250000 THEN 'Retail' WHEN managed_value_usd < 5000000 THEN 'Affluent' ELSE 'Institutional' END` · `is_international` → `local_currency <> 'USD'` |

### Business example — synonyms that unblock real users
| Users actually say | Column / value | Fix |
|---|---|---|
| "Northeast", "the East" | `region = 'NE'` | synonym + entity matching |
| "West Coast", "out west" | `region = 'WEST'` | synonym |
| "California" | `state = 'CA'` | **entity matching** |
| "equities", "stocks" | `investment_class = 'EQUITY'` | synonym on the measure's dimension |
| "cash", "money market" | `asset_class_code = 'MM_CASH'` | synonym + entity matching |
| "AUM", "managed assets", "book of business" | the `AUM` measure | synonyms on the measure |
| "AUA", "advised assets", "total assets" | the `Assets Under Advisement` measure | synonyms — and keep them apart from AUM |
| "net new money", "net sales", "flows" | `net_flows_usd` measure | synonyms |
| "return", "performance" | ambiguous — four columns | a clarification instruction, not a synonym |

### Business example — entity matching in action
Without it: *"How did our California advisors do last quarter?"* → Genie writes
`WHERE state = 'California'`, the table holds `'CA'`, and the answer is a confident **zero** —
or the filter is silently dropped and you get the national number labelled as California.

With entity matching on `dim_advisor.state` (50 values curated), `region` (4) and
`dim_asset_class.asset_class_code` (12): Genie matches the phrasing to the real value, and
handles "Californa" too.

**Teaching rule:** turn on entity matching for every low-cardinality categorical column users
name out loud — region, state, asset class, flow type, channel, strategy, period.

### Business example — the fan-out trap — spend real time here
`fct_aum_snapshot` holds one row per account per day. Ask *"What do we manage?"* against the
raw table with no cardinality declared, and Genie writes `SUM(market_value_local)` across
every snapshot in the table. The answer is the real book **multiplied by the number of days**.

The number *looks* like a number. The chart *looks* like a chart. Nobody notices until the
figure fails to tie to the regulatory filing.

Fix at three layers, in order:
1. **Data:** `vw_aum_reporting` exposes month-end reporting dates only (Module 7).
2. **Knowledge store:** declare `fct_aum_snapshot.account_id → dim_account.account_id
   (Many-to-One)`, and a `Reporting dates only` filter expression.
3. **Description:** "one row per account per day — never SUM across dates."

> **This is the scariest failure mode in the course: a plausible wrong number.** It is also
> the most natural mistake in this domain, because AUM is point-in-time by nature and nothing
> in the SQL warns you.

### Knowledge mining
Genie proposes new joins and SQL expressions by reading Unity Catalog schemas and observing author behaviour — thumbs-up on responses and downloaded queries. Teach authors that **their own upvotes are training signal**, and to review suggestions rather than accept blindly.

### Lab 9 (40 min) — GRADED, hardest lab
On the MFG agent: add synonyms for 10 business terms (start with AUM, AUA, net new money, equities, cash), enable entity matching on 4 categorical columns, declare all 6 join relationships with correct cardinality, and author 8 SQL expressions (3 filters, 4 measures, 1 field). Then re-run the 9 broken questions from Lab 4 and show which now pass.

### Common mistakes
- Adding synonyms to the column but not the values (or vice versa).
- Wrong cardinality (One-to-Many where it's Many-to-One) → fan-out and inflated totals.
- Encoding a metric in a **text instruction** instead of a **measure expression**.
- Exposing a snapshot table with no `Reporting dates only` filter.
- Adding "return" as a synonym for one of the return columns, instead of asking which one is meant.
- Burning the 200-snippet budget on low-value descriptions.

**Docs:** `/genie-agents/tune-quality`, `/genie/best-practices`

---

## Module 10 — Instructions, Example SQL, and Trusted Assets
**Level:** Advanced · **Duration:** 90 min

**Summary:** Prefer SQL to prose. Worked examples, parameterised queries and UC functions pin intent down where instructions only suggest it.

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
❌ **Title:** `q_aum_ac_fq`
✅ **Title:** `What was our AUM by asset class at the end of last fiscal quarter?`
```sql
SELECT ac.asset_class_name,
       SUM(v.managed_value_usd) AS aum_usd
FROM   genie_agent.mfg_core_vw_aum_reporting v
JOIN   genie_agent.mfg_core_dim_asset_class  ac ON ac.asset_class_code = v.asset_class_code
WHERE  v.fiscal_quarter = :fiscal_quarter   -- Format 'FY2026-Q3'. MFG fiscal year starts Oct 1.
  AND  v.as_of_date = (                     -- the quarter's last reporting date
         SELECT max(as_of_date) FROM genie_agent.mfg_core_vw_aum_reporting
         WHERE fiscal_quarter = :fiscal_quarter)
  AND  v.is_discretionary                   -- AUM excludes advisory-only mandates
GROUP BY ac.asset_class_name
ORDER BY aum_usd DESC
```
Five lessons in one artifact: the title is the user's sentence; the parameter comment explains
the format *and* the fiscal quirk; the view already handles currency and the snapshot grain;
the discretionary filter pins down which AUM this is; and the join path is demonstrated rather
than described.

### Business example — a UC function as a trusted asset
```sql
CREATE OR REPLACE FUNCTION genie_agent.mfg_core_net_flows(
  from_date DATE COMMENT 'Inclusive start, on settlement date.',
  to_date   DATE COMMENT 'Inclusive end, on settlement date.'
) RETURNS TABLE (gross_sales_usd DECIMAL(20,2), redemptions_usd DECIMAL(20,2), net_flows_usd DECIMAL(20,2))
COMMENT 'Net new money between two settlement dates. Excludes exchanges between Meridian
         products and anything not settled. Owner: Wealth Analytics. Do not recompute by hand.'
RETURN ...
```
This settles the exchange question permanently and hides the netting logic from users
entirely — which is the point. Nobody has to remember that exchanges aren't sales.

### Business example — instruction quality ladder
| ❌ Vague (the docs call this out) | ✅ Specific |
|---|---|
| "Ask clarification questions about returns" | "**When** a user asks about return or performance without saying which measure, **ask** before running any query. **Example:** 'Do you mean time-weighted net of fees, which is what we report to clients, or money-weighted, which reflects that client's own cash-flow timing?'" |
| "Use the right calendar" | "MFG's fiscal year starts 1 October. FY2026 = 2025-10-01 to 2026-09-30. 'Last quarter' means the prior **fiscal** quarter unless the user says 'calendar'. A quarter-end figure uses the last **business** day, not the last calendar day." |
| "AUM should be accurate" | "'AUM' with no qualifier means **discretionary managed assets in USD**, excluding held-away. Use 'AUA' or 'advised assets' for the wider figure, and say which you used in the answer." |
| "Handle flows carefully" | "Net flows = subscriptions and transfers in, **less** redemptions and transfers out. **Exclude exchanges** — they move money between Meridian products. Count settled instructions only." |
| "Never show PII" | *(delete this — it does nothing.* Use column masks, Module 6.*)* |
| "Be helpful in summaries" | "In summaries: report USD in millions with thousands separators, state the reporting date in every headline number, and say which AUM definition you used." |

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
 8  UC functions             aum_by_asset_class, net_flows, to_usd, fiscal_period,
                             benchmark_relative, flows_by_channel, account_growth,
                             reporting_date_resolver
12  text instruction blocks  fiscal calendar and reporting dates, AUM terminology,
                             return clarification, flow netting, settled-only rule,
                             currency handling, summary formatting, data freshness, ...
── 60 used, 40 held in reserve for what monitoring reveals
```
**Teaching point:** deliberately leaving headroom is professional practice. Monitoring *will* surface questions you didn't predict.

### Lab 10 (40 min) — GRADED
Add 10 example queries (≥3 parameterised with typed, commented parameters), register 2 UC functions as trusted assets (one must settle the AUM definition, one the flow netting), and write 4 text instruction blocks including one clarification rule for "return" using the four-part template. Submit an instruction budget table.

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
Build a 30-question benchmark set (10 smoke, 12 coverage, 8 traps — at least one per planted flaw) with ground-truth SQL. Two of the traps must be questions where the *correct* behaviour is to ask for clarification rather than answer. Run it, record the score, fix the top 3 failures via the edit-and-save loop, re-run, report before/after.

**Docs:** `/genie-agents/monitor`

---

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
| Revenue is gross, not net | text instruction "use net revenue" | `net_fee_revenue` **measure expression** + fix the view (Modules 7, 9) |
| AUM is 30× too high | re-ask the question | **join cardinality** + `Latest snapshot` filter + EOP view (Modules 7, 9) |
| Wrong year | a note in the description | **fiscal calendar instruction** + `dim_date` fiscal columns (Modules 7, 10) |
| Transaction counts too high | ignore it | **`status = 'POSTED'` filter expression** (Module 9) |
| "Net flows" answered inconsistently | more prose | **two named measures** + a **clarification instruction** (Modules 9, 10) |
| A complex recurring question is always slightly off | more text instructions | **example query** or **UC function** as a trusted asset (Module 10) |
| Genie asserts a *cause* ("outflows rose because of the fee change") | forward it to the CIO | it's an **unsupported claim** — tighten context, remove overlapping tables, diagnose with Genie Code. Genie retrieves; it does not diagnose (Module 2). |
| Answers pull from `fct_aum_legacy` | delete the table and break downstream | **certify** `fct_transactions`, **deprecate** the legacy table in UC (Modules 6, 7) |
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

**Summary:** Split a slow answer into thinking time and query time first, because the fixes for the two are entirely different.

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
Complaint: regional sales leads say it takes 40 seconds.

Measurement:
  execution_duration_ms                 4,100 ms   ← the SQL is fine
  gap before EXECUTING_QUERY           31,000 ms   ← thinking dominates
  poll-loop overhead (own code)         3,200 ms   ← self-inflicted
Verdict: a thinking problem, plus 3 seconds we added ourselves.

What the agent actually looked like:
  22 objects, including fct_holdings_raw (380 columns) and fct_aum_legacy
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

**Summary:** Read the common error signatures, gather the evidence support actually needs, and tell apart the problems that are yours to fix.

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

**Docs:** `/genie-agents/monitor`, `/genie/best-practices`

---

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

**Docs:** `/genie/budgets`, `/metric-views/`, `/genie/best-practices`

---

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

**Docs:** `/genie-agents/conversation-api`, `/generative-ai/agent-bricks/multi-agent-supervisor`, `/genie/best-practices` (version control)

---

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

## Part D — Coverage map: *Genie Performance & Issues Playbook* → this course

**Summary:** Which module covers each item in the internal Genie Performance & Issues Playbook.

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
| Budgets and cost controls | `/aws/en/genie/budgets` |
| Genie Code | `/aws/en/genie-code/` |
| Metric views | `/aws/en/metric-views/` |
| Supervisor Agent (multi-agent) | `/aws/en/generative-ai/agent-bricks/multi-agent-supervisor` |
| Knowledge Assistant | `/aws/en/generative-ai/agent-bricks/knowledge-assistant` |
| Release notes | `/aws/en/ai-bi/release-notes/` |

Internal: *Genie Performance & Issues Playbook & Health Check* — source for Modules 13 and 14, the limits table, and the supervisor stance in 16.4.

---

## Part F — Dataset design (instructor reference)

**Summary:** Instructor reference: the flaws planted in the Meridian dataset and the module each one serves. Contains the answers.

> **This page contains the answers.** It catalogues what is wrong with the Meridian dataset
> and which module each problem serves. Module 0 deliberately does not mention any of it, and
> Lab 0 asks learners to notice things for themselves. If you are taking the course rather
> than teaching it, stop here and come back after Module 4.

Every figure the modules quote is measured from a real provisioning run rather than
estimated. Re-run `99_validate` after any change to the generators and update them if they
move — a course that quotes stale numbers teaches learners to distrust it.

### F.1 The nine planted flaws

| # | Planted flaw | What breaks without a fix | Taught in |
|---|---|---|---|
| **1** | **AUM has three defensible readings** — discretionary only, all managed, or managed plus held-away. `fct_aum_snapshot` carries `market_value_local` and `held_away_value_local`; `dim_portfolio.is_discretionary` splits the rest | three different headline numbers, each defensible, and no way to tell which one you were given | 5, 7, 9, 11 |
| **2** | Fiscal year starts **Oct 1** (FY2026 = 2025-10-01 → 2026-09-30), and a **reporting date is the last *business* day**, not the last calendar day | "end of Q2" silently means calendar quarter; month-end totals land on a day the market was shut | 5, 10, 11 |
| **3** | `dim_advisor.region` ∈ `NE, SE, MW, WEST`; `state` ∈ `CA, NY, TX…`; `dim_asset_class.asset_class_code` ∈ `EQ_US, FI_CORP, MM_CASH…` — users say "Northeast", "California", "equities", "cash" | confident **zero rows**, or a silently dropped filter | 9, 12 |
| **4** | **Net flows counted naively double-count exchanges.** `fct_flows.flow_type` includes `EXCHANGE_IN`/`EXCHANGE_OUT` — money moving between Meridian products, which should net to zero. `status` also includes `PENDING` and `CANCELLED` | gross sales and redemptions both inflated; net flows unchanged, so the error hides | 7, 9, 11 |
| **5** | `dim_asset_class` carries **two hierarchies**: `investment_class` (how PMs think) vs `regulatory_class` (how reporting rolls up). An ETF of bonds is `FIXED_INCOME` in one and `POOLED_VEHICLE` in the other | rollups mix reporting frames; two answers to one allocation question | 7, 9 |
| **6** | `fct_aum_snapshot` is a **daily snapshot** — summing it across dates multiplies the book by the number of days | **a plausible wrong number.** The scariest failure in the course, and the most natural mistake here, because AUM is inherently a point-in-time figure | 9, 11, 12 |
| **7** | **Return has three defensible readings** — `twr_gross`, `twr_net` (after fees) and `mwr` (money weighted) — each across six `period_type` values. `fct_performance` also carries `benchmark_return`, which is *not* the portfolio's return at all | several honest answers to "what was our return?" — the reason GIPS exists — plus a fourth column that silently answers a different question | 5, 9, 10, 11 |
| **8** | `dim_client` holds real **PII**: `ssn_last4`, `email`, `dob`, `annual_income` | a governance incident, not a data-quality one | 6, 17 |
| **9** | International portfolios report in **EUR, GBP and JPY**, needing `dim_fx_rate` joined *as of the reporting date*. `fct_flows` also separates `trade_date` from `settlement_date` | currency mixing; totals that don't tie to finance; flows landing in the wrong period | 9, 10 |

Two more flaws are added to the *agent*, not the data, in Module 8: a bloated 22-object agent
and 9,000 characters of prose instructions — the raw material for Module 13's latency lab.

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
| 30-object limit / pre-joining | 7 | 14 base objects → curated 6 |
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
| Instruction length ceiling | 10, 13 | the planted 9,000-character prose block |
| Benchmarks & scoring | 11 | ground-truth SQL for all nine flaws |
| Monitoring & feedback triage | 12 | seeded conversation history with feedback |
| Nondeterminism expectation-setting | 4, 11, 12 | flaw 7 produces legitimately varying answers |
| Performance: thinking vs query | 13 | bloated agent + the 380-column feed + an unclustered fact table |
| Warehouse & table tuning | 13 | an unclustered 900M-row `fct_flows`, plus the 380-column feed |
| Errors & escalation | 14 | scripted error scenarios |
| Cost & budgets | 15 | five-agent portfolio + one service-principal integration |
| API, tracing, CI/CD | 16 | the whole agent, exported as `serialized_space` |
| Supervisor / multi-agent | 16 | 5 agents + document volume + external context |
