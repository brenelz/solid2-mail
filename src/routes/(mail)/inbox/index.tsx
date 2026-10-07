import { Title } from "@solidjs/meta";
import { createMemo, Loading } from "solid-js";
import { ThreadListSkeleton } from "../../../components/skeletons";
import { ThreadList, ThreadListHeader } from "../../../components/thread-list";
import { getThreads } from "../../../lib/queries";
import { defineFileRoute } from "@solidjs/router/fs";

export const route = defineFileRoute("/inbox", {
  preload: () => getThreads("inbox"),
});

export default function InboxPage() {
  const threads = createMemo(() => getThreads("inbox"), {
    name: "inboxThreads",
  });

  return (
    <div class="flex h-full flex-col">
      <Title>Inbox · Stamp</Title>
      <Loading fallback={<ThreadListSkeleton title="Inbox" />}>
        <ThreadListHeader
          count={threads().length}
          title="Inbox"
          total={threads().length}
        />
        <div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <ThreadList mailbox="inbox" threads={threads()} />
        </div>
      </Loading>
    </div>
  );
}
