import { createMemo, Loading, Show } from "solid-js";
import { setDelaysEnabled } from "../lib/mutations";
import { getDelaysEnabled } from "../lib/queries";
import { TimerIcon, TimerOffIcon } from "./icons";
import { Skeleton } from "./skeletons";

/** Floating demo controls, top right on desktop (like the original's demo toolbar). */
export function DemoToolbar() {
  return (
    <div class="fixed top-4 right-4 z-50 hidden items-start md:flex">
      <Loading fallback={<Skeleton class="h-8 w-24 rounded-full" />}>
        <DemoToolbarPill />
      </Loading>
    </div>
  );
}

function DemoToolbarPill() {
  const delays = createMemo(() => getDelaysEnabled(), {
    name: "delaysEnabled",
  });

  // Like the original: persist the setting server-side, then reload so every query re-runs under it.
  const toggleDelays = async () => {
    await setDelaysEnabled(!delays());
    window.location.reload();
  };

  return (
    <div class="border-divider flex items-center overflow-hidden rounded-full border bg-black/80 text-xs shadow-sm backdrop-blur-md">
      <button
        aria-label={`Delays ${delays() ? "on" : "off"}`}
        aria-pressed={delays() ? "true" : "false"}
        class={[
          "focus-visible:bg-accent/20 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none",
          delays() ? "text-accent" : "text-gray hover:text-white",
        ]}
        onClick={toggleDelays}
        title="Delays"
        type="button"
      >
        <Show when={delays()} fallback={<TimerOffIcon class="size-3.5" />}>
          <TimerIcon class="size-3.5" />
        </Show>
        <span>Delays</span>
      </button>
    </div>
  );
}
