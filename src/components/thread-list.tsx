import { useAction } from "@solidjs/router";
import { createOptimistic, For, Show } from "solid-js";
import { markThreadsRead, moveThreads, starThreads } from "../lib/mutations";
import type { Mailbox, ThreadListItem } from "../lib/types";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  BrandMark,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon,
  MailOpenIcon,
  PaperclipIcon,
  StarIcon,
} from "./icons";
import {
  BulkActions,
  ClearSelection,
  SelectAll,
  useSelection,
} from "./thread-selection";
import { LabelChip, RowButton, UserAvatar } from "./ui";

const pagerLinkClass =
  "text-gray inline-flex size-6 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white";

/** Without `count` the pager is hidden — e.g. search before anything is typed. */
export function ThreadListHeader(props: {
  title: string;
  count?: number;
  total?: number;
}) {
  const selection = useSelection();
  const selecting = () => (selection?.selected().length ?? 0) > 0;
  return (
    <div class="border-divider/70 flex h-12 shrink-0 items-center justify-between gap-3 border-b bg-black px-4 sm:px-5">
      <div class="flex min-w-0 items-center gap-3">
        <SelectAll />
        {/* While anything is selected the title gives way to "N selected" and the bulk actions. */}
        <Show
          when={selecting()}
          fallback={
            <h2 class="truncate text-sm font-semibold tracking-tight">
              {props.title}
            </h2>
          }
        >
          <BulkActions />
        </Show>
      </div>
      <Show when={selecting()}>
        <ClearSelection />
      </Show>
      <Show when={!selecting() && props.count !== undefined}>
        <div class="flex shrink-0 items-center gap-1">
          <span class="text-gray mr-1 text-xs tabular-nums">
            {props.count ? `1–${props.count}` : 0} of {props.total}
          </span>
          <span
            aria-disabled="true"
            class={`${pagerLinkClass} cursor-default opacity-40 hover:bg-transparent`}
          >
            <ChevronLeftIcon class="size-4" />
          </span>
          <span
            aria-disabled="true"
            class={`${pagerLinkClass} cursor-default opacity-40 hover:bg-transparent`}
          >
            <ChevronRightIcon class="size-4" />
          </span>
        </div>
      </Show>
    </div>
  );
}

export const mailboxEmptyCopy: Record<
  Mailbox,
  { title: string; body: string }
> = {
  inbox: {
    title: "Inbox zero",
    body: "New conversations show up here as they arrive.",
  },
  starred: {
    title: "No starred conversations",
    body: "Star a conversation to keep it close.",
  },
  sent: {
    title: "Nothing sent yet",
    body: "Replies and new messages you write show up here.",
  },
  archive: {
    title: "Nothing archived",
    body: "Archived conversations land here and stay searchable.",
  },
};

export function ThreadList(props: {
  threads: ThreadListItem[];
  /** Where a row links — the thread inside this list's own route (mailbox or search). */
  hrefFor: (threadId: string) => string;
  empty: { title: string; body?: string };
}) {
  return (
    <Show
      when={props.threads.length > 0}
      fallback={
        <EmptyState body={props.empty.body} title={props.empty.title} />
      }
    >
      <ul aria-label="Conversations" class="flex flex-col">
        <For each={props.threads}>
          {(thread) => (
            <ThreadRow href={props.hrefFor(thread.id)} thread={thread} />
          )}
        </For>
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

const hoverOnly =
  "invisible size-8 group-hover:visible group-has-[:focus-visible]:visible";

function ThreadRow(props: { href: string; thread: ThreadListItem }) {
  const selection = useSelection();
  const selected = () => !!selection?.isSelected(props.thread.id);
  const sender = () => props.thread.participants.at(-1) ?? "";

  const move = useAction(moveThreads);
  const star = useAction(starThreads);
  const markRead = useAction(markThreadsRead);

  // Optimistic copies of the row's state: an action touching this row (its own buttons or the bulk toolbar)
  // flips them on submit, and they fall back to the server's values once the action's update commits.
  const [starred, setStarred] = createOptimistic(() => props.thread.starred);
  const [read, setRead] = createOptimistic(() => props.thread.read);
  const [location, setLocation] = createOptimistic(() => props.thread.mailbox);
  const isThisRow = (ids: string[]) => ids.includes(props.thread.id);

  starThreads.onSubmit((ids, value) => {
    if (isThisRow(ids)) setStarred(value);
  });

  markThreadsRead.onSubmit((ids, value) => {
    if (isThisRow(ids)) setRead(value);
  });

  moveThreads.onSubmit((ids, to) => {
    if (isThisRow(ids)) setLocation(to);
  });

  // Archive acts on where the thread lives, so it works the same in a mailbox, Starred and search results.
  // In Inbox/Archive a moved row fades until the refreshed list drops it.
  const leaving = () =>
    (selection?.mailbox === "inbox" || selection?.mailbox === "archive") &&
    location() !== selection.mailbox;
  const emphasis = () => (read() ? "text-white/70" : "font-bold text-white");

  return (
    <li
      class={[
        "group border-divider/70 relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 border-b px-4 py-3 transition-[background-color,opacity] duration-200 sm:px-5",
        selected()
          ? "bg-accent/15"
          : read()
            ? "hover:bg-card/40 bg-black"
            : "bg-card/60 hover:bg-card",
        { "opacity-40": leaving() },
      ]}
      data-selected={selected() ? "" : undefined}
    >
      <a
        aria-label={props.thread.subject}
        class="focus-visible:ring-accent/40 absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-inset"
        href={props.href}
      />
      {/* The avatar doubles as the row checkbox: hover shows the check, a selected row keeps it filled. */}
      <button
        aria-checked={selected() ? "true" : "false"}
        aria-label={`Select ${props.thread.subject}`}
        class="group/select relative z-20 flex size-9 items-center justify-center rounded-full"
        disabled={!selection}
        onClick={() => selection?.toggle(props.thread.id)}
        role="checkbox"
        type="button"
      >
        <span
          class={[
            "absolute inset-0",
            selected() ? "invisible" : "group-hover/select:invisible",
          ]}
        >
          <UserAvatar name={sender() === "me" ? "Me" : sender()} />
        </span>
        <span
          class={[
            "flex size-7 items-center justify-center rounded-full border",
            selected()
              ? "border-accent bg-accent text-white"
              : "border-gray/50 bg-card invisible text-transparent group-hover/select:visible",
          ]}
        >
          <CheckIcon class="size-3.5" stroke-width={3} />
        </span>
      </button>
      <div class="flex min-w-0 flex-col">
        <div class="flex h-5 items-center gap-1.5">
          <span
            class={[
              "truncate text-sm",
              emphasis(),
              { "tracking-tight": !read() },
            ]}
          >
            {props.thread.participants.join(", ")}
          </span>
          <Show when={props.thread.messageCount > 1}>
            <span class="text-gray text-xs tabular-nums">
              {props.thread.messageCount}
            </span>
          </Show>
          <time
            class={[
              "ml-auto shrink-0 text-xs tabular-nums",
              read() ? "text-gray" : "font-bold text-white",
            ]}
          >
            {props.thread.time}
          </time>
        </div>
        <div class={["h-5 truncate text-sm leading-5", emphasis()]}>
          {props.thread.subject}
        </div>
        <div class="flex h-5 items-center gap-2">
          <For each={props.thread.labels}>
            {(label) => (
              <LabelChip class="hidden xl:inline-flex" label={label} />
            )}
          </For>
          <Show when={props.thread.hasAttachments}>
            <PaperclipIcon class="text-gray size-3.5 shrink-0" />
          </Show>
          <span class="text-gray min-w-0 flex-1 truncate text-[13px]">
            {props.thread.snippet}
          </span>
          <span class="relative z-20 flex shrink-0 items-center gap-1">
            <Show when={location() !== "sent"}>
              <RowButton
                class={hoverOnly}
                label={location() === "archive" ? "Move to inbox" : "Archive"}
                onClick={() =>
                  void move(
                    [props.thread.id],
                    location() === "archive" ? "inbox" : "archive",
                  )
                }
              >
                <Show
                  when={location() === "archive"}
                  fallback={<ArchiveIcon class="size-[18px]" />}
                >
                  <ArchiveRestoreIcon class="size-[18px]" />
                </Show>
              </RowButton>
            </Show>
            <RowButton
              class={hoverOnly}
              label={read() ? "Mark as unread" : "Mark as read"}
              onClick={() => void markRead([props.thread.id], !read())}
            >
              <Show
                when={read()}
                fallback={<MailOpenIcon class="size-[18px]" />}
              >
                <MailIcon class="size-[18px]" />
              </Show>
            </RowButton>
            <RowButton
              active={starred()}
              class={starred() ? "size-8" : hoverOnly}
              label={starred() ? "Remove star" : "Star"}
              onClick={() => void star([props.thread.id], !starred())}
            >
              <StarIcon class="size-[18px]" filled={starred()} />
            </RowButton>
          </span>
        </div>
      </div>
    </li>
  );
}
