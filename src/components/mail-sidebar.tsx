import { For, Show } from "solid-js";
import { currentUser, labels, mailboxes, type Mailbox } from "../lib/data";
import {
  ArchiveIcon,
  ChevronsUpDownIcon,
  InboxIcon,
  MonitorIcon,
  MoonIcon,
  PenLineIcon,
  SendIcon,
  StarIcon,
  SunIcon,
} from "./icons";
import { UserAvatar } from "./ui";

const mailboxIcons: Record<Mailbox, typeof InboxIcon> = {
  archive: ArchiveIcon,
  inbox: InboxIcon,
  sent: SendIcon,
  starred: StarIcon,
};

const linkClass =
  "group flex h-10 items-center gap-3 rounded-lg px-3 text-base tracking-tight transition-colors not-aria-[current=page]:hover:bg-card aria-[current=page]:bg-accent/15 aria-[current=page]:text-accent aria-[current=page]:font-bold aria-[current=page]:[&_svg]:stroke-[2.5]";

// Hardcoded until routing state is wired up.
const ACTIVE: Mailbox = "inbox";

export function MailSidebar() {
  return (
    <aside class="hidden w-60 shrink-0 md:flex">
      <div class="flex min-h-0 flex-1 flex-col gap-6 px-3 pt-1 pb-3">
        <div class="px-1">
          <button
            class="bg-accent hover:bg-accent-hover inline-flex h-9 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors"
            type="button"
          >
            <PenLineIcon class="size-4" /> Compose
          </button>
        </div>

        <nav aria-label="Mailboxes" class="flex flex-col gap-0.5">
          <For each={mailboxes}>
            {(mailbox) => {
              const Icon = mailboxIcons[mailbox.id];
              return (
                <a
                  aria-current={mailbox.id === ACTIVE ? "page" : undefined}
                  class={linkClass}
                  href={`/${mailbox.id}`}
                >
                  <Icon class="size-5 shrink-0" />
                  <span class="flex-1">{mailbox.name}</span>
                  <Show when={mailbox.count > 0}>
                    <span class="text-gray group-aria-[current=page]:text-accent text-xs font-medium tabular-nums">
                      {mailbox.count}
                    </span>
                  </Show>
                </a>
              );
            }}
          </For>
        </nav>

        <nav aria-label="Labels" class="flex flex-col gap-0.5">
          <p class="text-gray flex h-9 items-center px-3 text-sm font-semibold tracking-tight">Labels</p>
          <For each={labels}>
            {(label) => (
              <a
                class="hover:bg-card flex h-9 items-center gap-3 rounded-lg px-3 text-sm tracking-tight transition-colors"
                href={`/search?q=${encodeURIComponent(label.name)}`}
              >
                <span
                  aria-hidden="true"
                  class="size-2.5 shrink-0 rounded-full"
                  style={{ "background-color": label.color }}
                />
                {label.name}
              </a>
            )}
          </For>
        </nav>

        <div class="mt-auto flex flex-col gap-2">
          <div class="px-2">
            <ThemeToggle />
          </div>
          <button
            class="hover:bg-card flex h-12 w-full min-w-0 items-center gap-2.5 rounded-lg px-2 text-left transition-colors"
            type="button"
          >
            <UserAvatar name={currentUser.name} size="sm" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm leading-tight font-semibold tracking-tight">{currentUser.title}</span>
              <span class="text-gray block truncate text-xs leading-tight">{currentUser.email}</span>
            </span>
            <ChevronsUpDownIcon class="text-gray size-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function ThemeToggle() {
  const base = "rounded-full p-1.5 transition-colors";
  const inactive = `${base} text-gray hover:text-white`;
  // Dark is hardcoded for now.
  const active = `${base} bg-white text-black shadow-sm`;
  return (
    <div class="inline-flex items-center gap-0.5">
      <button aria-label="Light mode" aria-pressed="false" class={inactive} type="button">
        <SunIcon class="size-4" />
      </button>
      <button aria-label="Dark mode" aria-pressed="true" class={active} type="button">
        <MoonIcon class="size-4" />
      </button>
      <button aria-label="System theme" aria-pressed="false" class={inactive} type="button">
        <MonitorIcon class="size-4" />
      </button>
    </div>
  );
}
