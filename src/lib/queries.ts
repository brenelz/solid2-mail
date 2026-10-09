import { query, type RoutePreloadFuncArgs } from "@solidjs/router";
import { isServer } from "@solidjs/web";
import * as server from "./server";
import { currentUser, delay, isDelaysEnabled, labels, threads } from "./server";
import type {
  Label,
  LatestMessage,
  Mailbox,
  MailboxCounts,
  Message,
  ThreadListItem,
  ThreadSummary,
  User,
} from "./types";

// Cached router queries. Each body is a server function: on the client it compiles to an RPC stub,
// so ./server (server-only) never reaches the browser.

export const getLabels = query(async (): Promise<Label[]> => {
  "use server";
  "use build";
  return labels;
}, "labels");

/** Unread conversations per mailbox. */
export const getMailboxCounts = query(async (): Promise<MailboxCounts> => {
  "use server";
  await delay(400);
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
  return currentUser;
}, "currentUser");

export const getThreads = query(async (mailbox: Mailbox): Promise<ThreadListItem[]> => {
  "use server";
  await delay(700);
  // Starred is a view across every location; the others are where a thread lives.
  return mailbox === "starred" ? threads.filter((t) => t.starred) : threads.filter((t) => t.mailbox === mailbox);
}, "threads");

// A thread loads in three parts, like the original: the summary arrives first (a hover preload fetches it),
// then the latest message, then the earlier ones. The delays stagger them so each stage is visible.

export const getThreadSummary = query(async (id: string): Promise<ThreadSummary | undefined> => {
  "use server";
  await delay(600);
  return server.getThreadSummary(id);
}, "threadSummary");

export const getLatestMessage = query(async (id: string): Promise<LatestMessage | undefined> => {
  "use server";
  await delay(1000);
  return server.getLatestMessage(id);
}, "latestMessage");

export const getEarlierMessages = query(async (id: string): Promise<Message[]> => {
  "use server";
  await delay(3000);
  return server.getEarlierMessages(id);
}, "earlierMessages");

/** Route preload for a thread. A link preload (hover, focus, touch) stops at the summary; message bodies
 *  load on the navigation itself, where they start together instead of after the header. */
export function preloadThread(id: string, intent: RoutePreloadFuncArgs["intent"]) {
  void getThreadSummary(id);
  // The server runs preloads with intent "preload" too, to collect an action's single-flight response.
  if (intent === "preload" && !isServer) return;
  void getLatestMessage(id);
  void getEarlierMessages(id);
}


export const getDelaysEnabled = query(async (): Promise<boolean> => {
  "use server";
  return isDelaysEnabled();
}, "delaysEnabled");

/** Matches subject, snippet, participants and label names (like the original). An empty query returns every thread. */
export const searchThreads = query(async (q: string): Promise<ThreadListItem[]> => {
  "use server";
  const needle = q.trim().toLowerCase();
  await delay(500);
  if (!needle) return threads;
  return threads.filter((t) =>
    [t.subject, t.snippet, ...t.participants, ...t.labels.map((l) => l.name)].some((field) =>
      field.toLowerCase().includes(needle),
    ),
  );
}, "search");
