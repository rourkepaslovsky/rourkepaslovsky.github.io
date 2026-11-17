# Portfolio — Rourke Paslovsky

Personal site. Astro, static, deployed to GitHub Pages on push to `main`.

The home page tells a story with one dot per commit. The dots start as noise and rearrange for
each chapter: a trend line, a globe, a calendar of every day worked, a bonsai, and finally one
point.

- **Dot engine:** `src/scripts/dots.js` (canvas, no dependencies). Chapters in
  `src/pages/index.astro` pick a formation with `data-formation`.
- **Commit data:** `src/data/activity.json`, commits per day. Rebuild it with
  `python3 scripts/activity.py src/data/activity.json <repo paths>`. Dates and counts only.
- **Case studies:** `src/content/work/`, one markdown file per project (schema in
  `src/content.config.ts`).
- **Ask box:** `src/components/Ask.astro` with retrieval in `src/lib/retrieve.js`. It quotes the
  site and declines when nothing matches.
- **Photo:** save a portrait as `public/rourke.jpg` and it appears in the "Roots" chapter.
- **Design tokens:** top of `src/styles/global.css`.

To add a project: run Claude Code from the project's repo and say "add this to my portfolio"
(the `/portfolio` skill handles the rest).

```sh
npm install
npm run dev      # local dev
npm run build    # production build (Node >= 22.23.4)
```
