/**
 * Test database: a real Postgres (PGlite, in memory) with the app's actual
 * Supabase migrations applied, plus a small stand-in for the parts of Supabase
 * the migrations depend on (the auth/storage schemas, auth.uid(), and the
 * anon/authenticated roles). This lets tests check the real row-level-security
 * policies without touching the live Lovable Cloud database.
 */
import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;

  create schema auth;
  grant usage on schema auth to anon, authenticated, service_role;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
  );
  -- Same definitions Supabase uses: identity comes from the request's JWT claims.
  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
  $$;
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(auth.jwt() ->> 'sub', '')::uuid
  $$;
  grant execute on function auth.jwt(), auth.uid() to anon, authenticated, service_role;

  create schema storage;
  grant usage on schema storage to anon, authenticated, service_role;
  create table storage.buckets (id text primary key, name text, public boolean default false);
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text, name text, owner uuid, created_at timestamptz default now()
  );
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as $$
    select string_to_array(name, '/')
  $$;
`;

function migrationFiles(): string[] {
  const dirs = [join(ROOT, "supabase", "migrations"), join(ROOT, "drizzle", "migrations")];
  return dirs.flatMap((dir) =>
    readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .map((f) => join(dir, f)),
  );
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;

export async function createTestDb() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const file of migrationFiles()) {
    try {
      await db.exec(readFileSync(file, "utf8"));
    } catch (err) {
      throw new Error(`Migration failed: ${file}\n${(err as Error).message}`);
    }
  }

  /** Simulates someone signing up: inserts into auth.users (fires the profile trigger). */
  async function createUser(email: string): Promise<string> {
    const res = await db.query<{ id: string }>(
      "insert into auth.users (email) values ($1) returning id",
      [email],
    );
    return res.rows[0]!.id;
  }

  /**
   * Runs queries exactly the way a logged-in browser would: as the
   * `authenticated` role, with that user's id in the JWT claims, so every
   * row-level-security policy applies.
   */
  async function asUser<T>(
    userId: string,
    email: string,
    fn: (q: <R = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<R[]>) => Promise<T>,
  ): Promise<T> {
    return db.transaction(async (tx) => {
      const claims = JSON.stringify({ sub: userId, email, role: "authenticated" });
      await tx.query("select set_config('request.jwt.claims', $1, true)", [claims]);
      await tx.exec("set local role authenticated");
      return fn(async (sql, params) => (await tx.query(sql, params)).rows as never);
    });
  }

  return { db, createUser, asUser };
}
