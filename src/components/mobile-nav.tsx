import { useLocation } from "@solidjs/router";
import {
  createContext,
  createEffect,
  createSignal,
  Show,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { MenuIcon, XIcon } from "./icons";
import { MailSidebarContent } from "./mail-sidebar";
import { iconButtonClass } from "./ui";

type MobileNav = { open: Accessor<boolean>; show: () => void; hide: () => void };

const MobileNavContext = createContext<MobileNav>();

/** Whether the small-screen navigation drawer is open; the top bar's menu button and the drawer share it. */
export function MobileNavProvider(props: ParentProps) {
  const [open, setOpen] = createSignal(false, { name: "mobileNavOpen" });
  const nav: MobileNav = { open, show: () => setOpen(true), hide: () => setOpen(false) };

  // Picking a mailbox, label or anything else navigates: close the drawer behind it.
  const location = useLocation();
  createEffect(
    () => location.pathname + location.search,
    () => {
      nav.hide(); // an effect may only return a cleanup function, so don't return the setter's value
    },
  );

  return <MobileNavContext value={nav}>{props.children}</MobileNavContext>;
}

/** The ☰ button in the top bar (small screens only). */
export function MobileNavTrigger() {
  const nav = useContext(MobileNavContext);
  return (
    <button
      aria-expanded={nav.open() ? "true" : "false"}
      aria-haspopup="dialog"
      aria-label="Open navigation"
      class={`${iconButtonClass} -ml-1 size-10 md:hidden`}
      onClick={nav.show}
      type="button"
    >
      <MenuIcon class="size-5" />
    </button>
  );
}

/** The drawer: the sidebar's content sliding over the page, with a backdrop. Escape, ✕ or the backdrop close it. */
export function MobileNavDrawer() {
  const nav = useContext(MobileNavContext);
  let closeButton: HTMLButtonElement | undefined;

  createEffect(nav.open, (isOpen) => {
    if (!isOpen) return;
    closeButton?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") nav.hide();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  return (
    <Show when={nav.open()}>
      <div aria-hidden="true" class="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden" onClick={nav.hide} />
      <div
        aria-label="Stamp navigation"
        aria-modal="true"
        class="border-divider fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] flex-col border-r bg-black pt-[max(1rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] shadow-2xl md:hidden"
        role="dialog"
      >
        <button
          aria-label="Close navigation"
          class="text-gray hover:bg-card absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 grid size-9 place-items-center rounded-full hover:text-white"
          onClick={nav.hide}
          ref={(el) => (closeButton = el)}
          type="button"
        >
          <XIcon class="size-5" />
        </button>
        <MailSidebarContent drawer />
      </div>
    </Show>
  );
}
