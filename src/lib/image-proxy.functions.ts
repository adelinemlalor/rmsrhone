import { createServerFn } from "@tanstack/react-start";

/** Fetch a remote image server-side (for hosts that block browser downloads) and return it as a data URL. */
export const fetchImageData = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    if (typeof input?.url !== "string" || !/^https?:\/\//.test(input.url)) throw new Error("Invalid URL");
    return input;
  })
  .handler(async ({ data }) => {
    const res = await fetch(data.url, { headers: { "User-Agent": "RMSRhone/1.0 (trip PDF export)" } });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 8_000_000) return null;
    return `data:${type};base64,${Buffer.from(buf).toString("base64")}`;
  });
