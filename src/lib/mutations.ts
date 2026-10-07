"use server";
import { getRequestEvent, serializeCookie } from "@solidjs/web";
import { DELAYS_COOKIE } from "./server";

/** Demo toolbar: turn the fake query latency on or off (stored in a cookie). */
export async function setDelaysEnabled(enabled: boolean) {
  const event = getRequestEvent() as { response?: { headers: Headers } } | undefined;
  event?.response?.headers.append(
    "Set-Cookie",
    serializeCookie(DELAYS_COOKIE, enabled ? "1" : "0", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 }),
  );
}
