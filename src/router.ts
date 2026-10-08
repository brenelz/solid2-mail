import { pageRoutes } from "virtual:file-routes";
import { createRouter } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";

// scrollRestoration off: its effect looped under fast back-to-back navigations ("Potential Infinite Loop
// Detected", 400k+ runs in the optimistic phase), which also left the graph half-built (GRAPH_GROWTH).
// It restores *window* scroll, and nothing here scrolls the window (lists and threads scroll in <main>),
// so turning it off loses nothing. Revisit once fixed upstream in @solidjs/router.
export const Router = createRouter({ routes: fileRoutes(pageRoutes), scrollRestoration: false });

export const { paths } = Router;
