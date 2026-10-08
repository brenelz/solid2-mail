import { createMemo, For, Loading, Show } from "solid-js";
import { MAILBOXES, type Mailbox } from "../lib/mailboxes";
import { getCurrentUser, getLabels, getMailboxCounts } from "../lib/queries";
import { searchHref } from "../lib/search";
import {
  ArchiveIcon,
  BrandMark,
  ChevronsUpDownIcon,
  InboxIcon,
  SendIcon,
  StarIcon,
} from "./icons";
import { CurrentUserCardSkeleton, LabelNavSkeleton } from "./skeletons";
import { ComposeButton } from "./compose";
import { SolidBadge, UserAvatar } from "./ui";
import { dynamic, dynamicComponent } from "@solidjs/web";

const mailboxIcons: Record<Mailbox, typeof InboxIcon> = {
  archive: ArchiveIcon,
  inbox: InboxIcon,
  sent: SendIcon,
  starred: StarIcon,
};

// The router marks plain anchors: `data-active` when the URL is this mailbox or a thread inside it.
const linkClass =
  "group flex h-10 items-center gap-3 rounded-lg px-3 text-base tracking-tight transition-colors not-data-active:hover:bg-card data-active:bg-accent/15 data-active:text-accent data-active:font-bold data-active:[&_svg]:stroke-[2.5]";

/** The desktop sidebar. On small screens the same content opens in the mobile navigation drawer. */
export function MailSidebar() {
  return (
    <aside class="hidden w-60 shrink-0 md:flex">
      <MailSidebarContent />
    </aside>
  );
}

/** Mailboxes, labels and the account card. In the drawer the brand row takes the Compose button's place
 *  (small screens have the floating Compose button instead). */
export function MailSidebarContent(props: { drawer?: boolean }) {
  const mailboxCounts = createMemo(() => getMailboxCounts(), { name: "mailboxCounts" });
  const Labels = dynamicComponent(() => getLabels());
  const currentUser = createMemo(() => getCurrentUser(), {
    name: "currentUser",
  });

  return (
    <div class={["flex min-h-0 flex-1 flex-col gap-6 px-3 pb-3", props.drawer ? "pt-0" : "pt-1"]}>
      <Show
        when={props.drawer}
        fallback={
          <div class="px-1">
            <ComposeButton variant="sidebar" />
          </div>
        }
      >
        <a aria-label="Stamp inbox" class="flex h-10 items-center gap-2.5 px-2 text-xl font-bold tracking-tight" href="/inbox">
          <BrandMark class="text-accent size-7" />
          Stamp
          <SolidBadge />
        </a>
      </Show>

      <nav aria-label="Mailboxes" class="flex flex-col gap-0.5">
        <For each={MAILBOXES}>
          {(mailbox) => {
            const Icon = mailboxIcons[mailbox.id];
            return (
              <a
                class={linkClass}
                href={`/${mailbox.id}`}
              >
                <Icon class="size-5 shrink-0" />
                <span class="flex-1">{mailbox.name}</span>
                {/* While this mailbox is the in-flight navigation target the router sets `data-pending`:
                      show a "…" in place of the count until the page is ready. */}
                <span aria-hidden="true" class="text-gray hidden items-center gap-0.5 group-data-pending:flex">
                  <span class="size-1 animate-pulse rounded-full bg-current" />
                  <span class="size-1 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                  <span class="size-1 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
                </span>
                {/* Only the count waits on the server; while it loads the row renders without it. */}
                <Loading>
                  <Show when={mailboxCounts()[mailbox.id] > 0}>
                    <span class="text-gray group-data-active:text-accent text-xs font-medium tabular-nums group-data-pending:hidden">
                      {mailboxCounts()[mailbox.id]}
                    </span>
                  </Show>
                </Loading>
              </a>
            );
          }}
        </For>
      </nav>

      <nav aria-label="Labels" class="flex flex-col gap-0.5">
        <p class="text-gray flex h-9 items-center px-3 text-sm font-semibold tracking-tight">
          Labels
        </p>
        <Loading fallback={<LabelNavSkeleton />}>
          <Labels />
        </Loading>
      </nav>

      <div class="mt-auto flex flex-col gap-2">
        <Loading fallback={<CurrentUserCardSkeleton />}>
          <button
            class="hover:bg-card flex h-12 w-full min-w-0 items-center gap-2.5 rounded-lg px-2 text-left transition-colors"
            type="button"
          >
            <UserAvatar name={currentUser().name} size="sm" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm leading-tight font-semibold tracking-tight">
                {currentUser().title}
              </span>
              <span class="text-gray block truncate text-xs leading-tight">
                {currentUser().email}
              </span>
            </span>
            <ChevronsUpDownIcon class="text-gray size-3.5 shrink-0" />
          </button>
        </Loading>
      </div>
    </div>
  );
}
