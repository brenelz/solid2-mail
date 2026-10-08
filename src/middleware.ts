import type { StartMiddleware } from "@solidjs/vite-plugin";
import { createAPIHandler } from "filesystem-routing/api";
import routes from "virtual:file-routes";

// createAPIHandler still speaks the previous (request, next) middleware shape.
const api = createAPIHandler(routes);

const handleAPI: StartMiddleware = (event, next) => api(event.request, next);

export default [handleAPI];
