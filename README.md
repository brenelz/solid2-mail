# Stamp — SolidJS 2

A Gmail-style mail client demo built with **SolidJS 2** (Solid Router 2, server functions, streaming SSR). It's a
SolidJS port of Aurora Scharff's Next.js 16 demo, [aurorascharff/next16-mail](https://github.com/aurorascharff/next16-mail).

Source: https://github.com/brenelz/solid2-mail

```bash
pnpm install
pnpm dev     # http://localhost:5173
pnpm build   # Vercel build output (.vercel/output) via Nitro
```

The mail data is an in-memory mock (`src/lib/server.ts`); it resets when the server restarts.
