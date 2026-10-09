import "server-only";
import { getRequestEvent, parseCookieHeader } from "@solidjs/web";
import type {
  Label,
  LatestMessage,
  Message,
  MutationResult,
  Person,
  ThreadListItem,
  ThreadSummary,
  User,
} from "./types";

// Server-only data layer. Static placeholder content for now — swap for a real database later.

/** Demo toggle: delays are on unless this cookie is "0". Flipped from the demo toolbar. */
export const DELAYS_COOKIE = "stamp-delays";

export function isDelaysEnabled() {
  const cookie = getRequestEvent()?.request.headers.get("cookie");
  return parseCookieHeader(cookie)[DELAYS_COOKIE] !== "0";
}

/** Fake network/database latency so loading states are visible. Skipped when delays are toggled off. */
export async function delay(ms = 1000) {
  if (!isDelaysEnabled()) return;
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const labels: Label[] = [
  { id: "design", name: "Design", color: "#8b5cf6" },
  { id: "engineering", name: "Engineering", color: "#1b50ff" },
  { id: "hiring", name: "Hiring", color: "#38bdf8" },
  { id: "infra", name: "Infra", color: "#6366f1" },
  { id: "launch", name: "Launch", color: "#ec4899" },
  { id: "social", name: "Social", color: "#f472b6" },
];

const label = (id: string) => labels.find((l) => l.id === id)!;

export const currentUser: User = {
  name: "Mara Lindqvist",
  title: "Work",
  email: "mara@stamp.dev",
};

export const threads: ThreadListItem[] = [
  {
    id: "thr-oncall",
    mailbox: "inbox",
    participants: ["Ingrid", "me"],
    messageCount: 2,
    subject: "On-call rotation for October",
    snippet: "Works for me. I'll swap the 27th with Tomas so it doesn't clash with the offsite.",
    time: "00:17",
    read: false,
    starred: false,
    hasAttachments: false,
    labels: [label("infra")],
  },
  {
    id: "thr-typography",
    mailbox: "inbox",
    participants: ["Jonas"],
    messageCount: 1,
    subject: "Typography pass on the thread view",
    snippet:
      "Small typography pass on the thread view. Message bodies go from 14px to 15px with a 1.65 line height, and the max measure is 68ch. It reads a lot calmer on the wide pane.",
    time: "29 Sept",
    read: true,
    starred: true,
    hasAttachments: false,
    labels: [label("design")],
  },
  {
    id: "thr-offsite",
    mailbox: "inbox",
    participants: ["Sofie", "me"],
    messageCount: 3,
    subject: "Offsite confirmed: Bergen, last week of October",
    snippet: "Booked for Thursday 14:00. Bring the phone.",
    time: "26 Sept",
    read: true,
    starred: false,
    hasAttachments: false,
    labels: [label("social")],
  },
  {
    id: "thr-talk",
    mailbox: "inbox",
    participants: ["Leo", "me"],
    messageCount: 2,
    subject: "Talk accepted: Above the fold",
    snippet: "Yes. Send me the slide deck when you have a skeleton and I will fill in the middle.",
    time: "25 Sept",
    read: true,
    starred: false,
    hasAttachments: true,
    labels: [label("launch")],
  },
  {
    id: "thr-roadmap",
    mailbox: "sent",
    participants: ["me", "Sofie"],
    messageCount: 1,
    subject: "Q4 roadmap draft",
    snippet: "First pass at the Q4 roadmap is in the doc. Search and offline are the two big bets, everything else is polish.",
    time: "24 Sept",
    read: true,
    starred: false,
    hasAttachments: true,
    labels: [label("engineering")],
  },
  {
    id: "thr-intro",
    mailbox: "sent",
    participants: ["me", "Elin"],
    messageCount: 1,
    subject: "Intro: Elin <> Tomas",
    snippet: "Elin, meet Tomas. He ran the last two migrations and knows where the bodies are buried.",
    time: "22 Sept",
    read: true,
    starred: true,
    hasAttachments: false,
    labels: [label("hiring")],
  },
  {
    id: "thr-retro",
    mailbox: "archive",
    participants: ["Ingrid", "me"],
    messageCount: 4,
    subject: "Incident retro: search outage",
    snippet: "Retro notes are final. Action items are tracked in the infra board, nothing left for us here.",
    time: "18 Sept",
    read: true,
    starred: false,
    hasAttachments: false,
    labels: [label("infra")],
  },
  {
    id: "thr-lunch",
    mailbox: "archive",
    participants: ["Leo"],
    messageCount: 1,
    subject: "Friday lunch",
    snippet: "Ramen place on the corner, 12:30. I booked for six.",
    time: "12 Sept",
    read: false,
    starred: false,
    hasAttachments: false,
    labels: [label("social")],
  },
];

const contacts: Person[] = [
  { name: "Ingrid Solberg", email: "ingrid@stamp.dev" },
  { name: "Jonas Berg", email: "jonas@stamp.dev" },
  { name: "Leo Marchetti", email: "leo@stamp.dev" },
  { name: "Sofie Dahl", email: "sofie@stamp.dev" },
  { name: "Elin Ruud", email: "elin@stamp.dev" },
  { name: "Tomas Lund", email: "tomas@stamp.dev" },
];

const me: Person = { name: currentUser.name, email: currentUser.email };
const firstName = (person: Person) => person.name.split(" ")[0];

/** List entries name people by first name ("Ingrid", "me"); resolve one back to a person. */
function personNamed(name: string): Person {
  if (name === "me") return me;
  return (
    contacts.find((c) => firstName(c).toLowerCase() === name.toLowerCase()) ?? {
      name,
      email: `${name.toLowerCase()}@stamp.dev`,
    }
  );
}

// --- Messages. Only some threads have hand-written content; the rest start as one message built from the list entry.

const handWritten: Record<string, Message[]> = {
  "thr-typography": [
    {
      id: "msg-typography-1",
      from: personNamed("Jonas"),
      to: [me],
      date: "Tue, 29 Sept 2026, 02:41",
      paragraphs: [
        "Small typography pass on the thread view. Message bodies go from 14px to 15px with a 1.65 line height, and the max measure is 68ch. It reads a lot calmer on the wide pane.",
        "Subjects stay at 20px semibold. Sender names 14px semibold, addresses 13px muted. Timestamps tabular.",
        "Nothing changes in the list.",
      ],
    },
  ],
};

const messagesByThread = new Map<string, Message[]>(
  threads.map((t) => {
    const sender = personNamed(t.participants[0]);
    const others = t.participants.filter((p) => p !== t.participants[0]).map(personNamed);
    const seeded: Message = {
      id: `msg-${t.id}-1`,
      from: sender,
      to: sender === me ? others : [me],
      date: t.time,
      paragraphs: [t.snippet],
    };
    return [t.id, handWritten[t.id] ?? [seeded]];
  }),
);

/** The other side of a conversation: whoever last wrote that isn't me, else whoever I last wrote to. */
function counterpart(messages: Message[]): Person[] {
  const theirs = messages.findLast((m) => m.from.email !== me.email);
  if (theirs) return [theirs.from];
  return messages.at(-1)?.to ?? [];
}

export function getThreadSummary(id: string): ThreadSummary | undefined {
  const item = threads.find((t) => t.id === id);
  const latest = messagesByThread.get(id)?.at(-1);
  if (!item || !latest) return undefined;
  return {
    id: item.id,
    subject: item.subject,
    labels: item.labels,
    starred: item.starred,
    read: item.read,
    mailbox: item.mailbox,
    messageCount: messagesByThread.get(id)!.length,
    latest: { from: latest.from, to: latest.to, date: latest.date },
  };
}

export function getLatestMessage(id: string): LatestMessage | undefined {
  const messages = messagesByThread.get(id);
  const message = messages?.at(-1);
  if (!messages || !message) return undefined;
  return { message, replyTo: counterpart(messages).map(firstName).join(", ") || firstName(me) };
}

/** Every message but the latest, newest first. */
export function getEarlierMessages(id: string): Message[] {
  return (messagesByThread.get(id) ?? []).slice(0, -1).reverse();
}

// --- Mutations (in memory: a dev-server restart resets them)

const listTime = (date: Date) =>
  date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
const fullDate = (date: Date) =>
  date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
const snippetOf = (body: string) => body.replace(/\s+/g, " ").slice(0, 160);
const paragraphsOf = (body: string) => body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/** Moves a thread to the top of the list (lists are newest first). */
function bump(item: ThreadListItem) {
  threads.splice(threads.indexOf(item), 1);
  threads.unshift(item);
}

export function addReply(threadId: string, body: string): MutationResult {
  const item = threads.find((t) => t.id === threadId);
  const messages = messagesByThread.get(threadId);
  if (!item || !messages) return { ok: false, error: "This conversation no longer exists." };
  const now = new Date();
  messages.push({ id: `msg-${threadId}-${messages.length + 1}`, from: me, to: counterpart(messages), date: fullDate(now), paragraphs: paragraphsOf(body) });
  if (!item.participants.includes("me")) item.participants.push("me");
  item.messageCount += 1;
  item.snippet = snippetOf(body);
  item.time = listTime(now);
  item.read = true;
  bump(item);
  return { ok: true, threadId };
}

/** Compose is hardcoded to send to Mara (the current user), so a new message lands in her Inbox, unread. */
export function createThread(input: { subject: string; body: string }): MutationResult {
  const now = new Date();
  const id = `thr-${now.getTime().toString(36)}`;
  threads.unshift({
    id,
    mailbox: "inbox",
    participants: ["me"],
    messageCount: 1,
    subject: input.subject,
    snippet: snippetOf(input.body),
    time: listTime(now),
    read: false,
    starred: false,
    hasAttachments: false,
    labels: [],
  });
  messagesByThread.set(id, [
    { id: `msg-${id}-1`, from: me, to: [me], date: fullDate(now), paragraphs: paragraphsOf(input.body) },
  ]);
  return { ok: true, threadId: id };
}

/** Bulk edits from the list toolbar: move between Inbox/Archive, star, mark read. Unknown ids are skipped. */
export function updateThreads(
  ids: string[],
  patch: Partial<Pick<ThreadListItem, "mailbox" | "starred" | "read">>,
) {
  for (const thread of threads) {
    if (ids.includes(thread.id)) Object.assign(thread, patch);
  }
}
