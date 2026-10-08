import {
  createContext,
  createMemo,
  createOptimistic,
  createSignal,
  Loading,
  Show,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { composeMessage } from "../lib/mutations";
import { getCurrentUser } from "../lib/queries";
import { MinusIcon, PenLineIcon, SendIcon, XIcon } from "./icons";
import { fieldClass, submitOnCommandEnter } from "./ui";

type ComposeState = "closed" | "open" | "minimized";

type Compose = {
  state: Accessor<ComposeState>;
  open: () => void;
  /** Minimize, or restore when already minimized. */
  toggleMinimized: () => void;
  close: () => void;
};

const ComposeContext = createContext<Compose>();

/** Owns whether the compose panel is open; the sidebar button, the mobile FAB and the panel share it. */
export function ComposeProvider(props: ParentProps) {
  const [state, setState] = createSignal<ComposeState>("closed", { name: "composeState" });
  const compose: Compose = {
    state,
    open: () => setState("open"),
    toggleMinimized: () => setState((s) => (s === "minimized" ? "open" : "minimized")),
    close: () => setState("closed"),
  };
  return <ComposeContext value={compose}>{props.children}</ComposeContext>;
}

export const useCompose = () => useContext(ComposeContext);

export function ComposeButton(props: { variant: "sidebar" | "fab" }) {
  const compose = useCompose();
  return (
    <Show
      when={props.variant === "fab"}
      fallback={
        <button
          class="bg-accent hover:bg-accent-hover inline-flex h-9 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors"
          onClick={compose.open}
          type="button"
        >
          <PenLineIcon class="size-4" /> Compose
        </button>
      }
    >
      {/* Gmail-style floating compose on small screens; hidden while the (full-screen there) panel is open. */}
      <Show when={compose.state() === "closed"}>
        <button
          class="bg-accent shadow-accent/30 fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-2 rounded-2xl pr-5 pl-4 text-sm font-semibold text-white shadow-xl transition-transform active:scale-95 md:hidden"
          onClick={compose.open}
          type="button"
        >
          <PenLineIcon class="size-5" />
          Compose
        </button>
      </Show>
    </Show>
  );
}

export function ComposePanel() {
  const compose = useCompose();
  return (
    <Show when={compose.state() !== "closed"}>
      <section
        aria-label="New message"
        class={[
          "border-divider fixed inset-0 z-40 flex flex-col bg-black pt-[env(safe-area-inset-top)] sm:inset-auto sm:right-4 sm:bottom-0 sm:w-[min(36rem,calc(100vw-2rem))] sm:rounded-t-2xl sm:border sm:border-b-0 sm:pt-0 sm:shadow-2xl",
          compose.state() === "minimized" ? "sm:h-12" : "sm:max-h-[calc(100dvh-5rem)]",
        ]}
      >
        <header class="bg-card flex h-12 shrink-0 items-center justify-between px-4 sm:rounded-t-2xl">
          <button class="text-sm font-semibold tracking-tight" onClick={compose.toggleMinimized} type="button">
            New message
          </button>
          <span class="flex items-center gap-1">
            <button
              aria-label={compose.state() === "minimized" ? "Expand" : "Minimize"}
              class="text-gray hidden size-7 items-center justify-center rounded-full hover:text-white sm:inline-flex"
              onClick={compose.toggleMinimized}
              type="button"
            >
              <MinusIcon class="size-4" />
            </button>
            <button
              aria-label="Close"
              class="text-gray inline-flex size-7 items-center justify-center rounded-full hover:text-white"
              onClick={compose.close}
              type="button"
            >
              <XIcon class="size-4" />
            </button>
          </span>
        </header>
        {/* Minimizing only hides the form, so a half-written message survives it. */}
        <div class={["min-h-0 flex-1 overflow-y-auto p-4", { "sm:hidden": compose.state() === "minimized" }]}>
          <ComposeForm />
        </div>
      </section>
    </Show>
  );
}

function ComposeForm() {
  const compose = useCompose();
  const user = createMemo(() => getCurrentUser(), { name: "composeFrom" });

  const [sending, setSending] = createOptimistic(false);
  const [error, setError] = createSignal<string | undefined>(undefined);

  // Same shape as the reply form. Failure is either a thrown error or a returned `{ ok: false }` (validation);
  // keep the draft and show why. Success closes the panel: the new thread is at the top of the Inbox, and the
  // form unmounts, so the next compose starts empty.
  composeMessage
    .onSubmit(() => {
      setSending(true);
    })
    .onSettled((submission) => {
      const result = submission.result;
      if (submission.error || (result && !result.ok)) {
        setError(result && !result.ok ? result.error : "Couldn't send this message. Try again.");
      } else {
        setError(undefined);
        compose.close();
      }
    });

  return (
    <form
      action={composeMessage}
      class="group flex flex-col gap-4"
      data-sending={sending() ? "" : undefined}
      method="post"
    >
      <p class="text-gray flex h-8 items-center px-1 text-xs">
        <span class="w-8 font-semibold">From</span>
        <Loading>
          {user().name} <span class="mx-1.5">·</span> {user().email}
        </Loading>
      </p>
      {/* Hardcoded for now: every new message goes to Mara. */}
      <p class="text-gray -mt-3 flex h-8 items-center px-1 text-xs">
        <span class="w-8 font-semibold">To</span>
        <Loading>
          {user().name} <span class="mx-1.5">·</span> {user().email}
        </Loading>
      </p>
      <input
        aria-label="Subject"
        aria-invalid={error() ? "true" : undefined}
        autocomplete="off"
        class={[fieldClass, "h-10 group-data-sending:opacity-60"]}
        id="compose-subject"
        maxlength={120}
        name="subject"
        placeholder="Subject"
        readonly={!!sending()}
        required
      />
      <textarea
        aria-label="Message"
        aria-invalid={error() ? "true" : undefined}
        class={[fieldClass, "min-h-56 resize-y py-2 leading-relaxed group-data-sending:opacity-60"]}
        id="compose-body"
        maxlength={4000}
        name="body"
        onKeyDown={submitOnCommandEnter}
        placeholder="Write your message"
        readonly={!!sending()}
        required
      />
      <div class="flex items-center justify-between gap-3">
        {/* The previous attempt's error stays hidden while a retry is in flight. */}
        <p class="text-danger min-h-4 text-xs" role={!sending() && error() ? "alert" : undefined}>
          <Show when={!sending() && error()}>{(message) => message()}</Show>
        </p>
        <div class="flex items-center gap-2">
          <button
            class="text-muted hover:bg-card inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors hover:text-white"
            onClick={compose.close}
            type="button"
          >
            Discard
          </button>
          <button
            class="bg-accent hover:bg-accent-hover inline-flex h-9 w-24 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition-colors group-data-sending:pointer-events-none group-data-sending:opacity-60"
            disabled={!!sending()}
            type="submit"
          >
            <SendIcon class="size-3.5" />
            <span class="group-data-sending:hidden">Send</span>
            <span class="hidden group-data-sending:inline">Sending</span>
          </button>
        </div>
      </div>
    </form>
  );
}
