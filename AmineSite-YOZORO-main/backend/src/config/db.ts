import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { env } from "./env.js";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : [{ emit: "stdout", level: "error" }],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (env.NODE_ENV === "development") {
  // @ts-ignore
  db.$on("query", (e: any) => {
    logger.debug({ query: e.query, duration: `${e.duration}ms` }, "Prisma Query");
  });
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db;
}

