import { query } from "@solidjs/router";
import { currentUser, delay, isDelaysEnabled, labels, threadDetails, threads } from "./server";
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
    inbox: unread.length,
    starred: unread.filter((t) => t.starred).length,
    sent: 0,
    archive: 0,
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
  switch (mailbox) {
    case "inbox":
      return threads;
    case "starred":
      return threads.filter((t) => t.starred);
    default:
      return [];
  }
}, "threads");

export const getThread = query(async (id: string): Promise<Thread | undefined> => {
  "use server";
  await delay();
  return threadDetails.find((t) => t.id === id);
}, "thread");

export const getDelaysEnabled = query(async (): Promise<boolean> => {
  "use server";
  return isDelaysEnabled();
}, "delaysEnabled");
