import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ['query'], // Optional: uncomment for query logging
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;