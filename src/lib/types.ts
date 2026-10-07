export type Label = { id: string; name: string; color: string };

export type Mailbox = "inbox" | "starred" | "sent" | "archive";

export type MailboxSummary = { id: Mailbox; name: string; count: number };

export type User = { name: string; title: string; email: string };

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

export type Thread = {
  id: string;
  subject: string;
  labels: Label[];
  starred: boolean;
  messageCount: number;
  from: { name: string; email: string };
  to: string;
  date: string;
  paragraphs: string[];
};
