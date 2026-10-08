import { For } from "solid-js";
import type { Message } from "../lib/types";
import { UserAvatar } from "./ui";

/** One message in a conversation. Plain markup: rendered on the server by the `getThread` server component. */
export function MessageView(props: { message: Message }) {
  const to = () => props.message.to.map((person) => person.name.split(" ")[0]).join(", ");
  return (
    <article>
      <div class="flex h-11 items-center gap-3">
        <UserAvatar name={props.message.from.name} size="lg" />
        <div class="min-w-0 flex-1">
          <p class="flex h-5 items-baseline gap-1.5 text-sm">
            <span class="truncate font-semibold tracking-tight">{props.message.from.name}</span>
            <span class="text-gray hidden truncate text-[13px] sm:inline">{props.message.from.email}</span>
          </p>
          <p class="text-gray flex h-5 items-center truncate text-[13px]">to {to()}</p>
        </div>
        <time class="text-gray shrink-0 text-xs tabular-nums">{props.message.date}</time>
      </div>
      <div class="mt-4 flex max-w-[68ch] flex-col gap-4 text-[15px] leading-[1.65] text-white/85">
        <For each={props.message.paragraphs}>{(paragraph) => <p>{paragraph}</p>}</For>
      </div>
    </article>
  );
}
