import { For, Show } from "solid-js";
import type { Mailbox, ThreadListItem } from "../lib/types";
import {
  ArchiveIcon,
  BrandMark,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon,
  MailOpenIcon,
  PaperclipIcon,
  StarIcon,
} from "./icons";
import { LabelChip, RowButton, UserAvatar } from "./ui";

const pagerLinkClass =
  "text-gray inline-flex size-6 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white";

/** Without `count` the pager is hidden — e.g. search before anything is typed. */
export function ThreadListHeader(props: { title: string; count?: number; total?: number }) {
  return (
    <div class="border-divider/70 flex h-12 shrink-0 items-center justify-between gap-3 border-b bg-black px-4 sm:px-5">
      <div class="flex min-w-0 items-center gap-3">
        <button
          aria-checked="false"
          aria-label="Select all on this page"
          class="border-gray/50 bg-card enabled:hover:border-gray ml-2 flex size-5 shrink-0 items-center justify-center rounded-full border text-transparent transition-colors"
          role="checkbox"
          type="button"
        >
          <CheckIcon class="size-3" stroke-width={3} />
        </button>
        <h2 class="truncate text-sm font-semibold tracking-tight">{props.title}</h2>
      </div>
      <Show when={props.count !== undefined}>
      <div class="flex shrink-0 items-center gap-1">
        <span class="text-gray mr-1 text-xs tabular-nums">
          {props.count ? `1–${props.count}` : 0} of {props.total}
        </span>
        <span aria-disabled="true" class={`${pagerLinkClass} cursor-default opacity-40 hover:bg-transparent`}>
          <ChevronLeftIcon class="size-4" />
        </span>
        <span aria-disabled="true" class={`${pagerLinkClass} cursor-default opacity-40 hover:bg-transparent`}>
          <ChevronRightIcon class="size-4" />
        </span>
      </div>
      </Show>
    </div>
  );
}

export const mailboxEmptyCopy: Record<Mailbox, { title: string; body: string }> = {
  inbox: { title: "Inbox zero", body: "New conversations show up here as they arrive." },
  starred: { title: "No starred conversations", body: "Star a conversation to keep it close." },
  sent: { title: "Nothing sent yet", body: "Replies and new messages you write show up here." },
  archive: { title: "Nothing archived", body: "Archived conversations land here and stay searchable." },
};

export function ThreadList(props: {
  threads: ThreadListItem[];
  /** Where a row links — the thread inside this list's own route (mailbox or search). */
  hrefFor: (threadId: string) => string;
  empty: { title: string; body?: string };
}) {
  return (
    <Show when={props.threads.length > 0} fallback={<EmptyState body={props.empty.body} title={props.empty.title} />}>
      <ul aria-label="Conversations" class="flex flex-col">
        <For each={props.threads}>{(thread) => <ThreadRow href={props.hrefFor(thread.id)} thread={thread} />}</For>
      </ul>
    </Show>
  );
}

export function EmptyState(props: { title: string; body?: string }) {
  return (
    <div class="border-divider m-3 flex flex-col items-center gap-3 rounded-lg border border-dashed px-5 py-16 text-center">
      <BrandMark class="text-divider size-8" />
      <p class="text-sm font-medium text-white">{props.title}</p>
      <Show when={props.body}>
        <p class="text-muted max-w-xs text-sm">{props.body}</p>
      </Show>
    </div>
  );
}

const hoverOnly = "invisible size-8 group-hover:visible group-has-[:focus-visible]:visible";

function ThreadRow(props: { href: string; thread: ThreadListItem }) {
  const sender = () => props.thread.participants.at(-1) ?? "";
  const emphasis = () => (props.thread.read ? "text-white/70" : "font-bold text-white");

  return (
    <li
      class={[
        "group border-divider/70 relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 border-b px-4 py-3 transition-[background-color,opacity] duration-200 sm:px-5",
        props.thread.read ? "hover:bg-card/40 bg-black" : "bg-card/60 hover:bg-card",
      ]}
    >
      <a
        aria-label={props.thread.subject}
        class="focus-visible:ring-accent/40 absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-inset"
        href={props.href}
      />
      <button
        aria-checked="false"
        aria-label={`Select ${props.thread.subject}`}
        class="group/select relative z-20 flex size-9 items-center justify-center rounded-full"
        role="checkbox"
        type="button"
      >
        <span class="absolute inset-0 group-hover/select:invisible">
          <UserAvatar name={sender() === "me" ? "Me" : sender()} />
        </span>
        <span class="border-gray/50 bg-card invisible flex size-7 items-center justify-center rounded-full border text-transparent group-hover/select:visible">
          <CheckIcon class="size-3.5" stroke-width={3} />
        </span>
      </button>
      <div class="flex min-w-0 flex-col">
        <div class="flex h-5 items-center gap-1.5">
          <span class={["truncate text-sm", emphasis(), { "tracking-tight": !props.thread.read }]}>
            {props.thread.participants.join(", ")}
          </span>
          <Show when={props.thread.messageCount > 1}>
            <span class="text-gray text-xs tabular-nums">{props.thread.messageCount}</span>
          </Show>
          <time
            class={["ml-auto shrink-0 text-xs tabular-nums", props.thread.read ? "text-gray" : "font-bold text-white"]}
          >
            {props.thread.time}
          </time>
        </div>
        <div class={["h-5 truncate text-sm leading-5", emphasis()]}>{props.thread.subject}</div>
        <div class="flex h-5 items-center gap-2">
          <For each={props.thread.labels}>{(label) => <LabelChip class="hidden xl:inline-flex" label={label} />}</For>
          <Show when={props.thread.hasAttachments}>
            <PaperclipIcon class="text-gray size-3.5 shrink-0" />
          </Show>
          <span class="text-gray min-w-0 flex-1 truncate text-[13px]">{props.thread.snippet}</span>
          <span class="relative z-20 flex shrink-0 items-center gap-1">
            <RowButton class={hoverOnly} label="Archive">
              <ArchiveIcon class="size-[18px]" />
            </RowButton>
            <RowButton class={hoverOnly} label={props.thread.read ? "Mark as unread" : "Mark as read"}>
              <Show when={props.thread.read} fallback={<MailOpenIcon class="size-[18px]" />}>
                <MailIcon class="size-[18px]" />
              </Show>
            </RowButton>
            <RowButton
              active={props.thread.starred}
              class={props.thread.starred ? "size-8" : hoverOnly}
              label={props.thread.starred ? "Remove star" : "Star"}
            >
              <StarIcon class="size-[18px]" filled={props.thread.starred} />
            </RowButton>
          </span>
        </div>
      </div>
    </li>
  );
}
