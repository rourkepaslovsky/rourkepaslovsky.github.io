# Portfolio — Rourke Paslovsky

Personal portfolio site. Astro, static, deployed to GitHub Pages on push to `main`.

- Case studies live in `src/content/work/` — one markdown file per project (schema in `src/content.config.ts`).
- Design tokens in `src/styles/global.css`.
- To add a project: run Claude Code from the project's repo and say "add this to my portfolio" (the `/portfolio` skill handles the rest).

```sh
npm install
npm run dev      # local dev
npm run build    # production build (Node >= 22.23.4)
```
