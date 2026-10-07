export type Label = { id: string; name: string; color: string };

import type { Mailbox } from "./mailboxes";

export type { Mailbox, MailboxCounts } from "./mailboxes";

export type User = { name: string; title: string; email: string };

/** Where a thread lives. "starred" is a view across these, not a location. */
export type ThreadLocation = Exclude<Mailbox, "starred">;

export type ThreadListItem = {
  id: string;
  mailbox: ThreadLocation;
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

export type Thread = {
  id: string;
  subject: string;
  labels: Label[];
  starred: boolean;
  messageCount: number;
  from: { name: string; email: string };
  to: string;
  /** First name the reply box addresses: the sender, or the recipient when you sent it. */
  replyTo: string;
  date: string;
  paragraphs: string[];
};
