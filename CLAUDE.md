# Lakehouse Academy — working notes

Next.js site rendering courses from markdown. `content/courses/<id>/plan.md` is the source;
everything under `modules/` is generated.

## Edit plan.md, never modules/

```bash
npm run content   # split plan.md into modules/ and build the registry
npm run dev
```

`scripts/split-content.mjs` says it in a header comment and it is still the easiest mistake
to make: edit a file in `modules/`, watch the next build silently revert it.

**Module bodies use `###` and below.** A `##` heading inside a module collides with how the
splitter finds the reference Parts and truncates the module at that point. This shipped once
— Lab 16 lost most of its body, the build passed, and the tests passed. Only counting
sections per module caught it.

## Who this is written for

**They write SQL competently and have probably never opened Databricks.**

Do not explain joins, `GROUP BY`, `CASE WHEN`, or what a foreign key is. Do explain Unity
Catalog scoping, what a Genie Agent is as an object, metric views, volumes, warehouses,
trusted assets, and every piece of Genie-specific vocabulary.

The rule: assume they can read the SQL and cannot place the Databricks concept.

## Module shape

Part A.5 of `plan.md` is the full version. In short:

1. **Open with a failure**, not an agenda. A named person, a real question, a wrong answer,
   the SQL, and what was actually in the column.
2. **Explain why in plain language.**
3. **Each capability arrives as the answer to a specific failure.** If you cannot name the
   failure a feature prevents, it does not belong in the module.
4. **Say where the thing lives** — agent-scoped or catalog-scoped, and what follows.
5. **Reference tables last**, once the words in them mean something.

Module 9 is the reference implementation.

## Lab shape

Part A.6 has the full version.

**Numbered click paths, not outcomes.** "Put each synonym where the thing it names actually
lives" is meaningless to someone who has not seen the Configure tab. Write `Click Configure,
then Sources. Click the table name. Click the pencil icon next to the column.`

Do one slowly, then give a table to repeat against. End every step with a question to ask and
the answer that means it worked. Never reference material the reader cannot reach — give the
line that prints it.

**The steps live here; the material lives in the package.** `academy.lab(n)` prints the
inputs and a summary, not a competing set of instructions. They drifted once and every lab's
step 1 pointed at the staler copy.

## Verify by doing, not by reading

Every content bug of consequence was found by following the lab, not by reviewing it:

- Lab 9 told learners to put a synonym on a measure that step 4 had not created yet
- Lab 3 promised two "disguised" research questions and none of its ten were disguised
- Lab 4's nine recorded failures no longer reproduce, because the model improved
- Lab 0 never mentioned `restartPython()`, the usual way an install silently uses a stale package

After a rewrite, sweep rather than trusting the commit:

```bash
grep -c '^\*\*Step [0-9]' content/courses/genie-agents/modules/*.md   # labs have steps
grep -m1 '^### ' content/courses/genie-agents/modules/*.md            # modules open with a scene
```

Module 10 once said everything twice — the rewrite replaced text down to an anchor and left
the old sections below it. Module 4's opening was reported as committed and never written,
because the script aborted before the file write.

## Facts about Genie

Keep documented and observed figures apart, and label them. A client told an observed number
is documented stops trusting the documented ones.

**Documented:** 30 tables/views per agent (advice: ≤ 5) · 100 instructions · 200 knowledge
store snippets · 500 benchmarks · 120 entity-matching columns × 1,024 values × 127 chars ·
10,000 conversations × 10,000 messages · files over 10 MB ignored · 5 files per question
without content search.

**Observed, not published:** ~5–7k character instruction degradation · ~90 s query ceiling ·
~597 s backend ceiling · rate limits.

There is **no documented character limit on instructions**. Re-check anything quoted before a
delivery — Genie ships fast, and "Genie spaces" were renamed "Genie Agents" mid-course.

## Tests

```bash
npm test    # diagrams, quizzes, glossary, db
```

`npm run build` regenerates content first, so a broken plan.md fails the build.
