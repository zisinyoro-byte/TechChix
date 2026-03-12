import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const db = globalForPrisma.db ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.db = db
}

// Handle connection cleanup on serverless
if (process.env.NODE_ENV === 'production') {
  // Prevent hot-reload from creating multiple connections
  if (globalForPrisma.db) {
    globalForPrisma.db.$disconnect()
  }
}
