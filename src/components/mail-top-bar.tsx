import { useIsRouting, useLocation, useNavigate } from "@solidjs/router";
import { createEffect, untrack } from "solid-js";
import { searchHref, searchQuery } from "../lib/search";
import { BrandMark, GitHubIcon, MenuIcon, SearchIcon } from "./icons";
import { iconButtonClass } from "./ui";

export function MailTopBar() {
  return (
    <header class="flex h-16 shrink-0 items-center gap-2 px-3 sm:px-4 md:gap-3">
      <button aria-label="Open navigation" class={`${iconButtonClass} -ml-1 size-10 md:hidden`} type="button">
        <MenuIcon class="size-5" />
      </button>
      <div class="hidden w-56 items-center gap-1 pl-2 md:flex">
        <a aria-label="Stamp inbox" class="flex items-center gap-2.5 text-xl font-bold tracking-tight" href="/inbox">
          <BrandMark class="text-accent size-7" />
          Stamp
        </a>
        <a
          aria-label="View source on GitHub"
          class={iconButtonClass}
          href="https://github.com/aurorascharff/next16-mail"
          rel="noopener noreferrer"
          target="_blank"
          title="View source on GitHub"
        >
          <GitHubIcon class="size-4" />
        </a>
      </div>
      <div class="min-w-0 flex-1 md:max-w-2xl">
        <SearchForm />
      </div>
    </header>
  );
}

/** Search as you type: each keystroke navigates to `/search?q=…`; the search page does the querying. */
function SearchForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRouting = useIsRouting();
  const onSearchPage = () => location.pathname === "/search" || location.pathname.startsWith("/search/");
  const urlQuery = () => (onSearchPage() ? searchQuery(location.query) : "");
  let input: HTMLInputElement | undefined;

  // The URL is the source of truth, but never overwrite the box while the user is typing in it: a navigation
  // landing late would otherwise clobber newer keystrokes. Label links, Back, leaving search etc. sync it.
  createEffect(urlQuery, (q) => {
    if (input && document.activeElement !== input) input.value = q;
  });

  return (
    <form class="relative" onSubmit={(e) => e.preventDefault()} role="search">
      <label class="sr-only" for="search-mail">
        Search mail
      </label>
      <SearchIcon
        class={
          onSearchPage() && isRouting()
            ? "text-gray pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-pulse"
            : "text-gray pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        }
      />
      <input
        autocomplete="off"
        class="bg-card placeholder-gray focus:ring-accent/30 h-10 w-full rounded-lg pr-3 pl-9 text-sm outline-none focus:ring-2"
        id="search-mail"
        name="q"
        onInput={(e) =>
          navigate(searchHref(e.currentTarget.value.trim()), { replace: onSearchPage(), scroll: false })
        }
        placeholder="Search mail"
        ref={(el) => (input = el)}
        type="search"
        // Server-rendered initial value (e.g. landing on /search?q=Design); later syncs go through the effect.
        value={untrack(urlQuery)}
      />
    </form>
  );
}
