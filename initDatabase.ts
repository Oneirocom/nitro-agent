import { PrismaClient } from "@prisma/client/extension";

export async function initDatabase() {
  const prisma = new PrismaClient();

  try {
    // Create extensions
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "vector"`;
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    console.log("Database extensions initialized successfully");
  } catch (error) {
    console.error("Error initializing database extensions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

export default initDatabase;
