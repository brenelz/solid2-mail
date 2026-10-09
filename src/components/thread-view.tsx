import { Title } from "@solidjs/meta";
import { useAction } from "@solidjs/router";
import { createEffect, createMemo, createOptimistic, For, Loading, Show } from "solid-js";
import { markThreadsRead, moveThreads, starThreads } from "../lib/mutations";
import { getEarlierMessages, getLatestMessage, getThreadSummary } from "../lib/queries";
import type { Message, ThreadSummary } from "../lib/types";
import { ArchiveIcon, ArchiveRestoreIcon, ArrowLeftIcon, StarIcon } from "./icons";
import { ReplyForm } from "./reply-form";
import {
  EarlierMessagesSkeleton,
  LatestMessageSkeleton,
  ThreadHeaderSkeleton,
  ThreadToolbarSkeleton,
} from "./skeletons";
import { iconButtonClass, LabelChip, UserAvatar } from "./ui";

/** A conversation, shared by `/:mailbox/:threadId` and `/search/:threadId` — only where "back" goes differs.
 *  It streams in stages like the original: toolbar and header from the summary, then the latest message
 *  with the reply form, then the earlier messages below it. */
export function ThreadView(props: { threadId: string; backHref: string }) {
  const summary = createMemo(() => getThreadSummary(props.threadId), { name: "threadSummary" });

  // Opening an unread thread marks it read (like the original). Done here rather than in a query, which
  // also runs from preloads (hover/prefetch) and must not mark anything. The action's revalidation refreshes
  // the lists and unread counts; once the thread comes back read this has nothing left to do.
  const markRead = useAction(markThreadsRead);
  createEffect(
    () => {
      const current = summary();
      return current && !current.read ? current.id : undefined;
    },
    (unreadId) => {
      if (unreadId) void markRead([unreadId], true);
    },
    { name: "markOpenedThreadRead" },
  );

  return (
    <div class="flex h-full flex-col">
      <Loading fallback={<ThreadToolbarSkeleton />}>
        {/* No Show around the toolbar: in production builds a Show here rebuilt it on every action. */}
        <ThreadToolbar backHref={props.backHref} thread={summary()} />
      </Loading>

      <article class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-24 sm:px-8">
        <div class="mx-auto w-full max-w-4xl">
          <Loading fallback={<ThreadHeaderSkeleton />}>
            <Show
              when={summary()}
              fallback={<p class="text-gray py-8 text-sm">This conversation could not be found.</p>}
            >
              {(t) => (
                <>
                  <Title>{`${t().subject} · Stamp`}</Title>
                  <header>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2 pt-4">
                      <h1 class="text-xl leading-7 font-semibold sm:text-2xl sm:leading-8">{t().subject}</h1>
                      <For each={t().labels} keyed={(label) => label.id}>
                        {(label) => <LabelChip label={label()} size="md" />}
                      </For>
                    </div>
                    <div class="mt-6">
                      <SenderRow message={t().latest} />
                    </div>
                  </header>
                  <div class="mt-5">
                    <Loading fallback={<LatestMessageSkeleton />}>
                      <LatestMessageView messageCount={t().messageCount} threadId={t().id} />
                      <Loading fallback={<EarlierMessagesSkeleton />}>
                        <EarlierMessagesView threadId={t().id} />
                      </Loading>
                    </Loading>
                  </div>
                </>
              )}
            </Show>
          </Loading>
        </div>
      </article>
    </div>
  );
}

function LatestMessageView(props: { threadId: string; messageCount: number }) {
  const latest = createMemo(() => getLatestMessage(props.threadId), { name: "latestMessage" });
  return (
    <Show when={latest()}>
      {(l) => (
        <>
          <MessageText paragraphs={l().message.paragraphs} />
          <ReplyForm messageCount={props.messageCount} replyTo={l().replyTo} threadId={props.threadId} />
        </>
      )}
    </Show>
  );
}

/** Newest first, under the reply form. */
function EarlierMessagesView(props: { threadId: string }) {
  const earlier = createMemo(() => getEarlierMessages(props.threadId), { name: "earlierMessages" });
  return (
    <Show when={earlier().length > 0}>
      <ol class="border-divider/70 mt-10 flex flex-col gap-8 border-t pt-8">
        <For each={earlier()} keyed={(message) => message.id}>
          {(message) => (
            <li class="border-divider/70 border-b pb-8 last:border-b-0 last:pb-0">
              <article>
                <SenderRow message={message()} />
                <div class="mt-4">
                  <MessageText paragraphs={message().paragraphs} />
                </div>
              </article>
            </li>
          )}
        </For>
      </ol>
    </Show>
  );
}

function SenderRow(props: { message: Pick<Message, "from" | "to" | "date"> }) {
  const to = () => props.message.to.map((person) => person.name.split(" ")[0]).join(", ");
  return (
    <div class="flex h-11 items-center gap-3">
      <UserAvatar name={props.message.from.name} size="lg" />
      <div class="min-w-0 flex-1">
        <p class="flex h-5 items-baseline gap-1.5 text-sm">
          <span class="truncate font-semibold tracking-tight">{props.message.from.name}</span>
          <span class="text-gray hidden truncate text-[13px] sm:inline">{props.message.from.email}</span>
        </p>
        <p class="text-gray flex h-5 items-center truncate text-[13px]">to {to()}</p>
      </div>
      <time class="text-gray shrink-0 text-xs tabular-nums">{props.message.date}</time>
    </div>
  );
}

function MessageText(props: { paragraphs: string[] }) {
  return (
    <div class="flex max-w-[68ch] flex-col gap-4 text-[15px] leading-[1.65] text-white/85">
      <For each={props.paragraphs}>{(paragraph) => <p>{paragraph}</p>}</For>
    </div>
  );
}

/** Back, Archive / Move to inbox and Star for the open thread. A missing thread shows only Back. */
function ThreadToolbar(props: { thread: ThreadSummary | undefined; backHref: string }) {
  const move = useAction(moveThreads);
  const star = useAction(starThreads);

  // Optimistic like the list rows: star and archive flip on submit and fall back to the server's values once saved.
  const [starred, setStarred] = createOptimistic(() => props.thread?.starred ?? false);
  const [mailbox, setMailbox] = createOptimistic(() => props.thread?.mailbox);
  const isThisThread = (ids: string[]) => !!props.thread && ids.includes(props.thread.id);
  // eslint-disable-next-line solid/reactivity -- action hooks are event-like: read the thread id at submit time
  starThreads.onSubmit((ids, value) => {
    if (isThisThread(ids)) setStarred(value);
  });
  // eslint-disable-next-line solid/reactivity -- action hooks are event-like: read the thread id at submit time
  moveThreads.onSubmit((ids, to) => {
    if (isThisThread(ids)) setMailbox(to);
  });

  const archived = () => mailbox() === "archive";

  return (
    <div class="border-divider/70 flex h-14 shrink-0 items-center gap-1 border-b bg-black px-3 sm:px-6">
      <a
        aria-label="Back to list"
        class="text-gray hover:bg-card inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:text-white"
        href={props.backHref}
      >
        <ArrowLeftIcon class="size-5" />
      </a>
      <span class="bg-divider mx-1 h-5 w-px" hidden={!props.thread} />
      {/* Sent threads have nowhere to be archived from (same rule as the list rows). */}
      <Show when={props.thread && props.thread.mailbox !== "sent"}>
        <button
          aria-label={archived() ? "Move to inbox" : "Archive"}
          class={iconButtonClass}
          onClick={() => void move([props.thread!.id], archived() ? "inbox" : "archive")}
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
        hidden={!props.thread}
        aria-pressed={starred() ? "true" : "false"}
        class={[
          "hover:bg-card inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
          starred() ? "text-accent" : "text-muted hover:text-white",
        ]}
        onClick={() => void star([props.thread!.id], !starred())}
        title={starred() ? "Remove star" : "Star"}
        type="button"
      >
        <StarIcon class="size-4" filled={starred()} />
      </button>
      <span class="text-gray ml-auto text-xs tabular-nums">
        {props.thread && (props.thread.messageCount === 1 ? "1 message" : `${props.thread.messageCount} messages`)}
      </span>
    </div>
  );
}
