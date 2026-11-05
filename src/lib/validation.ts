/**
 * Form validation for plans and trips. Returns a map of field -> friendly
 * message; an empty object means the form is OK to save.
 */

export type PlanErrors = { [K in "title" | "category" | "cost_estimated" | "cost_actual"]?: string | undefined };
export type TripErrors = { [K in "name" | "end" | "budget"]?: string | undefined };

export function validatePlan(form: {
  title?: string | null;
  category?: string | null;
  cost_estimated?: number | null;
  cost_actual?: number | null;
}): PlanErrors {
  const errors: PlanErrors = {};
  if (!form.title?.trim()) errors.title = 'Give this plan a title — for example "Dinner at Sal Grosso".';
  if (!form.category?.trim()) errors.category = "Pick a category so the plan gets the right icon and budget bucket.";
  if (typeof form.cost_estimated === "number" && form.cost_estimated < 0)
    errors.cost_estimated = "Costs can't be negative.";
  if (typeof form.cost_actual === "number" && form.cost_actual < 0)
    errors.cost_actual = "Costs can't be negative.";
  return errors;
}

export function validateTrip(form: { name: string; start: string; end: string; budget: string }): TripErrors {
  const errors: TripErrors = {};
  if (!form.name.trim()) errors.name = 'Every trip needs a name — for example "Peru 2027".';
  if (form.start && form.end && form.end < form.start)
    errors.end = "The trip can't end before it starts. Check the end date.";
  if (form.budget && Number(form.budget) < 0) errors.budget = "The budget can't be negative.";
  return errors;
}

export const hasErrors = (e: object) => Object.values(e).some(Boolean);
