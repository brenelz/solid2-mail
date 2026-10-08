import { query } from "@solidjs/router";
import { currentUser, delay, getThreadDetail, isDelaysEnabled, labels, threads } from "./server";
import type { Label, Mailbox, MailboxCounts, Thread, ThreadListItem, User } from "./types";

// Cached router queries. Each body is a server function: on the client it compiles to an RPC stub,
// so ./server (server-only) never reaches the browser.

export const getLabels = query(async (): Promise<Label[]> => {
  "use server";
  await delay();
  return labels;
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

export const getThreads = query(async (mailbox: Mailbox): Promise<ThreadListItem[]> => {
  "use server";
  await delay();
  // Starred is a view across every location; the others are where a thread lives.
  return mailbox === "starred" ? threads.filter((t) => t.starred) : threads.filter((t) => t.mailbox === mailbox);
}, "threads");

export const getThread = query(async (id: string): Promise<Thread | undefined> => {
  "use server";
  await delay();
  return getThreadDetail(id);
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
