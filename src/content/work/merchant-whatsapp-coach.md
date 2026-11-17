---
title: "Merchant WhatsApp Coach"
outcome: "From client brief to a 440-agent WhatsApp rollout in under four weeks, by deliberately reusing a proven engine instead of rebuilding it."
client: "A mobile financial-services provider"
role: "Sole engineer — design, build, rollout"
period: "October to November 2026"
stack: ["Next.js", "TypeScript", "WhatsApp Cloud API (direct)", "Supabase (Postgres, pgvector)", "Claude (Anthropic API)", "Voyage embeddings", "Vercel"]
order: 3
---

## The problem

The client's merchant-acquisition teams — 440 field agents signing up small businesses for a merchant payments app — needed training support where they actually work: inside WhatsApp. The timeline was unforgiving: nine days from brief to demo, a pilot by the end of the month, and full rollout in under four weeks.

## What I built

A two-way WhatsApp coach that turns the client's 38-slide training plan into tappable FAQs plus free-text questions and answers in four languages, talking directly to Meta's WhatsApp Cloud API with no intermediary provider. Behind it, a reporting dashboard for the agency and the client surfaces answer quality, knowledge gaps, cohort usage and feedback, with a rehearsal simulator for testing conversations before they reach real agents.

The product's rules are encoded, not aspirational: grounded answers only, no financial advice (a regulatory requirement in South African financial services), the coach never messages first, language is chosen by the agent rather than guessed, and costs are controlled through a roster allow-list and per-agent caps.

## Decisions worth noting

- **Reuse over rewrite, logged as a decision.** The retrieval and answering engine was lifted from the [multilingual field coach](/work/field-coach/) rather than rebuilt. On a four-week timeline, the highest-risk components should be ones already proven in production — and the decision record explains the trade-off for whoever maintains it next.
- **Direct Cloud API integration.** Skipping a WhatsApp business service provider cut cost and latency, in exchange for owning the edge cases — template approval flows, session windows, delivery quirks — which are now institutional knowledge.
- **Compliance in the product law, not the fine print.** FAIS constraints shaped what the coach is allowed to say at the engine level.

## Outcome

Pilot ran on schedule in late October; rollout to the full 440-agent field force began in early November 2026. The four-week delivery was only possible because of the reuse decision — a case where the architecture choice *was* the project plan.
