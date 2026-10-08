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
  useSelectedThreads,
  useSelection,
} from "./thread-selection";
import { LabelChip, UserAvatar } from "./ui";

const pagerLinkClass =
  "text-gray inline-flex size-6 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white";

/**
 * Without `count` the pager is hidden — e.g. search before anything is typed. `threads` are the list's threads
 * (select all and the bulk actions work on them); on a mailbox they arrive as data from the server component.
 */
export function ThreadListHeader(props: {
  title: string;
  threads?: ThreadListItem[];
  count?: number;
  total?: number;
}) {
  const threads = () => props.threads ?? [];
  const selected = useSelectedThreads(threads);
  const selecting = () => selected().length > 0;
  return (
    <div class="border-divider/70 flex h-12 shrink-0 items-center justify-between gap-3 border-b bg-black px-4 sm:px-5">
      <div class="flex min-w-0 items-center gap-3">
        <SelectAll selected={selected()} threads={threads()} />
        {/* While anything is selected the title gives way to "N selected" and the bulk actions. */}
        <Show
          when={selecting()}
          fallback={
            <h2 class="truncate text-sm font-semibold tracking-tight">
              {props.title}
            </h2>
          }
        >
          <BulkActions selected={selected()} />
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

/** The client-rendered list (search). Mailboxes render the same rows from the `getThreads` server component. */
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
          {(thread) => {
            // Once per row, like a component body: the behavior owns the row's optimistic state.
            const row = threadRowBehavior(thread);
            return <ThreadRow href={props.hrefFor(thread.id)} row={row} thread={thread} />;
          }}
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
const rowButtonClass =
  "inline-flex size-6 items-center justify-center rounded-full transition-colors hover:bg-white/10";
const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

/** What the server passes a row's binding slot: the thread's server state. */
export type ThreadRowArgs = Pick<ThreadListItem, "id" | "starred" | "read" | "mailbox">;

/** Everything about a row the client owns: selection, optimistic state and the handlers. */
export type ThreadRowBehavior = {
  rowClass: string;
  selectedAttr: "" | undefined;
  checked: "true" | "false";
  selectDisabled: boolean;
  avatarClass: string;
  checkClass: string;
  participantsClass: string;
  timeClass: string;
  subjectClass: string;
  archiveHidden: boolean;
  archiveLabel: string;
  archiveIconHidden: boolean;
  restoreIconHidden: boolean;
  readLabel: string;
  readIconHidden: boolean;
  unreadIconHidden: boolean;
  starClass: string;
  starPressed: "true" | "false";
  starLabel: string;
  starFilledHidden: boolean;
  starOutlineHidden: boolean;
  onToggle: () => void;
  onArchive: () => void;
  onToggleRead: () => void;
  onStar: () => void;
};

/**
 * The client half of a thread row: the `row` binding-slot fill for the `getThreads` server component, and
 * what the client list passes `ThreadRow` directly. Runs once per row, like a component body; values are
 * getters so the positions that bind them update.
 */
export function threadRowBehavior(p: ThreadRowArgs): ThreadRowBehavior {
  const selection = useSelection();
  const selected = () => !!selection?.isSelected(p.id);

  const move = useAction(moveThreads);
  const star = useAction(starThreads);
  const markRead = useAction(markThreadsRead);

  // Optimistic copies of the row's state: an action touching this row (its own buttons or the bulk toolbar)
  // flips them on submit, and they fall back to the server's values once the action's update commits.
  const [starred, setStarred] = createOptimistic(() => p.starred);
  const [read, setRead] = createOptimistic(() => p.read);
  const [location, setLocation] = createOptimistic(() => p.mailbox);
  const isThisRow = (ids: string[]) => ids.includes(p.id);

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

  return {
    get rowClass() {
      return cx(
        "group border-divider/70 relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 border-b px-4 py-3 transition-[background-color,opacity] duration-200 sm:px-5",
        selected() ? "bg-accent/15" : read() ? "hover:bg-card/40 bg-black" : "bg-card/60 hover:bg-card",
        leaving() && "opacity-40",
      );
    },
    get selectedAttr() {
      return selected() ? "" : undefined;
    },
    get checked() {
      return selected() ? "true" : "false";
    },
    selectDisabled: !selection,
    get avatarClass() {
      return cx("absolute inset-0", selected() ? "invisible" : "group-hover/select:invisible");
    },
    get checkClass() {
      return cx(
        "flex size-7 items-center justify-center rounded-full border",
        selected()
          ? "border-accent bg-accent text-white"
          : "border-gray/50 bg-card invisible text-transparent group-hover/select:visible",
      );
    },
    get participantsClass() {
      return cx("truncate text-sm", emphasis(), !read() && "tracking-tight");
    },
    get timeClass() {
      return cx("ml-auto shrink-0 text-xs tabular-nums", read() ? "text-gray" : "font-bold text-white");
    },
    get subjectClass() {
      return cx("h-5 truncate text-sm leading-5", emphasis());
    },
    get archiveHidden() {
      return location() === "sent";
    },
    get archiveLabel() {
      return location() === "archive" ? "Move to inbox" : "Archive";
    },
    get archiveIconHidden() {
      return location() === "archive";
    },
    get restoreIconHidden() {
      return location() !== "archive";
    },
    get readLabel() {
      return read() ? "Mark as unread" : "Mark as read";
    },
    get readIconHidden() {
      return !read();
    },
    get unreadIconHidden() {
      return read();
    },
    get starClass() {
      return cx(rowButtonClass, starred() ? "text-accent size-8" : cx("text-gray hover:text-white", hoverOnly));
    },
    get starPressed() {
      return starred() ? "true" : "false";
    },
    get starLabel() {
      return starred() ? "Remove star" : "Star";
    },
    get starFilledHidden() {
      return !starred();
    },
    get starOutlineHidden() {
      return starred();
    },
    onToggle: () => selection?.toggle(p.id),
    onArchive: () => void move([p.id], location() === "archive" ? "inbox" : "archive"),
    onToggleRead: () => void markRead([p.id], !read()),
    onStar: () => void star([p.id], !starred()),
  };
}

/**
 * One row, shared by both sides: the `getThreads` server component renders it with `row` from its binding
 * slot, the client list with `threadRowBehavior`'s result. Server data (`thread`) renders as markup; every
 * client-owned value comes from `row` and is bound whole at an attribute, class or handler position — never
 * branched on (on the server it's a stand-in), so client-state toggles are `hidden` attributes, not `<Show>`.
 */
export function ThreadRow(props: { href: string; thread: ThreadListItem; row: ThreadRowBehavior }) {
  const sender = () => props.thread.participants.at(-1) ?? "";
  const toggleButtonClass = cx(rowButtonClass, "text-gray hover:text-white", hoverOnly);

  return (
    <li class={props.row.rowClass} data-selected={props.row.selectedAttr} $key={props.thread.id}>
      <a
        aria-label={props.thread.subject}
        class="focus-visible:ring-accent/40 absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-inset"
        href={props.href}
      />
      {/* The avatar doubles as the row checkbox: hover shows the check, a selected row keeps it filled. */}
      <button
        aria-checked={props.row.checked}
        aria-label={`Select ${props.thread.subject}`}
        class="group/select relative z-20 flex size-9 items-center justify-center rounded-full"
        disabled={props.row.selectDisabled}
        // eslint-disable-next-line solid/reactivity -- a slot handler binds whole; a wrapper would be a server-local function
        onClick={props.row.onToggle}
        role="checkbox"
        type="button"
      >
        <span class={props.row.avatarClass}>
          <UserAvatar name={sender() === "me" ? "Me" : sender()} />
        </span>
        <span class={props.row.checkClass}>
          <CheckIcon class="size-3.5" stroke-width={3} />
        </span>
      </button>
      <div class="flex min-w-0 flex-col">
        <div class="flex h-5 items-center gap-1.5">
          <span class={props.row.participantsClass}>{props.thread.participants.join(", ")}</span>
          <Show when={props.thread.messageCount > 1}>
            <span class="text-gray text-xs tabular-nums">{props.thread.messageCount}</span>
          </Show>
          <time class={props.row.timeClass}>{props.thread.time}</time>
        </div>
        <div class={props.row.subjectClass}>{props.thread.subject}</div>
        <div class="flex h-5 items-center gap-2">
          <For each={props.thread.labels}>
            {(label) => <LabelChip class="hidden xl:inline-flex" label={label} />}
          </For>
          <Show when={props.thread.hasAttachments}>
            <PaperclipIcon class="text-gray size-3.5 shrink-0" />
          </Show>
          <span class="text-gray min-w-0 flex-1 truncate text-[13px]">{props.thread.snippet}</span>
          <span class="relative z-20 flex shrink-0 items-center gap-1">
            <button
              aria-label={props.row.archiveLabel}
              class={toggleButtonClass}
              hidden={props.row.archiveHidden}
              // eslint-disable-next-line solid/reactivity -- a slot handler binds whole; a wrapper would be a server-local function
              onClick={props.row.onArchive}
              title={props.row.archiveLabel}
              type="button"
            >
              <span class="contents" hidden={props.row.archiveIconHidden}>
                <ArchiveIcon class="size-[18px]" />
              </span>
              <span class="contents" hidden={props.row.restoreIconHidden}>
                <ArchiveRestoreIcon class="size-[18px]" />
              </span>
            </button>
            <button
              aria-label={props.row.readLabel}
              class={toggleButtonClass}
              // eslint-disable-next-line solid/reactivity -- a slot handler binds whole; a wrapper would be a server-local function
              onClick={props.row.onToggleRead}
              title={props.row.readLabel}
              type="button"
            >
              <span class="contents" hidden={props.row.readIconHidden}>
                <MailIcon class="size-[18px]" />
              </span>
              <span class="contents" hidden={props.row.unreadIconHidden}>
                <MailOpenIcon class="size-[18px]" />
              </span>
            </button>
            <button
              aria-label={props.row.starLabel}
              aria-pressed={props.row.starPressed}
              class={props.row.starClass}
              // eslint-disable-next-line solid/reactivity -- a slot handler binds whole; a wrapper would be a server-local function
              onClick={props.row.onStar}
              title={props.row.starLabel}
              type="button"
            >
              <span class="contents" hidden={props.row.starFilledHidden}>
                <StarIcon class="size-[18px]" filled />
              </span>
              <span class="contents" hidden={props.row.starOutlineHidden}>
                <StarIcon class="size-[18px]" />
              </span>
            </button>
          </span>
        </div>
      </div>
    </li>
  );
}
