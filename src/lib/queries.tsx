import { query } from "@solidjs/router";
import { currentUser, delay, getThreadDetail, isDelaysEnabled, labels, threads } from "./server";
import type { Mailbox, MailboxCounts, ThreadListItem, User } from "./types";
import { For, Show, type ComponentProps } from "solid-js";
import type { BindingSlot, Slot } from "@solidjs/web/frames";
import { searchHref } from "./search";
import { mailboxName } from "./mailboxes";
import {
  EmptyState,
  mailboxEmptyCopy,
  ThreadRow,
  type ThreadListHeader,
  type ThreadRowArgs,
  type ThreadRowBehavior,
} from "../components/thread-list";
import { MessageView } from "../components/message-view";
import type { ReplyForm } from "../components/reply-form";
import type { MarkOpenedRead, ThreadTitle, ThreadToolbarData } from "../components/thread-view";
import { LabelChip } from "../components/ui";

// Cached router queries. Each body is a server function: on the client it compiles to an RPC stub,
// so ./server (server-only) never reaches the browser.

export const getLabels = query(async () => {
  "use server";
  await delay();

  return () => (
    <For each={labels} keyed={(label) => label.id}>
      {(label) => (
        <a
          class="hover:bg-card flex h-9 items-center gap-3 rounded-lg px-3 text-sm tracking-tight transition-colors"
          href={searchHref(label().name)}
        >
          <span
            aria-hidden="true"
            class="size-2.5 shrink-0 rounded-full"
            style={{ "background-color": label().color }}
          />
          {label().name}
        </a>
      )}
    </For>
  )
}, "labels");

/** Unread conversations per mailbox. */
export const getMailboxCounts = query(async (): Promise<MailboxCounts> => {
  "use server";
  await delay();
  const unread = threads.filter((t) => !t.read);
  return {
    inbox: unread.filter((t) => t.mailbox === "inbox").length,
    starred: unread.filter((t) => t.starred).length,
    sent: unread.filter((t) => t.mailbox === "sent").length,
    archive: unread.filter((t) => t.mailbox === "archive").length,
  };
}, "mailboxCounts");

export const getCurrentUser = query(async (): Promise<User> => {
  "use server";
  await delay();
  return currentUser;
}, "currentUser");

/** The client positions in a mailbox's thread list (see `getThreads`). */
export type MailboxThreadsProps = {
  /** Selection-aware header (select all, bulk actions); gets the threads as data to act on. */
  header: Slot<ComponentProps<typeof ThreadListHeader>>;
  /** Per-row client behavior, bound into the server-rendered row markup. */
  row: BindingSlot<ThreadRowArgs, ThreadRowBehavior>;
};

/**
 * A mailbox's thread list as a server component: the rows are server markup, while the header and each row's
 * selection, optimistic state and handlers are client positions filled through the props. Mount it inside a
 * `ThreadSelection`: the fills read the selection from context, and a provider has to sit above the mount — a
 * slot's children are a server region, so a provider passed in as a slot wouldn't reach them.
 */
export const getThreads = query(async (mailbox: Mailbox) => {
  "use server";
  await delay();
  // Starred is a view across every location; the others are where a thread lives.
  const list = mailbox === "starred" ? threads.filter((t) => t.starred) : threads.filter((t) => t.mailbox === mailbox);
  const empty = mailboxEmptyCopy[mailbox];

  return (props: MailboxThreadsProps) => (
    <>
      <props.header count={list.length} threads={list} title={mailboxName(mailbox)} total={list.length} />
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <Show when={list.length > 0} fallback={<EmptyState body={empty.body} title={empty.title} />}>
          <ul aria-label="Conversations" class="flex flex-col">
            <For each={list}>
              {(thread) => (
                <ThreadRow
                  href={`/${mailbox}/${thread.id}`}
                  // `$key`: the fill holds optimistic state that must follow the thread across refetches.
                  row={props.row({
                    $key: thread.id,
                    id: thread.id,
                    starred: thread.starred,
                    read: thread.read,
                    mailbox: thread.mailbox,
                  })}
                  thread={thread}
                />
              )}
            </For>
          </ul>
        </Show>
      </div>
    </>
  );
}, "threads");

/** The client positions in an open conversation (see `getThread`). */
export type ThreadProps = {
  /** The page title (`<Title>` reads the meta context, so it can't render inside the server component). */
  title: Slot<ComponentProps<typeof ThreadTitle>>;
  /** Back / Archive / Star, with optimistic state and navigation. */
  toolbar: Slot<ThreadToolbarData>;
  /** Marks an unread thread read once it's on screen. Renders nothing. */
  opened: Slot<ComponentProps<typeof MarkOpenedRead>>;
  reply: Slot<ComponentProps<typeof ReplyForm>>;
};

/**
 * An open conversation as a server component: the subject, labels and messages are server markup, while the
 * title, toolbar, mark-as-read and reply form are client positions filled through the props.
 */
export const getThread = query(async (id: string) => {
  "use server";
  await delay();
  const thread = getThreadDetail(id);

  return (props: ThreadProps) => (
    <Show when={thread} fallback={<p class="text-gray p-8 text-sm">This conversation could not be found.</p>}>
      {(t) => (
        <div class="flex h-full flex-col">
          <props.title subject={t().subject} />
          <props.opened id={t().id} read={t().read} />
          <props.toolbar
            id={t().id}
            mailbox={t().mailbox}
            messageCount={t().messages.length}
            starred={t().starred}
          />

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

              <props.reply messageCount={t().messages.length} replyTo={t().replyTo} threadId={t().id} />
            </div>
          </article>
        </div>
      )}
    </Show>
  );
}, "thread");


export const getDelaysEnabled = query(async (): Promise<boolean> => {
  "use server";
  return isDelaysEnabled();
}, "delaysEnabled");

/** Matches subject, snippet, participants and label names (like the original). An empty query returns every thread. */
export const searchThreads = query(async (q: string): Promise<ThreadListItem[]> => {
  "use server";
  const needle = q.trim().toLowerCase();
  await delay();
  if (!needle) return threads;
  return threads.filter((t) =>
    [t.subject, t.snippet, ...t.participants, ...t.labels.map((l) => l.name)].some((field) =>
      field.toLowerCase().includes(needle),
    ),
  );
}, "search");
