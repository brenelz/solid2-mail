import { Title } from "@solidjs/meta";
import { createMemo, For, Loading, Show } from "solid-js";
import { getThread } from "../lib/queries";
import { ArchiveIcon, ArrowLeftIcon, SendIcon, StarIcon } from "./icons";
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
                {t().messageCount === 1
                  ? "1 message"
                  : `${t().messageCount} messages`}
              </span>
            </div>

            <article class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-24 sm:px-8">
              <div class="mx-auto w-full max-w-4xl">
                <header>
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-2 pt-4">
                    <h1 class="text-xl leading-7 font-semibold sm:text-2xl sm:leading-8">
                      {t().subject}
                    </h1>
                    <For each={t().labels}>
                      {(label) => <LabelChip label={label} size="md" />}
                    </For>
                  </div>
                  <div class="mt-6 flex h-11 items-center gap-3">
                    <UserAvatar name={t().from.name} size="lg" />
                    <div class="min-w-0 flex-1">
                      <p class="flex h-5 items-baseline gap-1.5 text-sm">
                        <span class="truncate font-semibold tracking-tight">
                          {t().from.name}
                        </span>
                        <span class="text-gray hidden truncate text-[13px] sm:inline">
                          {t().from.email}
                        </span>
                      </p>
                      <p class="text-gray flex h-5 items-center truncate text-[13px]">
                        to {t().to}
                      </p>
                    </div>
                    <time class="text-gray shrink-0 text-xs tabular-nums">
                      {t().date}
                    </time>
                  </div>
                </header>

                <div class="mt-5 min-h-48">
                  <div class="flex max-w-[68ch] flex-col gap-4 text-[15px] leading-[1.65] text-white/85">
                    <For each={t().paragraphs}>
                      {(paragraph) => <p>{paragraph}</p>}
                    </For>
                  </div>
                </div>

                <form class="mt-8 flex flex-col gap-3">
                  <label class="sr-only" for="reply">
                    Reply
                  </label>
                  <textarea
                    class="border-divider placeholder-gray focus:border-accent focus:ring-accent/25 bg-card min-h-24 w-full resize-y rounded-md border px-3 py-2 text-sm leading-relaxed text-white transition-colors focus:ring-2 focus:outline-none"
                    id="reply"
                    name="body"
                    placeholder={`Reply to ${t().replyTo}…`}
                  />
                  <div class="flex justify-end">
                    <span class="text-gray flex shrink-0 gap-2 pr-1 text-xs">
                      <button class="hover:text-white" type="button">
                        Cc
                      </button>
                      <button class="hover:text-white" type="button">
                        Bcc
                      </button>
                    </span>
                  </div>
                  <div class="flex items-center justify-end gap-3">
                    <button
                      class="bg-accent hover:bg-accent-hover inline-flex h-9 w-24 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition-colors"
                      type="button"
                    >
                      <SendIcon class="size-3.5" /> Send
                    </button>
                  </div>
                </form>
              </div>
            </article>
          </div>
        )}
      </Show>
    </Loading>
  );
}
