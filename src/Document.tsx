import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";
import geistLatin from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";

export default function Document(props: ParentProps) {
  return (
    <html lang="en" class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href={geistLatin} as="font" type="font/woff2" crossorigin="" />
        <meta
          name="description"
          content="Stamp, a Gmail-style mail client demo rebuilt with SolidJS 2 — a port of aurorascharff/next16-mail."
        />
        <title>Stamp · SolidJS</title>
        <HydrationScript />
      </head>
      <body class="flex min-h-dvh flex-col">{props.children}</body>
    </html>
  );
}
