import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { ThreadView } from "../../../components/thread-view";
import { getThread } from "../../../lib/queries";
import { searchHref, searchQuery } from "../../../lib/search";

export const route = defineFileRoute("/search/:threadId", {
  preload: ({ params }) => getThread(params.threadId),
});

// Back returns to the same search (`?q=` rides along on the thread URL).
export default function SearchThreadPage(props: RouteProps<typeof route>) {
  return (
    <ThreadView backHref={searchHref(searchQuery(props.location.query))} threadId={props.params.threadId} />
  );
}
