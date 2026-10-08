import { For } from "solid-js";
import { CheckIcon } from "./icons";

const range = (count: number) => Array.from({ length: count }, (_, i) => i);

export function Skeleton(props: { class?: string }) {
  return <span aria-hidden="true" class={["skeleton-animation block", props.class]} />;
}

export function CurrentUserCardSkeleton() {
  return (
    <div aria-hidden="true" class="flex h-12 items-center gap-2.5 px-2">
      <Skeleton class="size-8 shrink-0 rounded-full" />
      <div class="flex flex-col gap-2">
        <Skeleton class="h-3 w-16" />
        <Skeleton class="h-3 w-28" />
      </div>
    </div>
  );
}

/** List header with a disabled select-all, so the header keeps its shape while rows load. */
export function ThreadListSkeleton(props: { title?: string; count?: number }) {
  return (
    <div aria-hidden="true">
      <div class="border-divider/70 flex h-12 shrink-0 items-center justify-between gap-3 border-b bg-black px-4 sm:px-5">
        <div class="flex min-w-0 items-center gap-3">
          <span class="border-gray/50 bg-card ml-2 flex size-5 shrink-0 items-center justify-center rounded-full border text-transparent">
            <CheckIcon class="size-3" stroke-width={3} />
          </span>
          <h2 class="truncate text-sm font-semibold tracking-tight">{props.title}</h2>
        </div>
      </div>
      <ThreadRowsSkeleton count={props.count} />
    </div>
  );
}

export function ThreadRowsSkeleton(props: { count?: number }) {
  return (
    <ul aria-hidden="true" class="flex flex-col">
      <For each={range(props.count ?? 6)}>
        {(index) => (
          <li class="border-divider/70 grid h-21 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 border-b px-4 py-3 sm:px-5">
            <Skeleton class="size-9 rounded-full" />
            <div class="flex flex-col gap-3">
              <Skeleton class={index % 2 === 0 ? "h-4 w-40" : "h-4 w-32"} />
              <Skeleton class={index % 3 === 0 ? "h-4 w-1/2" : "h-4 w-2/3"} />
            </div>
          </li>
        )}
      </For>
    </ul>
  );
}

export function ThreadPageSkeleton() {
  return (
    <div aria-hidden="true" class="flex h-full flex-col">
      <div class="border-divider/70 flex h-14 shrink-0 items-center gap-1 border-b bg-black px-3 sm:px-6">
        <Skeleton class="size-9 rounded-full" />
        <span class="bg-divider mx-1 h-5 w-px" />
        <Skeleton class="size-9 rounded-full" />
        <Skeleton class="size-9 rounded-full" />
      </div>
      <div class="min-h-0 flex-1 overflow-hidden px-5 pb-24 sm:px-8">
        <div class="mx-auto w-full max-w-4xl">
          <div class="pt-4">
            <div class="flex h-7 items-center sm:h-8">
              <Skeleton class="h-6 w-3/5 max-w-xl" />
            </div>
          </div>
          <div class="mt-6 flex h-11 items-center gap-3">
            <Skeleton class="size-10 rounded-full" />
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-36" />
              <Skeleton class="h-3.5 w-24" />
            </div>
          </div>
          <div class="mt-5 flex min-h-48 max-w-[68ch] flex-col gap-3 pt-1">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-11/12" />
            <Skeleton class="h-4 w-4/5" />
            <Skeleton class="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
