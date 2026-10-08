import { Title } from "@solidjs/meta";
import { useAction, useNavigate } from "@solidjs/router";
import { dynamicComponent } from "@solidjs/web";
import { createEffect, createOptimistic, Loading, Show } from "solid-js";
import { markThreadsRead, moveThreads, starThreads } from "../lib/mutations";
import { getThread } from "../lib/queries";
import type { ThreadLocation } from "../lib/types";
import { ArchiveIcon, ArchiveRestoreIcon, ArrowLeftIcon, StarIcon } from "./icons";
import { ReplyForm } from "./reply-form";
import { ThreadPageSkeleton } from "./skeletons";
import { iconButtonClass } from "./ui";

/**
 * A conversation, shared by `/:mailbox/:threadId` and `/search/:threadId` — only where "back" goes differs.
 * `getThread` is a server component: the messages render on the server; the props below fill its client
 * positions (the page title, the toolbar, marking it read, the reply form).
 */
export function ThreadView(props: { threadId: string; backHref: string }) {
  const Thread = dynamicComponent(() => getThread(props.threadId));

  return (
    <Loading fallback={<ThreadPageSkeleton />}>
      <Thread
        opened={MarkOpenedRead}
        reply={ReplyForm}
        title={ThreadTitle}
        toolbar={(toolbar) => <ThreadToolbar {...toolbar} backHref={props.backHref} />}
      />
    </Loading>
  );
}

export function ThreadTitle(props: { subject: string }) {
  return <Title>{`${props.subject} · Stamp`}</Title>;
}

/**
 * Opening an unread thread marks it read (like the original). Done here rather than in `getThread`, which also
 * runs from preloads (hover/prefetch) and must not mark anything. The action's revalidation refreshes the lists
 * and unread counts; once the thread comes back read this has nothing left to do. Renders nothing.
 */
export function MarkOpenedRead(props: { id: string; read: boolean }) {
  const markRead = useAction(markThreadsRead);
  createEffect(
    () => (props.read ? undefined : props.id),
    (unreadId) => {
      if (unreadId) void markRead([unreadId], true);
    },
    { name: "markOpenedThreadRead" },
  );
  return null;
}

/** What the server passes the toolbar slot: the open thread's state. */
export type ThreadToolbarData = {
  id: string;
  starred: boolean;
  mailbox: ThreadLocation;
  messageCount: number;
};

/** Back, Archive / Move to inbox and Star for the open thread. */
function ThreadToolbar(props: ThreadToolbarData & { backHref: string }) {
  const navigate = useNavigate();
  const move = useAction(moveThreads);
  const star = useAction(starThreads);

  // Optimistic like the list rows: the star flips on submit and falls back to the server's value once saved.
  const [starred, setStarred] = createOptimistic(() => props.starred);
  const [moving, setMoving] = createOptimistic(false);
  const isThisThread = (ids: string[]) => ids.includes(props.id);
  // eslint-disable-next-line solid/reactivity -- action hooks are event-like: read the thread id at submit time
  starThreads.onSubmit((ids, value) => {
    if (isThisThread(ids)) setStarred(value);
  });
  // eslint-disable-next-line solid/reactivity -- action hooks are event-like: read the thread id at submit time
  moveThreads.onSubmit((ids) => {
    if (isThisThread(ids)) setMoving(true);
  });

  const archived = () => props.mailbox === "archive";
  // Like the original: once moved, the thread no longer belongs where you were reading it, so go back to the list.
  const toggleArchived = async () => {
    const result = await move([props.id], archived() ? "inbox" : "archive");
    if (result?.ok) navigate(props.backHref);
  };

  return (
    <div class="border-divider/70 flex h-14 shrink-0 items-center gap-1 border-b bg-black px-3 sm:px-6">
      <a
        aria-label="Back to list"
        class="text-gray hover:bg-card inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:text-white"
        href={props.backHref}
      >
        <ArrowLeftIcon class="size-5" />
      </a>
      <span class="bg-divider mx-1 h-5 w-px" />
      {/* Sent threads have nowhere to be archived from (same rule as the list rows). */}
      <Show when={props.mailbox !== "sent"}>
        <button
          aria-busy={moving() ? "true" : undefined}
          aria-label={archived() ? "Move to inbox" : "Archive"}
          class={[iconButtonClass, "disabled:cursor-default disabled:opacity-40"]}
          disabled={moving()}
          onClick={() => void toggleArchived()}
          title={archived() ? "Move to inbox" : "Archive"}
          type="button"
        >
          <Show when={archived()} fallback={<ArchiveIcon class="size-4" />}>
            <ArchiveRestoreIcon class="size-4" />
          </Show>
        </button>
      </Show>
      <button
        aria-label={starred() ? "Remove star" : "Star"}
        aria-pressed={starred() ? "true" : "false"}
        class={[
          "hover:bg-card inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
          starred() ? "text-accent" : "text-muted hover:text-white",
        ]}
        onClick={() => void star([props.id], !starred())}
        title={starred() ? "Remove star" : "Star"}
        type="button"
      >
        <StarIcon class="size-4" filled={starred()} />
      </button>
      <span class="text-gray ml-auto text-xs tabular-nums">
        {props.messageCount === 1 ? "1 message" : `${props.messageCount} messages`}
      </span>
    </div>
  );
}
