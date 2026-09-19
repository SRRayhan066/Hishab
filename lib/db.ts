import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV === "production") return client;

  // Prisma sometimes throws with an empty `message`, and the Next.js error
  // overlay shows only `message` — so the code that actually names the fault
  // never reaches the screen. Print it here instead.
  return client.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        try {
          return await query(args);
        } catch (error) {
          const detail = error as {
            code?: string;
            meta?: unknown;
            message?: string;
            cause?: unknown;
          };

          console.error(`[prisma] ${model ?? "raw"}.${operation} failed`, {
            name: (error as object)?.constructor?.name,
            code: detail?.code,
            meta: detail?.meta,
            message: detail?.message,
            cause: detail?.cause,
          });

          throw error;
        }
      },
    },
  });
}

type Db = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: Db };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
