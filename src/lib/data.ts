// Static placeholder content. Replace with real queries once state/data is wired up.

export type Label = { id: string; name: string; color: string };

export type Mailbox = "inbox" | "starred" | "sent" | "archive";

export type ThreadListItem = {
  id: string;
  participants: string[];
  messageCount: number;
  subject: string;
  snippet: string;
  time: string;
  read: boolean;
  starred: boolean;
  hasAttachments: boolean;
  labels: Label[];
};

export const labels: Label[] = [
  { id: "design", name: "Design", color: "#8b5cf6" },
  { id: "engineering", name: "Engineering", color: "#1b50ff" },
  { id: "hiring", name: "Hiring", color: "#38bdf8" },
  { id: "infra", name: "Infra", color: "#6366f1" },
  { id: "launch", name: "Launch", color: "#ec4899" },
  { id: "social", name: "Social", color: "#f472b6" },
];

const label = (id: string) => labels.find((l) => l.id === id)!;

export const mailboxes: { id: Mailbox; name: string; count: number }[] = [
  { id: "inbox", name: "Inbox", count: 1 },
  { id: "starred", name: "Starred", count: 0 },
  { id: "sent", name: "Sent", count: 0 },
  { id: "archive", name: "Archive", count: 0 },
];

export const currentUser = {
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

export const thread = {
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
};
