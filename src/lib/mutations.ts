import { action } from "@solidjs/router";
import { getRequestEvent, redirect, respond, serializeCookie } from "@solidjs/web";
import {
  getEarlierMessages,
  getLatestMessage,
  getMailboxCounts,
  getThreads,
  getThreadSummary,
  searchThreads,
} from "./queries";
import { addReply, createThread, delay, DELAYS_COOKIE, updateThreads } from "./server";

// What a change to a thread's state (read, starred, mailbox) can affect. Message bodies stay cached.
const threadStateKeys = [getThreads.key, getMailboxCounts.key, searchThreads.key, getThreadSummary.key];

// Router actions: forms post to them (`<form action={sendReply.with(id)} method="post">`), the form gets
// `aria-busy` while one runs, and afterwards the router revalidates its queries, so lists, counts and
// the open thread refresh on their own. Each body is a server function; ./server never reaches the client.

/** Reply to a thread. Bind the thread id with `.with(threadId)`; the form supplies `body`. */
export const sendReply = action(async (threadId: string, form: FormData) => {
  "use server";
  const body = String(form.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Write a reply first." };
  await delay();
  await addReply(threadId, body);
  return redirect(`/inbox/${threadId}`, {
    revalidate: [...threadStateKeys, getLatestMessage.key, getEarlierMessages.key],
  });
});

/** Start a new conversation from the compose panel (`subject`, `body`). Always sent to Mara, for now. */
export const composeMessage = action(async (form: FormData) => {
  "use server";
  const subject = String(form.get("subject") ?? "").trim();
  if (!subject) return { ok: false, error: "Add a subject." };
  const body = String(form.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Write a message first." };
  await delay();
  return createThread({ subject, body });
});

// Bulk actions for the list toolbar. Called with `useAction` (no form): ids of the selected threads plus the
// new value. They only return once the change is made; the router's revalidation refreshes every list.

/** Archive (`"archive"`) or move back to the Inbox (`"inbox"`). */
export const moveThreads = action(async (ids: string[], to: "inbox" | "archive") => {
  "use server";
  await delay();
  updateThreads(ids, { mailbox: to });
  return respond({ ok: true as const }, { revalidate: threadStateKeys });
});

export const starThreads = action(async (ids: string[], starred: boolean) => {
  "use server";
  await delay();
  updateThreads(ids, { starred });
  return respond({ ok: true as const }, { revalidate: threadStateKeys });
});

export const markThreadsRead = action(async (ids: string[], read: boolean) => {
  "use server";
  await delay();
  updateThreads(ids, { read });
  return respond({ ok: true as const }, { revalidate: threadStateKeys });
});

/** Demo toolbar: turn the fake query latency on or off (stored in a cookie). */
export async function setDelaysEnabled(enabled: boolean) {
  "use server";
  const event = getRequestEvent() as
    | { response?: { headers: Headers } }
    | undefined;
  event?.response?.headers.append(
    "Set-Cookie",
    serializeCookie(DELAYS_COOKIE, enabled ? "1" : "0", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    }),
  );
}
