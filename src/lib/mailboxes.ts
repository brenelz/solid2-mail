// The mailbox list is static app vocabulary: it ships in the bundle, so the nav renders without waiting on a
// query. Only the per-user counts (`getMailboxCounts`) come from the server.
export const MAILBOXES = [
  { id: "inbox", name: "Inbox" },
  { id: "starred", name: "Starred" },
  { id: "sent", name: "Sent" },
  { id: "archive", name: "Archive" },
] as const;

export type Mailbox = (typeof MAILBOXES)[number]["id"];

export type MailboxCounts = Record<Mailbox, number>;

