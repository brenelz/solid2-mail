import "server-only";
import { getRequestEvent, parseCookieHeader } from "@solidjs/web";
import type { Label, MailboxSummary, Thread, ThreadListItem, User } from "./types";

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

export const mailboxes: MailboxSummary[] = [
  { id: "inbox", name: "Inbox", count: 1 },
  { id: "starred", name: "Starred", count: 0 },
  { id: "sent", name: "Sent", count: 0 },
  { id: "archive", name: "Archive", count: 0 },
];

export const currentUser: User = {
  name: "Mara Lindqvist",
  title: "Work",
  email: "mara@stamp.dev",
};

export const threads: ThreadListItem[] = [
  {
    id: "thr-oncall",
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
];

export const threadDetails: Thread[] = [
  {
    id: "thr-typography",
    subject: "Typography pass on the thread view",
    labels: [label("design")],
    starred: true,
    messageCount: 1,
    from: { name: "Jonas Berg", email: "jonas@stamp.dev" },
    to: "Mara",
    date: "Tue, 29 Sept 2026, 02:41",
    paragraphs: [
      "Small typography pass on the thread view. Message bodies go from 14px to 15px with a 1.65 line height, and the max measure is 68ch. It reads a lot calmer on the wide pane.",
      "Subjects stay at 20px semibold. Sender names 14px semibold, addresses 13px muted. Timestamps tabular.",
      "Nothing changes in the list.",
    ],
  },
];
