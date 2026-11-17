---
title: "Tech Stack 2.0"
outcome: "An internal platform that reads the accountant's monthly expense email and reconciles the company's entire software spend — the robot proposes, a human approves."
client: "GAS Marketing (internal)"
role: "Sole engineer"
period: "September to November 2026"
stack: ["Next.js", "TypeScript", "Supabase", "Resend (inbound & outbound email)", "Zod", "Vitest", "Vercel"]
order: 5
---

## The problem

Like most agencies, GAS pays for dozens of software tools across many accounts, and the only ground truth for what's actually being spent is the accountant's monthly expense summary — a spreadsheet in an email. Keeping a register of tools, costs and logins current by hand never survives contact with a busy month.

## What I built

Tech Stack 2.0 is a register of every tool the company pays for — cost per month, accounts, access — that keeps itself current. The accountant's monthly summary is ingested by inbound email: costs update automatically, and anything unusual (a new line item, a jump in spend, a tool that disappeared) is filed into a short review list for a human to approve. A daily watchdog notices when the statement hasn't arrived; summary emails keep the team informed; a 12-month average tracks cost drift.

It also handled its own migration: a staged extract-and-decide flow moved data from the old register with a hard no-bulk-delete rule, a restore path, and a keep-as-new-tool path for ambiguous rows.

## Decisions worth noting

- **Trust the right email verdict.** Inbound processing trusts the email provider's DKIM/DMARC verification and deliberately ignores weaker forwarding signals — getting email authentication subtly wrong is how automation becomes an attack surface. An email-replay tool makes ingestion debuggable after the fact.
- **The robot proposes, a human approves.** Automation does the tedious reconciliation; judgment calls go to a short human review queue. This pattern — full automation of the toil, human control of the decisions — is one I apply across my work.

## Outcome

Live and in monthly use at GAS. Small, finished, documented — shipped with workflows for go-live, migration and the monthly reconciliation, plus a decisions log for whoever touches it next.
