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


/** Route `matchFilters` value: `/:mailbox` only matches these, anything else falls through to the 404 route. */
export const MAILBOX_IDS: readonly Mailbox[] = MAILBOXES.map((mailbox) => mailbox.id);

export function mailboxName(id: Mailbox) {
  return MAILBOXES.find((mailbox) => mailbox.id === id)!.name;
}
