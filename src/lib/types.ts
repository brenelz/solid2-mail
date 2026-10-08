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

export type Person = { name: string; email: string };

export type Message = {
  id: string;
  from: Person;
  to: Person[];
  /** Display date, e.g. "Tue, 29 Sept 2026, 02:41". */
  date: string;
  paragraphs: string[];
};

export type Thread = {
  id: string;
  subject: string;
  labels: Label[];
  starred: boolean;
  /** First name the reply box addresses: the other side of the conversation. */
  replyTo: string;
  /** Oldest first. */
  messages: Message[];
};

/** What the mutations return: the client interprets it (error text under the form, closing the panel, …). */
export type MutationResult = { ok: true; threadId: string } | { ok: false; error: string };
