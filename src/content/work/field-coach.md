---
title: "Multilingual Field Coach"
outcome: "A four-language AI coach for a mobile-money field force that answers only from approved material, with a citation on every answer and an eval harness per language."
client: "A mobile financial-services provider"
role: "Sole engineer — design, build, deployment"
period: "August to November 2026"
stack: ["Next.js", "TypeScript", "Supabase (Postgres, pgvector)", "Claude (Anthropic API)", "Voyage embeddings", "PWA", "Vercel"]
order: 2
---

## The problem

The client's field agents sell and support a mobile-money wallet across South Africa. They work far from head office, their questions are urgent and practical, and a wrong answer about a financial product is worse than no answer. Training material existed — but as documents nobody opens on a street corner.

## What I built

The coach is an installable web app that puts an always-on AI coach in every field agent's pocket, in English, Afrikaans, isiZulu and isiXhosa. Agents ask free-text questions or tap guide tiles; the coach answers exclusively from client-approved knowledge, retrieved from a curated vector store, and cites its source on every answer. If the knowledge base doesn't contain the answer, the coach says so rather than improvising.

Behind the app sits a content pipeline — ingest, query and evaluation commands that rebuild and test the knowledge base — and a performance dashboard that gives the client a weekly view of agent activity, popular guides and unanswered questions, which doubles as a signal for where the official training material has gaps.

## Decisions worth noting

- **Grounding as a hard rule, tested in CI.** The eval harness runs in all four languages and treats a fluent, plausible, unsourced answer as a failure. Accuracy constraints are enforced by tests, not by prompt hopefulness.
- **Treating low-resource languages seriously.** isiZulu and isiXhosa answers go through a dedicated language pack — a wordbook, a checker and a repair pass — because embedding-era tooling underserves these languages and "mostly right" isn't acceptable in a user's home language.
- **A demo-reset script that spares real data**, so sales demonstrations can never corrupt production usage history.

## Outcome

The coach is live in production with the client's staff accounts onboarded, and its usage analytics matured into a weekly performance report the client uses to understand its field force. The engine proved solid enough that it was reused wholesale for a [second product for the same client](/work/merchant-whatsapp-coach/) eight weeks later.
