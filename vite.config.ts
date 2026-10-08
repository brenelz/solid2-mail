import { fileRoutes } from "filesystem-routing/vite";
import { nitro } from "nitro/vite";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // Nitro takes the dev port from here (it would otherwise default to 3000); keep Vite's usual 5173.
  server: { port: 5173 },
  // Inline seroval + seroval-plugins in dev SSR so both resolve the same build (with the `development`
  // condition). Externalized, Node loads seroval-plugins' own `seroval` import as the production build: a
  // second instance whose `Stream` fails the serializer's `instanceof` check — breaking server components.
  ssr: { noExternal: ["seroval", "seroval-plugins"] },
  plugins: [
    solid({
      start: {
        middleware: "./src/middleware.ts",
        node: true,
      },
      ssr: true,
      diagnostics: true,
      serverFunctions: { configure: "./src/server-config.ts", components: true },
    }),
    fileRoutes({ httpMethods: true, types: true }),
    tailwindcss(),
    // Nitro adopts Solid's `ssr` environment (its `index` entry is the `{ fetch }` handler) and packages the
    // build for Vercel: `vite build` writes `.vercel/output` (Build Output API), which Vercel deploys as-is.
    nitro({ preset: "vercel" }),
  ],
});
