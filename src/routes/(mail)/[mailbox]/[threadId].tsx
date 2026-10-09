import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { ThreadView } from "../../../components/thread-view";
import { MAILBOX_IDS } from "../../../lib/mailboxes";
import { preloadThread } from "../../../lib/queries";

export const route = defineFileRoute("/:mailbox/:threadId", {
  matchFilters: { mailbox: MAILBOX_IDS },
  preload: ({ params, intent }) => preloadThread(params.threadId, intent),
});

export default function ThreadPage(props: RouteProps<typeof route>) {
  return (
    <ThreadView
      backHref={`/${props.params.mailbox}`}
      threadId={props.params.threadId}
    />
  );
}
