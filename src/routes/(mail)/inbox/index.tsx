import { Title } from "@solidjs/meta";
import { ThreadList, ThreadListHeader } from "../../../components/thread-list";
import { threads } from "../../../lib/data";

export default function InboxPage() {
  return (
    <div class="flex h-full flex-col">
      <Title>Inbox · Stamp</Title>
      <ThreadListHeader count={threads.length} title="Inbox" total={threads.length} />
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <ThreadList mailbox="inbox" threads={threads} />
      </div>
    </div>
  );
}
