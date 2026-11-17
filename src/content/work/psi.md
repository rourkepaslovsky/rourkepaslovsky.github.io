---
title: "PSI — Pre-Sales Intelligence"
outcome: "A multi-tenant AI lead-qualification platform, now a commercial offering serving eleven client tenants across insurance, telecoms, logistics and education."
client: "GAS Marketing (productised offering)"
role: "Sole engineer — design, build, operations"
period: "May 2026, ongoing"
stack: ["TypeScript", "Next.js", "Supabase (Postgres, RLS, Realtime)", "Claude (Anthropic API)", "WhatsApp Cloud API", "Meta CAPI & Lead Ads", "Google Ads", "Zoho CRM", "Vercel"]
flow:
  - step: "A lead arrives"
    detail: "From a landing page, a Meta lead form, WhatsApp, the web chatbot or a voice call."
  - step: "The speaker converses"
    detail: "A Claude-driven agent qualifies the lead in natural conversation. It never sees the scoring rubric."
  - step: "The grader scores"
    detail: "A separate model scores the conversation and writes the intelligence brief. It never speaks to the lead."
  - step: "The dashboard ranks"
    detail: "Sales-ready opportunities surface on a realtime dashboard for that tenant."
  - step: "Signals flow back"
    detail: "High scorers go to humans or get booked; conversions return to the CRM, Meta and Google."
order: 1
---

## The problem

Marketing agencies generate leads; sales teams drown in them. Most leads from Meta forms, landing pages and WhatsApp are unqualified, and human agents either respond too slowly or waste hours on people who were never going to buy. GAS Marketing needed a way to qualify, score and nurture every lead automatically — and to sell that capability to clients as a product, not a one-off build.

## What I built

PSI is a multi-tenant SaaS platform where leads arrive from landing pages, Meta lead forms, WhatsApp, a web chatbot and voice calls, and are engaged in natural conversation by Claude-driven agents. Each conversation qualifies the lead against the client's criteria, produces a score with an intelligence brief, and surfaces ranked sales-ready opportunities on a realtime per-tenant dashboard. High scorers are handed to humans or booked directly; the rest enter scheduled WhatsApp nurture arcs. Confirmed conversions flow back to Meta and Google as offline conversion signals, and into the client's CRM.

The platform runs a fleet of nine scheduled AI agents — an internal system I called the Watchtower — that sweep conversations and performance data daily, weekly and monthly: detecting silent failures, grading conversation quality, proposing improvements to the conversational playbooks, and feeding an operations alert feed. Deterministic sentinels catch what probabilistic review might miss.

## Decisions worth noting

- **Separating the speaker from the grader.** The model that talks to the lead never sees the scoring rubric, and the model that scores never speaks. This prevents the conversation from gaming its own evaluation and keeps qualification honest.
- **Multi-tenancy at the database layer.** Tenant isolation is enforced with Postgres row-level security and verified by automated isolation tests in CI, not by application-code discipline alone.
- **Operations as a first-class feature.** The repo ships with runbooks for client onboarding, rollback, and secret rotation when a team member leaves; CI runs secret scanning and migration-permission checks. An incident ledger records every production gotcha so nothing is learned twice.

## Outcome

PSI went from first commit to a commercial lead-generation offering in six months — roughly 1,500 commits, 117 database migrations, and eleven live client tenants — and is now a product GAS Marketing sells, with scheduled AI agents reviewing and improving it continuously.
