import { createOptimistic, createSignal, Show } from "solid-js";
import { sendReply } from "../lib/mutations";
import { SendIcon } from "./icons";
import { fieldClass, submitOnCommandEnter } from "./ui";

export function ReplyForm(props: {
  threadId: string;
  replyTo: string;
  /** How many messages the thread shows right now — how we know a sent reply is on screen. */
  messageCount: number;
}) {
  let textarea: HTMLTextAreaElement | undefined;

  const [sending, setSending] = createOptimistic(false);
  const [error, setError] = createSignal<string | undefined>(undefined);

  sendReply
    .onSubmit(() => {
      setSending(true);
    })
    .onSettled((submission) => {
      if (submission.error) {
        setError(submission.result?.error);
      } else {
        setError(undefined);

        textarea!.value = "";
        textarea!.focus();
      }
    });

  return (
    <form
      action={sendReply.with(props.threadId)}
      class="group mt-8 flex flex-col gap-3"
      data-sending={sending() ? "" : undefined}
      method="post"
    >
      <label class="sr-only" for={`reply-${props.threadId}`}>
        Reply
      </label>
      <textarea
        aria-invalid={error() ? "true" : undefined}
        class={[
          fieldClass,
          "min-h-24 resize-y py-2 leading-relaxed group-data-sending:opacity-60",
        ]}
        id={`reply-${props.threadId}`}
        name="body"
        onKeyDown={submitOnCommandEnter}
        placeholder={`Reply to ${props.replyTo}…`}
        readonly={!!sending()}
        required
        ref={(el) => (textarea = el)}
      />
      <div class="flex items-center justify-between gap-3">
        <p
          class="text-danger min-h-4 text-xs"
          role={error() ? "alert" : undefined}
        >
          <Show when={error()}>{(message) => message()}</Show>
        </p>
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
    </form>
  );
}
