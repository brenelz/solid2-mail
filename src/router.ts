import { pageRoutes } from "virtual:file-routes";
import { createRouter, intentPreload, pendingLinks, viewportPreload } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";

export const Router = createRouter({
  routes: fileRoutes(pageRoutes),
  links: pendingLinks,
  // Links marked preload="viewport" (the mailboxes) also load their data once visible.
  preloadLinks: [intentPreload(), viewportPreload({ data: true })],
});

export const { paths } = Router;
