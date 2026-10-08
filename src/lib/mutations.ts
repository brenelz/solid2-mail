import { action } from "@solidjs/router";
import { getRequestEvent, redirect, serializeCookie } from "@solidjs/web";
import { addReply, createThread, delay, DELAYS_COOKIE } from "./server";

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
  return redirect(`/inbox/${threadId}`);
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
