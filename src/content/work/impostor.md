---
title: "Impostor"
outcome: "A realtime social-deduction party game — host screen plus a phone per player — built for remote team sessions, with sound, mugshot polaroids and a dramatic reveal."
client: "Side project"
role: "Design, build, game design"
period: "August 2026"
stack: ["Node.js", "Express", "Socket.io", "Vanilla JS"]
order: 6
---

## What it is

A noir-interrogation-themed take on the Undercover party game, built for my team's remote Friday sessions. One screen is shared in the video call as the host view; every player joins from their phone. Secret word cards go out, a speaking-order spotlight keeps rounds moving, accusations land on a live wall, and the reveal gets the full dramatic treatment — confetti included.

No framework, no build step: an Express server, Socket.io for realtime state, and hand-written HTML and JavaScript for both screens.

## Why it's here

Portfolios can make a person look like their job title and nothing else. This one is for craft and personality: realtime multiplayer state synchronisation across many devices is a genuinely fiddly engineering problem, and the details — face-photo mugshot polaroids from the team roster, sound design, a voting rule where the impostor is only convicted on a *strict* majority so a lone correct guess can't convict — are where it was fun to get it right. It also got my coworkers laughing on a Friday, which is its own kind of production outcome.
