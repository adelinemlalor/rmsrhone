import { describe, expect, test } from "vitest";
import { hasErrors, validatePlan, validateTrip } from "@/lib/validation";

describe("validatePlan", () => {
  test("blank title and missing category are both reported", () => {
    const e = validatePlan({ title: "   ", category: "" });
    expect(e.title).toMatch(/title/);
    expect(e.category).toMatch(/category/);
  });
  test("negative costs are rejected", () => {
    expect(validatePlan({ title: "Hotel", category: "Hotel", cost_actual: -5 }).cost_actual).toBeTruthy();
  });
  test("a complete plan passes", () => {
    expect(hasErrors(validatePlan({ title: "Dinner", category: "Restaurant", cost_estimated: 60 }))).toBe(false);
  });
});

describe("validateTrip", () => {
  test("name is required", () => {
    expect(validateTrip({ name: "", start: "", end: "", budget: "" }).name).toBeTruthy();
  });
  test("end date before start date is rejected", () => {
    expect(validateTrip({ name: "Peru", start: "2027-01-10", end: "2027-01-02", budget: "" }).end).toBeTruthy();
  });
  test("a valid trip passes", () => {
    expect(hasErrors(validateTrip({ name: "Peru", start: "2027-01-02", end: "2027-01-16", budget: "3000" }))).toBe(false);
  });
});
