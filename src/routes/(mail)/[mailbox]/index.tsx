import { Title } from "@solidjs/meta";
import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Loading } from "solid-js";
import { ThreadListSkeleton } from "../../../components/skeletons";
import { mailboxEmptyCopy, ThreadList, ThreadListHeader } from "../../../components/thread-list";
import { MAILBOX_IDS, mailboxName, type Mailbox } from "../../../lib/mailboxes";
import { getThreads } from "../../../lib/queries";

export const route = defineFileRoute("/:mailbox", {
  matchFilters: { mailbox: MAILBOX_IDS },
  preload: ({ params }) => getThreads(params.mailbox as Mailbox),
});

export default function MailboxPage(props: RouteProps<typeof route>) {
  // Safe: matchFilters only let the four mailbox ids reach this route.
  const mailbox = () => props.params.mailbox as Mailbox;
  const title = () => mailboxName(mailbox());
  const threads = createMemo(() => getThreads(mailbox()), { name: "mailboxThreads" });

  return (
    <div class="flex h-full flex-col">
      <Title>{`${title()} · Stamp`}</Title>
      <Loading fallback={<ThreadListSkeleton title={title()} />}>
        <ThreadListHeader count={threads().length} title={title()} total={threads().length} />
        <div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <ThreadList
            empty={mailboxEmptyCopy[mailbox()]}
            hrefFor={(id) => `/${mailbox()}/${id}`}
            threads={threads()}
          />
        </div>
      </Loading>
    </div>
  );
}
