import { expect, test } from "vitest";
import { resolveDark } from "@/lib/theme";

test("dark mode resolves from the saved preference and the device setting", () => {
  expect(resolveDark("dark", false)).toBe(true);
  expect(resolveDark("light", true)).toBe(false);
  expect(resolveDark("system", true)).toBe(true);
  expect(resolveDark("system", false)).toBe(false);
});
