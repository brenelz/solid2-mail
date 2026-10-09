import { Title } from "@solidjs/meta";
import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createProjection, Loading } from "solid-js";
import { ThreadListSkeleton } from "../../../components/skeletons";
import {
  mailboxEmptyCopy,
  ThreadList,
  ThreadListHeader,
} from "../../../components/thread-list";
import { ThreadSelection } from "../../../components/thread-selection";
import { MAILBOX_IDS, mailboxName, type Mailbox } from "../../../lib/mailboxes";
import { getThreads } from "../../../lib/queries";
import type { ThreadListItem } from "../../../lib/types";

export const route = defineFileRoute("/:mailbox", {
  matchFilters: { mailbox: MAILBOX_IDS },
  preload: ({ params }) => [void getThreads(params.mailbox as Mailbox)],
});

export default function MailboxPage(props: RouteProps<typeof route>) {
  // Safe: matchFilters only let the four mailbox ids reach this route.
  const mailbox = () => props.params.mailbox as Mailbox;
  const title = () => mailboxName(mailbox());
  // A projection reconciles each revalidation into the same row objects, so a star or archive updates rows in place.
  const threads = createProjection(() => getThreads(mailbox()), [] as ThreadListItem[], {
    key: "id",
    name: "mailboxThreads",
  });

  return (
    <div class="flex h-full flex-col">
      <Title>{`${title()} · Stamp`}</Title>
      <Loading fallback={<ThreadListSkeleton title={title()} />}>
        <ThreadSelection list={mailbox()} mailbox={mailbox()} threads={threads}>
          <ThreadListHeader
            count={threads.length}
            title={title()}
            total={threads.length}
          />
          <div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <ThreadList
              empty={mailboxEmptyCopy[mailbox()]}
              hrefFor={(id) => `/${mailbox()}/${id}`}
              threads={threads}
            />
          </div>
        </ThreadSelection>
      </Loading>
    </div>
  );
}
