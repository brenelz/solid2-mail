import { Title } from "@solidjs/meta";
import { useAction, useNavigate } from "@solidjs/router";
import { createEffect, createMemo, createOptimistic, For, Loading, Show } from "solid-js";
import { markThreadsRead, moveThreads, starThreads } from "../lib/mutations";
import { getThread } from "../lib/queries";
import type { Message, Thread } from "../lib/types";
import { ArchiveIcon, ArchiveRestoreIcon, ArrowLeftIcon, StarIcon } from "./icons";
import { ReplyForm } from "./reply-form";
import { ThreadPageSkeleton } from "./skeletons";
import { iconButtonClass, LabelChip, UserAvatar } from "./ui";

/** A conversation, shared by `/:mailbox/:threadId` and `/search/:threadId` — only where "back" goes differs. */
export function ThreadView(props: { threadId: string; backHref: string }) {
  const thread = createMemo(() => getThread(props.threadId), {
    name: "thread",
  });

  // Opening an unread thread marks it read (like the original). Done here rather than in `getThread`, which
  // also runs from preloads (hover/prefetch) and must not mark anything. The action's revalidation refreshes
  // the lists and unread counts; once the thread comes back read this has nothing left to do.
  const markRead = useAction(markThreadsRead);
  createEffect(
    () => {
      const current = thread();
      return current && !current.read ? current.id : undefined;
    },
    (unreadId) => {
      if (unreadId) void markRead([unreadId], true);
    },
  );

  return (
    <Loading fallback={<ThreadPageSkeleton />}>
      <Show
        when={thread()}
        fallback={
          <p class="text-gray p-8 text-sm">
            This conversation could not be found.
          </p>
        }
      >
        {(t) => (
          <div class="flex h-full flex-col">
            <Title>{`${t().subject} · Stamp`}</Title>
            <ThreadToolbar backHref={props.backHref} thread={t()} />

            <article class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-24 sm:px-8">
              <div class="mx-auto w-full max-w-4xl">
                <header class="flex flex-wrap items-center gap-x-3 gap-y-2 pt-4">
                  <h1 class="text-xl leading-7 font-semibold sm:text-2xl sm:leading-8">{t().subject}</h1>
                  <For each={t().labels}>{(label) => <LabelChip label={label} size="md" />}</For>
                </header>

                <ol class="mt-6 flex flex-col">
                  <For each={t().messages}>
                    {(message) => (
                      <li class="border-divider/70 border-t pt-6 pb-8 first:border-t-0 first:pt-0 last:pb-0">
                        <MessageView message={message} />
                      </li>
                    )}
                  </For>
                </ol>

                <ReplyForm messageCount={t().messages.length} replyTo={t().replyTo} threadId={t().id} />
              </div>
            </article>
          </div>
        )}
      </Show>
    </Loading>
  );
}

function MessageView(props: { message: Message }) {
  const to = () => props.message.to.map((person) => person.name.split(" ")[0]).join(", ");
  return (
    <article>
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
      <div class="mt-4 flex max-w-[68ch] flex-col gap-4 text-[15px] leading-[1.65] text-white/85">
        <For each={props.message.paragraphs}>{(paragraph) => <p>{paragraph}</p>}</For>
      </div>
    </article>
  );
}

/** Back, Archive / Move to inbox and Star for the open thread. */
function ThreadToolbar(props: { thread: Thread; backHref: string }) {
  const navigate = useNavigate();
  const move = useAction(moveThreads);
  const star = useAction(starThreads);

  // Optimistic like the list rows: the star flips on submit and falls back to the server's value once saved.
  const [starred, setStarred] = createOptimistic(() => props.thread.starred);
  const [moving, setMoving] = createOptimistic(false);
  const isThisThread = (ids: string[]) => ids.includes(props.thread.id);
  // eslint-disable-next-line solid/reactivity -- action hooks are event-like: read the thread id at submit time
  starThreads.onSubmit((ids, value) => {
    if (isThisThread(ids)) setStarred(value);
  });
  // eslint-disable-next-line solid/reactivity -- action hooks are event-like: read the thread id at submit time
  moveThreads.onSubmit((ids) => {
    if (isThisThread(ids)) setMoving(true);
  });

  const archived = () => props.thread.mailbox === "archive";
  // Like the original: once moved, the thread no longer belongs where you were reading it, so go back to the list.
  const toggleArchived = async () => {
    const result = await move([props.thread.id], archived() ? "inbox" : "archive");
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
      <Show when={props.thread.mailbox !== "sent"}>
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
        onClick={() => void star([props.thread.id], !starred())}
        title={starred() ? "Remove star" : "Star"}
        type="button"
      >
        <StarIcon class="size-4" filled={starred()} />
      </button>
      <span class="text-gray ml-auto text-xs tabular-nums">
        {props.thread.messages.length === 1 ? "1 message" : `${props.thread.messages.length} messages`}
      </span>
    </div>
  );
}
