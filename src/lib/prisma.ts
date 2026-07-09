import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

function getDbUrl() {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const normalized = dbPath.replace(/\\/g, "/");
  return `file:///${normalized.replace(/^\/+/, "")}`;
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: getDbUrl() });
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
