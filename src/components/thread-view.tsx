import { Title } from "@solidjs/meta";
import { createMemo, For, Loading, Show } from "solid-js";
import { getThread } from "../lib/queries";
import type { Message } from "../lib/types";
import { ArchiveIcon, ArrowLeftIcon, StarIcon } from "./icons";
import { ReplyForm } from "./reply-form";
import { ThreadPageSkeleton } from "./skeletons";
import { iconButtonClass, LabelChip, UserAvatar } from "./ui";

/** A conversation, shared by `/:mailbox/:threadId` and `/search/:threadId` — only where "back" goes differs. */
export function ThreadView(props: { threadId: string; backHref: string }) {
  const thread = createMemo(() => getThread(props.threadId), {
    name: "thread",
  });

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
            <div class="border-divider/70 flex h-14 shrink-0 items-center gap-1 border-b bg-black px-3 sm:px-6">
              <a
                aria-label="Back to list"
                class="text-gray hover:bg-card inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:text-white"
                href={props.backHref}
              >
                <ArrowLeftIcon class="size-5" />
              </a>
              <span class="bg-divider mx-1 h-5 w-px" />
              <button
                aria-label="Archive"
                class={iconButtonClass}
                title="Archive"
                type="button"
              >
                <ArchiveIcon class="size-4" />
              </button>
              <button
                aria-label={t().starred ? "Remove star" : "Star"}
                aria-pressed={t().starred ? "true" : "false"}
                class={[
                  "hover:bg-card inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                  t().starred ? "text-accent" : "text-muted hover:text-white",
                ]}
                title={t().starred ? "Remove star" : "Star"}
                type="button"
              >
                <StarIcon class="size-4" filled={t().starred} />
              </button>
              <span class="text-gray ml-auto text-xs tabular-nums">
                {t().messages.length === 1 ? "1 message" : `${t().messages.length} messages`}
              </span>
            </div>

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
