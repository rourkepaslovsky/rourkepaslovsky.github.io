---
title: "AI-Graded Learning Portal"
outcome: "A learning portal where AI grades typed open answers against source-derived rubrics, serving real student cohorts — and where an encouraging wrong answer counts as a governance failure."
client: "An education non-profit"
role: "Sole engineer — design, build, deployment"
period: "July to October 2026"
stack: ["Next.js", "TypeScript", "Supabase (Postgres, pgvector)", "Vercel AI SDK (Anthropic & OpenAI)", "Auth.js", "Voyage embeddings", "MDX", "Vercel"]
flow:
  - step: "Source PDFs are transformed"
    detail: "A pipeline turns course material into lesson MDX and knowledge-check JSON."
  - step: "A human reviews"
    detail: "Generated content lands in a staging area. Nothing goes straight to students."
  - step: "Students learn"
    detail: "Interactive lessons, plus a tutor grounded on the programme's own content in three languages."
  - step: "AI grades open answers"
    detail: "Typed answers are graded against rubrics derived from the source material."
  - step: "Staff see the gaps"
    detail: "A completions funnel and flagged unanswered questions feed back into the curriculum."
order: 4
---

## The problem

The client, an education non-profit, runs a data-skills programme for South African students. The course content lived in PDFs; checking understanding at scale meant multiple-choice only, which can't assess whether a student can actually explain a concept. The programme needed a modern learning portal that could teach, check understanding properly, and tutor — without ever teaching something the official material doesn't say.

## What I built

A learning portal with native interactive lessons, mixed-format knowledge checks — including typed open answers graded by AI against rubrics derived from the source material — and an AI tutor that answers in English, isiZulu or isiXhosa, grounded exclusively on the programme's own content. A super-admin dashboard gives programme staff a completions funnel, flagged unanswered questions, and topic-level analytics.

Content gets in through a pipeline that transforms source PDFs into lesson MDX and knowledge-check JSON, landing in a human-reviewed staging area — nothing generated goes straight to students.

## Decisions worth noting

- **Governance as a test suite.** The portal runs dedicated governance tests enforcing the source-only answering rule. The framing I wrote into the spec — *an encouraging wrong answer is a governance failure* — became the project's design principle: in education, confident hallucination does real harm.
- **Provider-agnostic AI wiring.** Tutoring, grading and content transformation each select their model independently through the Vercel AI SDK, so the best (or cheapest adequate) model can be chosen per function and swapped without a rewrite.
- **Deliberately boring auth.** Students log in with a student number and password — no OAuth, no magic links — because the users are cohorts onboarded from rosters, some sharing devices, and the simplest flow that works is the right one.
- **PII kept out of the repo.** Student rosters and credentials live outside version control by design.

## Outcome

Three student intakes (July, August and October 2026) were onboarded and used the portal in production. The unanswered-questions flag became a feedback loop into the official curriculum — the portal doesn't just deliver the material, it shows where the material falls short.
