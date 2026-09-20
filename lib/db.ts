import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Neon suspends a compute that has been idle for a few minutes, and its pooler
 * closes idle server connections on its own schedule. A serverless instance is
 * frozen between requests, so its timers don't run and it never notices. The
 * pool then hands the next query a socket the other end closed some time ago,
 * the query fails, and the page dies — while a reload works, because the pool
 * throws the dead client away and dials a fresh one. That is the "sometimes I
 * have to reload" bug.
 *
 * Two things close it: connections are retired long before they can go stale,
 * and a read that still loses its connection is retried instead of being
 * thrown at the user.
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * SQLSTATEs and socket errors that mean "this connection is gone", as opposed
 * to "this query was wrong". Only these are worth a second attempt — retrying
 * a constraint violation would just fail again more slowly.
 */
const transientCodes = new Set([
  // Postgres class 08 — connection exception.
  "08000",
  "08001",
  "08003",
  "08004",
  "08006",
  // Class 57 — operator intervention. 57P03 is what Neon returns while a
  // suspended compute is still waking up.
  "57P01",
  "57P02",
  "57P03",
  // Socket-level failures from Node itself.
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "EAI_AGAIN",
]);

/** The same faults as above, for the drivers that only report them as prose. */
const transientPatterns = [
  "connection terminated",
  "connection ended unexpectedly",
  "server closed the connection",
  "socket hang up",
  "timeout exceeded when trying to connect",
  "terminating connection due to administrator command",
  "the database system is starting up",
  "can't reach database server",
  "connection is closed",
];

/**
 * Prisma wraps driver errors, and the adapter wraps them again, so the code
 * that names the fault is usually two or three `cause` hops down.
 */
function isTransient(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== "object" || depth > 4) return false;

  const detail = error as { code?: unknown; message?: unknown; cause?: unknown };

  if (typeof detail.code === "string" && transientCodes.has(detail.code)) {
    return true;
  }

  if (typeof detail.message === "string") {
    const message = detail.message.toLowerCase();
    if (transientPatterns.some((pattern) => message.includes(pattern))) {
      return true;
    }
  }

  return isTransient(detail.cause, depth + 1);
}

/**
 * Only reads are retried.
 *
 * A read costs nothing to repeat. A write might have reached Postgres before
 * the socket died, and this app writes people's money — a retry that turns one
 * ৳500 expense into two is a worse bug than the one being fixed. A failed write
 * surfaces in the form the user just submitted, where they can see it and try
 * again themselves.
 *
 * This also keeps the retry away from `db.$transaction([...])`, whose
 * operations pass through this extension individually: every batch in this
 * codebase is writes-only, so nothing in one is retryable.
 */
const retryableOperations = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "$queryRaw",
  "$queryRawUnsafe",
]);

/** Short, then a little longer — enough for Neon to finish waking a compute. */
const retryDelaysMs = [100, 400];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  // Without this, `pg` quietly falls back to PG* env vars and then to
  // localhost, and the failure that follows names the wrong problem.
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — the database cannot be reached.");
  }

  const adapter = new PrismaPg(
    {
      connectionString,

      // The core of the fix. Neon's pooler closes idle server connections at
      // around five minutes; retiring ours every minute means we never hold
      // one long enough for the far end to have hung up on it. A connection
      // that is busy when its lifetime expires is retired on release, never
      // mid-query.
      maxLifetimeSeconds: 60,
      idleTimeoutMillis: 10_000,

      // Long enough for Neon to resume a suspended compute, short enough that
      // a real outage fails the request instead of hanging it.
      connectionTimeoutMillis: 15_000,

      // A frozen instance sends no traffic, and the NAT between it and Neon
      // will drop a silent socket. Keepalives stop that.
      keepAlive: true,
      keepAliveInitialDelayMillis: 5_000,

      // One page view fans out to about six queries in two parallel waves, so
      // leave room for those without opening more sockets per instance than
      // Neon's pooler wants to see.
      max: 10,
    },
    {
      // node-postgres emits these on *idle* clients, where there is no pending
      // query to reject them through. Unhandled, an `error` event on a Pool
      // reaches `uncaughtException` and takes the whole server down with it.
      // The pool discards the bad client and recovers by itself, so the only
      // thing needed here is to not die.
      onPoolError: (error) => console.error("[pg] idle pool error", error),
      onConnectionError: (error) => console.error("[pg] connection error", error),
    },
  );

  const client = new PrismaClient({ adapter });

  return client.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        const label = `${model ?? "raw"}.${operation}`;
        const retryable = retryableOperations.has(operation);

        for (let attempt = 0; ; attempt += 1) {
          try {
            return await query(args);
          } catch (error) {
            if (
              retryable &&
              attempt < retryDelaysMs.length &&
              isTransient(error)
            ) {
              console.warn(
                `[prisma] ${label} lost its connection, retrying (${attempt + 1}/${retryDelaysMs.length})`,
              );
              await sleep(retryDelaysMs[attempt]);
              continue;
            }

            const detail = error as {
              code?: string;
              meta?: unknown;
              message?: string;
              cause?: unknown;
            };

            // Prisma sometimes throws with an empty `message`, and the Next.js
            // error overlay shows only `message` — so the code that actually
            // names the fault never reaches the screen. Print it here instead.
            // In production the same line is what tells you afterwards whether
            // a 500 was the database or the app.
            console.error(`[prisma] ${label} failed`, {
              name: (error as object)?.constructor?.name,
              code: detail?.code,
              transient: isTransient(error),
              ...(isProduction
                ? {}
                : { meta: detail?.meta, cause: detail?.cause }),
              message: detail?.message,
            });

            throw error;
          }
        }
      },
    },
  });
}

type Db = ReturnType<typeof createPrismaClient>;

// Cached in every environment, not just development. HMR is the obvious
// reason, but Next.js can also evaluate this module once per server bundle,
// and each fresh evaluation would open a pool that nothing ever closes.
const globalForPrisma = globalThis as unknown as { prisma?: Db };

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;
