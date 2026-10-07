import { query } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { redirect } from "@solidjs/web";

// `/` has no page of its own. The router only follows redirects returned from a query: on the server
// that becomes a 302, on the client a soft `replace` navigation.
const redirectToInbox = query(() => redirect("/inbox"), "redirectToInbox");

export const route = defineFileRoute("/", {
  preload: () => redirectToInbox(),
});

export default function Index() {
  return null;
}
