import { Title } from "@solidjs/meta";
import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { dynamicComponent } from "@solidjs/web";
import { Loading } from "solid-js";
import { ThreadListSkeleton } from "../../../components/skeletons";
import { ThreadListHeader, threadRowBehavior } from "../../../components/thread-list";
import { ThreadSelection } from "../../../components/thread-selection";
import { MAILBOX_IDS, mailboxName, type Mailbox } from "../../../lib/mailboxes";
import { getThreads } from "../../../lib/queries";

export const route = defineFileRoute("/:mailbox", {
  matchFilters: { mailbox: MAILBOX_IDS },
  preload: ({ params }) => [void getThreads(params.mailbox as Mailbox)],
});

export default function MailboxPage(props: RouteProps<typeof route>) {
  // Safe: matchFilters only let the four mailbox ids reach this route.
  const mailbox = () => props.params.mailbox as Mailbox;
  const title = () => mailboxName(mailbox());
  // A server component: the rows render on the server; the props below fill its client positions.
  const Threads = dynamicComponent(() => getThreads(mailbox()));

  return (
    <div class="flex h-full flex-col">
      <Title>{`${title()} · Stamp`}</Title>
      <Loading fallback={<ThreadListSkeleton title={title()} />}>
        <ThreadSelection list={mailbox()} mailbox={mailbox()}>
          <Threads header={ThreadListHeader} row={threadRowBehavior} />
        </ThreadSelection>
      </Loading>
    </div>
  );
}
