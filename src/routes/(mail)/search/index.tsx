import { Title } from "@solidjs/meta";
import { useIsRouting, type RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Loading } from "solid-js";
import { ThreadListSkeleton } from "../../../components/skeletons";
import { ThreadList, ThreadListHeader } from "../../../components/thread-list";
import { ThreadSelection } from "../../../components/thread-selection";
import { searchThreads } from "../../../lib/queries";
import { searchHref, searchQuery } from "../../../lib/search";

export const route = defineFileRoute("/search", {
  preload: ({ location }) => searchThreads(searchQuery(location.query)),
});

export default function SearchPage(props: RouteProps<typeof route>) {
  const q = () => searchQuery(props.location.query);

  return (
    <div class="flex h-full flex-col">
      <Title>{q() ? `${q()} · Search · Stamp` : "Search · Stamp"}</Title>
      {/* An empty query (the box blanked out) lists every thread. */}
      <SearchResults q={q()} />
    </div>
  );
}

function SearchResults(props: { q: string }) {
  const results = createMemo(() => searchThreads(props.q), { name: "searchResults" });
  // Typing navigates; the old results stay up while the new ones load, dimmed like the original.
  const isRouting = useIsRouting();

  return (
    <Loading fallback={<ThreadListSkeleton count={4} title="Search" />}>
      {/* No mailbox: search spans locations, so there's no Archive / Move to inbox here (like the original). */}
      <ThreadSelection list={props.q} threads={results()}>
      <ThreadListHeader count={results().length} title="Search" total={results().length} />
      <div
        class={[
          "min-h-0 flex-1 overflow-y-auto overscroll-y-contain transition-opacity duration-200",
          { "opacity-60": isRouting() },
        ]}
      >
        <ThreadList
          empty={{ title: "No results" }}
          hrefFor={(id) => searchHref(props.q, id)}
          threads={results()}
        />
      </div>
      </ThreadSelection>
    </Loading>
  );
}
