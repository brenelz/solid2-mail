import { useAction } from "@solidjs/router";
import {
  createContext,
  createMemo,
  createOptimistic,
  createSignal,
  Show,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { markThreadsRead, moveThreads, starThreads } from "../lib/mutations";
import type { Mailbox, ThreadListItem } from "../lib/types";
import { ArchiveIcon, ArchiveRestoreIcon, CheckIcon, MailIcon, MailOpenIcon, StarIcon, XIcon } from "./icons";
import { RowButton } from "./ui";

type Selection = {
  /** Selected threads that are still in the list (archived-away rows drop out on their own). */
  selected: Accessor<ThreadListItem[]>;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  allSelected: Accessor<boolean>;
  toggleAll: () => void;
  clear: () => void;
  /** A bulk action is in flight: the toolbar is disabled until its result is on screen. */
  busy: Accessor<boolean>;
  /** The mailbox the list shows; undefined for search. */
  mailbox?: Mailbox;
};

// `null` default, not `undefined`: Solid 2 treats an undefined default as "no default" and throws when a
// header renders outside a selection (search before anything is typed, skeletons).
const SelectionContext = createContext<Selection | null>(null);

export const useSelection = () => useContext(SelectionContext) ?? undefined;

const NONE: ReadonlySet<string> = new Set();
const NO_THREADS: ThreadListItem[] = [];
const sameThreads = (a: ThreadListItem[], b: ThreadListItem[]) =>
  a.length === b.length && a.every((thread, i) => thread === b[i]);

/** Selection for one list. `list` names it (mailbox or search query): changing it starts a fresh selection. */
export function ThreadSelection(
  props: ParentProps<{ threads: ThreadListItem[]; list: string; mailbox?: Mailbox }>,
) {
  // The selected ids remember which list they belong to; on any other list nothing is selected. Derived rather
  // than reset by an effect: an effect writing state on every navigation fought overlapping navigation
  // transitions (fast mailbox switching hit "Potential Infinite Loop Detected").
  const [state, setState] = createSignal<{ list: string; ids: ReadonlySet<string> }>(
    { list: "", ids: new Set() },
    { name: "selectedIds" },
  );
  const ids = (): ReadonlySet<string> => (state().list === props.list ? state().ids : NONE);
  // Always an updater: it composes with writes not yet flushed, so several toggles in one tick (fast clicks)
  // all land. Computing from `ids()` instead would read the last *flushed* selection and drop earlier toggles.
  const setIds = (next: ReadonlySet<string> | ((current: ReadonlySet<string>) => ReadonlySet<string>)) => {
    setState((previous) => {
      const current = previous.list === props.list ? previous.ids : NONE;
      return { list: props.list, ids: typeof next === "function" ? next(current) : next };
    });
  };
  const [busy, setBusy] = createOptimistic(false);

  // Stable output: the same empty array whenever nothing is selected (always the case while switching lists)
  // and element-wise equality otherwise. A fresh array per run made this memo "change" on every update of the
  // list, which under fast mailbox switching re-staged it endlessly (Potential Infinite Loop Detected).
  const selected = createMemo(
    () => {
      const current = ids();
      return current.size === 0 ? NO_THREADS : props.threads.filter((t) => current.has(t.id));
    },
    { name: "selectedThreads", equals: sameThreads },
  );
  const allSelected = () => props.threads.length > 0 && selected().length === props.threads.length;
  const clear = () => {
    setIds(NONE);
  };

  // Same pattern as the forms: in-flight state set on submit (reverts when the action's update commits),
  // selection cleared once the change is on screen.
  // A row's own hover buttons use the same actions: only a bulk action (it carried exactly the selection)
  // clears the selection afterwards.
  const isSelection = (submitted: string[]) =>
    submitted.length === ids().size && submitted.every((id) => ids().has(id));
  for (const bulk of [moveThreads, starThreads, markThreadsRead]) {
    // eslint-disable-next-line solid/reactivity -- settled hooks are event-like: compare with the selection now
    bulk.onSubmit(() => setBusy(true)).onSettled((submission) => {
      if (!submission.error && isSelection(submission.input[0])) clear();
    });
  }

  const selection: Selection = {
    selected,
    isSelected: (id) => ids().has(id),
    toggle: (id) =>
      setIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    allSelected,
    toggleAll: () => setIds(allSelected() ? new Set<string>() : new Set(props.threads.map((t) => t.id))),
    clear,
    busy,
    get mailbox() {
      return props.mailbox;
    },
  };

  return <SelectionContext value={selection}>{props.children}</SelectionContext>;
}

/** Header checkbox. Drawn (disabled) without a selection context or rows, so the header keeps its shape. */
export function SelectAll() {
  const selection = useSelection();
  const all = () => !!selection?.allSelected();
  return (
    <button
      aria-checked={all() ? "true" : "false"}
      aria-label={all() ? "Clear selection" : "Select all on this page"}
      class={[
        "ml-2 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
        all() ? "border-accent bg-accent text-white" : "border-gray/50 bg-card enabled:hover:border-gray text-transparent",
      ]}
      disabled={!selection}
      onClick={() => selection?.toggleAll()}
      role="checkbox"
      type="button"
    >
      <CheckIcon class="size-3" stroke-width={3} />
    </button>
  );
}

/** "N selected" and the bulk actions, in place of the list title while anything is selected. */
export function BulkActions() {
  const selection = useSelection()!;
  const move = useAction(moveThreads);
  const star = useAction(starThreads);
  const markRead = useAction(markThreadsRead);

  const ids = () => selection.selected().map((t) => t.id);
  // Archive / Move to inbox follow where the selected threads live (not which list shows them), so it works in
  // Starred and search too: all in the Inbox → Archive, all archived → Move to inbox, otherwise (mixed, Sent) none.
  const locations = () => new Set(selection.selected().map((t) => t.mailbox));
  const canMove = () =>
    locations().size === 1 && (locations().has("inbox") || locations().has("archive"));
  const moveTo = () => (locations().has("archive") ? "inbox" : "archive");
  // Like the original: Star if any selected thread isn't starred yet, Mark as read if any is unread.
  const shouldStar = () => selection.selected().some((t) => !t.starred);
  const shouldRead = () => selection.selected().some((t) => !t.read);

  return (
    <>
      <span class="text-sm font-semibold tabular-nums">{selection.selected().length} selected</span>
      <Show when={canMove()}>
        <BulkButton
          label={moveTo() === "archive" ? "Archive" : "Move to inbox"}
          onClick={() => void move(ids(), moveTo())}
        >
          <Show when={moveTo() === "archive"} fallback={<ArchiveRestoreIcon class="size-4" />}>
            <ArchiveIcon class="size-4" />
          </Show>
        </BulkButton>
      </Show>
      <BulkButton label={shouldStar() ? "Star" : "Remove star"} onClick={() => void star(ids(), shouldStar())}>
        <StarIcon class="size-4" filled={!shouldStar()} />
      </BulkButton>
      <BulkButton
        label={shouldRead() ? "Mark as read" : "Mark as unread"}
        onClick={() => void markRead(ids(), shouldRead())}
      >
        <Show when={shouldRead()} fallback={<MailIcon class="size-4" />}>
          <MailOpenIcon class="size-4" />
        </Show>
      </BulkButton>
    </>
  );
}

function BulkButton(props: ParentProps<{ label: string; onClick: () => void }>) {
  const selection = useSelection()!;
  return (
    <button
      aria-label={props.label}
      class="text-gray inline-flex size-6 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
      disabled={selection.busy()}
      onClick={() => props.onClick()}
      title={props.label}
      type="button"
    >
      {props.children}
    </button>
  );
}

export function ClearSelection() {
  const selection = useSelection()!;
  return (
    <RowButton label="Clear selection" onClick={selection.clear}>
      <XIcon class="size-4" />
    </RowButton>
  );
}
