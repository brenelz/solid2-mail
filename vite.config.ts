import { fileRoutes } from "filesystem-routing/vite";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    solid({
      start: {
        middleware: "./src/middleware.ts",
        node: true,
      },
      ssr: true,
      diagnostics: true,
      serverFunctions: { configure: "./src/server-config.ts" },
    }),
    fileRoutes({ httpMethods: true, types: true }),
    tailwindcss(),
  ],
});
