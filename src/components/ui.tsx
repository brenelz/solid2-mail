import type { JSX } from "@solidjs/web";
import type { Label } from "../lib/types";

const avatarSizes = {
  lg: "size-10 text-sm",
  md: "size-9 text-sm",
  sm: "size-8 text-xs",
  xs: "size-6 text-[10px]",
} as const;

export function UserAvatar(props: { name: string; size?: keyof typeof avatarSizes }) {
  return (
    <span
      aria-hidden="true"
      class={[
        "bg-accent/15 text-accent flex shrink-0 items-center justify-center rounded-full font-semibold uppercase",
        avatarSizes[props.size ?? "md"],
      ]}
    >
      {props.name.charAt(0)}
    </span>
  );
}

export function LabelChip(props: { label: Label; size?: "sm" | "md"; class?: string }) {
  const md = () => props.size === "md";
  return (
    <span
      class={[
        "text-gray inline-flex shrink-0 items-center gap-1.5 font-medium whitespace-nowrap",
        md() ? "h-7 text-xs" : "h-5 text-[11px]",
        props.class,
      ]}
    >
      <span
        aria-hidden="true"
        class={["shrink-0 rounded-full", md() ? "size-2.5" : "size-2"]}
        style={{ "background-color": props.label.color }}
      />
      {props.label.name}
    </span>
  );
}

export const iconButtonClass =
  "text-muted inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-card hover:text-white";

/** Small round icon button used in rows and list headers. */
export function RowButton(props: {
  label: string;
  active?: boolean;
  class?: string;
  children: JSX.Element;
}) {
  return (
    <button
      aria-label={props.label}
      aria-pressed={props.active === undefined ? undefined : props.active ? "true" : "false"}
      class={[
        "inline-flex size-6 items-center justify-center rounded-full transition-colors hover:bg-white/10",
        props.active ? "text-accent" : "text-gray hover:text-white",
        props.class,
      ]}
      title={props.label}
      type="button"
    >
      {props.children}
    </button>
  );
}
