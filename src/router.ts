import { pageRoutes } from "virtual:file-routes";
import { createRouter, intentPreload, pendingLinks } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";

export const Router = createRouter({
  routes: fileRoutes(pageRoutes),
  links: pendingLinks,
  preloadLinks: intentPreload(),
});

export const { paths } = Router;
