/**
 * TEST 1 — Data isolation (PLAN.md §4)
 *
 * Given  User A has a trip "Lisbon" with a plan "Dinner at Sal Grosso",
 *        and User B has signed up but has no trips,
 * When   User B asks the database for all trips and all plans,
 *        and then tries to edit and delete A's plan,
 * Then   B gets back zero trips and zero plans, the edit and delete change nothing,
 *        and A's plan is still there when A looks.
 *
 * Runs against the app's real migrations and row-level-security policies.
 */
import { beforeAll, describe, expect, test } from "vitest";
import { createTestDb, type TestDb } from "./harness";

const A = { email: "a@example.test" } as { email: string; id: string };
const B = { email: "b@example.test" } as { email: string; id: string };
let t: TestDb;
let planId: string;

beforeAll(async () => {
  t = await createTestDb();
  A.id = await t.createUser(A.email);
  B.id = await t.createUser(B.email);

  // User A creates a trip and a plan through the same policies the app uses.
  await t.asUser(A.id, A.email, async (q) => {
    const [trip] = await q<{ id: string }>(
      "insert into public.trips (owner_id, name, primary_destination) values ($1, 'Lisbon', 'Lisbon, Portugal') returning id",
      [A.id],
    );
    const [plan] = await q<{ id: string }>(
      "insert into public.agenda_items (trip_id, title, category, day_date, cost_estimated) values ($1, 'Dinner at Sal Grosso', 'Restaurant', '2026-11-20', 60) returning id",
      [trip!.id],
    );
    planId = plan!.id;
  });
});

describe("data isolation: User B cannot see or touch User A's data", () => {
  test("User A can see their own trip and plan (sanity check)", async () => {
    const trips = await t.asUser(A.id, A.email, (q) => q("select name from public.trips"));
    const plans = await t.asUser(A.id, A.email, (q) => q("select title from public.agenda_items"));
    expect(trips).toEqual([{ name: "Lisbon" }]);
    expect(plans).toEqual([{ title: "Dinner at Sal Grosso" }]);
  });

  test("User B's trip list and plan list are empty", async () => {
    const trips = await t.asUser(B.id, B.email, (q) => q("select * from public.trips"));
    const plans = await t.asUser(B.id, B.email, (q) => q("select * from public.agenda_items"));
    expect(trips).toHaveLength(0);
    expect(plans).toHaveLength(0);
  });

  test("User B cannot open A's plan even with its exact id", async () => {
    const rows = await t.asUser(B.id, B.email, (q) =>
      q("select * from public.agenda_items where id = $1", [planId]),
    );
    expect(rows).toHaveLength(0);
  });

  test("User B's edit and delete affect zero rows", async () => {
    const updated = await t.asUser(B.id, B.email, (q) =>
      q("update public.agenda_items set title = 'hacked' where id = $1 returning id", [planId]),
    );
    const deleted = await t.asUser(B.id, B.email, (q) =>
      q("delete from public.agenda_items where id = $1 returning id", [planId]),
    );
    expect(updated).toHaveLength(0);
    expect(deleted).toHaveLength(0);
  });

  test("User B cannot sneak a plan into A's trip", async () => {
    const [trip] = await t.asUser(A.id, A.email, (q) => q<{ id: string }>("select id from public.trips"));
    await expect(
      t.asUser(B.id, B.email, (q) =>
        q("insert into public.agenda_items (trip_id, title, category) values ($1, 'spam', 'Note')", [trip!.id]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  test("stars: B can't see A's stars or star a plan on A's trip", async () => {
    await t.asUser(A.id, A.email, (q) =>
      q("insert into public.stars (user_id, agenda_item_id) values ($1, $2)", [A.id, planId]),
    );
    const bStars = await t.asUser(B.id, B.email, (q) => q("select * from public.stars"));
    expect(bStars).toHaveLength(0);
    await expect(
      t.asUser(B.id, B.email, (q) =>
        q("insert into public.stars (user_id, agenda_item_id) values ($1, $2)", [B.id, planId]),
      ),
    ).rejects.toThrow(/row-level security/);
    const aStars = await t.asUser(A.id, A.email, (q) => q("select agenda_item_id from public.stars"));
    expect(aStars).toEqual([{ agenda_item_id: planId }]);
  });

  test("A's plan is unchanged afterwards", async () => {
    const plans = await t.asUser(A.id, A.email, (q) => q("select title from public.agenda_items"));
    expect(plans).toEqual([{ title: "Dinner at Sal Grosso" }]);
  });
});
