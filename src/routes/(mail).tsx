import type { ParentProps } from "solid-js";
import {
  ComposeButton,
  ComposePanel,
  ComposeProvider,
} from "../components/compose";
import { DemoToolbar } from "../components/demo-toolbar";
import { MailSidebar } from "../components/mail-sidebar";
import { MailTopBar } from "../components/mail-top-bar";
import { MobileNavDrawer, MobileNavProvider } from "../components/mobile-nav";
import { defineFileRoute } from "@solidjs/router/fs";
import {
  getCurrentUser,
  getDelaysEnabled,
  getMailboxCounts,
} from "../lib/queries";

export const route = defineFileRoute("/(mail)", {
  preload: () => [
    void getMailboxCounts(),
    void getCurrentUser(),
    void getDelaysEnabled(),
  ],
});

export default function MailLayout(props: ParentProps) {
  return (
    <ComposeProvider>
      <MobileNavProvider>
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
      <ComposeButton variant="fab" />
      <ComposePanel />
      <MobileNavDrawer />
      </MobileNavProvider>
    </ComposeProvider>
  );
}
