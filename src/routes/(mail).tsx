import type { ParentProps } from "solid-js";
import { DemoToolbar } from "../components/demo-toolbar";
import { MailSidebar } from "../components/mail-sidebar";
import { MailTopBar } from "../components/mail-top-bar";
import { PenLineIcon } from "../components/icons";

export default function MailLayout(props: ParentProps) {
  return (
    <>
      <div class="flex h-dvh flex-col pt-[env(safe-area-inset-top)]">
        <MailTopBar />
        <div class="flex min-h-0 flex-1">
          <MailSidebar />
          <main class="border-divider/70 min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain md:rounded-tl-2xl md:border-t md:border-l">
            {props.children}
          </main>
        </div>
      </div>
      <DemoToolbar />
      {/* Floating compose button on small screens */}
      <button
        class="bg-accent shadow-accent/30 fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-2 rounded-2xl pr-5 pl-4 text-sm font-semibold text-white shadow-xl transition-transform active:scale-95 md:hidden"
        type="button"
      >
        <PenLineIcon class="size-5" />
        Compose
      </button>
    </>
  );
}
