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
        <form class="relative" role="search">
          <label class="sr-only" for="search-mail">
            Search mail
          </label>
          <SearchIcon class="text-gray pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            autocomplete="off"
            class="bg-card placeholder-gray focus:ring-accent/30 h-10 w-full rounded-lg pr-3 pl-9 text-sm outline-none focus:ring-2"
            id="search-mail"
            name="q"
            placeholder="Search mail"
            type="search"
          />
        </form>
      </div>
    </header>
  );
}
