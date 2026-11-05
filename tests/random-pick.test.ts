import { describe, expect, test } from "vitest";
import { randomPick } from "@/lib/random-pick";

const ideas = [
  { id: "a", name: "Taberna Sal Grosso", priority: "Must Do", scheduled: false },
  { id: "b", name: "Time Out Market", priority: "Maybe", scheduled: false },
  { id: "c", name: "Already booked", priority: "Must Do", scheduled: true },
];

describe("randomPick", () => {
  test("never picks a scheduled idea", () => {
    for (let i = 0; i < 50; i++) expect(randomPick(ideas)?.id).not.toBe("c");
  });
  test("weights by priority: Must Do (3) owns the first 3/4 of the range", () => {
    expect(randomPick(ideas, null, () => 0.7)?.id).toBe("a");
    expect(randomPick(ideas, null, () => 0.8)?.id).toBe("b");
  });
  test("'Pick again' doesn't repeat the same idea when another exists", () => {
    expect(randomPick(ideas, "a", () => 0)?.id).toBe("b");
  });
  test("returns null when nothing is left", () => {
    expect(randomPick([ideas[2]!])).toBeNull();
  });
});
